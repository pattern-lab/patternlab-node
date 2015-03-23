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
