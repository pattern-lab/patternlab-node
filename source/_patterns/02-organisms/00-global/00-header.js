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
    $(document).scroll(function() {
        var $header = $('header.header'),
          hasScrolled = $(window).scrollTop();
        $header[hasScrolled ? 'addClass' : 'removeClass']('header--sticky');
        $('.pageContent').css({ paddingTop : hasScrolled ? $header.outerHeight(false) : 0 });
    });
});