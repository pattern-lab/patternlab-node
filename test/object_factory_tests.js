(function () {
"use strict";

	var of = require('../core/lib/object_factory');

	exports['oPattern initialization'] = {
		'test oPattern initializes correctly' : function(test){
			var p = new of.oPattern('source/_patterns/00-atoms/00-global/00-colors.mustache', '00-atoms/00-global', '00-colors.mustache', { d: 123});
			test.equals(p.name, '00-atoms-00-global-00-colors');
			test.equals(p.abspath, 'source/_patterns/00-atoms/00-global/00-colors.mustache');
			test.equals(p.subdir, '00-atoms/00-global');
			test.equals(p.fileName, '00-colors');
			test.equals(p.fileExtension, '.mustache');
			test.equals(p.jsonFileData.d, 123);
			test.equals(p.patternName, 'colors');
			test.equals(p.patternDisplayName, 'Colors');
			test.equals(p.patternLink, '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html');
			test.equals(p.patternGroup, 'atoms');
			test.equals(p.patternSubGroup, 'global');
			test.equals(p.flatPatternPath, '00-atoms-00-global');
			test.equals(p.patternPartial, 'atoms-colors');
			test.equals(p.template, '');
			test.equals(p.patternPartialCode, '');
			test.equals(p.lineage.length, 0);
			test.equals(p.lineageIndex.length, 0);
			test.equals(p.lineageR.length, 0);
			test.equals(p.lineageRIndex.length, 0);
			test.done();
		},
		'test oPattern capitalizes patternDisplayName correctly' : function(test){
			var p = new of.oPattern('source/_patterns/00-atoms/00-global/00-colors-alt.mustache', '00-atoms/00-global', '00-colors-alt.mustache', { d: 123});
			test.equals(p.patternName, 'colors-alt');
			test.equals(p.patternDisplayName, 'Colors Alt');
			test.done();
		},
		'test oPattern removes pattern paramter from key correctly' : function(test){
			var p = new of.oPattern('source/_patterns/00-atoms/00-global/00-colors-alt.mustache', '00-atoms/00-global', '00-colors-alt.mustache', { d: 123});
			test.equals(p.patternName, 'colors-alt');
			test.equals(p.patternDisplayName, 'Colors Alt');
			test.done();
		}
	};

	exports['oPatternType initialization'] = {
		'test oPatternType initializes correctly' : function(test){
			var b = new of.oPatternType('test');
			test.equals(b.patternTypeLC, 'test');
			test.equals(b.patternTypeUC, 'Test');
			test.equals(b.patternTypeItems.length, 0);
			test.equals(b.patternTypeItemsIndex.length, 0);
			test.equals(b.patternItems.length, 0);
			test.equals(b.patternItemsIndex.length, 0);
			test.done();
		},
		'test oPatternType capitalizes patternTypeUC' : function(test){
			var b = new of.oPatternType('page-templates');
			test.equals(b.patternTypeLC, 'page-templates');
			test.equals(b.patternTypeUC, 'Page Templates');
			test.done();
		}
	};

	exports['oNavItem initialization'] = {
		'test oNavItem initializes correctly' : function(test){
			var ni = new of.oNavItem('test');
			test.equals(ni.patternSubtypeLC, 'test');
			test.equals(ni.patternSubtypeUC, 'Test');
			test.equals(ni.patternSubtypeItems.length, 0);
			test.equals(ni.patternSubtypeItemsIndex.length, 0);
			test.done();
		},
		'test oNavItem correctly capitalizes sectionNameUC' : function(test){
			var ni = new of.oNavItem('global-concepts');
			test.equals(ni.patternSubtypeLC, 'global-concepts');
			test.equals(ni.patternSubtypeUC, 'Global Concepts');
			test.done();
		}
	};

	exports['oSubNavItem initialization'] = {
		'test oSubNavItem initializes correctly' : function(test){
			var sni = new of.oNavSubItem('test');
			test.equals(sni.patternName, 'Test');
			test.equals(sni.patternPath, '');
			test.equals(sni.patternPartial, '');
			test.done();
		},
		'test oSubNavItem capitalizes patternName' : function(test){
			var sni = new of.oNavSubItem('nav button');
			test.equals(sni.patternName, 'Nav Button');
			test.done();
		}
	};

}());
