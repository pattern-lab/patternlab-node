var $ = require('jquery');
module.exports = $(function() {
    var field = $('.field');

    $('body').on('click', '[class*=checkout__voucherField--label]', function(){
        var voucherField = $(this);
        voucherField.toggleClass('checkout__voucherField--label--expanded');
        field.toggleClass('field--expanded');
    });
});
