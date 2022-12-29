/**
 * Panel Builder - supports building the panels to be included in the modal or styleguide
 */
/* eslint-disable no-param-reassign, no-unused-vars */

import Handlebars from 'handlebars/dist/handlebars';
import pretty from 'pretty';
import { html, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Panels } from './panels';
import { panelsUtil } from './panels-util';
import { urlHandler, Dispatcher } from '../utils';
import './pl-copy-to-clipboard/pl-copy-to-clipboard';
import { PrismLanguages as Prism } from './prism-languages';
import Normalizer from 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js';

const normalizeWhitespace = new Normalizer({
  'remove-trailing': true,
  'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  'break-lines': 100,
  indent: 2,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2,
  'spaces-to-tabs': 2,
});

export const panelsViewer = {
  // set up some defaults
  targetOrigin:
    window.location.protocol === 'file:'
      ? '*'
      : window.location.protocol + '//' + window.location.host,
  initCopy: false,
  initMoveTo: 0,

  /**
   * Check to see if all of the panels have been collected before rendering
   * @param  {String}      the collected panels
   * @param  {String}      the data from the pattern
   * @param  {Boolean}     if this is going to be passed back to the styleguide
   */
  checkPanels(panels, patternData, iframePassback, switchText) {
    // count how many panels have rendered content
    let panelContentCount = 0;
    for (let i = 0; i < panels.length; ++i) {
      if (panels[i].content !== undefined) {
        panelContentCount++;
      }
    }

    // see if the count of panels with content matches number of panels
    if (panelContentCount === Panels.count()) {
      panelsViewer.renderPanels(
        panels,
        patternData,
        iframePassback,
        switchText
      );
    }
  },

  /**
   * Gather the panels related to the modal
   * @param  {String}      the data from the pattern
   * @param  {Boolean}     if this is going to be passed back to the styleguide
   */
  gatherPanels(patternData, iframePassback, switchText) {
    Dispatcher.addListener('checkPanels', panelsViewer.checkPanels);

    // set-up defaults
    let template, templateCompiled, templateRendered, templateFormatted;

    // get the base panels
    const panels = Panels.get();

    // evaluate panels array and create content
    for (let i = 0; i < panels.length; ++i) {
      const panel = panels[i];

      // catch pattern panel since it doesn't have a name defined by default
      if (panel.name === undefined) {
        panel.name =
          patternData.patternEngineName || patternData.patternExtension;
        panel.language = patternData.patternExtension;
      }

      // if httpRequestReplace has not been set, use the extension. this is likely for the raw template
      if (panel.httpRequestReplace === undefined) {
        panel.httpRequestReplace = '';
      }

      if (panel.httpRequestReplace === '') {
        panel.httpRequestReplace =
          panel.httpRequestReplace + '.' + patternData.patternExtension;
      }

      if (panel.templateID !== undefined && panel.templateID) {
        if (panel.httpRequest !== undefined && panel.httpRequest) {
          // need a file and then render
          const fileBase = urlHandler.getFileName(
            patternData.patternPartial,
            false
          );
          const e = new XMLHttpRequest();
          // @todo: look deeper into how we can refactor this particular code block
          /* eslint-disable */
          e.onload = (function (i, panels, patternData, iframeRequest) {
            return function () {
              // since non-existant files (such as .scss from plugin-tab) still return a 200, we need to instead inspect the contents
              // we look for responseText that starts with the doctype
              let rText = this.responseText;
              if (rText.startsWith('<!DOCTYPE html>')) {
                rText = '';
              }

              // use pretty to format HTML
              if (panels[i].name === 'HTML') {
                templateFormatted = pretty(rText, { ocd: true });
              } else {
                templateFormatted = rText;
              }

              const templateHighlighted = Prism.highlight(
                templateFormatted,
                Prism.languages[panels[i].name.toLowerCase()] ||
                  Prism.languages['markup']
                // Prism.languages[panels[i].name.toLowerCase()],
              );

              const codeTemplate = (code, language) =>
                html`
                  <pre
                    class="language-markup"
                  ><code id="pl-code-fill-${language}" class="language-${language}">${unsafeHTML(
                    code
                  )}</code></pre>
                `;

              const result = document.createDocumentFragment();
              const fallBackResult = document.createDocumentFragment();

              render(codeTemplate(templateHighlighted, 'html'), result);
              render(codeTemplate(templateFormatted, 'html'), fallBackResult);

              if (result.children) {
                panels[i].content = result.children[0].outerHTML;
              } else if (fallBackResult.children) {
                panels[i].content = fallBackResult.children[0].outerHTML;
              } else {
                panels[i].content =
                  '<pre class="language-markup"><code id="pl-code-fill-html" class="language-html">' +
                  templateFormatted
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;') +
                  '</code></pre>';
              }

              Dispatcher.trigger('checkPanels', [
                panels,
                patternData,
                iframePassback,
                switchText,
              ]);
            };
          })(i, panels, patternData, iframePassback);
          /* eslint-enable */
          e.open(
            'GET',
            fileBase + panel.httpRequestReplace + '?' + new Date().getTime(),
            true
          );
          e.send();
        } else {
          // vanilla render of pattern data
          template = document.getElementById(panel.templateID);
          templateCompiled = Handlebars.compile(template.innerHTML);
          templateRendered = templateCompiled(patternData);
          const normalizedCode =
            normalizeWhitespace.normalize(templateRendered);
          normalizedCode.replace(/[\r\n]+/g, '\n\n');
          const highlightedCode = Prism.highlight(
            normalizedCode,
            Prism.languages.html
          );
          panels[i].content = highlightedCode;
          Dispatcher.trigger('checkPanels', [
            panels,
            patternData,
            iframePassback,
            switchText,
          ]);
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
  renderPanels(panels, plData, iframePassback, switchText) {
    // set-up defaults
    const patternData = plData; // prevents params from getting re-assigned

    let templateRendered;
    let annotation, count, els, item;
    const patternPartial = patternData.patternPartial;
    patternData.panels = panels;

    // set a default pattern description for modal pop-up
    if (!iframePassback && patternData.patternDesc.length === 0) {
      patternData.patternDesc = '';
    }

    // capitilize the pattern name
    patternData.patternNameCaps = patternData.patternName.toUpperCase();

    // check for annotations in the given mark-up
    const markup = document.createElement('div');
    markup.innerHTML = patternData.patternMarkup;

    count = 1;
    patternData.annotations = [];
    delete patternData.patternMarkup;

    for (let i = 0; i < window.comments.comments.length; ++i) {
      item = window.comments.comments[i];
      els = markup.querySelectorAll(item.el);

      if (els.length > 0) {
        annotation = {
          displayNumber: count,
          el: item.el,
          title: item.title,
          comment: item.comment,
        };
        patternData.annotations.push(annotation);
        count++;
      }
    }

    // alert the pattern that annotations should be highlighted
    if (patternData.annotations.length > 0) {
      const obj = JSON.stringify({
        event: 'patternLab.annotationsHighlightShow',
        annotations: patternData.annotations,
      });
      document
        .querySelector('.pl-js-iframe')
        .contentWindow.postMessage(obj, panelsViewer.targetOrigin);
    }

    // add hasComma property to lineage
    if (patternData.lineage.length > 0) {
      for (let i = 0; i < patternData.lineage.length; ++i) {
        if (i < patternData.lineage.length - 1) {
          patternData.lineage[i].hasComma = true;
        }
      }
    }

    // add hasComma property to lineageR
    if (patternData.lineageR.length > 0) {
      for (let i = 0; i < patternData.lineageR.length; ++i) {
        if (i < patternData.lineageR.length - 1) {
          patternData.lineageR[i].hasComma = true;
        }
      }
    }

    // add *Exists attributes for Handlebars templates
    // figure out if the description exists
    patternData.patternDescExists =
      patternData.patternDesc.length > 0 ||
      (patternData.patternDescAdditions !== undefined &&
        patternData.patternDescAdditions.length > 0);

    // figure out if lineage should be drawn
    patternData.lineageExists = patternData.lineage.length !== 0;

    // figure out if reverse lineage should be drawn
    patternData.lineageRExists = patternData.lineageR.length !== 0;

    // figure out if pattern state should be drawn
    patternData.patternStateExists = patternData.patternState.length > 0;

    // figure if annotations should be drawn
    patternData.annotationExists = patternData.annotations.length > 0;

    // figure if the entire desc block should be drawn
    patternData.descBlockExists =
      patternData.patternDescExists ||
      patternData.lineageExists ||
      patternData.lineageRExists ||
      patternData.patternStateExists ||
      patternData.annotationExists;

    // set isPatternView based on if we have to pass it back to the styleguide level
    patternData.isPatternView = iframePassback === false;

    // render all of the panels in the base panel template
    const template = document.querySelector('.pl-js-panel-template-base');
    const templateCompiled = Handlebars.compile(template.innerHTML);
    templateRendered = templateCompiled(patternData);

    // make sure templateRendered is modified to be an HTML element
    const div = document.createElement('div');
    div.className = 'pl-c-pattern-info';
    div.innerHTML = templateRendered;
    templateRendered = div;

    // add click events
    templateRendered = panelsUtil.addClickEvents(
      templateRendered,
      patternPartial
    );

    // add onclick events to the tabs in the rendered content
    for (let i = 0; i < panels.length; ++i) {
      const panel = panels[i];

      // default IDs
      const panelTab = '#pl-' + patternPartial + '-' + panel.id + '-tab';
      const panelBlock = '#pl-' + patternPartial + '-' + panel.id + '-panel';

      // show default options
      if (templateRendered.querySelector(panelTab) !== null && panel.default) {
        templateRendered
          .querySelector(panelTab)
          .classList.add('pl-is-active-tab');
        templateRendered
          .querySelector(panelBlock)
          .classList.add('pl-is-active-tab');
      }
    }

    // gather panels from plugins
    Dispatcher.trigger('insertPanels', [
      templateRendered,
      patternPartial,
      iframePassback,
      switchText,
    ]);
  },
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
