/**

  Very basic translation system

*/

"use strict";


var i18n = function (config, keyword) {
  var keyword = keyword.toLowerCase();
  var translatedWord = config.i18n[keyword] !== undefined ? config.i18n[keyword] : keyword.charAt(0).toUpperCase() + keyword.slice(1);
  return translatedWord;
};

module.exports = i18n;
