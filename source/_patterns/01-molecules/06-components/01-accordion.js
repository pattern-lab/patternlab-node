module.exports = (function() {
    'use strict';

    var $ = require('jquery');
    $('[class*=accordion__handle]').click(function(){
        $(this).toggleClass($(this).hasClass('accordion__handle') ? 'accordion__handle--expanded' : 'mobile-accordion__handle--expanded');
    });
})();