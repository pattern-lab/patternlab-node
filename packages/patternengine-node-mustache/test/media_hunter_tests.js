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

			mh.find_media_queries(pl);

			test.equals(pl.mediaQueries.length, 7);

			test.done();
		}
	};

	exports['media_query hunter spaces '] = {
		'test media hunter supports spaces in media query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries(pl);

			test.equals(pl.mediaQueries[0], '24em');

			test.done();
		}
	};

	exports['media_query hunter no spaces '] = {
		'test media hunter supports nospaces in media query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries(pl);

			//the last media query found in the shipped suite does not have a space
			//you can see this here:

			//./source/css/scss/base/_global-classes.scss
			// .hide-large-2 {
			//     @media all and (min-width:$bp-large-2) {
			//         display: none;
			//     }
			// }
 
			test.equals(pl.mediaQueries[6], '66em');

			test.done();
		}
	};

}());