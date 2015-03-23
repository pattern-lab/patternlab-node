/*!
 * URL Handler
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Helps handle the initial iFrame source. Parses a string to see if it matches
 * an expected pattern in Pattern Lab. Supports Pattern Labs fuzzy pattern partial
 * matching style.
 *
 */

var urlHandler = {
	
	// set-up some default vars
	skipBack: false,
	targetOrigin: (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host,
	
	/**
	* get the real file name for a given pattern name
	* @param  {String}       the shorthand partials syntax for a given pattern
	*
	* @return {String}       the real file path
	*/
	getFileName: function (name) {
		
		var baseDir     = "patterns";
		var fileName    = "";
		
		if (name === undefined) {
			return fileName;
		}
		
		if (name == "all") {
			return "styleguide/html/styleguide.html";
		} else if (name == "snapshots") {
			return "snapshots/index.html";
		}
		
		var paths = (name.indexOf("viewall-") != -1) ? viewAllPaths : patternPaths;
		var nameClean = name.replace("viewall-","");
		
		// look at this as a regular pattern
		var bits        = this.getPatternInfo(nameClean, paths);
		var patternType = bits[0];
		var pattern     = bits[1];
		
		if ((paths[patternType] !== undefined) && (paths[patternType][pattern] !== undefined)) {
			
			fileName = paths[patternType][pattern];
			
		} else if (paths[patternType] !== undefined) {
			
			for (var patternMatchKey in paths[patternType]) {
				if (patternMatchKey.indexOf(pattern) != -1) {
					fileName = paths[patternType][patternMatchKey];
					break;
				}
			}
		
		}
		
		if (fileName === "") {
			return fileName;
		}
		
		var regex = /\//g;
		if ((name.indexOf("viewall-") != -1) && (fileName !== "")) {
			fileName = baseDir+"/"+fileName.replace(regex,"-")+"/index.html";
		} else if (fileName !== "") {
			fileName = baseDir+"/"+fileName.replace(regex,"-")+"/"+fileName.replace(regex,"-")+".html";
		}
		
		return fileName;
	},
	
	/**
	* break up a pattern into its parts, pattern type and pattern name
	* @param  {String}       the shorthand partials syntax for a given pattern
	* @param  {Object}       the paths to be compared
	*
	* @return {Array}        the pattern type and pattern name
	*/
	getPatternInfo: function (name, paths) {
		
		var patternBits = name.split("-");
		
		var i = 1;
		var c = patternBits.length;
		
		var patternType = patternBits[0];
		while ((paths[patternType] === undefined) && (i < c)) {
			patternType += "-"+patternBits[i];
			i++;
		}
		
		var pattern = name.slice(patternType.length+1,name.length);
		
		return [patternType, pattern];
		
	},
	
	/**
	* search the request vars for a particular item
	*
	* @return {Object}       a search of the window.location.search vars
	*/
	getRequestVars: function() {
		
		// the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
		var oGetVars = new (function (sSearch) {
			if (sSearch.length > 1) {
				for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
					aItKey = aCouples[nKeyId].split("=");
					this[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
				}
			}
		})(window.location.search);
		
		return oGetVars;
		
	},
	
	/**
	* push a pattern onto the current history based on a click
	* @param  {String}       the shorthand partials syntax for a given pattern
	* @param  {String}       the path given by the loaded iframe
	*/
	pushPattern: function (pattern, givenPath) {
		var data         = { "pattern": pattern };
		var fileName     = urlHandler.getFileName(pattern);
		var path         = window.location.pathname;
		path             = (window.location.protocol === "file") ? path.replace("/public/index.html","public/") : path.replace(/\/index\.html/,"/");
		var expectedPath = window.location.protocol+"//"+window.location.host+path+fileName;
		if (givenPath != expectedPath) {
			// make sure to update the iframe because there was a click
			var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": fileName });
			document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
		} else {
			// add to the history
			var addressReplacement = (window.location.protocol == "file:") ? null : window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+"?p="+pattern;
			if (history.pushState !== undefined) {
				history.pushState(data, null, addressReplacement);
			}
			document.getElementById("title").innerHTML = "Pattern Lab - "+pattern;
			if (document.getElementById("sg-raw") !== undefined) {
				document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(pattern));
			}
		}
	},
	
	/**
	* based on a click forward or backward modify the url and iframe source
	* @param  {Object}      event info like state and properties set in pushState()
	*/
	popPattern: function (e) {
		
		var patternName;
		var state = e.state;
		
		if (state === null) {
			this.skipBack = false;
			return;
		} else if (state !== null) {
			patternName = state.pattern;
		} 
		
		var iFramePath = "";
		iFramePath = this.getFileName(patternName);
		if (iFramePath === "") {
			iFramePath = "styleguide/html/styleguide.html";
		}
		
		var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": iFramePath });
		document.getElementById("sg-viewport").contentWindow.postMessage( obj, urlHandler.targetOrigin);
		document.getElementById("title").innerHTML = "Pattern Lab - "+patternName;
		document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
		
		/*
		if (wsnConnected !== undefined) {
			wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+patternName+'" }' );
		}
		*/
		
	}
	
};

/**
* handle the onpopstate event
*/
window.onpopstate = function (event) {
	urlHandler.skipBack = true;
	urlHandler.popPattern(event);
};
/*!
 * Annotations Support for the Viewer
 *
 * Copyright (c) 2013 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var annotationsViewer = {
	
	// set-up default sections
	commentsActive:          false,
	commentsViewAllActive:   false,
	targetOrigin:            (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host,
	moveToOnInit:            0,
	
	/**
	* add the onclick handler to the annotations link in the main nav
	*/
	onReady: function() {
		
		// not sure this is used anymore...
		$('body').addClass('comments-ready');

		$(window).resize(function() {
			if(!annotationsViewer.commentsActive) {
				annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
			}
		});

		$('#sg-t-annotations').click(function(e) {
			
			e.preventDefault();
			
			// remove the class from the "eye" nav item
			$('#sg-t-toggle').removeClass('active');
			
			// turn the annotations section on and off
			annotationsViewer.toggleComments();
			
		});
		
		// initialize the annotations viewer
		annotationsViewer.commentContainerInit();
		
		// load the query strings in case code view has to show by default
		var queryStringVars = urlHandler.getRequestVars();
		if ((queryStringVars.view !== undefined) && ((queryStringVars.view === "annotations") || (queryStringVars.view === "a"))) {
			annotationsViewer.openComments();
			if (queryStringVars.number !== undefined) {
				annotationsViewer.moveToOnInit = queryStringVars.number;
			}
		}
		
	},
	
	/**
	* decide on if the annotations panel should be open or closed
	*/
	toggleComments: function() {
		
		if (!annotationsViewer.commentsActive) {
			annotationsViewer.openComments();
		} else {
			annotationsViewer.closeComments();
		}
		
	},
	
	/**
	* open the annotations panel
	*/
	openComments: function() {
		
		var obj;
		
		// make sure the code view overlay is off before showing the annotations view
		$('#sg-t-code').removeClass('active');
		codeViewer.codeActive = false;
		obj = JSON.stringify({ "event": "patternLab.codePanel", "codeToggle": "off" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
		codeViewer.slideCode(999);
		
		// tell the iframe annotation view has been turned on
		obj = JSON.stringify({ "event": "patternLab.annotationPanel", "commentToggle": "on" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
		
		// note that it's turned on in the viewer
		annotationsViewer.commentsActive = true;
		$('#sg-t-annotations').addClass('active');
	},
	
	/**
	* close the annotations panel
	*/
	closeComments: function() {
		annotationsViewer.commentsActive = false;
		var obj = JSON.stringify({"event": "patternLab.annotationPanel", "commentToggle": "off" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
		annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
		$('#sg-t-annotations').removeClass('active');
	},
	
	/**
	* add the basic mark-up and events for the annotations container
	*/
	commentContainerInit: function() {
		
		// the bulk of this template is in core/templates/index.mustache
		if (document.getElementById("sg-annotation-container") === null) {
			$('<div id="sg-annotation-container" class="sg-view-container"></div>').html("").appendTo('body').css('bottom',-$(document).outerHeight());
			setTimeout(function(){ $('#sg-annotation-container').addClass('anim-ready'); },50); //Add animation class once container is positioned out of frame
		}
		
		// make sure the close button handles the click
		$('body').delegate('#sg-annotation-close-btn','click',function() {
			annotationsViewer.commentsActive = false;
			$('#sg-t-annotations').removeClass('active');
			annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
			var obj = JSON.stringify({"event": "patternLab.annotationPanel", "commentToggle": "off" });
			document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
			return false;
		});
		
	},
	
	/**
	* slides the panel
	*/
	slideComment: function(pos) {
		$('#sg-annotation-container').css('bottom',-pos);
	},
	
	/**
	* moves to a particular item in the viewer
	*/
	moveTo: function(number) {
		if (document.getElementById("annotation-"+number) !== undefined) {
			var top = document.getElementById("annotation-"+number).offsetTop;
			$('#sg-annotation-container').animate({scrollTop: top - 10}, 600);
		}
	},
	
	/**
	* when turning on or switching between patterns with annotations view on make sure we get
	* the annotations from from the pattern via post message
	*/
	updateComments: function(data) {
		
		/* load annotation view */
		var template         = document.getElementById("pl-annotations-template");
		var templateCompiled = Hogan.compile(template.innerHTML);
		var templateRendered = templateCompiled.render(data);
		document.getElementById("sg-annotation-container").innerHTML = templateRendered;
		
		// slide the comment section into view
		annotationsViewer.slideComment(0);
		
		if (annotationsViewer.moveToOnInit != "0") {
			annotationsViewer.moveTo(annotationsViewer.moveToOnInit);
			annotationsViewer.moveToOnInit = "0";
		}
		
	},
	
	/**
	* toggle the comment pop-up based on a user clicking on the pattern
	* based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	* @param  {Object}      event info
	*/
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		if (data.event !== undefined) {
			
			if (data.event == "patternLab.annotationPanel") {
				if (data.commentOverlay === "on") {
					annotationsViewer.updateComments(data);
				} else {
					annotationsViewer.slideComment($('#sg-annotation-container').outerHeight());
				}
			} else if (data.event == "patternLab.annotationUpdateState") {
				document.getElementById("annotation-state-"+data.displayNumber).innerHTML = (data.annotationState === true) ? "" : " hidden";
			} else if (data.event == "patternLab.annotationNumberClicked") {
				annotationsViewer.moveTo(data.displaynumber);
			} else if (data.event == "patternLab.keyPress") {
				if (data.keyPress == 'ctrl+shift+a') {
					annotationsViewer.toggleComments();
					return false;
				} else if (data.keyPress == 'esc') {
					if (annotationsViewer.commentsActive) {
						annotationsViewer.closeComments();
						return false;
					}
				}
			} else if (data.event == "patternLab.pageLoad") {
				if (annotationsViewer.commentsViewAllActive && (data.patternpartial.indexOf("viewall-") != -1)) {
					var obj = JSON.stringify({ "commentToggle": "on" });
					document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
				}
			}
			
		}
		
	}
	
};

$(document).ready(function() { annotationsViewer.onReady(); });
window.addEventListener("message", annotationsViewer.receiveIframeMessage, false);

// make sure if a new pattern or view-all is loaded that comments are turned on as appropriate
$('#sg-viewport').load(function() {
	if (annotationsViewer.commentsActive) {
		var obj = JSON.stringify({ "commentToggle": "on" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,annotationsViewer.targetOrigin);
	}
});

// no idea why this has to be outside. there's something funky going on with the JS pattern
$('#sg-view li a').click(function() {
	$(this).parent().parent().removeClass('active');
	$(this).parent().parent().parent().parent().removeClass('active');
});

// toggle the annotations panel
jwerty.key('ctrl+shift+a', function (e) {
	annotationsViewer.toggleComments();
	return false;
});

// close the annotations panel if using escape
jwerty.key('esc', function (e) {
	if (annotationsViewer.commentsActive) {
		annotationsViewer.closeComments();
		return false;
	}
});

/*!
 * Code View Support for the Viewer
 *
 * Copyright (c) 2013 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var codeViewer = {
	
	// set up some defaults
	codeActive:   false,
	tabActive:    "e",
	encoded:      "",
	mustache:     "",
	css:          "",
	ids:          { "e": "#sg-code-title-html", "m": "#sg-code-title-mustache", "c": "#sg-code-title-css" },
	targetOrigin: (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host,
	copyOnInit:   false,
	
	/**
	* add the onclick handler to the code link in the main nav
	*/
	onReady: function() {
		
		// not sure this is needed anymore...
		$('body').addClass('code-ready');

		$(window).resize(function() {
			if(!codeViewer.codeActive) {
				codeViewer.slideCode($('#sg-code-container').outerHeight());
			}
		});
		
		// add the onclick handler
		$('#sg-t-code').click(function(e) {
			
			e.preventDefault();
			
			// remove the class from the "eye" nav item
			$('#sg-t-toggle').removeClass('active');
			
			// if the code link in the main nav is active close the panel. otherwise open
			if ($(this).hasClass('active')) {
				codeViewer.closeCode();
			} else {
				codeViewer.openCode();
			}
			
		});
		
		// initialize the code viewer
		codeViewer.codeContainerInit();
		
		// load the query strings in case code view has to show by default
		var queryStringVars = urlHandler.getRequestVars();
		if ((queryStringVars.view !== undefined) && ((queryStringVars.view === "code") || (queryStringVars.view === "c"))) {
			codeViewer.copyOnInit = ((queryStringVars.copy !== undefined) && (queryStringVars.copy === "true")) ? true : false;
			codeViewer.openCode();
		}
		
	},
	
	/**
	* decide on if the code panel should be open or closed
	*/
	toggleCode: function() {
		
		if (!codeViewer.codeActive) {
			codeViewer.openCode();
		} else {
			codeViewer.closeCode();
		}
		
	},
	
	/**
	* after clicking the code view link open the panel
	*/
	openCode: function() {
		
		var obj;
		
		// make sure the annotations overlay is off before showing code view
		$('#sg-t-annotations').removeClass('active');
		annotationsViewer.commentsActive = false;
		obj = JSON.stringify({ "event": "patternLab.annotationPanel", "commentToggle": "off" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,codeViewer.targetOrigin);
		annotationsViewer.slideComment(999);
		
		// tell the iframe code view has been turned on
		obj = JSON.stringify({ "event": "patternLab.codePanel", "codeToggle": "on" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,codeViewer.targetOrigin);
		
		// note it's turned on in the viewer
		codeViewer.codeActive = true;
		$('#sg-t-code').addClass('active');
		
	},
	
	/**
	* after clicking the code view link close the panel
	*/
	closeCode: function() {
		var obj = JSON.stringify({ "event": "patternLab.codePanel", "codeToggle": "off" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,codeViewer.targetOrigin);
		codeViewer.codeActive = false;
		codeViewer.slideCode($('#sg-code-container').outerHeight());
		$('#sg-t-code').removeClass('active');
	},
	
	/**
	* add the basic mark-up and events for the code container
	*/
	codeContainerInit: function() {
		
		// the bulk of this template is in core/templates/index.mustache
		if (document.getElementById("sg-code-container") === null) {
			$('<div id="sg-code-container" class="sg-view-container"></div>').html("").appendTo('body').css('bottom',-$(document).outerHeight());
			setTimeout(function(){ $('#sg-code-container').addClass('anim-ready'); },50); //Add animation class once container is positioned out of frame
		}
		
		// make sure the close button handles the click
		$('body').delegate('#sg-code-close-btn','click',function() {
			codeViewer.closeCode();
			return false;
		});
		
	},
	
	/**
	* depending on what tab is clicked this swaps out the code container. makes sure prism highlight is added.
	*/
	swapCode: function(type) {
		
		codeViewer.clearSelection();
		var fill      = "";
		var className = (type == "c") ? "css" : "markup";
		$("#sg-code-fill").removeClass().addClass("language-"+className);
		if (type == "m") {
			fill = codeViewer.mustache;
		} else if (type == "e") {
			fill = codeViewer.encoded;
		} else if (type == "c") {
			fill = codeViewer.css;
		}
		$("#sg-code-fill").html(fill).text();
		codeViewer.tabActive = type;
		Prism.highlightElement(document.getElementById("sg-code-fill"));
		$('.sg-code-title-active').removeClass('sg-code-title-active');
		$(codeViewer.ids[type]).toggleClass("sg-code-title-active");
	},
	
	/**
	* select the code where using cmd+a/ctrl+a
	*/
	selectCode: function() {
		if (codeViewer.codeActive) {
			selection = window.getSelection();
			range = document.createRange();
			range.selectNodeContents(document.getElementById("sg-code-fill"));
			selection.removeAllRanges();
			selection.addRange(range);
		}
	},
	
	/**
	* clear any selection of code when swapping tabs or opening a new pattern
	*/
	clearSelection: function() {
		if (codeViewer.codeActive) {
			if (window.getSelection().empty) {
				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {
				window.getSelection().removeAllRanges();
			}
		}
	},
	
	/**
	* slides the panel
	*/
	slideCode: function(pos) {
		$('#sg-code-container').css('bottom',-pos);
	},
	
	/**
	* once the AJAX request for the encoded mark-up is finished this runs.
	* if the encoded tab is the current active tab it adds the content to the default code container
	*/
	saveEncoded: function() {
		codeViewer.encoded = this.responseText;
		if (codeViewer.tabActive == "e") {
			codeViewer.activateDefaultTab("e",this.responseText);
		}
	},
	
	/**
	* once the AJAX request for the mustache mark-up is finished this runs.
	* if the mustache tab is the current active tab it adds the content to the default code container
	*/
	saveMustache: function() {
		codeViewer.mustache = this.responseText;
		if (codeViewer.tabActive == "m") {
			codeViewer.activateDefaultTab("m",this.responseText);
		}
	},
	
	/**
	* once the AJAX request for the css mark-up is finished this runs. if this function is running then css has been enabled
	* if the css tab is the current active tab it adds the content to the default code container
	*/
	saveCSS: function() {
		$('#sg-code-title-css').css("display","block");
		codeViewer.css = this.responseText;
		if (codeViewer.tabActive == "c") {
			codeViewer.activateDefaultTab("c",this.responseText);
		}
	},
	
	/**
	* when loading the code view make sure the active tab is highlighted and filled in appropriately
	*/
	activateDefaultTab: function(type,code) {
		var typeName  = "";
		var className = (type == "c") ? "css" : "markup";
		if (type == "m") {
			typeName = "mustache";
		} else if (type == "e") {
			typeName = "html";
		} else if (type == "c") {
			typeName = "css";
		}
		$('.sg-code-title-active').removeClass('sg-code-title-active');
		$('#sg-code-title-'+typeName).addClass('sg-code-title-active');
		$("#sg-code-fill").removeClass().addClass("language-"+className);
		$("#sg-code-fill").html(code).text();
		Prism.highlightElement(document.getElementById("sg-code-fill"));
		if (codeViewer.copyOnInit) {
			codeViewer.selectCode();
			codeViewer.copyOnInit = false;
		}
	},
	
	/**
	* when turning on or switching between patterns with code view on make sure we get
	* the code from from the pattern via post message
	*/
	updateCode: function(patternData) {
		
		// clear any selections that might have been made
		codeViewer.clearSelection();
		
		// figure out if lineage should be drawn
		patternData.lineageExists = false;
		if (patternData.lineage.length !== 0) {
			patternData.lineageExists = true;
		}
		
		// figure out if reverse lineage should be drawn
		patternData.lineageRExists = false;
		if (patternData.lineageR.length !== 0) {
			patternData.lineageRExists = true;
		}
		
		/* load code view */
		var template         = document.getElementById("pl-code-template");
		var templateCompiled = Hogan.compile(template.innerHTML);
		var templateRendered = templateCompiled.render(patternData);
		document.getElementById("sg-code-container").innerHTML = templateRendered;
		
		Dispatcher.trigger("codePanelRenderDone", [ patternData ] );
		
		// when clicking on a lineage item change the iframe source
		$('#sg-code-lineage-fill a, #sg-code-lineager-fill a').on("click", function(e){
			e.preventDefault();
			$("#sg-code-loader").css("display","block");
			var obj = JSON.stringify({ "event": "patternLab.pathUpdate", "path": urlHandler.getFileName($(this).attr("data-patternpartial")) });
			document.getElementById("sg-viewport").contentWindow.postMessage(obj,codeViewer.targetOrigin);
		});
		
		// get the file name of the pattern so we can get the various editions of the code that can show in code view
		var fileName = urlHandler.getFileName(patternData.patternPartial);
		
		// request the encoded markup version of the pattern
		var e = new XMLHttpRequest();
		e.onload = this.saveEncoded;
		e.open("GET", fileName.replace(/\.html/,".escaped.html") + "?" + (new Date()).getTime(), true);
		e.send();
		
		// request the mustache markup version of the pattern
		var m = new XMLHttpRequest();
		m.onload = this.saveMustache;
		m.open("GET", fileName.replace(/\.html/,"."+patternData.patternExtension) + "?" + (new Date()).getTime(), true);
		m.send();
		
		// if css is enabled request the css for the pattern
		if (patternData.cssEnabled) {
			var c = new XMLHttpRequest();
			c.onload = this.saveCSS;
			c.open("GET", fileName.replace(/\.html/,".css") + "?" + (new Date()).getTime(), true);
			c.send();
		}
		
		// make sure the click events are handled on the HTML tab
		$(codeViewer.ids["e"]).click(function() {
			codeViewer.swapCode("e");
		});
		
		// make sure the click events are handled on the Mustache tab
		$(codeViewer.ids["m"]).click(function() {
			codeViewer.swapCode("m");
		});
		
		// make sure the click events are handled on the CSS tab
		$(codeViewer.ids["c"]).click(function() {
			codeViewer.swapCode("c");
		});
		
		// move the code into view
		codeViewer.slideCode(0);
		
		$("#sg-code-loader").css("display","none");
		
	},
	
	/**
	* toggle the comment pop-up based on a user clicking on the pattern
	* based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	* @param  {Object}      event info
	*/
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		// switch based on stuff related to the postmessage
		if ((data.event !== undefined) && (data.event == "patternLab.codePanel")) {
			if (data.codeOverlay === "on") {
				codeViewer.updateCode(data.patternData);
			} else {
				codeViewer.slideCode($('#sg-code-container').outerHeight());
			}
		}
		
		if ((data.event !== undefined) && (data.event == "patternLab.keyPress")) {
			
			if (data.keyPress == 'ctrl+shift+c') {
				codeViewer.toggleCode();
				return false;
			} else if (data.keyPress == 'cmd+a') {
				codeViewer.selectCode();
				return false;
			} else if (data.keyPress == 'ctrl+shift+u') {
				if (codeViewer.codeActive) {
					codeViewer.swapCode("m");
					return false;
				}
			} else if (data.keyPress == 'ctrl+shift+y') {
				if (codeViewer.codeActive) {
					codeViewer.swapCode("e");
					return false;
				}
			} else if (data.keyPress == 'esc') {
				if (codeViewer.codeActive) {
					codeViewer.closeCode();
					return false;
				}
			}
			
		}
		
	}
	
};

// when the document is ready make the codeViewer ready
$(document).ready(function() { codeViewer.onReady(); });
window.addEventListener("message", codeViewer.receiveIframeMessage, false);

// make sure if a new pattern or view-all is loaded that comments are turned on as appropriate
$('#sg-viewport').load(function() {
	if (codeViewer.codeActive) {
		var obj = JSON.stringify({ "event": "patternLab.codePanel", "codeToggle": "on" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,codeViewer.targetOrigin);
	}
});

// toggle the code panel
jwerty.key('ctrl+shift+c', function (e) {
	codeViewer.toggleCode();
	return false;
});

// when the code panel is open hijack cmd+a so that it only selects the code view
jwerty.key('cmd+a/ctrl+a', function (e) {
	if (codeViewer.codeActive) {
		codeViewer.selectCode();
		return false;
	}
});

// open the mustache panel
jwerty.key('ctrl+shift+u', function (e) {
	if (codeViewer.codeActive) {
		codeViewer.swapCode("m");
		return false;
	}
});

// open the html panel
jwerty.key('ctrl+shift+y', function (e) {
	if (codeViewer.codeActive) {
		codeViewer.swapCode("e");
		return false;
	}
});

// close the code panel if using escape
jwerty.key('esc', function (e) {
	if (codeViewer.codeActive) {
		codeViewer.closeCode();
		return false;
	}
});

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;
	
	function raw(s) {
		return s;
	}
	
	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}
	
	var config = $.cookie = function (key, value, options) {
		
		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);
			
			if (value === null) {
				options.expires = -1;
			}
			
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			
			value = config.json ? JSON.stringify(value) : String(value);
			
			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}
		
		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}
		
		return null;
	};
	
	config.defaults = {};
	
	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

/*!
 * Data Saver
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

var DataSaver = {
	
	// the name of the cookie to store the data in
	cookieName: "patternlab",
	
	/**
	* Add a given value to the cookie
	* @param  {String}       the name of the key
	* @param  {String}       the value
	*/
	addValue: function (name,val) {
		var cookieVal = $.cookie(this.cookieName);
		cookieVal = ((cookieVal === null) || (cookieVal === "")) ? name+"~"+val : cookieVal+"|"+name+"~"+val;
		$.cookie(this.cookieName,cookieVal);
	},
	
	/**
	* Update a value found in the cookie. If the key doesn't exist add the value
	* @param  {String}       the name of the key
	* @param  {String}       the value
	*/
	updateValue: function (name,val) {
		if (this.findValue(name)) {
			var updateCookieVals = "";
			var cookieVals = $.cookie(this.cookieName).split("|");
			for (var i = 0; i < cookieVals.length; i++) {
				var fieldVals = cookieVals[i].split("~");
				if (fieldVals[0] == name) {
					fieldVals[1] = val;
				}
				updateCookieVals += (i > 0) ? "|"+fieldVals[0]+"~"+fieldVals[1] : fieldVals[0]+"~"+fieldVals[1];
			}
			$.cookie(this.cookieName,updateCookieVals);
		} else {
			this.addValue(name,val);
		}
	},
	
	/**
	* Remove the given key
	* @param  {String}       the name of the key
	*/
	removeValue: function (name) {
		var updateCookieVals = "";
		var cookieVals = $.cookie(this.cookieName).split("|");
		var k = 0;
		for (var i = 0; i < cookieVals.length; i++) {
			var fieldVals = cookieVals[i].split("~");
			if (fieldVals[0] != name) {
				updateCookieVals += (k === 0) ? fieldVals[0]+"~"+fieldVals[1] : "|"+fieldVals[0]+"~"+fieldVals[1];
				k++;
			}
		}
		$.cookie(this.cookieName,updateCookieVals);
	},
	
	/**
	* Find the value using the given key
	* @param  {String}       the name of the key
	*
	* @return {String}       the value of the key or false if the value isn't found
	*/
	findValue: function (name) {
		if ($.cookie(this.cookieName)) {
			var cookieVals = $.cookie(this.cookieName).split("|");
			for (var i = 0; i < cookieVals.length; i++) {
				var fieldVals = cookieVals[i].split("~");
				if (fieldVals[0] == name) {
					return fieldVals[1];
				}
			}
		} 
		return false;
	}
	
};

/*!
 * Simple Layout Rendering for Pattern Lab
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

/* load pattern nav */
var template         = document.getElementById("pl-pattern-nav-template");
var templateCompiled = Hogan.compile(template.innerHTML);
var templateRendered = templateCompiled.render(navItems);
document.getElementById("pl-pattern-nav-target").innerHTML = templateRendered;

/* load ish controls */
var template         = document.getElementById("pl-ish-controls-template");
var templateCompiled = Hogan.compile(template.innerHTML);
var templateRendered = templateCompiled.render(ishControls);
document.getElementById("sg-controls").innerHTML = templateRendered;
/*!
 * Pattern Finder
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var patternFinder = {
	
	data:   [],
	active: false,
	
	init: function() {
		
		for (var patternType in patternPaths) {
			if (patternPaths.hasOwnProperty(patternType)) {
				for (var pattern in patternPaths[patternType]) {
					var obj = {};
					obj.patternPartial = patternType+"-"+pattern;
					obj.patternPath    = patternPaths[patternType][pattern];
					this.data.push(obj);
				}
			}
		}
		
		// instantiate the bloodhound suggestion engine
		var patterns = new Bloodhound({
			datumTokenizer: function(d) { return Bloodhound.tokenizers.nonword(d.patternPartial); },
			queryTokenizer: Bloodhound.tokenizers.nonword,
			limit: 10,
			local: this.data
		});
		
		// initialize the bloodhound suggestion engine
		patterns.initialize();
		
		$('#sg-find .typeahead').typeahead({ highlight: true }, {
			displayKey: 'patternPartial',
			source: patterns.ttAdapter()
		});
		//.on('typeahead:selected', patternFinder.onAutocompleted).on('typeahead:autocompleted', patternFinder.onSelected);
		
	},
	
	passPath: function(item) {
		// update the iframe via the history api handler
		patternFinder.closeFinder();
		var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": urlHandler.getFileName(item.patternPartial) });
		document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
	},
	
	onSelected: function(e,item) {
		patternFinder.passPath(item);
	},
	
	onAutocompleted: function(e,item) {
		patternFinder.passPath(item);
	},
	
	toggleFinder: function() {
		if (!patternFinder.active) {
			patternFinder.openFinder();
		} else {
			patternFinder.closeFinder();
		}
	},
	
	openFinder: function() {
		patternFinder.active = true;
		$('#sg-find .typeahead').val("");
		$("#sg-find").addClass('show-overflow');
		$('#sg-find .typeahead').focus();
	},
	
	closeFinder: function() {
		patternFinder.active = false;
		$("#sg-find").removeClass('show-overflow');
		$('.sg-acc-handle, .sg-acc-panel').removeClass('active');
		$('#sg-find .typeahead').val("");
	},
	
	receiveIframeMessage: function(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		if ((data.event !== undefined) && (data.event == "patternLab.keyPress")) {
			
			if (data.keyPress == 'ctrl+shift+f') {
				patternFinder.toggleFinder();
				return false;
			}
			
		}
		
	}
	
};

patternFinder.init();

window.addEventListener("message", patternFinder.receiveIframeMessage, false);

$('#sg-find .typeahead').focus(function() {
	if (!patternFinder.active) {
		patternFinder.openFinder();
	}
});

$('#sg-find .typeahead').blur(function() {
	patternFinder.closeFinder();
});

// jwerty stuff
// toggle the annotations panel
jwerty.key('ctrl+shift+f', function (e) {
	$('.sg-find .sg-acc-handle, .sg-find .sg-acc-panel').addClass('active');
	patternFinder.toggleFinder();
	return false;
});
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

/**
 * @requires data-saver.js
 * @requires url-handler.js
 * @requires postmessage.js
 */

(function (w) {
	
	var sw = document.body.clientWidth, //Viewport Width
		sh = $(document).height(), //Viewport Height
		minViewportWidth = parseInt(config.ishMinimum), //Minimum Size for Viewport
		maxViewportWidth = parseInt(config.ishMaximum), //Maxiumum Size for Viewport
		viewportResizeHandleWidth = 14, //Width of the viewport drag-to-resize handle
		$sgViewport = $('#sg-viewport'), //Viewport element
		$sizePx = $('.sg-size-px'), //Px size input element in toolbar
		$sizeEms = $('.sg-size-em'), //Em size input element in toolbar
		$bodySize = (config.ishFontSize !== undefined) ? parseInt(config.ishFontSize) : parseInt($('body').css('font-size')), //Body size of the document,
		$headerHeight = $('.sg-header').height(),
		discoID = false,
		discoMode = false,
		hayMode = false;
	
	//Update dimensions on resize
	$(w).resize(function() {
		sw = document.body.clientWidth;
		sh = $(document).height();

		setAccordionHeight();
	});

	// Accordion dropdown
	$('.sg-acc-handle').on("click", function(e){
		e.preventDefault();

		var $this = $(this),
			$panel = $this.next('.sg-acc-panel'),
			subnav = $this.parent().parent().hasClass('sg-acc-panel');

		//Close other panels if link isn't a subnavigation item
		if (!subnav) {
			$('.sg-acc-handle').not($this).removeClass('active');
			$('.sg-acc-panel').not($panel).removeClass('active');
		}

		//Activate selected panel
		$this.toggleClass('active');
		$panel.toggleClass('active');
		setAccordionHeight();
	});

	//Accordion Height 
	function setAccordionHeight() {
		var $activeAccordion = $('.sg-acc-panel.active').first(),
			accordionHeight = $activeAccordion.height(),
			availableHeight = sh-$headerHeight; //Screen height minus the height of the header
		
		$activeAccordion.height(availableHeight); //Set height of accordion to the available height
	}

	$('.sg-nav-toggle').on("click", function(e){
		e.preventDefault();
		$('.sg-nav-container').toggleClass('active');
	});
	
	// "View (containing clean, code, raw, etc options) Trigger
	$('#sg-t-toggle').on("click", function(e){
		e.preventDefault();
		$(this).parents('ul').toggleClass('active');
	});

	//Size Trigger
	$('#sg-size-toggle').on("click", function(e){
		e.preventDefault();
		$(this).parents('ul').toggleClass('active');
	});
	
	//Phase View Events
	$('.sg-size[data-size]').on("click", function(e){
		e.preventDefault();
		killDisco();
		killHay();
		
		var val = $(this).attr('data-size');
		
		if (val.indexOf('px') > -1) {
			$bodySize = 1;
		}
		
		val = val.replace(/[^\d.-]/g,'');
		sizeiframe(Math.floor(val*$bodySize));
	});
	
	//Size View Events

	// handle small button
	function goSmall() {
		killDisco();
		killHay();
		sizeiframe(getRandom(minViewportWidth,500));
	}
	
	$('#sg-size-s').on("click", function(e){
		e.preventDefault();
		goSmall();
	});
	
	jwerty.key('ctrl+shift+s', function(e) {
		goSmall();
		return false;
	});
	
	// handle medium button
	function goMedium() {
		killDisco();
		killHay();
		sizeiframe(getRandom(500,800));
	}
	
	$('#sg-size-m').on("click", function(e){
		e.preventDefault();
		goMedium();
	});
	
	jwerty.key('ctrl+shift+m', function(e) {
		goLarge();
		return false;
	});
	
	// handle large button
	function goLarge() {
		killDisco();
		killHay();
		sizeiframe(getRandom(800,1200));
	}
	
	$('#sg-size-l').on("click", function(e){
		e.preventDefault();
		goLarge();
	});
	
	jwerty.key('ctrl+shift+l', function(e) {
		goLarge();
		return false;
	});

	//Click Full Width Button
	$('#sg-size-full').on("click", function(e){ //Resets 
		e.preventDefault();
		killDisco();
		killHay();
		sizeiframe(sw);
	});
	
	//Click Random Size Button
	$('#sg-size-random').on("click", function(e){
		e.preventDefault();
		killDisco();
		killHay();
		sizeiframe(getRandom(minViewportWidth,sw));
	});
	
	//Click for Disco Mode, which resizes the viewport randomly
	$('#sg-size-disco').on("click", function(e){
		e.preventDefault();
		killHay();

		if (discoMode) {
			killDisco();

		} else {
			startDisco();
		}
	});

	/* Disco Mode */
	function disco() {
		sizeiframe(getRandom(minViewportWidth,sw));
	}
	
	function killDisco() {
		discoMode = false;
		clearInterval(discoID);
		discoID = false;
	}
	
	function startDisco() {
		discoMode = true;
		discoID = setInterval(disco, 800);
	}
	
	jwerty.key('ctrl+shift+d', function(e) {
		if (!discoMode) {
			startDisco();
		} else {
			killDisco();
		}
		return false;
	});

	//Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
	$('#sg-size-hay').on("click", function(e){
		e.preventDefault();
		killDisco();
		if (hayMode) {
			killHay();
		} else {
			startHay();
		}
	});

	//Stop Hay! Mode
	function killHay() {
		var currentWidth = $sgViewport.width();
		hayMode = false;
		$sgViewport.removeClass('hay-mode');
		$('#sg-gen-container').removeClass('hay-mode');
		sizeiframe(Math.floor(currentWidth));
	}
	
	// start Hay! mode
	function startHay() {
		hayMode = true;
		$('#sg-gen-container').removeClass("vp-animate").width(minViewportWidth+viewportResizeHandleWidth);
		$sgViewport.removeClass("vp-animate").width(minViewportWidth);
		
		var timeoutID = window.setTimeout(function(){
			$('#sg-gen-container').addClass('hay-mode').width(maxViewportWidth+viewportResizeHandleWidth);
			$sgViewport.addClass('hay-mode').width(maxViewportWidth);
			
			setInterval(function(){ var vpSize = $sgViewport.width(); updateSizeReading(vpSize); },100);
		}, 200);
	}
	
	// start hay from a keyboard shortcut
	jwerty.key('ctrl+shift+h', function(e) {
		if (!hayMode) {
			startHay();
		} else {
			killHay();
		}
	});

	//Pixel input
	$sizePx.on('keydown', function(e){
		var val = Math.floor($(this).val());

		if(e.keyCode === 38) { //If the up arrow key is hit
			val++;
			sizeiframe(val,false);
		} else if(e.keyCode === 40) { //If the down arrow key is hit
			val--;
			sizeiframe(val,false);
		} else if(e.keyCode === 13) { //If the Enter key is hit
			e.preventDefault();
			sizeiframe(val); //Size Iframe to value of text box
			$(this).blur();
		}
	});

	$sizePx.on('keyup', function(){
		var val = Math.floor($(this).val());
		updateSizeReading(val,'px','updateEmInput');
	});

	//Em input
	$sizeEms.on('keydown', function(e){
		var val = parseFloat($(this).val());

		if(e.keyCode === 38) { //If the up arrow key is hit
			val++;
			sizeiframe(Math.floor(val*$bodySize),false);
		} else if(e.keyCode === 40) { //If the down arrow key is hit
			val--;
			sizeiframe(Math.floor(val*$bodySize),false);
		} else if(e.keyCode === 13) { //If the Enter key is hit
			e.preventDefault();
			sizeiframe(Math.floor(val*$bodySize)); //Size Iframe to value of text box
		}
	});

	$sizeEms.on('keyup', function(){
		var val = parseFloat($(this).val());
		updateSizeReading(val,'em','updatePxInput');
	});
	
	// set 0 to 320px as a default
	jwerty.key('ctrl+shift+0', function(e) {
		e.preventDefault();
		sizeiframe(320,true);
		return false;
	});
	
	// handle the MQ click
	var mqs = [];
	$('#sg-mq a').each(function(i) {
		
		mqs.push($(this).html());
		
		// bind the click
		$(this).on("click", function(i,k) {
			return function(e) {
				e.preventDefault();
				var val = $(k).html();
				var type = (val.indexOf("px") !== -1) ? "px" : "em";
				val = val.replace(type,"");
				var width = (type === "px") ? val*1 : val*$bodySize;
				sizeiframe(width,true);
			};
		}(i,this));
		
		// bind the keyboard shortcut. can't use cmd on a mac because 3 & 4 are for screenshots
		jwerty.key('ctrl+shift+'+(i+1), function (k) {
			return function(e) {
				var val = $(k).html();
				var type = (val.indexOf("px") !== -1) ? "px" : "em";
				val = val.replace(type,"");
				var width = (type === "px") ? val*1 : val*$bodySize;
				sizeiframe(width,true);
				return false;
			};
		}(this));
		
	});
	
	//Resize the viewport
	//'size' is the target size of the viewport
	//'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
	function sizeiframe(size,animate) {
		var theSize;
		
		if(size>maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
			theSize = maxViewportWidth;
		} else if(size<minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
			theSize = minViewportWidth;
		} else {
			theSize = size;
		}
		
		//Conditionally remove CSS animation class from viewport
		if(animate===false) {
			$('#sg-gen-container,#sg-viewport').removeClass("vp-animate"); //If aninate is set to false, remove animate class from viewport
		} else {
			$('#sg-gen-container,#sg-viewport').addClass("vp-animate");
		}
		
		$('#sg-gen-container').width(theSize+viewportResizeHandleWidth); //Resize viewport wrapper to desired size + size of drag resize handler
		$sgViewport.width(theSize); //Resize viewport to desired size
		
		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
		var obj = JSON.stringify({ "event": "patternLab.resize", "resize": "true" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,targetOrigin);
		
		updateSizeReading(theSize); //Update values in toolbar
		saveSize(theSize); //Save current viewport to cookie
	}
	
	$("#sg-gen-container").on('transitionend webkitTransitionEnd', function(e){
		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
		var obj = JSON.stringify({ "event": "patternLab.resize", "resize": "true" });
		document.getElementById('sg-viewport').contentWindow.postMessage(obj,targetOrigin);
	});
	
	function saveSize(size) {
		if (!DataSaver.findValue('vpWidth')) {
			DataSaver.addValue("vpWidth",size);
		} else {
			DataSaver.updateValue("vpWidth",size);
		}
	}
	
	
	//Update Pixel and Em inputs
	//'size' is the input number
	//'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
	//'target' is what inputs to update. Defaults to both
	function updateSizeReading(size,unit,target) {
		var emSize, pxSize;

		if(unit==='em') { //If size value is in em units
			emSize = size;
			pxSize = Math.floor(size*$bodySize);
		} else { //If value is px or absent
			pxSize = size;
			emSize = size/$bodySize;
		}
		
		if (target === 'updatePxInput') {
			$sizePx.val(pxSize);
		} else if (target === 'updateEmInput') {
			$sizeEms.val(emSize.toFixed(2));
		} else {
			$sizeEms.val(emSize.toFixed(2));
			$sizePx.val(pxSize);
		}
	}
	
	/* Returns a random number between min and max */
	function getRandom (min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	
	//Update The viewport size
	function updateViewportWidth(size) {
		$("#sg-viewport").width(size);
		$("#sg-gen-container").width(size*1 + 14);
		
		updateSizeReading(size);
	}

	//Detect larger screen and no touch support
	/*
	if('ontouchstart' in document.documentElement && window.matchMedia("(max-width: 700px)").matches) {
		$('body').addClass('no-resize');
		$('#sg-viewport ').width(sw);

		alert('workit');
	} else {
		
	}
	*/
	
	$('#sg-gen-container').on('touchstart', function(event){});

	// handles widening the "viewport"
	//   1. on "mousedown" store the click location
	//   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
	//   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
	$('#sg-rightpull').mousedown(function(event) {
		
		// capture default data
		var origClientX = event.clientX;
		var origViewportWidth = $sgViewport.width();
		
		// show the cover
		$("#sg-cover").css("display","block");
		
		// add the mouse move event and capture data. also update the viewport width
		$('#sg-cover').mousemove(function(event) {
			var viewportWidth;
			
			viewportWidth = origViewportWidth + 2*(event.clientX - origClientX);
			
			if (viewportWidth > minViewportWidth) {
				
				if (!DataSaver.findValue('vpWidth')) {
					DataSaver.addValue("vpWidth",viewportWidth);
				} else {
					DataSaver.updateValue("vpWidth",viewportWidth);
				}
				
				sizeiframe(viewportWidth,false);
			}
		});
		
		return false;
		
	});

	// on "mouseup" we unbind the "mousemove" event and hide the cover again
	$('body').mouseup(function() {
		$('#sg-cover').unbind('mousemove');
		$('#sg-cover').css("display","none");
	});


	// capture the viewport width that was loaded and modify it so it fits with the pull bar
	var origViewportWidth = $("#sg-viewport").width();
	$("#sg-gen-container").width(origViewportWidth);
	
	var testWidth = screen.width;
	if (window.orientation !== undefined) {
		testWidth = (window.orientation === 0) ? screen.width : screen.height;
	}
	if (($(window).width() == testWidth) && ('ontouchstart' in document.documentElement) && ($(window).width() <= 1024)) {
		$("#sg-rightpull-container").width(0);
	} else {
		$("#sg-viewport").width(origViewportWidth - 14);
	}
	updateSizeReading($("#sg-viewport").width());
	
	// get the request vars
	var oGetVars = urlHandler.getRequestVars();
	
	// pre-load the viewport width
	var vpWidth = 0;
	var trackViewportWidth = true; // can toggle this feature on & off

	if ((oGetVars.h !== undefined) || (oGetVars.hay !== undefined)) {
		startHay();
	} else if ((oGetVars.d !== undefined) || (oGetVars.disco !== undefined)) {
		startDisco();
	} else if ((oGetVars.w !== undefined) || (oGetVars.width !== undefined)) {
		vpWidth = (oGetVars.w !== undefined) ? oGetVars.w : oGetVars.width;
		vpWidth = (vpWidth.indexOf("em") !== -1) ? Math.floor(Math.floor(vpWidth.replace("em",""))*$bodySize) : Math.floor(vpWidth.replace("px",""));
		DataSaver.updateValue("vpWidth",vpWidth);
		updateViewportWidth(vpWidth);
	} else if (trackViewportWidth && (vpWidth = DataSaver.findValue("vpWidth"))) {
		updateViewportWidth(vpWidth);
	}
	
	// load the iframe source
	var patternName = "all";
	var patternPath = "";
	var iFramePath  = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+"styleguide/html/styleguide.html?"+Date.now();
	if ((oGetVars.p !== undefined) || (oGetVars.pattern !== undefined)) {
		patternName = (oGetVars.p !== undefined) ? oGetVars.p : oGetVars.pattern;
		patternPath = urlHandler.getFileName(patternName);
		iFramePath  = (patternPath !== "") ? window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+patternPath+"?"+Date.now() : iFramePath;
	}
	
	if (patternName !== "all") {
		document.getElementById("title").innerHTML = "Pattern Lab - "+patternName;
		history.replaceState({ "pattern": patternName }, null, null);
	}
	
	if (document.getElementById("sg-raw") !== undefined) {
		document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
	}
	
	urlHandler.skipBack = true;
	document.getElementById("sg-viewport").contentWindow.location.replace(iFramePath);

	//Close all dropdowns and navigation
	function closePanels() {
		$('.sg-nav-container, .sg-nav-toggle, .sg-acc-handle, .sg-acc-panel').removeClass('active');
		patternFinder.closeFinder();
	}

	// update the iframe with the source from clicked element in pull down menu. also close the menu
	// having it outside fixes an auto-close bug i ran into
	$('a[data-patternpartial]').on("click", function(e){
		e.preventDefault();
		// update the iframe via the history api handler
		var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": urlHandler.getFileName($(this).attr("data-patternpartial")) });
		document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
		closePanels();
	});

	// handle when someone clicks on the grey area of the viewport so it auto-closes the nav
	$('#sg-vp-wrap').click(function() {
		closePanels();
	});
	
	// Listen for resize changes
	if (window.orientation !== undefined) {
		var origOrientation = window.orientation;
		window.addEventListener("orientationchange", function() {
			if (window.orientation != origOrientation) {
				$("#sg-gen-container").width($(window).width());
				$("#sg-viewport").width($(window).width());
				updateSizeReading($(window).width());
				origOrientation = window.orientation;
			}
		}, false);
		
	}
	
	// watch the iframe source so that it can be sent back to everyone else.
	// based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	function receiveIframeMessage(event) {
		
		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
			return;
		}
		
		var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
		
		if (data.event == "patternLab.bodyclick") {
			
			closePanels();
			
		} else if (data.event == "patternLab.pageLoad") {
			
			if (!urlHandler.skipBack) {
				
				if ((history.state === undefined) || (history.state === null) || (history.state.pattern !== data.patternpartial)) {
					urlHandler.pushPattern(data.patternpartial, data.path);
				}
				
				/*
				if (wsnConnected) {
					var iFramePath = urlHandler.getFileName(data.patternpartial);
					wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+event.data.patternpartial+'" }' );
				}
				*/
			}
			
			// reset the defaults
			urlHandler.skipBack = false;
			
		} else if (data.event == "patternLab.keyPress") {
			if (data.keyPress == 'ctrl+shift+s') {
				goSmall();
			} else if (data.keyPress == 'ctrl+shift+m') {
				goMedium();
			} else if (data.keyPress == 'ctrl+shift+l') {
				goLarge();
			} else if (data.keyPress == 'ctrl+shift+d') {
				if (!discoMode) {
					startDisco();
				} else {
					killDisco();
				}
			} else if (data.keyPress == 'ctrl+shift+h') {
				if (!hayMode) {
					startHay();
				} else {
					killHay();
				}
			} else if (data.keyPress == 'ctrl+shift+0') {
				sizeiframe(320,true);
			} else if (found = data.keyPress.match(/ctrl\+shift\+([1-9])/)) {
				var val = mqs[(found[1]-1)];
				var type = (val.indexOf("px") !== -1) ? "px" : "em";
				val = val.replace(type,"");
				var width = (type === "px") ? val*1 : val*$bodySize;
				sizeiframe(width,true);
			}
			return false;
		}
	}
	window.addEventListener("message", receiveIframeMessage, false);
	
	/*if (qrCodeGeneratorOn) {
		$('.sg-tools').click(function() {
			if ((qrCodeGenerator.lastGenerated == "") || (qrCodeGenerator.lastGenerated != window.location.search)) {
				qrCodeGenerator.getQRCode();
				qrCodeGenerator.lastGenerated = window.location.search;
			}
		});
	}*/
	
})(this);
/*!
 * Plugin Loader
 *
 * Copyright (c) 2015 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Takes the assets they can be loaded for plugins and adds them to the DOM
 *
 * @requires styleguide.js
 *
 */

var pluginLoader = {
	
	init: function () {
		
		var s, t, l, c, n;
		
		for (var i = 0; i < plugins.length; ++i) {
			
			var plugin = plugins[i];
			
			// load the templates
			for (var key in plugin.templates) {
				if (plugin.templates.hasOwnProperty(key)) {
					t           = document.getElementsByTagName('script');
					l           = t.length - 1;
					s           = t[l];
					n           = document.createElement('script');
					n.type      = 'text/mustache';
					n.id        = plugin.name.replace("\/","-")+"-"+key+"-template";
					n.innerHTML = plugin.templates[key];
					s.parentNode.insertBefore(n, s.nextSibling);
				}
			}
			
			// load the stylesheets
			for (var k = 0; k < plugin.stylesheets.length; ++k) {
				s       = plugin.stylesheets[k];
				t       = document.getElementsByTagName('link');
				l       = t.length - 1;
				c       = t[l];
				n       = document.createElement('link');
				n.type  = 'text/css';
				n.rel   = 'stylesheet';
				n.href  = 'patternlab-components/'+plugin.name+'/'+s;
				n.media = 'screen';
				c.parentNode.insertBefore(n, c.nextSibling);
			}
			
			// load the javascript
			// $script.path('patternlab-components/'+plugin.name+'/');
			$script(plugin.javascripts, plugin.name, eval('(function() { '+plugin.callback+' })'));
			$script.ready([plugin.name], eval('(function() { '+plugin.onready+' })'));
			
		}
		
	}
	
};

pluginLoader.init();
