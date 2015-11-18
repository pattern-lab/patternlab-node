var $ = require('jquery');
module.exports = $(function() {
    $('body').on('click', '[class*=accordion__handle]', function(){
        $(this).toggleClass($(this).hasClass('accordion__handle') ? 'accordion__handle--expanded' : 'mobile-accordion__handle--expanded');
    });
});