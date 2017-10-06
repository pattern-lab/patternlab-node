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

