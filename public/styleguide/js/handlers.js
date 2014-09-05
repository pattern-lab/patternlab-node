/*jslint indent: 4, regexp: true*/
/*global window*/
var EventDelegator  = require('./eventDelegator/eventDelegator'),
    config          = require('./config'),
    dataSaver       = require('./data-saver'),
    gui             = require('./gui'),
    urlHandler      = require('./url-handler'),
    delegator       = new EventDelegator(document.documentElement),
    elViewport      = document.getElementById('sg-viewport'),
    elCover         = document.getElementById('sg-cover');

function _parents(element, selector, cb) {
    var target = element.parentNode;

    while (target && target !== document.documentElement) {
        if (target.matches(selector)) {
            cb(target);
        }
        target = target.parentNode;
    }
}

function _siblings(element, selector, cb) {
    var target = element.parentNode.children[0];

    while (target) {
        if (target.matches(selector)) {
            cb(target);
        }
        target = target.nextSibling;
    }
}

function _toggleUL(e) {
    e.preventDefault();
    var target = e.target.parentNode;

    _parents(target, 'ul', function (el) {
        el.classList.toggle('active');
    });
}

function _size(num) {
    gui.killDisco();
    gui.killHay();
    gui.sizeiframe(num);
}

delegator
    // handles widening the "viewport"
    //   1. on "mousedown" store the click location
    //   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
    //   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
    .on('mousedown', '#sg-rightpull', function (e) {
        // capture default data
        var origClientX = e.clientX,
            origViewportWidth = elViewport.offsetWidth;

        // show the cover
        elCover.style.display = 'block';

        // add the mouse move event and capture data. also update the viewport width
        delegator.on('mousemove', '#sg-cover', function (e) {
            var viewportWidth = (origClientX > e.clientX) ?
                    origViewportWidth - ((origClientX - e.clientX) * 2) :
                    origViewportWidth + ((e.clientX - origClientX) * 2);

            if (viewportWidth > config.minViewportWidth) {
                if (!dataSaver.findValue('vpWidth')) {
                    dataSaver.addValue('vpWidth', viewportWidth);
                } else {
                    dataSaver.updateValue('vpWidth', viewportWidth);
                }

                gui.sizeiframe(viewportWidth, false);
            }
        });
    })

    // on "mouseup" we unbind the "mousemove" event and hide the cover again
    .on('mouseup', 'body', function () {
        delegator.off('mousemove', '#sg-cover');
        elCover.style.display = 'none';
    })

    /* Pattern Lab accordion dropdown */
    .on('click', '.sg-acc-handle', function (e) {
        var next = e.target;

        while (next && (next.nodeType !== 1 || !next.matches('.sg-acc-panel'))) {
            next = next.nextSibling;
        }

        e.preventDefault();

        e.target.classList.toggle('active');
        if (next) {
            next.classList.toggle('active');
        }
    })

    .on('click', '.sg-nav-toggle', function (e) {
        e.preventDefault();
        document.querySelector('.sg-nav-container').classList.toggle('active');
    })

    //View (containing clean, code, raw, etc options) Trigger
    .on('click', '#sg-t-toggle', _toggleUL)

    //Size Trigger
    .on('click', '#sg-size-toggle', _toggleUL)

    //Phase View Events
    .on('click', '.sg-size[data-size]', function (e) {
        e.preventDefault();
        gui.killDisco();
        gui.killHay();

        var val = e.target.getAttribute('data-size');

        if (val.indexOf('px') > -1) {
            config.bodySize = 1;
        }

        val = val.replace(/[^\d.\-]/g, '');
        gui.sizeiframe(Math.floor(val * config.bodySize));
    })

    //Size View Events

    //Click Size Small Button
    .on('click', '#sg-size-s', function (e) {
        e.preventDefault();
        _size(gui.getRandom(config.minViewportWidth, 500));
    })

    //Click Size Medium Button
    .on('click', '#sg-size-m', function (e) {
        e.preventDefault();
        _size(gui.getRandom(500, 800));
    })

    //Click Size Large Button
    .on('click', '#sg-size-l', function (e) {
        e.preventDefault();
        _size(gui.getRandom(800, 1200));
    })

    //Click Full Width Button
    .on('click', '#sg-size-full', function (e) { //Resets 
        e.preventDefault();
        _size(config.sw);
    })

    //Click Random Size Button
    .on('click', '#sg-size-random', function (e) {
        e.preventDefault();
        _size(gui.getRandom(config.minViewportWidth, config.sw));
    })

    //Click for Disco Mode, which resizes the viewport randomly
    .on('click', '#sg-size-disco', function (e) {
        e.preventDefault();
        gui.killHay();
        gui.toggleDisco();
    })

    //Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
    .on('click', '#sg-size-hay', function (e) {
        e.preventDefault();
        gui.killDisco();
        gui.toggleHay();
    })

    //Pixel input
    .on('keydown', '.sg-size-px', function (e) {
        var val = parseInt(e.target.value, 10);

        if (e.keyCode === 38) { //If the up arrow key is hit
            val++;
            gui.sizeiframe(val, false);
        } else if (e.keyCode === 40) { //If the down arrow key is hit
            val--;
            gui.sizeiframe(val, false);
        } else if (e.keyCode === 13) { //If the Enter key is hit
            e.preventDefault();
            gui.sizeiframe(val); //Size Iframe to value of text box
            e.target.blur();
        }
    })

    .on('keyup', '.sg-size-px', function (e) {
        var val = parseInt(e.target.value, 10);
        gui.updateSizeReading(val, 'px', 'updateEmInput');
    })

    //Em input
    .on('keydown', '.sg-size-em', function (e) {
        var val = parseFloat(e.target.value);

        if (e.keyCode === 38) { //If the up arrow key is hit
            val++;
            gui.sizeiframe(Math.floor(val * config.bodySize), false);
        } else if (e.keyCode === 40) { //If the down arrow key is hit
            val--;
            gui.sizeiframe(Math.floor(val * config.bodySize), false);
        } else if (e.keyCode === 13) { //If the Enter key is hit
            e.preventDefault();
            gui.sizeiframe(Math.floor(val * config.bodySize)); //Size Iframe to value of text box
        }
    })

    .on('keyup', '.sg-size-em', function (e) {
        var val = parseFloat(e.target.value);
        gui.updateSizeReading(val, 'em', 'updatePxInput');
    })

    // handle the MQ click
    .on('click', '#sg-mq a', function (e) {
        e.preventDefault();
        var val     = e.target.innerHTML,
            type    = parseInt((val.indexOf('px') !== -1 ? 'px' : 'em'), 10);

        val = val.replace(type, '');

        gui.sizeiframe((type === 'px' ? val : val * config.bodySize), true);
    })

    // update the iframe with the source from clicked element in pull down menu. also close the menu
    // having it outside fixes an auto-close bug i ran into
    .on('click', '.sg-nav a', function (e) {
        if (e.target.matches('.sg-acc-handle')) {
            return;
        }
        e.preventDefault();

        // update the iframe via the history api handler
        document.getElementById('sg-viewport').contentWindow.postMessage(
            {
                'path': urlHandler.getFileName(e.target.getAttribute('data-patternpartial'))
            },
            urlHandler.targetOrigin
        );

        // close up the menu
        _parents(e.target, '.sg-acc-panel', function (el) {
            el.classList.toggle('active');
            _siblings(el, '.sg-acc-handle', function (el) {
                el.classList.toggle('active');
            });
        });
        return false;
    })

    .on('click', '#sg-vp-wrap', function () {
        gui.closePanels();
    });

window.addEventListener('resize', function () {
    config.sw = document.body.clientWidth;
    config.sh = document.body.clientHeight;
}, false);

window.addEventListener('message', function receiveIframeMessage(event) {
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol + '//' + window.location.host)) {
        return;
    }

    if (event.data.bodyclick !== undefined) {
        gui.closePanels();
    } else if (event.data.patternpartial !== undefined) {
        if (!urlHandler.skipBack) {
            if (window.history.state === null || window.history.state.pattern !== event.data.patternpartial) {
                urlHandler.pushPattern(event.data.patternpartial, event.data.path);
            }
            if (window.wsnConnected) {
                console.log('wsn');
                var iFramePath = urlHandler.getFileName(event.data.patternpartial);
                window.wsn.send('{"url": "' + iFramePath + '", "patternpartial": "' + event.data.patternpartial + '" }');
            }
        }

        // for testing purposes
        //console.log(event.data.lineage);

        // reset the defaults
        urlHandler.skipBack = false;
    }
}, false);