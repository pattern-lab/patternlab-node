module.exports = function(Handlebars) {
  Handlebars.registerHelper('test', function() {
    return 'This is a test helper';
  });
};
