module.exports = {
    minViewportWidth            : 240, //Minimum Size for Viewport
    maxViewportWidth            : 2600, //Maxiumum Size for Viewport
    viewportResizeHandleWidth   : 14, //Width of the viewport drag-to-resize handle
    bodySize                    : parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size')),
    sw                          : document.body.clientWidth, //Viewport Width
    sh                          : document.body.clientHeight //Viewport Height
}