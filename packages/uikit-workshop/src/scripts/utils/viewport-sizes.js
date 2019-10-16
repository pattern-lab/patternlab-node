let minWidth = 240;
let maxWidth = 2600;

if (window.config !== undefined) {
  //set minimum and maximum viewport based on confg
  if (window.config.ishMinimum !== undefined) {
    minWidth = parseInt(window.config.ishMinimum, 10); //Minimum Size for Viewport
  }
  if (window.config.ishMaximum !== undefined) {
    maxWidth = parseInt(window.config.ishMaximum, 10); //Maxiumum Size for Viewport
  }

  //alternatively, use the ishViewportRange object
  if (window.config.ishViewportRange !== undefined) {
    minWidth = window.config.ishViewportRange.s[0];
    maxWidth = window.config.ishViewportRange.l[1];
  }

  //if both are set, then let's use the larger one.
  if (window.config.ishViewportRange && window.config.ishMaximum) {
    const largeRange = parseInt(window.config.ishViewportRange.l[1], 10);
    const ishMaximum = parseInt(window.config.ishMaximum, 10);
    maxWidth = largeRange > ishMaximum ? largeRange : ishMaximum;
  }
}

export const minViewportWidth = minWidth;
export const maxViewportWidth = maxWidth;
