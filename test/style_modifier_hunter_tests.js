(function () {
	"use strict";

	var smh = require('../builder/style_modifier_hunter');

	exports['consume_style_modifier'] = {
		'uses the partial stylemodifer to modify the patterns tmpTemplate' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				tmpTemplate: '<div class="foo {{styleModifier}}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar}}', pl);

			//assert
			test.equals(pattern.tmpTemplate, '<div class="foo bar"></div>');
			test.done();
		},
		'replaces style modifiers with spaces in the syntax' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				tmpTemplate: '<div class="foo {{ styleModifier }}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar}}', pl);

			//assert
			test.equals(pattern.tmpTemplate, '<div class="foo bar"></div>');
			test.done();
		},
		'replaces multiple style modifiers' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				tmpTemplate: '<div class="foo {{ styleModifier }}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar|baz|dum}}', pl);

			//assert
			test.equals(pattern.tmpTemplate, '<div class="foo bar baz dum"></div>');
			test.done();
		},
		'does not alter pattern tmpTemplate if styleModifier not found in partial' : function(test){
			//arrange
			var pl = {};
			pl.config = {};
			pl.config.debug = false;

			var pattern = {
				tmpTemplate: '<div class="foo {{styleModifier}}"></div>'
			};

			var style_modifier_hunter = new smh();

			//act
			style_modifier_hunter.consume_style_modifier(pattern, '{{> partial}}', pl);

			//assert
			test.equals(pattern.tmpTemplate, '<div class="foo {{styleModifier}}"></div>');
			test.done();
		}
	};

}());
