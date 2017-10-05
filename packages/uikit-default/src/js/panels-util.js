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

