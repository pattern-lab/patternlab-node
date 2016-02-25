var $ = require('jquery');
module.exports = $(function() {
    $('body').on('click', '.navigation--primary__hamburger', function(e) {
        e.stopPropagation();
        $('.basicLayout').toggleClass('basicLayout--expanded-left');
    }).on('click', '.cart__link', function(e) {
        e.stopPropagation();
        $('.basicLayout').toggleClass('basicLayout--expanded-right');
    }).on('click', '.basicLayout--inner', function() {
        $('.basicLayout').removeClass('basicLayout--expanded-left basicLayout--expanded-right');
    }).on('click', '.header__navigation', function(e) {
        e.stopPropagation();
    });

    // sticky header
    var $header = $('header.header').addClass('header--sticky');
    $(document).scroll(function() {
        $header[$(window).scrollTop() ? 'addClass' : 'removeClass']('header--scrolled');
    }).scroll();
    $(window).resize(function() {
        $header.next().css({ paddingTop : $header.outerHeight(false) });
    }).resize();
});