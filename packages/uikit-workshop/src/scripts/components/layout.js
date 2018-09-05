/**
 * Primary UI rendering for Pattern Lab
 */

import Hogan from 'hogan.js';

try {
  /* load pattern nav */
  const template = document.querySelector('.pl-js-pattern-nav-template');
  const templateCompiled = Hogan.compile(template.innerHTML);
  const templateRendered = templateCompiled.render(window.navItems);
  document.querySelector(
    '.pl-js-pattern-nav-target'
  ).innerHTML = templateRendered;

  /* load ish controls */
  const controlsTemplate = document.querySelector(
    '.pl-js-ish-controls-template'
  );
  const controlsTemplateCompiled = Hogan.compile(controlsTemplate.innerHTML);
  const controlsTemplateRendered = controlsTemplateCompiled.render(
    window.ishControls
  );
  document.querySelector(
    '.pl-js-controls'
  ).innerHTML = controlsTemplateRendered;
} catch (e) {
  const message = '<p>Please generate your site before trying to view it.</p>';
  document.querySelector('.pl-js-pattern-nav-target').innerHTML = message;
}
