var $ = require('jquery');
module.exports = $(function() {
    $('body').on('click', '.navigation--primary__hamburger', function(e) {
        e.preventDefault();
        $(this).toggleClass('navigation--active');
    });
});