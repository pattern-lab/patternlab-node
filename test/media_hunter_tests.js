(function () {
"use strict";

	var MediaHunter = require('../builder/media_hunter');

	exports['media_query hunter '] = {
		'test media hunter finds query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries(pl);

			test.equals(pl.mediaQueries.length, 6);

			test.done();
		}
	};

}());