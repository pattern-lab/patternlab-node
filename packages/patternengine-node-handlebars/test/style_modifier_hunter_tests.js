(function () {
	"use strict";

	var smh = require('../builder/style_modifier_hunter');

	exports['consume_style_modifier'] = {
		'uses the partial stylemodifer to modify the patterns extendedTemplate' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				extendedTemplate: '<div class="foo {{styleModifier}}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar}}', pl);

			//assert
			test.equals(pattern.extendedTemplate, '<div class="foo bar"></div>');
			test.done();
		},
		'does not alter pattern extendedTemplate if styleModifier not found in partial' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				extendedTemplate: '<div class="foo {{styleModifier}}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial}}', pl);

			//assert
			test.equals(pattern.extendedTemplate, '<div class="foo {{styleModifier}}"></div>');
			test.done();
		}
	};

}());
