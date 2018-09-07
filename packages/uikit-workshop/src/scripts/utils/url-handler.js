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

export const urlHandler = {
  // set-up some default vars
  skipBack: false,
  targetOrigin:
    window.location.protocol === 'file:'
      ? '*'
      : window.location.protocol + '//' + window.location.host,

  /**
   * get the real file name for a given pattern name
   * @param  {String}       the shorthand partials syntax for a given pattern
   * @param  {Boolean}      with the file name should be returned with the full rendered suffix or not
   *
   * @return {String}       the real file path
   */
  getFileName(name, withRenderedSuffix) {
    const baseDir = 'patterns';
    let fileName = '';

    if (name === undefined) {
      return fileName;
    }

    if (withRenderedSuffix === undefined) {
      withRenderedSuffix = true;
    }

    if (name === 'all') {
      return 'styleguide/html/styleguide.html';
    } else if (name === 'snapshots') {
      return 'snapshots/index.html';
    }

    const paths =
      name.indexOf('viewall-') !== -1
        ? window.viewAllPaths
        : window.patternPaths;
    const nameClean = name.replace('viewall-', '');

    // look at this as a regular pattern
    const bits = this.getPatternInfo(nameClean, paths);
    const patternType = bits[0];
    const pattern = bits[1];

    if (
      paths[patternType] !== undefined &&
      paths[patternType][pattern] !== undefined
    ) {
      fileName = paths[patternType][pattern];
    } else if (paths[patternType] !== undefined) {
      for (const patternMatchKey in paths[patternType]) {
        if (patternMatchKey.indexOf(pattern) !== -1) {
          fileName = paths[patternType][patternMatchKey];
          break;
        }
      }
    }

    if (fileName === '') {
      return fileName;
    }

    const regex = /\//g;
    if (
      name.indexOf('viewall-') !== -1 &&
      name.indexOf('viewall-') === 0 &&
      fileName !== ''
    ) {
      fileName = baseDir + '/' + fileName.replace(regex, '-') + '/index.html';
    } else if (fileName !== '') {
      fileName =
        baseDir +
        '/' +
        fileName.replace(regex, '-') +
        '/' +
        fileName.replace(regex, '-');
      if (withRenderedSuffix) {
        const fileSuffixRendered =
          window.config.outputFileSuffixes !== undefined &&
          window.config.outputFileSuffixes.rendered !== undefined
            ? window.config.outputFileSuffixes.rendered
            : '';
        fileName = fileName + fileSuffixRendered + '.html';
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
  getPatternInfo(name, paths) {
    const patternBits = name.split('-');

    let i = 1;
    const c = patternBits.length;

    let patternType = patternBits[0];
    while (paths[patternType] === undefined && i < c) {
      patternType += '-' + patternBits[i];
      i++;
    }

    const pattern = name.slice(patternType.length + 1, name.length);

    return [patternType, pattern];
  },

  /**
   * search the request vars for a particular item
   *
   * @return {Object}       a search of the window.location.search vars
   */
  getRequestVars() {
    // the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
    const oGetVars = new function(sSearch) {
      if (sSearch.length > 1) {
        for (
          let aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split('&');
          nKeyId < aCouples.length;
          nKeyId++
        ) {
          aItKey = aCouples[nKeyId].split('=');
          this[unescape(aItKey[0])] =
            aItKey.length > 1 ? unescape(aItKey[1]) : '';
        }
      }
    }(window.location.search);

    return oGetVars;
  },

  /**
   * push a pattern onto the current history based on a click
   * @param  {String}       the shorthand partials syntax for a given pattern
   * @param  {String}       the path given by the loaded iframe
   */
  pushPattern(pattern, givenPath) {
    const data = {
      pattern,
    };
    const fileName = urlHandler.getFileName(pattern);
    let path = window.location.pathname;
    path =
      window.location.protocol === 'file'
        ? path.replace('/public/index.html', 'public/')
        : path.replace(/\/index\.html/, '/');
    const expectedPath =
      window.location.protocol + '//' + window.location.host + path + fileName;
    if (givenPath !== expectedPath) {
      // make sure to update the iframe because there was a click
      const obj = JSON.stringify({
        event: 'patternLab.updatePath',
        path: fileName,
      });
      document
        .querySelector('.pl-js-iframe')
        .contentWindow.postMessage(obj, urlHandler.targetOrigin);
    } else {
      // add to the history
      const addressReplacement =
        window.location.protocol === 'file:'
          ? null
          : window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname.replace('index.html', '') +
            '?p=' +
            pattern;
      if (window.history.pushState !== undefined) {
        window.history.pushState(data, null, addressReplacement);
      }
      document.getElementById('title').innerHTML = 'Pattern Lab - ' + pattern;

      // Open in new window link
      if (document.querySelector('.pl-js-open-new-window') !== undefined) {
        // Set value of href to the path to the pattern
        document
          .querySelector('.pl-js-open-new-window')
          .setAttribute('href', urlHandler.getFileName(pattern));
      }
    }
  },

  /**
   * based on a click forward or backward modify the url and iframe source
   * @param  {Object}      event info like state and properties set in pushState()
   */
  popPattern(e) {
    let patternName;
    const state = e.state;

    if (state === null) {
      this.skipBack = false;
      return;
    } else if (state !== null) {
      patternName = state.pattern;
    }

    let iFramePath = '';
    iFramePath = this.getFileName(patternName);
    if (iFramePath === '') {
      iFramePath = 'styleguide/html/styleguide.html';
    }

    const obj = JSON.stringify({
      event: 'patternLab.updatePath',
      path: iFramePath,
    });
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.postMessage(obj, urlHandler.targetOrigin);
    document.getElementById('title').innerHTML = 'Pattern Lab - ' + patternName;
    document
      .querySelector('.pl-js-open-new-window')
      .setAttribute('href', urlHandler.getFileName(patternName));
  },
};

/**
 * handle the onpopstate event
 */
window.onpopstate = function(event) {
  urlHandler.skipBack = true;
  urlHandler.popPattern(event);
};
