(function () {
"use strict";

	var MediaHunter = require('../builder/media_hunter');

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

			test.equals(pl.mediaQueries[0], '35em');

			test.done();
		},

		'test media hunter supports nospaces in media query' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries[1], '50em');

			test.done();
		},

		'calling media hunter twice does not double add media queries' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);
			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries.length, 4);

			test.done();
		},

		'encountering the same breakpoint in a file does not double add' : function(test){

			//setup pl object
			var pl = {};
			var mh = new MediaHunter();

			mh.find_media_queries('./test/files', pl);

			test.equals(pl.mediaQueries.length, 4);

			test.done();
		}
	};

}());
