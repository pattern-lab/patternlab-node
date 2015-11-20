var $ = require('jquery');
module.exports = $(function() {
    $('body').on('click', '.navigation--primary__hamburger', function(e) {
        e.stopPropagation();
        $('.basicLayout').toggleClass('basicLayout--showOffCanvasA');
    }).on('click', '.basicLayout__canvas', function() {
        $('.basicLayout').removeClass('basicLayout--showOffCanvasA');
    }).on('click', '.header__navigation', function(e) {
        e.stopPropagation();
    });
    $(document).scroll(function() {
        $('header.header')[$(window).scrollTop() ? 'addClass' : 'removeClass']('header--sticky');
        $('.pageContent')[$(window).scrollTop() ? 'addClass' : 'removeClass']('pageContent--stickyHeader');
    });
});