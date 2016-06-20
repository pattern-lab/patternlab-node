var $ = require('jquery');

module.exports = $(function() {

  $('.tabs').find('li > a').on('click', function(e) {
    var $currentTarget = $(e.currentTarget),
        $target = $currentTarget.attr('href'),
        $tabContent = $('[data-tab=' + $currentTarget.data('target') + ']');

    $currentTarget.parents('ul').find('li').removeClass('tabs__active');
    $currentTarget.parent().addClass('tabs__active');

    $tabContent.find('> div').css('display', 'none');
    $tabContent.find($target).css('display', 'block');

  });
});
