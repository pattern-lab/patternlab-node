/**
 * @requires data-saver.js
 * @requires url-handler.js
 * @requires postmessage.js
 */

(function (w) {

	var sw = document.body.clientWidth, //Viewport Width
		sh = $(document).height(); //Viewport Height

		var minViewportWidth = 240;
		var maxViewportWidth = 2600;

		//set minimum and maximum viewport based on confg
		if (config.ishMinimum !== undefined) {
			minViewportWidth = parseInt(config.ishMinimum); //Minimum Size for Viewport
		}
		if (config.ishMaximum !== undefined) {
			maxViewportWidth = parseInt(config.ishMaximum); //Maxiumum Size for Viewport
		}
	
		//alternatively, use the ishViewportRange object
		if (config.ishViewportRange !== undefined) {
			minViewportWidth = config.ishViewportRange.s[0];
			maxViewportWidth = config.ishViewportRange.l[1];
		}
	
		var viewportResizeHandleWidth = 14, //Width of the viewport drag-to-resize handle
		$sgIframe = $('.pl-js-iframe'), //Viewport element
		$sizePx = $('#pl-size-px'), //Px size input element in toolbar
		$sizeEms = $('#pl-size-em'), //Em size input element in toolbar
		$bodySize = (config.ishFontSize !== undefined) ? parseInt(config.ishFontSize) : parseInt($('body').css('font-size')), //Body size of the document
		discoID = false,
		discoMode = false,
		fullMode = true,
		hayMode = false;

	//Update dimensions on resize
	$(w).resize(function () {
		sw = document.body.clientWidth;
		sh = $(document).height();

		if (fullMode === true) {
			sizeiframe(sw, false);
		}
	});

	// Nav menu button on small screens
	$('.pl-js-nav-trigger').on("click", function (e) {
		e.preventDefault();
		$('.pl-js-nav-target').toggleClass('pl-is-active');
	});

	// Accordion dropdown
	$('.pl-js-acc-handle').on("click", function (e) {
		e.preventDefault();

		var $this = $(this),
			$panel = $this.next('.pl-js-acc-panel'),
			subnav = $this.parent().parent().hasClass('pl-js-acc-panel');

		//Close other panels if link isn't a subnavigation item
		if (!subnav) {
			$('.pl-js-acc-handle').not($this).removeClass('pl-is-active');
			$('.pl-js-acc-panel').not($panel).removeClass('pl-is-active');
		}

		//Activate selected panel
		$this.toggleClass('pl-is-active');
		$panel.toggleClass('pl-is-active');
	});

	//Size View Events

	// handle small button
	function goSmall() {
		killDisco();
		killHay();
		fullMode = false;
		sizeiframe(getRandom(minViewportWidth, 500));
	}

	$('#pl-size-s').on("click", function (e) {
		e.preventDefault();
		goSmall();
	});

	jwerty.key('ctrl+shift+s', function (e) {
		goSmall();
		return false;
	});

	// handle medium button
	function goMedium() {
		killDisco();
		killHay();
		fullMode = false;
		sizeiframe(getRandom(
			minViewportWidth,
			config.ishViewportRange !== undefined ? parseInt(config.ishViewportRange.s[1]) : 500
		));
	}

	$('#pl-size-m').on("click", function (e) {
		e.preventDefault();
		goMedium();
	});

	jwerty.key('ctrl+shift+m', function (e) {
		goLarge();
		return false;
	});

	// handle large button
	function goLarge() {
		killDisco();
		killHay();
		fullMode = false;
		sizeiframe(getRandom(
			config.ishViewportRange !== undefined ? parseInt(config.ishViewportRange.l[0]) : 800,
			config.ishViewportRange !== undefined ? parseInt(config.ishViewportRange.l[1]) : 1200
		));
	}

	$('#pl-size-l').on("click", function (e) {
		e.preventDefault();
		goLarge();
	});

	jwerty.key('ctrl+shift+l', function (e) {
		goLarge();
		return false;
	});

	//Click Full Width Button
	$('#pl-size-full').on("click", function (e) { //Resets
		e.preventDefault();
		killDisco();
		killHay();
		fullMode = true;
		sizeiframe(sw);
	});

	//Click Random Size Button
	$('#pl-size-random').on("click", function (e) {
		e.preventDefault();
		killDisco();
		killHay();
		fullMode = false;
		sizeiframe(getRandom(minViewportWidth, sw));
	});

	//Click for Disco Mode, which resizes the viewport randomly
	$('#pl-size-disco').on("click", function (e) {
		e.preventDefault();
		killHay();
		fullMode = false;

		if (discoMode) {
			killDisco();

		} else {
			startDisco();
		}
	});

	// Disco Mode
	function disco() {
		sizeiframe(getRandom(minViewportWidth, sw));
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

	jwerty.key('ctrl+shift+d', function (e) {
		if (!discoMode) {
			startDisco();
		} else {
			killDisco();
		}
		return false;
	});

	//Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
	$('#pl-size-hay').on("click", function (e) {
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
		var currentWidth = $sgIframe.width();
		hayMode = false;
		$sgIframe.removeClass('hay-mode');
		$('.pl-js-vp-iframe-container').removeClass('hay-mode');
		sizeiframe(Math.floor(currentWidth));
	}

	// start Hay! mode
	function startHay() {
		hayMode = true;
		$('.pl-js-vp-iframe-container').removeClass("vp-animate").width(minViewportWidth + viewportResizeHandleWidth);
		$sgIframe.removeClass("vp-animate").width(minViewportWidth);

		var timeoutID = window.setTimeout(function () {
			$('.pl-js-vp-iframe-container').addClass('hay-mode').width(maxViewportWidth + viewportResizeHandleWidth);
			$sgIframe.addClass('hay-mode').width(maxViewportWidth);

			setInterval(function () {
				var vpSize = $sgIframe.width();
				updateSizeReading(vpSize);
			}, 100);
		}, 200);
	}

	// start hay from a keyboard shortcut
	jwerty.key('ctrl+shift+h', function (e) {
		if (!hayMode) {
			startHay();
		} else {
			killHay();
		}
	});

	//Pixel input
	$sizePx.on('keydown', function (e) {
		var val = Math.floor($(this).val());

		if (e.keyCode === 38) { //If the up arrow key is hit
			val++;
			sizeiframe(val, false);
		} else if (e.keyCode === 40) { //If the down arrow key is hit
			val--;
			sizeiframe(val, false);
		} else if (e.keyCode === 13) { //If the Enter key is hit
			e.preventDefault();
			sizeiframe(val); //Size Iframe to value of text box
			$(this).blur();
		}
	});

	$sizePx.on('keyup', function () {
		var val = Math.floor($(this).val());
		updateSizeReading(val, 'px', 'updateEmInput');
	});

	//Em input
	$sizeEms.on('keydown', function (e) {
		var val = parseFloat($(this).val());

		if (e.keyCode === 38) { //If the up arrow key is hit
			val++;
			sizeiframe(Math.floor(val * $bodySize), false);
		} else if (e.keyCode === 40) { //If the down arrow key is hit
			val--;
			sizeiframe(Math.floor(val * $bodySize), false);
		} else if (e.keyCode === 13) { //If the Enter key is hit
			e.preventDefault();
			sizeiframe(Math.floor(val * $bodySize)); //Size Iframe to value of text box
		}
	});

	$sizeEms.on('keyup', function () {
		var val = parseFloat($(this).val());
		updateSizeReading(val, 'em', 'updatePxInput');
	});

	// set 0 to 320px as a default
	jwerty.key('ctrl+shift+0', function (e) {
		e.preventDefault();
		sizeiframe(320, true);
		return false;
	});

	//Resize the viewport
	//'size' is the target size of the viewport
	//'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
	function sizeiframe(size, animate) {
		var theSize;

		if (size > maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
			theSize = maxViewportWidth;
		} else if (size < minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
			theSize = minViewportWidth;
		} else {
			theSize = size;
		}

		//Conditionally remove CSS animation class from viewport
		if (animate === false) {
			$('.pl-js-vp-iframe-container, .pl-js-iframe').removeClass("vp-animate"); //If aninate is set to false, remove animate class from viewport
		} else {
			$('.pl-js-vp-iframe-container, .pl-js-iframe').addClass("vp-animate");
		}

		$('.pl-js-vp-iframe-container').width(theSize + viewportResizeHandleWidth); //Resize viewport wrapper to desired size + size of drag resize handler
		$sgIframe.width(theSize); //Resize viewport to desired size

		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol + "//" + window.location.host;
		var obj = JSON.stringify({
			"event": "patternLab.resize",
			"resize": "true"
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, targetOrigin);

		updateSizeReading(theSize); //Update values in toolbar
		saveSize(theSize); //Save current viewport to cookie
	}

	$(".pl-js-vp-iframe-container").on('transitionend webkitTransitionEnd', function (e) {
		var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol + "//" + window.location.host;
		var obj = JSON.stringify({
			"event": "patternLab.resize",
			"resize": "true"
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, targetOrigin);
	});

	function saveSize(size) {
		if (!DataSaver.findValue('vpWidth')) {
			DataSaver.addValue("vpWidth", size);
		} else {
			DataSaver.updateValue("vpWidth", size);
		}
	}


	//Update Pixel and Em inputs
	//'size' is the input number
	//'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
	//'target' is what inputs to update. Defaults to both
	function updateSizeReading(size, unit, target) {
		var emSize, pxSize;

		if (unit === 'em') { //If size value is in em units
			emSize = size;
			pxSize = Math.floor(size * $bodySize);
		} else { //If value is px or absent
			pxSize = size;
			emSize = size / $bodySize;
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
	function getRandom(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	//Update The viewport size
	function updateViewportWidth(size) {
		$(".pl-js-iframe").width(size);
		$(".pl-js-vp-iframe-container").width(size * 1 + 14);

		updateSizeReading(size);
	}

	$('.pl-js-vp-iframe-container').on('touchstart', function (event) {});

	// handles widening the "viewport"
	//   1. on "mousedown" store the click location
	//   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
	//   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
	$('.pl-js-resize-handle').mousedown(function (event) {

		// capture default data
		var origClientX = event.clientX;
		var origViewportWidth = $sgIframe.width();

		fullMode = false;

		// show the cover
		$(".pl-js-viewport-cover").css("display", "block");

		// add the mouse move event and capture data. also update the viewport width
		$('.pl-js-viewport-cover').mousemove(function (event) {
			var viewportWidth;

			viewportWidth = origViewportWidth + 2 * (event.clientX - origClientX);

			if (viewportWidth > minViewportWidth) {

				if (!DataSaver.findValue('vpWidth')) {
					DataSaver.addValue("vpWidth", viewportWidth);
				} else {
					DataSaver.updateValue("vpWidth", viewportWidth);
				}

				sizeiframe(viewportWidth, false);
			}
		});

		return false;

	});

	// on "mouseup" we unbind the "mousemove" event and hide the cover again
	$('body').mouseup(function () {
		$('.pl-js-viewport-cover').unbind('mousemove');
		$('.pl-js-viewport-cover').css("display", "none");
	});


	// capture the viewport width that was loaded and modify it so it fits with the pull bar
	var origViewportWidth = $(".pl-js-iframe").width();
	$(".pl-js-vp-iframe-container").width(origViewportWidth);

	var testWidth = screen.width;
	if (window.orientation !== undefined) {
		testWidth = (window.orientation === 0) ? screen.width : screen.height;
	}
	if (($(window).width() == testWidth) && ('ontouchstart' in document.documentElement) && ($(window).width() <= 1024)) {
		$(".pl-js-resize-container").width(0);
	} else {
		$(".pl-js-iframe").width(origViewportWidth - 14);
	}
	updateSizeReading($(".pl-js-iframe").width());

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
		vpWidth = (vpWidth.indexOf("em") !== -1) ? Math.floor(Math.floor(vpWidth.replace("em", "")) * $bodySize) : Math.floor(vpWidth.replace("px", ""));
		DataSaver.updateValue("vpWidth", vpWidth);
		updateViewportWidth(vpWidth);
	} else if (trackViewportWidth && (vpWidth = DataSaver.findValue("vpWidth"))) {
		updateViewportWidth(vpWidth);
	}

	// set up the defaults for the
	var baseIframePath = window.location.protocol + "//" + window.location.host + window.location.pathname.replace("index.html", "");
	var patternName = ((config.defaultPattern !== undefined) && (typeof config.defaultPattern === 'string') && (config.defaultPattern.trim().length > 0)) ? config.defaultPattern : 'all';
	var iFramePath = baseIframePath + "styleguide/html/styleguide.html?" + Date.now();
	if ((oGetVars.p !== undefined) || (oGetVars.pattern !== undefined)) {
		patternName = (oGetVars.p !== undefined) ? oGetVars.p : oGetVars.pattern;
	}

	if (patternName !== "all") {
		patternPath = urlHandler.getFileName(patternName);
		iFramePath = (patternPath !== "") ? baseIframePath + patternPath + "?" + Date.now() : iFramePath;
		document.getElementById("title").innerHTML = "Pattern Lab - " + patternName;
		history.replaceState({
			"pattern": patternName
		}, null, null);
	}

	// Open in new window link
	if (document.querySelector('.pl-js-open-new-window') !== undefined) {
		// Set value of href to the path to the pattern
		document.querySelector('.pl-js-open-new-window').setAttribute("href", urlHandler.getFileName(patternName));
	}

	urlHandler.skipBack = true;
	document.querySelector('.pl-js-iframe').contentWindow.location.replace(iFramePath);

	// Close all dropdowns and navigation
	function closePanels() {
		$('.pl-js-nav-container, .pl-js-acc-handle, .pl-js-acc-panel').removeClass('pl-is-active');
		patternFinder.closeFinder();
	}

	// update the iframe with the source from clicked element in pull down menu. also close the menu
	// having it outside fixes an auto-close bug i ran into
	$('a[data-patternpartial]').on("click", function (e) {
		e.preventDefault();
		// update the iframe via the history api handler
		var obj = JSON.stringify({
			"event": "patternLab.updatePath",
			"path": urlHandler.getFileName($(this).attr("data-patternpartial"))
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, urlHandler.targetOrigin);
		closePanels();
	});

	// handle when someone clicks on the grey area of the viewport so it auto-closes the nav
	$('.pl-js-viewport').click(function () {
		closePanels();
	});

	// Listen for resize changes
	if (window.orientation !== undefined) {
		var origOrientation = window.orientation;
		window.addEventListener("orientationchange", function () {
			if (window.orientation != origOrientation) {
				$(".pl-js-vp-iframe-container").width($(window).width());
				$(".pl-js-iframe").width($(window).width());
				updateSizeReading($(window).width());
				origOrientation = window.orientation;
			}
		}, false);

	}

	// watch the iframe source so that it can be sent back to everyone else.
	// based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	function receiveIframeMessage(event) {

		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol + "//" + window.location.host)) {
			return;
		}

		var data = {};
		try {
			data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
		} catch (e) {}

		if (data.event !== undefined) {

			if (data.event == "patternLab.pageLoad") {

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
					sizeiframe(320, true);
				} else if (found == data.keyPress.match(/ctrl\+shift\+([1-9])/)) {
					var val = mqs[(found[1] - 1)];
					var type = (val.indexOf("px") !== -1) ? "px" : "em";
					val = val.replace(type, "");
					var width = (type === "px") ? val * 1 : val * $bodySize;
					sizeiframe(width, true);
				}
				return false;
			}

		}

	}
	window.addEventListener("message", receiveIframeMessage, false);

})(this);

