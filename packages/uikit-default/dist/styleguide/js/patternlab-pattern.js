/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
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
	var options = {
		"event": "patternLab.pageLoad",
		"path": parts[0]
	};

	patternData = document.getElementById('pl-pattern-data-footer').innerHTML;
	patternData = JSON.parse(patternData);
	options.patternpartial = (patternData.patternPartial !== undefined) ? patternData.patternPartial : "all";
	if (patternData.lineage !== "") {
		options.lineage = patternData.lineage;
	}

	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol + "//" + window.location.host;
	parent.postMessage(options, targetOrigin);

	// find all links and add an onclick handler for replacing the iframe address so the history works
	var aTags = document.getElementsByTagName('a');
	for (var i = 0; i < aTags.length; i++) {
		aTags[i].onclick = function (e) {
			var href = this.getAttribute("href");
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

}

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {

	// does the origin sending the message match the current host? if not dev/null the request
	if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol + "//" + window.location.host)) {
		return;
	}

	var path;
	var data = {};
	try {
		data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
	} catch (e) {}

	if ((data.event !== undefined) && (data.event == "patternLab.updatePath")) {

		if (patternData.patternPartial !== undefined) {

			// handle patterns and the view all page
			var re = /(patterns|snapshots)\/(.*)$/;
			path = window.location.protocol + "//" + window.location.host + window.location.pathname.replace(re, '') + data.path + '?' + Date.now();
			window.location.replace(path);

		} else {

			// handle the style guide
			path = window.location.protocol + "//" + window.location.host + window.location.pathname.replace("styleguide\/html\/styleguide.html", "") + data.path + '?' + Date.now();
			window.location.replace(path);

		}

	} else if ((data.event !== undefined) && (data.event == "patternLab.reload")) {

		// reload the location if there was a message to do so
		window.location.reload();

	}

}
window.addEventListener("message", receiveIframeMessage, false);
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
	targetOrigin: (window.location.protocol == "file:") ? "*" : window.location.protocol + "//" + window.location.host,

	/**
	 * get the real file name for a given pattern name
	 * @param  {String}       the shorthand partials syntax for a given pattern
	 * @param  {Boolean}      with the file name should be returned with the full rendered suffix or not
	 *
	 * @return {String}       the real file path
	 */
	getFileName: function (name, withRenderedSuffix) {

		var baseDir = "patterns";
		var fileName = "";

		if (name === undefined) {
			return fileName;
		}

		if (withRenderedSuffix === undefined) {
			withRenderedSuffix = true;
		}

		if (name == "all") {
			return "styleguide/html/styleguide.html";
		} else if (name == "snapshots") {
			return "snapshots/index.html";
		}

		var paths = (name.indexOf("viewall-") != -1) ? viewAllPaths : patternPaths;
		var nameClean = name.replace("viewall-", "");

		// look at this as a regular pattern
		var bits = this.getPatternInfo(nameClean, paths);
		var patternType = bits[0];
		var pattern = bits[1];

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
		if ((name.indexOf("viewall-") !== -1) && (name.indexOf("viewall-") === 0) && (fileName !== "")) {
			fileName = baseDir + "/" + fileName.replace(regex, "-") + "/index.html";
		} else if (fileName !== "") {
			fileName = baseDir+"/"+fileName.replace(regex,"-")+"/"+fileName.replace(regex,"-");
			if (withRenderedSuffix) {
				var fileSuffixRendered = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.rendered !== undefined)) ? config.outputFileSuffixes.rendered : '';
				fileName = fileName+fileSuffixRendered+".html";
			}
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
			patternType += "-" + patternBits[i];
			i++;
		}

		var pattern = name.slice(patternType.length + 1, name.length);

		return [patternType, pattern];

	},

	/**
	 * search the request vars for a particular item
	 *
	 * @return {Object}       a search of the window.location.search vars
	 */
	getRequestVars: function () {

		// the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
		var oGetVars = new(function (sSearch) {
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
		var data = {
			"pattern": pattern
		};
		var fileName = urlHandler.getFileName(pattern);
		var path = window.location.pathname;
		path = (window.location.protocol === "file") ? path.replace("/public/index.html", "public/") : path.replace(/\/index\.html/, "/");
		var expectedPath = window.location.protocol + "//" + window.location.host + path + fileName;
		if (givenPath != expectedPath) {
			// make sure to update the iframe because there was a click
			var obj = JSON.stringify({
				"event": "patternLab.updatePath",
				"path": fileName
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, urlHandler.targetOrigin);
		} else {
			// add to the history
			var addressReplacement = (window.location.protocol == "file:") ? null : window.location.protocol + "//" + window.location.host + window.location.pathname.replace("index.html", "") + "?p=" + pattern;
			if (history.pushState !== undefined) {
				history.pushState(data, null, addressReplacement);
			}
			document.getElementById("title").innerHTML = "Pattern Lab - " + pattern;
			
			// Open in new window link
			if (document.querySelector('.pl-js-open-new-window') !== undefined) {
				// Set value of href to the path to the pattern
				document.querySelector('.pl-js-open-new-window').setAttribute("href", urlHandler.getFileName(pattern));
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

		var obj = JSON.stringify({
			"event": "patternLab.updatePath",
			"path": iFramePath
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, urlHandler.targetOrigin);
		document.getElementById("title").innerHTML = "Pattern Lab - " + patternName;
		document.querySelector('.pl-js-open-new-window').setAttribute("href", urlHandler.getFileName(patternName));
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
 * Panels Util
 * For both styleguide and viewer
 *
 * Copyright (c) 2013-16 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var panelsUtil = {

	/**
	 * Add click events to the template that was rendered
	 * @param  {String}      the rendered template for the modal
	 * @param  {String}      the pattern partial for the modal
	 */
	addClickEvents: function (templateRendered, patternPartial) {

		var els = templateRendered.querySelectorAll('.pl-js-tab-link');
		for (var i = 0; i < els.length; ++i) {
			els[i].onclick = function (e) {
				e.preventDefault();

				var patternPartial = this.getAttribute('data-patternpartial');
				var panelID = this.getAttribute('data-panelid');
				panelsUtil.show(patternPartial, panelID);
			};
		}

		return templateRendered;

	},

	/**
	 * Show a specific modal
	 * @param  {String}      the pattern partial for the modal
	 * @param  {String}      the ID of the panel to be shown
	 */
	show: function (patternPartial, panelID) {

		var els;

		// turn off all of the active tabs
		els = document.querySelectorAll('#pl-' + patternPartial + '-tabs .pl-js-tab-link');
		for (i = 0; i < els.length; ++i) {
			els[i].classList.remove('pl-is-active-tab');
		}

		// hide all of the panels
		els = document.querySelectorAll('#pl-' + patternPartial + '-panels .pl-js-tab-panel');
		for (i = 0; i < els.length; ++i) {
			els[i].classList.remove('pl-is-active-tab');
		}

		// add active tab class
		document.getElementById('pl-' + patternPartial + '-' + panelID + '-tab').classList.add('pl-is-active-tab');

		// show the panel
		document.getElementById('pl-' + patternPartial + '-' + panelID + '-panel').classList.add('pl-is-active-tab');

	}

};


/*!
 * Modal for the Styleguide Layer
 * For both annotations and code/info
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires panels-util.js
 * @requires url-handler.js
 *
 */

var modalStyleguide = {

	// set up some defaults
	active: [],
	targetOrigin: (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host,

	/**
	 * initialize the modal window
	 */
	onReady: function () {

		// go through the panel toggles and add click event to the pattern extra toggle button
		var els = document.querySelectorAll('.pl-js-pattern-extra-toggle');
		for (var i = 0; i < els.length; ++i) {
			els[i].onclick = (function (e) {
				var patternPartial = this.getAttribute('data-patternpartial');
				modalStyleguide.toggle(patternPartial);
			});
		}

	},

	/**
	 * toggle the modal window open and closed based on clicking the pip
	 * @param  {String}       the patternPartial that identifies what needs to be toggled
	 */
	toggle: function (patternPartial) {
		if ((modalStyleguide.active[patternPartial] === undefined) || !modalStyleguide.active[patternPartial]) {
			var el = document.getElementById('pl-pattern-data-' + patternPartial);
			modalStyleguide.collectAndSend(el, true, false);
		} else {
			modalStyleguide.highlightsHide();
			modalStyleguide.close(patternPartial);
		}

	},

	/**
	 * open the modal window for a view-all entry
	 * @param  {String}       the patternPartial that identifies what needs to be opened
	 * @param  {String}       the content that should be inserted
	 */
	open: function (patternPartial, content) {

		// make sure templateRendered is modified to be an HTML element
		var div = document.createElement('div');
		div.innerHTML = content;
		content = document.createElement('div').appendChild(div).querySelector('div');

		// add click events
		content = panelsUtil.addClickEvents(content, patternPartial);

		// make sure the modal viewer and other options are off just in case
		modalStyleguide.close(patternPartial);

		// note it's turned on in the viewer
		modalStyleguide.active[patternPartial] = true;

		// make sure there's no content
		div = document.getElementById('pl-pattern-extra-' + patternPartial);
		if (div.childNodes.length > 0) {
			div.removeChild(div.childNodes[0]);
		}

		// add the content
		document.getElementById('pl-pattern-extra-' + patternPartial).appendChild(content);

		// show the modal
		document.getElementById('pl-pattern-extra-toggle-' + patternPartial).classList.add('pl-is-active');
		document.getElementById('pl-pattern-extra-' + patternPartial).classList.add('pl-is-active');

	},

	/**
	 * close the modal window for a view-all entry
	 * @param  {String}       the patternPartial that identifies what needs to be closed
	 */
	close: function (patternPartial) {

		// not that the modal viewer is no longer active
		modalStyleguide.active[patternPartial] = false;

		// hide the modal, look at info-panel.js
		document.getElementById('pl-pattern-extra-toggle-' + patternPartial).classList.remove('pl-is-active');
		document.getElementById('pl-pattern-extra-' + patternPartial).classList.remove('pl-is-active');

	},

	/**
	 * get the data that needs to be send to the viewer for rendering
	 * @param  {Element}      the identifier for the element that needs to be collected
	 * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
	 * @param  {Boolean}      if the text in the dropdown should be switched
	 */
	collectAndSend: function (el, iframePassback, switchText) {
		var patternData = JSON.parse(el.innerHTML);
		if (patternData.patternName !== undefined) {
			patternMarkupEl = document.querySelector('#' + patternData.patternPartial + ' > .pl-js-pattern-example');
			patternData.patternMarkup = (patternMarkupEl !== null) ? patternMarkupEl.innerHTML : document.querySelector('body').innerHTML;
			modalStyleguide.patternQueryInfo(patternData, iframePassback, switchText);
		}
	},

	/**
	 * hide the annotation highlights
	 */
	highlightsHide: function (patternPartial) {
		var patternPartialSelector = (patternPartial !== undefined) ? '#' + patternPartial + " > " : "";
		elsToHide = document.querySelectorAll(patternPartialSelector + '.pl-has-annotation');
		for (i = 0; i < elsToHide.length; i++) {
			elsToHide[i].classList.remove('pl-has-annotation');
		}
		elsToHide = document.querySelectorAll(patternPartialSelector + '.pl-c-annotation-tip');
		for (i = 0; i < elsToHide.length; i++) {
			elsToHide[i].style.display = 'none';
		}
	},

	/**
	 * return the pattern info to the top level
	 * @param  {Object}       the content that will be sent to the viewer for rendering
	 * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
	 * @param  {Boolean}      if the text in the dropdown should be switched
	 */
	patternQueryInfo: function (patternData, iframePassback, switchText) {

		// send a message to the pattern
		try {
			var obj = JSON.stringify({
				'event': 'patternLab.patternQueryInfo',
				'patternData': patternData,
				'iframePassback': iframePassback,
				'switchText': switchText
			});
			parent.postMessage(obj, modalStyleguide.targetOrigin);
		} catch (e) {}

	},

	/**
	 * toggle the comment pop-up based on a user clicking on the pattern
	 * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	 * @param  {Object}      event info
	 */
	receiveIframeMessage: function (event) {

		var i;

		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol + '//' + window.location.host)) {
			return;
		}

		var data = {};
		try {
			data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
		} catch (e) {}

		// see if it got a path to replace
		if ((data.event !== undefined) && (data.event == 'patternLab.patternQuery')) {

			var els, iframePassback, patternData, patternMarkupEl;

			// find all elements related to pattern info
			els = document.querySelectorAll('.pl-js-pattern-data');
			iframePassback = (els.length > 1);

			// send each up to the parent to be read and compiled into panels
			for (i = 0; i < els.length; i++) {
				modalStyleguide.collectAndSend(els[i], iframePassback, data.switchText);
			}

		} else if ((data.event !== undefined) && (data.event == 'patternLab.patternModalInsert')) {

			// insert the previously rendered content being passed from the iframe
			modalStyleguide.open(data.patternPartial, data.modalContent);

		} else if ((data.event !== undefined) && (data.event == 'patternLab.annotationsHighlightShow')) {

			var elsToHighlight, j, item, span;

			// go over the supplied annotations
			for (i = 0; i < data.annotations.length; i++) {

				item = data.annotations[i];
				elsToHighlight = document.querySelectorAll(item.el);

				if (elsToHighlight.length > 0) {

					for (j = 0; j < elsToHighlight.length; j++) {

						elsToHighlight[j].classList.add('pl-has-annotation');

						span = document.createElement('span');
						span.innerHTML = item.displayNumber;
						span.classList.add('pl-c-annotation-tip');

						if (window.getComputedStyle(elsToHighlight[j], null).getPropertyValue('max-height') == '0px') {
							span.style.display = 'none';
						}

						annotationTip = document.querySelector(item.el + ' > span.pl-c-annotation-tip');
						if (annotationTip === null) {
							elsToHighlight[j].insertBefore(span, elsToHighlight[j].firstChild);
						} else {
							annotationTip.style.display = 'inline';
						}

						elsToHighlight[j].onclick = (function (item) {
							return function (e) {
								e.preventDefault();
								e.stopPropagation();
								var obj = JSON.stringify({
									'event': 'patternLab.annotationNumberClicked',
									'displayNumber': item.displayNumber
								});
								parent.postMessage(obj, modalStyleguide.targetOrigin);
							};
						})(item);

					}

				}

			}

		} else if ((data.event !== undefined) && (data.event == 'patternLab.annotationsHighlightHide')) {

			modalStyleguide.highlightsHide();

		} else if ((data.event !== undefined) && (data.event == 'patternLab.patternModalClose')) {

			var keys = [];
			for (var k in modalStyleguide.active) {
				keys.push(k);
			}
			for (i = 0; i < keys.length; i++) {
				var patternPartial = keys[i];
				if (modalStyleguide.active[patternPartial]) {
					modalStyleguide.close(patternPartial);
				}
			}

		}

	}

};

// when the document is ready make sure the modal is ready
modalStyleguide.onReady();
window.addEventListener('message', modalStyleguide.receiveIframeMessage, false);

