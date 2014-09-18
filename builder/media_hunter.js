(function () {
	"use strict";

	var media_hunter = function(){

		function findMediaQueries(patternlab){
			patternlab.mediaQueries = [];

			

			
		}

		return {
			find_media_queries: function(patternlab){
				findMediaQueries(patternlab);
			}
		};

	};

	module.exports = media_hunter;

}());