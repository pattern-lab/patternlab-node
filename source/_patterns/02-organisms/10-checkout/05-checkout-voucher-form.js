var $ = require('jquery');
module.exports = $(function() {
    $('body').on('click', '[class*=checkout__voucherField--label]', function(){
        $(this).toggleClass($(this).hasClass('checkout__voucherField--label') ? 'checkout__voucherField--label--expanded' : 'checkout__voucherField--label--expanded');
    });
});