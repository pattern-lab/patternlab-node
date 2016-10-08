"use strict";

var tap = require('tap');

var smh = require('../core/lib/style_modifier_hunter');

tap.test('uses the partial stylemodifer to modify the patterns extendedTemplate', function(test){
  //arrange
  var pl = {};
  pl.partials = {};
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
  test.end();
});

tap.test('replaces style modifiers with spaces in the syntax', function(test){
  //arrange
  var pl = {};
  pl.partials = {};
  pl.config = {};
  pl.config.debug = false;

  var pattern = {
    extendedTemplate: '<div class="foo {{ styleModifier }}"></div>'
  };

  var style_modifier_hunter = new smh();

  //act
  style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar}}', pl);

  //assert
  test.equals(pattern.extendedTemplate, '<div class="foo bar"></div>');
  test.end();
});

tap.test('replaces multiple style modifiers', function(test){
  //arrange
  var pl = {};
  pl.partials = {};
  pl.config = {};
  pl.config.debug = false;

  var pattern = {
    extendedTemplate: '<div class="foo {{ styleModifier }}"></div>'
  };

  var style_modifier_hunter = new smh();

  //act
  style_modifier_hunter.consume_style_modifier(pattern, '{{> partial:bar|baz|dum}}', pl);

  //assert
  test.equals(pattern.extendedTemplate, '<div class="foo bar baz dum"></div>');
  test.end();
});

tap.test('does not alter pattern extendedTemplate if styleModifier not found in partial', function(test){
  //arrange
  var pl = {};
  pl.partials = {};
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
  test.end();
});
