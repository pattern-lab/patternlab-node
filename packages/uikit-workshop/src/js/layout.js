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
