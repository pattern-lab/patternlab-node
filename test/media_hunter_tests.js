(function () {
"use strict";

	var MediaHunter = require('../builder/media_hunter');

	//all tests here run against the shipped code, and as such altering any of that can break these tests
	//these tests are intended to catch development regressions. one should not have a need to run tests during patternlab use.

	exports['media_query hunter basic support '] = {
		'test media hunter finds query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries.length, 4);

			test.done();
		},

		'test media hunter supports spaces in media query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries[0], '1600px');

			console.log(pl.mediaQueries);

			test.done();
		},

		'test media hunter supports nospaces in media query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries[2], '50em');

			test.done();
		}
	};

}());
