/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (self != top) {
	
	// handle the options that could be sent to the parent window
	//   - all get path
	//   - pattern & view all get a pattern partial, styleguide gets all
	//   - pattern shares lineage
	var path = window.location.toString();
	var parts = path.split("?");
	var options = { "event": "patternLab.pageLoad", "path": parts[0] };
	
	options.patternpartial = (patternData.patternPartial !== undefined) ? patternData.patternPartial : "all";
	if (patternData.lineage !== "") {
		options.lineage = patternData.lineage;
	}
	
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	parent.postMessage(options, targetOrigin);
	
	// find all links and add an onclick handler for replacing the iframe address so the history works
	var aTags = document.getElementsByTagName('a');
	for (var i = 0; i < aTags.length; i++) {
		aTags[i].onclick = function(e) {
			var href   = this.getAttribute("href");
			var target = this.getAttribute("target");
			if ((target !== undefined) && ((target == "_parent") || (target == "_blank"))) {
				// just do normal stuff
			} else if (href && href !== "#") {
				e.preventDefault();
				window.location.replace(href);
			} else {
				e.preventDefault();
				return false;
			}
		};
	}
	
	// bind the keyboard shortcuts for various viewport resizings + pattern search
	var keys = [ "s", "m", "l", "d", "h", "f" ];
	for (var i = 0; i < keys.length; i++) {
		jwerty.key('ctrl+shift+'+keys[i],  function (k,t) {
			return function(e) {
				var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "ctrl+shift+"+k });
				parent.postMessage(obj,t);
				return false;
			};
		}(keys[i],targetOrigin));
	}
	
	// bind the keyboard shortcuts for mqs
	var i = 0;
	while (i < 10) {
		jwerty.key('ctrl+shift+'+i, function (k,t) {
			return function(e) {
				var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
				var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "ctrl+shift+"+k });
				parent.postMessage(obj,t);
				return false;
			};
		}(i,targetOrigin));
		i++;
	}
	
}

// if there are clicks on the iframe make sure the nav in the iframe parent closes
var body = document.getElementsByTagName('body');
body[0].onclick = function() {
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	var obj = JSON.stringify({ "event": "patternLab.bodyClick", "bodyclick": "bodyclick" });
	parent.postMessage(obj,targetOrigin);
};

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
	
	// does the origin sending the message match the current host? if not dev/null the request
	if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
		return;
	}
	
	var path;
	var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
	
	// see if it got a path to replace
	if (data.event == "patternLab.updatePath") {
		
		if (patternData.patternPartial !== undefined) {
			
			// handle patterns and the view all page
			var re = /(patterns|snapshots)\/(.*)$/;
			path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace(re,'')+data.path+'?'+Date.now();
			window.location.replace(path);
			
		} else {
			
			// handle the style guide
			path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("styleguide\/html\/styleguide.html","")+data.path+'?'+Date.now();
			window.location.replace(path);
			
		}
		
	} else if (data.event == "patternLab.reload") {
		
		// reload the location if there was a message to do so
		window.location.reload();
		
	}
	
}
window.addEventListener("message", receiveIframeMessage, false);

/*!
 * Annotations Support for Patterns
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */

var annotationsPattern = {
	
	commentsOverlayActive:  false,
	commentsOverlay:        false,
	commentsEmbeddedActive: false,
	commentsEmbedded:       false,
	commentsGathered:       { "event": "patternLab.annotationPanel", "commentOverlay": "on", "comments": [ ] },
	trackedElements:        [ ],
	targetOrigin:           (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host,
	
	/**
	* record which annotations are related to this pattern so they can be sent to the viewer when called
	*/
	gatherComments: function() {
		
		// make sure this only added when we're on a pattern specific view
		if (document.getElementById("sg-patterns") === null) {
			
			var count = 0;
			
			for (var comment in comments.comments) {
				
				var item = comments.comments[comment];
				var els  = document.querySelectorAll(item.el);
				
				if (els.length > 0) {
					
					count++;
					item.displaynumber = count;
					
					for (var i = 0; i < els.length; ++i) {
						els[i].onclick = (function(item) {
							return function(e) {
								
								if (annotationsPattern.commentsOverlayActive) {
									
									e.preventDefault();
									e.stopPropagation();
									
									// if an element was clicked on while the overlay was already on swap it
									var obj = JSON.stringify({"event": "patternLab.annotationNumberClicked", "displaynumber": item.displaynumber, "el": item.el, "title": item.title, "comment": item.comment });
									parent.postMessage(obj,annotationsPattern.targetOrigin);
									
								}
								
							};
						})(item);
					}
				}
				
				
			}
			
		} else {
			
			var obj = JSON.stringify({"event": "patternLab.annotationPanel", "commentOverlay": "off" });
			parent.postMessage(obj,annotationsPattern.targetOrigin);
			
		}
		
	},
	
	/**
	* embed a comment by building the sg-annotations div (if necessary) and building an sg-annotation div
	* @param  {Object}      element to check the parent node of
	* @param  {String}      the title of the comment
	* @param  {String}      the comment HTML
	*/
	embedComments: function (el,title,comment) {
		
		// build the annotation div and add the content to it
		var annotationDiv = document.createElement("div");
		annotationDiv.classList.add("sg-annotation");
		
		var h3       = document.createElement("h3");
		var p        = document.createElement("p");
		h3.innerHTML = title;
		p.innerHTML  = comment;
		
		annotationDiv.appendChild(h3);
		annotationDiv.appendChild(p);
		
		// find the parent element to attach things to
		var parentEl = annotationsPattern.findParent(el);
		
		// see if a child with the class annotations exists
		var els = parentEl.getElementsByClassName("sg-annotations");
		if (els.length > 0) {
			els[0].appendChild(annotationDiv);
		} else {
			var annotationsDiv = document.createElement("div");
			annotationsDiv.classList.add("sg-annotations");
			annotationsDiv.appendChild(annotationDiv);
			parentEl.appendChild(annotationsDiv);
		}
		
	},
	
	/**
	* recursively find the parent of an element to see if it contains the sg-pattern class
	* @param  {Object}      element to check the parent node of
	*/
	findParent: function(el) {
		
		var parentEl;
		
		if (el.classList.contains("sg-pattern")) {
			return el;
		} else if (el.parentNode.classList.contains("sg-pattern")) {
			return el.parentNode;
		} else {
			parentEl = annotationsPattern.findParent(el.parentNode);
		}
		
		return parentEl;
		
	},
	
	/**
	* toggle the annotation feature on/off
	* based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	* @param  {Object}      event info
	*/
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		
		var i, obj, state, els, item, displayNum;
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		if ((data.event !== undefined) && (data.event == "patternLab.resize") && (annotationsPattern.commentsOverlayActive)) {
			
			for (i = 0; i < annotationsPattern.trackedElements.length; ++i) {
				var el = annotationsPattern.trackedElements[i];
				if (window.getComputedStyle(el.element,null).getPropertyValue("max-height") == "0px") {
					el.element.firstChild.style.display = "none";
					obj = JSON.stringify({"event": "patternLab.annotationUpdateState", "annotationState": false, "displayNumber": el.displayNumber });
					parent.postMessage(obj,annotationsPattern.targetOrigin);
				} else {
					el.element.firstChild.style.display = "block";
					obj = JSON.stringify({"event": "patternLab.annotationUpdateState", "annotationState": true, "displayNumber": el.displayNumber });
					parent.postMessage(obj,annotationsPattern.targetOrigin);
				}
			}
			
		} else if ((data.event !== undefined) && (data.event == "patternLab.annotationPanel")) {
			
			// if this is an overlay make sure it's active for the onclick event
			annotationsPattern.commentsOverlayActive  = false;
			annotationsPattern.commentsEmbeddedActive = false;
			
			// see which flag to toggle based on if this is a styleguide or view-all page
			if ((data.commentToggle === "on") && (document.getElementById("sg-patterns") !== null)) {
				annotationsPattern.commentsEmbeddedActive = true;
			} else if (data.commentToggle === "on") {
				annotationsPattern.commentsOverlayActive  = true;
			}
			
			// if comments overlay is turned off make sure to remove the has-annotation class and pointer
			if (!annotationsPattern.commentsOverlayActive) {
				els = document.querySelectorAll(".has-annotation");
				for (i = 0; i < els.length; i++) {
					els[i].classList.remove("has-annotation");
				}
				els = document.querySelectorAll(".annotation-tip");
				for (i = 0; i < els.length; i++) {
					els[i].style.display = "none";
				}
			}
			
			// if comments embedding is turned off make sure to hide the annotations div
			if (!annotationsPattern.commentsEmbeddedActive) {
				els = document.getElementsByClassName("sg-annotations");
				for (i = 0; i < els.length; i++) {
					els[i].style.display = "none";
				}
			}
			
			// if comments overlay is turned on add the has-annotation class and pointer
			if (annotationsPattern.commentsOverlayActive) {
				
				var count = 0;
				
				for (i = 0; i < comments.comments.length; i++) {
					item = comments.comments[i];
					els  = document.querySelectorAll(item.el);
					
					state = true;
					
					if (els.length) {
						
						count++;
						
						//Loop through all items with annotations
						for (k = 0; k < els.length; k++) {
							
							els[k].classList.add("has-annotation");
							
							var span       = document.createElement("span");
							span.innerHTML = count;
							span.classList.add("annotation-tip");
							
							if (window.getComputedStyle(els[k],null).getPropertyValue("max-height") == "0px") {
								span.style.display = "none";
								state = false;
							}
							
							annotationsPattern.trackedElements.push({ "itemel": item.el, "element": els[k], "displayNumber": count, "state": state });
							
							els[k].insertBefore(span,els[k].firstChild);
							
						}
						
					}
					
				}
				
				// count elements so it can be used when displaying the results in the viewer
				count = 0;
				
				// iterate over the comments in annotations.js
				for (i = 0; i < comments.comments.length; i++) {
					
					state = true;
					
					item  = comments.comments[i];
					els   = document.querySelectorAll(item.el);
					
					// if an element is found in the given pattern add it to the overall object so it can be passed when the overlay is turned on
					if (els.length > 0) {
						count++;
						for (k = 0; k < els.length; k++) {
							if (window.getComputedStyle(els[k],null).getPropertyValue("max-height") == "0px") {
								state = false;
							}
						}
						var comment = { "el": item.el, "title": item.title, "comment": item.comment, "number": count, "state": state };
						annotationsPattern.commentsGathered.comments.push(comment);
					}
				
				}
				
				// send the list of annotations for the page back to the parent
				obj = JSON.stringify(annotationsPattern.commentsGathered);
				parent.postMessage(obj,annotationsPattern.targetOrigin);
				
			} else if (annotationsPattern.commentsEmbeddedActive && !annotationsPattern.commentsEmbedded) {
				
				// if comment embedding is turned on and comments haven't been embedded yet do it
				for (i = 0; i < comments.comments.length; i++)  {
					item = comments.comments[i];
					els  = document.querySelectorAll(item.el);
					if (els.length > 0) {
						annotationsPattern.embedComments(els[0],item.title,item.comment); //Embed the comment
					}
					annotationsPattern.commentsEmbedded = true;
				}
				
			} else if (annotationsPattern.commentsEmbeddedActive && annotationsPattern.commentsEmbedded) {
				
				// if comment embedding is turned on and comments have been embedded simply display them
				els = document.getElementsByClassName("sg-annotations");
				for (i = 0; i < els.length; ++i) {
					els[i].style.display = "block";
				}
				
			}
			
		}
		
	}
	
};

// add the onclick handlers to the elements that have an annotations
annotationsPattern.gatherComments();
window.addEventListener("message", annotationsPattern.receiveIframeMessage, false);

// before unloading the iframe make sure any active overlay is turned off/closed
window.onbeforeunload = function() {
	var obj = JSON.stringify({ "event": "patternLab.annotationPanel", "commentOverlay": "off" });
	parent.postMessage(obj,annotationsPattern.targetOrigin);
};

// tell the parent iframe that keys were pressed

// toggle the annotations panel
jwerty.key('ctrl+shift+a', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "ctrl+shift+a" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});

// close the annotations panel if using escape
jwerty.key('esc', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "esc" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});

/*!
 * Code View Support for Patterns
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */

var codePattern = {
	
	codeOverlayActive:  false,
	codeEmbeddedActive: false,
	targetOrigin: (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host,
	
	/**
	* toggle the annotation feature on/off
	* based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	* @param  {Object}      event info
	*/
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		if ((data.event !== undefined) && (data.event == "patternLab.codePanel")) {
			
			var els, i;
			
			// if this is an overlay make sure it's active for the onclick event
			codePattern.codeOverlayActive  = false;
			codePattern.codeEmbeddedActive = false;
			
			// see which flag to toggle based on if this is a styleguide or view-all page
			if ((data.codeToggle == "on") && (document.getElementById("sg-patterns") !== null)) {
				codePattern.codeEmbeddedActive = true;
			} else if (data.codeToggle == "on") {
				codePattern.codeOverlayActive  = true;
			}
			
			// if comments embedding is turned off make sure to hide the annotations div
			if (!codePattern.codeEmbeddedActive && (document.getElementById("sg-patterns") !== null)) {
				els = document.getElementsByClassName("sg-code");
				for (i = 0; i < els.length; i++) {
					els[i].style.display = "none";
				}
			}
			
			// if comments overlay is turned on add the has-comment class and pointer
			if (codePattern.codeOverlayActive) {
				
				var obj = JSON.stringify({ "event": "patternLab.codePanel", "codeOverlay": "on", "patternData": patternData });
				parent.postMessage(obj,codePattern.targetOrigin);
				
			} else if (codePattern.codeEmbeddedActive) {
				
				// if code embedding is turned on simply display them
				els = document.getElementsByClassName("sg-code");
				for (i = 0; i < els.length; ++i) {
					els[i].style.display = "block";
				}
				
			}
			
		}
		
	}
	
};

// add the onclick handlers to the elements that have an annotations
window.addEventListener("message", codePattern.receiveIframeMessage, false);

// before unloading the iframe make sure any active overlay is turned off/closed
window.onbeforeunload = function() {
	var obj = JSON.stringify({ "event": "patternLab.codePanel", "codeOverlay": "off" });
	parent.postMessage(obj,codePattern.targetOrigin);
};

// tell the parent iframe that keys were pressed

// toggle the code panel
jwerty.key('ctrl+shift+c', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.codeKeyPress", "keyPress": "ctrl+shift+c" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});

// when the code panel is open hijack cmd+a so that it only selects the code view
jwerty.key('cmd+a/ctrl+a', function (e) {
	if (codePattern.codeOverlayActive) {
		var obj = JSON.stringify({ "event": "patternLab.codeKeyPress", "keyPress": "cmd+a" });
		parent.postMessage(obj,codePattern.targetOrigin);
		return false;
	}
});

// open the mustache panel
jwerty.key('ctrl+shift+u', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.codeKeyPress", "keyPress": "ctrl+shift+u" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});

// open the html panel
jwerty.key('ctrl+shift+h', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.codeKeyPress", "keyPress": "ctrl+shift+h" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});

// close the code panel if using escape
jwerty.key('esc', function (e) {
	var obj = JSON.stringify({ "event": "patternLab.codeKeyPress", "keyPress": "esc" });
	parent.postMessage(obj,codePattern.targetOrigin);
	return false;
});