var $ = require('jquery');

module.exports = $(function() {
  /*
    can be used in simple and advanced ways:
    - data-toggle-class="my-to-be-toggled-classname" toggles the specified classname(s) on the clicked element itself
    - data-toggle-class="my-to-be-toggled-classname : .target-selector" toggles the specified classname(s) on the given querySelector string
    - data-toggle-class="toggle--A : .target-A && toggle--B : .target-B" toggles multiple targets differently
    - data-toggle-class="toggle--A && toggle--B : .target-B" toggles class name toggle--A on current element and toggle--B on .target-B
   */

  $('[data-toggle-class]').each(function() {
    var $source = $(this),
      data = $source.data('toggle-class');

    $source.click(function() {
      data.split('&&').forEach(function(block) {
        block = block.split(':');

        if (!block[1]) {
          block[1] = $source;
        } else {
          block[1] = $(block[1]);
        }

        block[1].toggleClass(block[0]);
      });
    });
  });
});
