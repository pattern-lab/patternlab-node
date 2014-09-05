/*jslint indent: 4*/
/*global window*/
'use strict';
var config = require('./config'),
    dataSaver = require('./data-saver'),
    urlHandler = require('./url-handler'),
    elGenContainer = document.getElementById('sg-gen-container'),
    elViewport = document.getElementById('sg-viewport'),
    elSizePx = document.querySelector('.sg-size-px'), //Px size input element in toolbar
    elSizeEms = document.querySelector('.sg-size-em'), //Em size input element in toolbar;
    discoID = false,
    discoMode = false,
    hayMode = false;

//Update Pixel and Em inputs
//'size' is the input number
//'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
//'target' is what inputs to update. Defaults to both
function updateSizeReading(size, unit, target) {
    var emSize = (unit === 'em' ? Math.floor(size * config.bodySize) : size),
        pxSize = (unit === 'em' ? size / config.bodySize : size);

    if (target === 'updatePxInput') {
        elSizePx.value = pxSize;
    } else if (target === 'updateEmInput') {
        elSizeEms.value = emSize;
    } else {
        elSizeEms.value = emSize;
        elSizePx.value = pxSize;
    }
}

function saveSize(size) {
    if (!dataSaver.findValue('vpWidth')) {
        dataSaver.addValue('vpWidth', size);
    } else {
        dataSaver.updateValue('vpWidth', size);
    }
}

/* Returns a random number between min and max */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//Resize the viewport
//'size' is the target size of the viewport
//'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
function sizeiframe(size, animate) {
    var theSize;

    if (size > config.maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
        theSize = config.maxViewportWidth;
    } else if (size < config.minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
        theSize = config.minViewportWidth;
    } else {
        theSize = size;
    }

    //Conditionally remove CSS animation class from viewport
    elGenContainer.classList.remove('vp-animate', animate);
    elViewport.classList.remove('vp-animate', animate);

    elGenContainer.style.width = (theSize + config.viewportResizeHandleWidth) + 'px'; //Resize viewport wrapper to desired size + size of drag resize handler
    elViewport.style.width = theSize + 'px'; //Resize viewport to desired size

    updateSizeReading(theSize); //Update values in toolbar
    saveSize(theSize); //Save current viewport to cookie
}

function updateViewportWidth(size) {
    size = parseInt(size, 10);
    elViewport.style.width = parseInt(size, 10) + 'px';
    elGenContainer.style.width = (size + 14) + 'px';

    updateSizeReading(size);
}

/* Disco Mode */
function disco() {
    sizeiframe(getRandom(config.minViewportWidth, config.sw));
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

function toggleDisco() {
    if (!discoMode) {
        startDisco();
    } else {
        killDisco();
    }
}

//Stop Hay! Mode
function killHay() {
    var currentWidth = elViewport.offsetWidth;
    hayMode = false;
    elViewport.classList.remove('hay-mode');
    elGenContainer.classList.remove('hay-mode');
    sizeiframe(Math.floor(currentWidth));
}

// start Hay! mode
function startHay() {
    hayMode = true;
    elGenContainer.classList.remove('vp-animate');
    elGenContainer.style.width = (config.minViewportWidth + config.viewportResizeHandleWidth) + 'px';
    elViewport.classList.remove('vp-animate');
    elViewport.style.width = config.minViewportWidth + 'px';

    window.setTimeout(function () {
        elGenContainer.classList.add('hay-mode');
        elGenContainer.style.width = (config.maxViewportWidth + config.viewportResizeHandleWidth) + 'px';
        elViewport.classList.add('hay-mode');
        elViewport.style.width = config.maxViewportWidth + 'px';

        //todo this is not removed
        setInterval(function () {
            var vpSize = elViewport.offsetWidth;
            updateSizeReading(vpSize);
        }, 100);
    }, 200);
}

function toggleHay() {
    if (!hayMode) {
        startHay();
    } else {
        killHay();
    }
}

// handle when someone clicks on the grey area of the viewport so it auto-closes the nav
function closePanels() {
    // close up the menu
    var panels = document.querySelectorAll('.sg-acc-panel'),
        handles = document.querySelectorAll('.sg-acc-handle');

    [].forEach.call(panels, function (panel) {
        panel.classList.remove('active');
    });


    [].forEach.call(handles, function (handle) {
        handle.classList.remove('active');
    });
}

function init() {
    var origViewportWidth   = elViewport.offsetWidth,
        oGetVars            = urlHandler.getRequestVars(), // get the request vars
        vpWidth             = 0,
        trackViewportWidth  = true, // can toggle this feature on & off
        patternName         = 'all',
        patternPath         = '',
        iFramePath          = window.location.protocol + '//' + window.location.host + window.location.pathname.replace('index.html', '') + 'styleguide/html/styleguide.html';

    // capture the viewport width that was loaded and modify it so it fits with the pull bar
    elGenContainer.style.width = origViewportWidth + 'px';
    elViewport.style.width = (origViewportWidth - 14) + 'px';
    updateSizeReading(origViewportWidth - 14);

    // pre-load the viewport width
    if (oGetVars.h || oGetVars.hay) {
        startHay();
    } else if (oGetVars.d || oGetVars.disco) {
        startDisco();
    } else if (oGetVars.w || oGetVars.width) {
        vpWidth = oGetVars.w || oGetVars.width;
        vpWidth = vpWidth.indexOf('em') !== -1 ? Math.floor(Math.floor(vpWidth.replace('em', '')) * config.bodySize) : Math.floor(vpWidth.replace('px', ''));

        dataSaver.updateValue('vpWidth', vpWidth);
        updateViewportWidth(vpWidth);
    } else if (trackViewportWidth && dataSaver.findValue('vpWidth')) {
        updateViewportWidth(dataSaver.findValue('vpWidth'));
    }

    // load the iframe source
    if (oGetVars.p || oGetVars.pattern) {
        patternName = oGetVars.p || oGetVars.pattern;
        patternPath = urlHandler.getFileName(patternName);
        iFramePath  = (patternPath !== '') ? window.location.protocol + '//' + window.location.host + window.location.pathname.replace('index.html', '') + patternPath : iFramePath;
    }

    if (patternName !== 'all') {
        document.getElementById('title').innerHTML = 'Pattern Lab - ' + patternName;
        window.history.replaceState({ 'pattern': patternName }, null, null);
    }

    document.getElementById('sg-raw').setAttribute('href', urlHandler.getFileName(patternName));

    urlHandler.skipBack = true;
    document.getElementById('sg-viewport').contentWindow.location.replace(iFramePath);
}

module.exports = {
    sizeiframe          : sizeiframe,
    getRandom           : getRandom,
    updateViewportWidth : updateViewportWidth,
    disco               : disco,
    killDisco           : killDisco,
    startDisco          : startDisco,
    startHay            : startHay,
    killHay             : killHay,
    toggleDisco         : toggleDisco,
    toggleHay           : toggleHay,
    updateSizeReading   : updateSizeReading,
    closePanels         : closePanels,
    init                : init
};