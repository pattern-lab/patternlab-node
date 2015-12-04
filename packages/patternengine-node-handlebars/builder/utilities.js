/*
 * patternlab-node - v0.14.0 - 2015
 *
 * Brian Muenzenmeyer, Geoffrey Pursell and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
  var path = require('path');

  var util = {
    // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    shuffle: function (o) {
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    },

    /**
     * Recursively merge properties of two objects.
     *
     * @param {Object} obj1 If obj1 has properties obj2 doesn't, add to obj2.
     * @param {Object} obj2 This object's properties have priority over obj1.
     * @returns {Object} obj2
     */
    mergeData: function (obj1, obj2) {
      if(typeof obj2 === 'undefined'){
        obj2 = {};
      }
      for(var p in obj1){
        try {
          // Only recurse if obj1[p] is an object.
          if(obj1[p].constructor === Object){
            // Requires 2 objects as params; create obj2[p] if undefined.
            if(typeof obj2[p] === 'undefined'){
              obj2[p] = {};
            }
            obj2[p] = util.mergeData(obj1[p], obj2[p]);
            // Pop when recursion meets a non-object. If obj1[p] is a non-object,
            // only copy to undefined obj2[p]. This way, obj2 maintains priority.
          } else if(typeof obj2[p] === 'undefined'){
            obj2[p] = obj1[p];
          }
        } catch(e) {
          // Property in destination object not set; create it and set its value.
          if(typeof obj2[p] === 'undefined'){
            obj2[p] = obj1[p];
          }
        }
      }
      return obj2;
    },

    isObjectEmpty: function (obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) { return false; }
      }
      return true;
    }
  };

  module.exports = util;
}());
