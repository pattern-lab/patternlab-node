---
el: "header[role=banner]"
title: "Masthead"
---
The main header of the site doesn't take up *too much screen real estate* in order to keep the focus on the core content.
It's using a linear CSS gradient instead of a background image to give greater design flexibility and reduce HTTP requests.
~*~
---
selector: ".logo"
title: "Logo"
---
The _logo image_ is an SVG file, which ensures that the logo displays crisply even on high resolution displays.
A PNG fallback is provided for browsers that don't support SVG images.

Further reading: [Optimizing Web Experiences for High Resolution Screens](http://bradfrostweb.com/blog/mobile/hi-res-optimization/)
