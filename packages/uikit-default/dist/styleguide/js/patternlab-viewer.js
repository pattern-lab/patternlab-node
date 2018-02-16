/*!
 * clipboard.js v1.7.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,o){function i(a,c){if(!n[a]){if(!e[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(r)return r(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return i(n||t)},u,u.exports,t,e,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(t,e,n){function o(t,e){for(;t&&t.nodeType!==i;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var i=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}e.exports=o},{}],2:[function(t,e,n){function o(t,e,n,o,r){var a=i.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function i(t,e,n,o){return function(n){n.delegateTarget=r(n.target,e),n.delegateTarget&&o.call(t,n)}}var r=t("./closest");e.exports=o},{"./closest":1}],3:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},{}],4:[function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.fn(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return i(t,e,n);if(c.nodeList(t))return r(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function i(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function r(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return l(document.body,t,e,n)}var c=t("./is"),l=t("delegate");e.exports=o},{"./is":3,delegate:2}],5:[function(t,e,n){function o(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),i=document.createRange();i.selectNodeContents(t),o.removeAllRanges(),o.addRange(i),e=o.toString()}return e}e.exports=o},{}],6:[function(t,e,n){function o(){}o.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){i.off(t,o),e.apply(n,arguments)}var i=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,i=n.length;for(o;o<i;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],i=[];if(o&&e)for(var r=0,a=o.length;r<a;r++)o[r].fn!==e&&o[r].fn._!==e&&i.push(o[r]);return i.length?n[t]=i:delete n[t],this}},e.exports=o},{}],7:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","select"],r);else if(void 0!==o)r(n,e("select"));else{var a={exports:{}};r(a,i.select),i.clipboardAction=a.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),c=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return a(t,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=e.action,this.container=e.container,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""}},{key:"initSelection",value:function t(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function t(){var e=this,n="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return e.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[n?"right":"left"]="-9999px";var o=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=o+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,i.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function t(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function t(){this.selectedText=(0,i.default)(this.target),this.copyText()}},{key:"copyText",value:function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(t){e=!1}this.handleResult(e)}},{key:"handleResult",value:function t(e){this.emitter.emit(e?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function t(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function t(){this.removeFake()}},{key:"action",set:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!==(void 0===e?"undefined":r(e))||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&e.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(e.hasAttribute("readonly")||e.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=e}},get:function t(){return this._target}}]),t}();t.exports=c})},{select:5}],8:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","./clipboard-action","tiny-emitter","good-listener"],r);else if(void 0!==o)r(n,e("./clipboard-action"),e("tiny-emitter"),e("good-listener"));else{var a={exports:{}};r(a,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=a.exports}}(this,function(t,e,n,o){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var s=i(e),u=i(n),f=i(o),d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),p=function(t){function e(t,n){r(this,e);var o=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return o.resolveOptions(n),o.listenClick(t),o}return c(e,t),h(e,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText,this.container="object"===d(e.container)?e.container:document.body}},{key:"listenClick",value:function t(e){var n=this;this.listener=(0,f.default)(e,"click",function(t){return n.onClick(t)})}},{key:"onClick",value:function t(e){var n=e.delegateTarget||e.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s.default({action:this.action(n),target:this.target(n),text:this.text(n),container:this.container,trigger:n,emitter:this})}},{key:"defaultAction",value:function t(e){return l("action",e)}},{key:"defaultTarget",value:function t(e){var n=l("target",e);if(n)return document.querySelector(n)}},{key:"defaultText",value:function t(e){return l("text",e)}},{key:"destroy",value:function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],n="string"==typeof e?[e]:e,o=!!document.queryCommandSupported;return n.forEach(function(t){o=o&&!!document.queryCommandSupported(t)}),o}}]),e}(u.default);t.exports=p})},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)});

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

try {
  
  /* load pattern nav */
  var template         = document.querySelector(".pl-js-pattern-nav-template");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(navItems);
  document.querySelector(".pl-js-pattern-nav-target").innerHTML = templateRendered;
  
  /* load ish controls */
  var template         = document.querySelector(".pl-js-ish-controls-template");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(ishControls);
  document.querySelector(".pl-js-controls").innerHTML = templateRendered;
  
} catch(e) {
  
  var message = "<p>Please generate your site before trying to view it.</p>";
  document.querySelector(".pl-js-pattern-nav-target").innerHTML = message;
  
}

/*!
 * URL Handler
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Helps handle the initial iFrame source. Parses a string to see if it matches
 * an expected pattern in Pattern Lab. Supports Pattern Lab's fuzzy pattern partial
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
 * Modal for the Viewer Layer
 * For both annotations and code/info
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 * @requires data-saver.js
 *
 */

var modalViewer = {

	// set up some defaults
	active: false,
	switchText: true,
	template: 'info',
	patternData: {},
	targetOrigin: (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host,

	/**
	 * initialize the modal window
	 */
	onReady: function () {

		// make sure the listener for checkpanels is set-up
		Dispatcher.addListener('insertPanels', modalViewer.insert);

		// add the info/code panel onclick handler
		$('.pl-js-pattern-info-toggle').click(function (e) {
			modalViewer.toggle();
		});

		// make sure the close button handles the click
		$('.pl-js-modal-close-btn').on('click', function (e) {

			// hide any open annotations
			obj = JSON.stringify({
				'event': 'patternLab.annotationsHighlightHide'
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, modalViewer.targetOrigin);

			// hide the viewer
			modalViewer.close();

		});

		// see if the modal is already active, if so update attributes as appropriate
		if (DataSaver.findValue('modalActive') === 'true') {
			modalViewer.active = true;
			$('.pl-js-pattern-info-toggle').html("Hide Pattern Info");
		}

		// make sure the modal viewer is not viewable, it's always hidden by default. the pageLoad event determines when it actually opens
		modalViewer.hide();

		// review the query strings in case there is something the modal viewer is supposed to handle by default
		var queryStringVars = urlHandler.getRequestVars();

		// show the modal if code view is called via query string
		if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'code') || (queryStringVars.view === 'c'))) {
			modalViewer.queryPattern();
		}

		// show the modal if the old annotations view is called via query string
		if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'annotations') || (queryStringVars.view === 'a'))) {
			modalViewer.queryPattern();
		}

	},

	/**
	 * toggle the modal window open and closed
	 */
	toggle: function () {
		if (modalViewer.active === false) {
			modalViewer.queryPattern();
		} else {
			obj = JSON.stringify({
				'event': 'patternLab.annotationsHighlightHide'
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, modalViewer.targetOrigin);
			modalViewer.close();
		}
	},

	/**
	 * open the modal window
	 */
	open: function () {

		// make sure the modal viewer and other options are off just in case
		modalViewer.close();

		// note it's turned on in the viewer
		DataSaver.updateValue('modalActive', 'true');
		modalViewer.active = true;

		// show the modal
		modalViewer.show();

	},

	/**
	 * close the modal window
	 */
	close: function () {

		var obj;

		// note that the modal viewer is no longer active
		DataSaver.updateValue('modalActive', 'false');
		modalViewer.active = false;

		//Remove active class to modal
		$('.pl-js-modal').removeClass('pl-is-active');

		// update the wording
		$('.pl-js-pattern-info-toggle').html("Show Pattern Info");

		// tell the styleguide to close
		obj = JSON.stringify({
			'event': 'patternLab.patternModalClose'
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, modalViewer.targetOrigin);

	},

	/**
	 * hide the modal window
	 */
	hide: function () {
		$('.pl-js-modal').removeClass('pl-is-active');
	},

	/**
	 * insert the copy for the modal window. if it's meant to be sent back to the iframe, do that.
	 * @param  {String}       the rendered template that should be inserted
	 * @param  {String}       the patternPartial that the rendered template is related to
	 * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
	 * @param  {Boolean}      if the text in the dropdown should be switched
	 */
	insert: function (templateRendered, patternPartial, iframePassback, switchText) {

		if (iframePassback) {

			// send a message to the pattern
			var obj = JSON.stringify({
				'event': 'patternLab.patternModalInsert',
				'patternPartial': patternPartial,
				'modalContent': templateRendered.outerHTML
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, modalViewer.targetOrigin);

		} else {

			// insert the panels and open the viewer
			$('.pl-js-modal-content').html(templateRendered);
			modalViewer.open();

		}

		// update the wording unless this is a default viewall opening
		if (switchText === true) {
			$('.pl-js-pattern-info-toggle').html("Hide Pattern Info");
		}

	},

	/**
	 * refresh the modal if a new pattern is loaded and the modal is active
	 * @param  {Object}       the patternData sent back from the query
	 * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
	 * @param  {Boolean}      if the text in the dropdown should be switched
	 */
	refresh: function (patternData, iframePassback, switchText) {

		// if this is a styleguide view close the modal
		if (iframePassback) {
			modalViewer.hide();
		}

		// gather the data that will fill the modal window
		panelsViewer.gatherPanels(patternData, iframePassback, switchText);

	},

	/**
	 * slides the modal window into or out of view
	 * @param  {Integer}      where the modal window should be slide to
	 */
	slide: function (pos) {
		$('.pl-js-modal').toggleClass('pl-is-active');
	},

	/**
	 * slides the modal window to a particular annotation
	 * @param  {Integer}      the number for the element that should be highlighted
	 */
	slideToAnnotation: function (pos) {

		// remove active class
		els = document.querySelectorAll('.pl-js-annotations li');
		for (i = 0; i < els.length; ++i) {
			els[i].classList.remove('pl-is-active');
		}

		// add active class to called element and scroll to it
		for (i = 0; i < els.length; ++i) {
			if ((i + 1) == pos) {
				els[i].classList.add('pl-is-active');
				$('.pl-js-pattern-info').animate({
					scrollTop: els[i].offsetTop - 10
				}, 600);
			}
		}

	},

	/**
	 * Show modal
	 */
	show: function () {
		$('.pl-js-modal').addClass('pl-is-active');
	},

	/**
	 * ask the pattern for info so we can open the modal window and populate it
	 * @param  {Boolean}      if the dropdown text should be changed
	 */
	queryPattern: function (switchText) {

		// note that the modal is active and set switchText
		if ((switchText === undefined) || (switchText)) {
			switchText = true;
			DataSaver.updateValue('modalActive', 'true');
			modalViewer.active = true;
		}

		// send a message to the pattern
		var obj = JSON.stringify({
			'event': 'patternLab.patternQuery',
			'switchText': switchText
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, modalViewer.targetOrigin);

	},

	/**
	 * toggle the comment pop-up based on a user clicking on the pattern
	 * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
	 * @param  {Object}      event info
	 */
	receiveIframeMessage: function (event) {

		var els, i;

		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol + '//' + window.location.host)) {
			return;
		}

		var data = {};

		try {
			data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
		} catch (e) {}

		if ((data.event !== undefined) && (data.event == "patternLab.pageLoad")) {

			if ((modalViewer.active === false) && (data.patternpartial !== undefined) && (data.patternpartial.indexOf('viewall-') === 0) && (config.defaultShowPatternInfo !== undefined) && (config.defaultShowPatternInfo)) {
				modalViewer.queryPattern(false);
			} else if (modalViewer.active === true) {
				modalViewer.queryPattern();
			}

		} else if ((data.event !== undefined) && (data.event == 'patternLab.patternQueryInfo')) {

			// refresh the modal if a new pattern is loaded and the modal is active
			modalViewer.refresh(data.patternData, data.iframePassback, data.switchText);

		} else if ((data.event !== undefined) && (data.event == 'patternLab.annotationNumberClicked')) {

			// slide to a given annoation
			modalViewer.slideToAnnotation(data.displayNumber);
		}

	}

};

// when the document is ready make sure the modal is ready
$(document).ready(function () {
	modalViewer.onReady();
});

window.addEventListener("message", modalViewer.receiveIframeMessage, false);


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
 * Default languages for Prism to match rendering capability
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */
var PrismLanguages = {

	languages: [],

	get: function (key) {

		var language;

		for (i = 0; i < this.languages.length; ++i) {
			language = this.languages[i];
			if (language[key] !== undefined) {
				return language[key];
			}
		}

		return 'markup';

	},

	add: function (language) {

		// see if the language already exists, overwrite if it does
		for (var key in language) {
			if (language.hasOwnProperty(key)) {
				for (i = 0; i < this.languages.length; ++i) {
					if (this.languages[i][key] !== undefined) {
						this.languages[i][key] = language[key];
						return;
					}
				}
			}
		}

		this.languages.push(language);

	}

};

// this shouldn't get hardcoded, also need to think about including Prism's real lang libraries (e.g. handlebars & twig)
PrismLanguages.add({
	'twig': 'markup'
});
PrismLanguages.add({
	'mustache': 'markup'
});


/*!
 * Default Panels for Pattern Lab plus Panel related events
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * config is coming from the default viewer and is passed through from PL's config
 *
 * @requires prism-languages.js
 */

var Panels = {

  panels: [],

  count: function() {
    return this.panels.length;
  },

  get: function() {
    return JSON.parse(JSON.stringify(this.panels));
  },

  add: function(panel) {

    // if ID already exists in panels array ignore the add()
    for (var i = 0; i < this.panels.length; ++i) {
      if (panel.id === this.panels[i].id) {
        return;
      }
    }

    // it wasn't found so push the tab onto the tabs
    this.panels.push(panel);

  },

  remove: function(id) {
    var panels = this.panels;
    for (var i = panels.length - 1; i >= 0; i--) {
      if (panels[i].id === id){
        var panelToRemove = panels[i];
        panels.splice(i, 1);
        //if removed panel was default, set first panel as new default, if exists
        if (panelToRemove.default && panels.length){
          panels[0].default = true;
        }
        return; //should be no more panels with the same id
      }
    }
  }

};

var fileSuffixPattern = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.rawTemplate !== undefined)) ? config.outputFileSuffixes.rawTemplate : '';
var fileSuffixMarkup  = ((config.outputFileSuffixes !== undefined) && (config.outputFileSuffixes.markupOnly !== undefined)) ? config.outputFileSuffixes.markupOnly : '.markup-only';

// add the default panels
// Panels.add({ 'id': 'pl-panel-info', 'name': 'info', 'default': true, 'templateID': 'pl-panel-template-info', 'httpRequest': false, 'prismHighlight': false, 'keyCombo': '' });
// TODO: sort out pl-panel-html
Panels.add({
	'id': 'pl-panel-pattern',
	'name': config.patternExtension.toUpperCase(),
	'default': true,
	'templateID': 'pl-panel-template-code',
	'httpRequest': true,
	'httpRequestReplace': fileSuffixPattern,
	'httpRequestCompleted': false,
	'prismHighlight': true,
	'language': PrismLanguages.get(config.patternExtension),
	'keyCombo': 'ctrl+shift+u'
});

Panels.add({
	'id': 'pl-panel-html',
	'name': 'HTML',
	'default': false,
	'templateID': 'pl-panel-template-code',
	'httpRequest': true,
	'httpRequestReplace': fileSuffixMarkup + '.html',
	'httpRequestCompleted': false,
	'prismHighlight': true,
	'language': 'markup',
	'keyCombo': 'ctrl+shift+y'
});

// gather panels from plugins
Dispatcher.trigger('setupPanels');


/*!
 * Panel Builder. Supports building the panels to be included in the modal or styleguide
 *
 * Copyright (c) 2013-16 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires panels.js
 * @requires url-handler.js
 */

var panelsViewer = {

	// set up some defaults
	targetOrigin: (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host,
	initCopy: false,
	initMoveTo: 0,

	/**
	 * Check to see if all of the panels have been collected before rendering
	 * @param  {String}      the collected panels
	 * @param  {String}      the data from the pattern
	 * @param  {Boolean}     if this is going to be passed back to the styleguide
	 */
	checkPanels: function (panels, patternData, iframePassback, switchText) {

		// count how many panels have rendered content
		var panelContentCount = 0;
		for (var i = 0; i < panels.length; ++i) {
			if (panels[i].content !== undefined) {
				panelContentCount++;
			}
		}

		// see if the count of panels with content matches number of panels
		if (panelContentCount === Panels.count()) {
			panelsViewer.renderPanels(panels, patternData, iframePassback, switchText);
		}

	},

	/**
	 * Gather the panels related to the modal
	 * @param  {String}      the data from the pattern
	 * @param  {Boolean}     if this is going to be passed back to the styleguide
	 */
	gatherPanels: function (patternData, iframePassback, switchText) {

		Dispatcher.addListener('checkPanels', panelsViewer.checkPanels);

		// set-up defaults
		var template, templateCompiled, templateRendered, panel;

		// get the base panels
		var panels = Panels.get();

		// evaluate panels array and create content
		for (var i = 0; i < panels.length; ++i) {

			panel = panels[i];

			// catch pattern panel since it doesn't have a name defined by default
			if (panel.name === undefined) {
				panel.name = patternData.patternEngineName || patternData.patternExtension;
		        panel.language = patternData.patternExtension;
			}

			// if httpRequestReplace has not been set, use the extension. this is likely for the raw template
			if (panel.httpRequestReplace === '') {
				panel.httpRequestReplace = panel.httpRequestReplace + '.' + patternData.patternExtension;
			}

			if ((panel.templateID !== undefined) && (panel.templateID)) {

				if ((panel.httpRequest !== undefined) && (panel.httpRequest)) {

					// need a file and then render
					var fileBase = urlHandler.getFileName(patternData.patternPartial, false);
					var e = new XMLHttpRequest();
					e.onload = (function (i, panels, patternData, iframeRequest) {
						return function () {
							prismedContent = Prism.highlight(this.responseText, Prism.languages['html']);
							template = document.getElementById(panels[i].templateID);
							templateCompiled = Hogan.compile(template.innerHTML);
							templateRendered = templateCompiled.render({
								'language': 'html',
								'code': prismedContent
							});
							panels[i].content = templateRendered;
							Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);
						};
					})(i, panels, patternData, iframePassback);

					e.open('GET', fileBase + panel.httpRequestReplace + '?' + (new Date()).getTime(), true);
					e.send();

				} else {

					// vanilla render of pattern data
					template = document.getElementById(panel.templateID);
					templateCompiled = Hogan.compile(template.innerHTML);
					templateRendered = templateCompiled.render(patternData);
					panels[i].content = templateRendered;
					Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);

				}

			}

		}

	},

	/**
	 * Render the panels that have been collected
	 * @param  {String}      the collected panels
	 * @param  {String}      the data from the pattern
	 * @param  {Boolean}     if this is going to be passed back to the styleguide
	 */
	renderPanels: function (panels, patternData, iframePassback, switchText) {

		// set-up defaults
		var template, templateCompiled, templateRendered;
		var annotation, comment, count, div, els, item, markup, i;
		var patternPartial = patternData.patternPartial;
		patternData.panels = panels;

		// set a default pattern description for modal pop-up
		if (!iframePassback && (patternData.patternDesc.length === 0)) {
			patternData.patternDesc = "";
		}

		// capitilize the pattern name
		patternData.patternNameCaps = patternData.patternName.toUpperCase();

		// check for annotations in the given mark-up
		markup = document.createElement('div');
		markup.innerHTML = patternData.patternMarkup;

		count = 1;
		patternData.annotations = [];
		delete patternData['patternMarkup'];

		for (i = 0; i < comments.comments.length; ++i) {

			item = comments.comments[i];
			els = markup.querySelectorAll(item.el);

			if (els.length > 0) {
				annotation = {
					'displayNumber': count,
					'el': item.el,
					'title': item.title,
					'comment': item.comment
				};
				patternData.annotations.push(annotation);
				count++;
			}

		}

		// alert the pattern that annotations should be highlighted
		if (patternData.annotations.length > 0) {
			var obj = JSON.stringify({
				'event': 'patternLab.annotationsHighlightShow',
				'annotations': patternData.annotations
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
		}

		// add hasComma property to lineage
		if (patternData.lineage.length > 0) {
			for (i = 0; i < patternData.lineage.length; ++i) {
				if (i < (patternData.lineage.length - 1)) {
					patternData.lineage[i].hasComma = true;
				}
			}
		}

		// add hasComma property to lineageR
		if (patternData.lineageR.length > 0) {
			for (i = 0; i < patternData.lineageR.length; ++i) {
				if (i < (patternData.lineageR.length - 1)) {
					patternData.lineageR[i].hasComma = true;
				}
			}
		}

		// add *Exists attributes for Hogan templates
		// figure out if the description exists
		patternData.patternDescExists = ((patternData.patternDesc.length > 0) || ((patternData.patternDescAdditions !== undefined) && (patternData.patternDescAdditions.length > 0)));

		// figure out if lineage should be drawn
		patternData.lineageExists = (patternData.lineage.length !== 0);

		// figure out if reverse lineage should be drawn
		patternData.lineageRExists = (patternData.lineageR.length !== 0);

		// figure out if pattern state should be drawn
		patternData.patternStateExists = (patternData.patternState.length > 0);

		// figure if annotations should be drawn
		patternData.annotationExists = (patternData.annotations.length > 0);

		// figure if the entire desc block should be drawn
		patternData.descBlockExists = (patternData.patternDescExists || patternData.lineageExists || patternData.lineageRExists || patternData.patternStateExists || patternData.annotationExists);

		// set isPatternView based on if we have to pass it back to the styleguide level
		patternData.isPatternView = (iframePassback === false);

		// render all of the panels in the base panel template
		template = document.querySelector('.pl-js-panel-template-base');
		templateCompiled = Hogan.compile(template.innerHTML);
		templateRendered = templateCompiled.render(patternData);

		// make sure templateRendered is modified to be an HTML element
		div = document.createElement('div');
		div.className = 'pl-c-pattern-info';
		div.innerHTML = templateRendered;
		templateRendered = div;

		// add click events
		templateRendered = panelsUtil.addClickEvents(templateRendered, patternPartial);




		// add onclick events to the tabs in the rendered content
		for (i = 0; i < panels.length; ++i) {

			panel = panels[i];

			// default IDs
			panelTab = '#pl-' + patternPartial + '-' + panel.id + '-tab';
			panelBlock = '#pl-' + patternPartial + '-' + panel.id + '-panel';

			// show default options
			if ((templateRendered.querySelector(panelTab) !== null) && (panel.default)) {
				templateRendered.querySelector(panelTab).classList.add('pl-is-active-tab');
				templateRendered.querySelector(panelBlock).classList.add('pl-is-active-tab');
			}

		}

		// find lineage links in the rendered content and add postmessage handlers in case it's in the modal
		$('.pl-js-lineage-link', templateRendered).on('click', function (e) {
			e.preventDefault();
			var obj = JSON.stringify({
				'event': 'patternLab.updatePath',
				'path': urlHandler.getFileName($(this).attr('data-patternpartial'))
			});
			document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
		});

		// gather panels from plugins
		Dispatcher.trigger('insertPanels', [templateRendered, patternPartial, iframePassback, switchText]);

	}

};

/**
* Pattern panel resizer
* 1) Add mousedown event listener to the modal resizer tab
* 2) Display block on the modal cover when the panel is being dragged so fast
* drags can occur.
* 3) Create mousemove event on the cover since it spans the entire screen and
* the mouse can be dragged into it without losing resizing
* 4) Find the new panel height by taking the window height and subtracting the
* Y-position within the modal cover. Set modal height to this.
* 5) Add mouseup event to the body so that when drag is released, the modal
* stops resizing and modal cover doesn't display anymore.
*/
$('.pl-js-modal-resizer').mousedown(function (event) { /* 1 */

	$(".pl-js-modal-cover").css("display", "block"); /* 2 */

	$('.pl-js-modal-cover').mousemove(function (event) { /* 3 */
		var panelHeight = window.innerHeight - event.clientY + 32; /* 4 */
		$('.pl-js-modal').css("height", panelHeight + "px"); /* 4 */
	});
});

$('body').mouseup(function () { /* 5 */
	$('.pl-js-modal').unbind('mousemove'); /* 5 */
	$('.pl-js-modal-cover').css("display", "none"); /* 5 */
});

// Copy to clipboard functionality
var clipboard = new Clipboard('.pl-js-code-copy-btn');
clipboard.on('success', function(e) {
	var copyButton = document.querySelectorAll(".pl-js-code-copy-btn");
	for (i=0; i<copyButton.length ;i++) {
		copyButton[i].innerText = "Copy";
	}
    e.trigger.textContent = 'Copied';
});

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

	data: [],
	active: false,

	init: function () {

		for (var patternType in patternPaths) {
			if (patternPaths.hasOwnProperty(patternType)) {
				for (var pattern in patternPaths[patternType]) {
					var obj = {};
					obj.patternPartial = patternType + "-" + pattern;
					obj.patternPath = patternPaths[patternType][pattern];
					this.data.push(obj);
				}
			}
		}

		// instantiate the bloodhound suggestion engine
		var patterns = new Bloodhound({
			datumTokenizer: function (d) {
				return Bloodhound.tokenizers.nonword(d.patternPartial);
			},
			queryTokenizer: Bloodhound.tokenizers.nonword,
			limit: 10,
			local: this.data
		});

		// initialize the bloodhound suggestion engine
		patterns.initialize();

		$('.pl-js-typeahead').typeahead({
			highlight: true
		}, {
			displayKey: 'patternPartial',
			source: patterns.ttAdapter()
		}).on('typeahead:selected', patternFinder.onSelected).on('typeahead:autocompleted', patternFinder.onAutocompleted);

	},

	passPath: function (item) {
		// update the iframe via the history api handler
		patternFinder.closeFinder();
		var obj = JSON.stringify({
			"event": "patternLab.updatePath",
			"path": urlHandler.getFileName(item.patternPartial)
		});
		document.querySelector('.pl-js-iframe').contentWindow.postMessage(obj, urlHandler.targetOrigin);
	},

	onSelected: function (e, item) {
		patternFinder.passPath(item);
	},

	onAutocompleted: function (e, item) {
		patternFinder.passPath(item);
	},

	toggleFinder: function () {
		if (!patternFinder.active) {
			patternFinder.openFinder();
		} else {
			patternFinder.closeFinder();
		}
	},

	openFinder: function () {
		patternFinder.active = true;
		$('.pl-js-typeahead').val("");
	},

	closeFinder: function () {
		patternFinder.active = false;
		document.activeElement.blur();
		$('.pl-js-typeahead').val("");
	},

	receiveIframeMessage: function (event) {

		// does the origin sending the message match the current host? if not dev/null the request
		if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol + "//" + window.location.host)) {
			return;
		}

		var data = {};
		try {
			data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
		} catch (e) {}

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

$('.pl-js-typeahead').focus(function () {
	if (!patternFinder.active) {
		patternFinder.openFinder();
	}
});

$('.pl-js-typeahead').blur(function () {
	patternFinder.closeFinder();
});


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

		//if both are set, then let's use the larger one.
		if (config.ishViewportRange && config.ishMaximum) {
			var largeRange = parseInt(config.ishViewportRange.l[1]);
			var ishMaximum = parseInt(config.ishMaximum);
			maxViewportWidth = largeRange > ishMaximum ? largeRange : ishMaximum;
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
					t = document.getElementsByTagName('script');
					l = t.length - 1;
					s = t[l];
					n = document.createElement('script');
					n.type = 'text/mustache';
					n.id = plugin.name.replace("\/", "-") + "-" + key + "-template";
					n.innerHTML = plugin.templates[key];
					s.parentNode.insertBefore(n, s.nextSibling);
				}
			}

			// load the stylesheets
			for (var k = 0; k < plugin.stylesheets.length; ++k) {
				s = plugin.stylesheets[k];
				t = document.getElementsByTagName('link');
				l = t.length - 1;
				c = t[l];
				n = document.createElement('link');
				n.type = 'text/css';
				n.rel = 'stylesheet';
				n.href = 'patternlab-components/' + plugin.name + '/' + s;
				n.media = 'screen';
				c.parentNode.insertBefore(n, c.nextSibling);
			}

			// load the javascript
			// $script.path('patternlab-components/'+plugin.name+'/');
			$script(plugin.javascripts, plugin.name, eval('(function() { ' + plugin.callback + ' })'));
			$script.ready([plugin.name], eval('(function() { ' + plugin.onready + ' })'));

		}

	}

};

pluginLoader.init();