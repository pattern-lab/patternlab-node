var $ = require('jquery');

module.exports = $(function() {
    $('body').on('click', '.accordion__handle', function(){
        $(this).toggleClass('accordion__handle--expanded');
    }).on('click', '.mobile-accordion__handle', function(){
        $(this).toggleClass('mobile-accordion__handle--expanded');
    });
});