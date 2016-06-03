"use strict";

var pattern_assembler = function () {
  var path = require('path'),
    fs = require('fs-extra'),
    Pattern = require('./object_factory').Pattern,
    md = require('markdown-it')(),
    plutils = require('./utilities'),
    patternEngines = require('./pattern_engines');


  // HELPER FUNCTIONS

  function getPartial(partialName, patternlab) {
    //look for exact partial matches
    for (var i = 0; i < patternlab.patterns.length; i++) {
      if (patternlab.patterns[i].patternPartial === partialName) {
        return patternlab.patterns[i];
      }
    }

    //else look by verbose syntax
    for (var i = 0; i < patternlab.patterns.length; i++) {
      switch (partialName) {
        case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName:
        case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName + '.mustache':
          return patternlab.patterns[i];
      }
    }

    //return the fuzzy match if all else fails
    for (var i = 0; i < patternlab.patterns.length; i++) {
      var partialParts = partialName.split('-'),
        partialType = partialParts[0],
        partialName = partialParts.slice(1).join('-');

      if (patternlab.patterns[i].patternPartial.split('-')[0] === partialType && patternlab.patterns[i].patternPartial.indexOf(partialName) > -1) {
        return patternlab.patterns[i];
      }
    }
    throw 'Could not find pattern with partial ' + partialName;
  }

  function buildListItems(container) {
    //combine all list items into one structure
    var list = [];
    for (var item in container.listitems) {
      if (container.listitems.hasOwnProperty(item)) {
        list.push(container.listitems[item]);
      }
    }
    container.listItemArray = plutils.shuffle(list);

    for (var i = 1; i <= container.listItemArray.length; i++) {
      var tempItems = [];
      if (i === 1) {
        tempItems.push(container.listItemArray[0]);
        container.listitems['' + i ] = tempItems;
      } else {
        for (var c = 1; c <= i; c++) {
          tempItems.push(container.listItemArray[c - 1]);
          container.listitems['' + i ] = tempItems;
        }
      }
    }
  }

  function setState(pattern, patternlab) {
    if (patternlab.config.patternStates && patternlab.config.patternStates[pattern.patternPartial]) {
      pattern.patternState = patternlab.config.patternStates[pattern.patternPartial];
    } else {
      pattern.patternState = "";
    }
  }

  function addPattern(pattern, patternlab) {

    //add the link to the global object
    patternlab.data.link[pattern.patternGroup + '-' + pattern.patternName] = '/patterns/' + pattern.patternLink;

    //only push to array if the array doesn't contain this pattern
    var isNew = true;
    for (var i = 0; i < patternlab.patterns.length; i++) {
      //so we need the identifier to be unique, which patterns[i].relPath is
      if (pattern.relPath === patternlab.patterns[i].relPath) {
        //if relPath already exists, overwrite that element
        patternlab.patterns[i] = pattern;
        patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate || pattern.template;
        isNew = false;
        break;
      }
    }

    // if the pattern is new, we must register it with various data structures!
    if (isNew) {

      if (patternlab.config.debug) {
        console.log('found new pattern ' + pattern.patternPartial);
      }

      // do global registration
      patternlab.patterns.push(pattern);
      patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate || pattern.template;

      // do plugin-specific registration
      pattern.registerPartial();
    }
  }

  // Render a pattern on request. Long-term, this should probably go away.
  function renderPattern(pattern, data, partials) {
    // if we've been passed a full Pattern, it knows what kind of template it
    // is, and how to render itself, so we just call its render method
    if (pattern instanceof Pattern) {
      return pattern.render(data, partials);
    } else {
      // otherwise, assume it's a plain mustache template string, and we
      // therefore just need to create a dummpy pattern to be able to render
      // it
      var dummyPattern = Pattern.createEmpty({extendedTemplate: pattern});
      return patternEngines.mustache.renderPattern(dummyPattern, data, partials);
    }
  }

  function processPatternIterative(relPath, patternlab) {
    //extract some information
    var filename = path.basename(relPath);
    var ext = path.extname(filename);
    var patternsPath = patternlab.config.paths.source.patterns;

    // skip non-pattern files
    if (!patternEngines.isPatternFile(filename, patternlab)) { return null; }

    //make a new Pattern Object
    var currentPattern = new Pattern(relPath);

    //if file is named in the syntax for variants
    if (patternEngines.isPseudoPatternJSON(filename)) {
      return currentPattern;
    }

    //can ignore all non-supported files at this point
    if (patternEngines.isFileExtensionSupported(ext) === false) {
      return currentPattern;
    }

    //see if this file has a state
    setState(currentPattern, patternlab);

    //look for a json file for this template
    try {
      var jsonFilename = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName + ".json");
      currentPattern.jsonFileData = fs.readJSONSync(jsonFilename);
      if (patternlab.config.debug) {
        console.log('processPatternIterative: found pattern-specific data.json for ' + currentPattern.patternPartial);
      }
    }
    catch (e) {
      // do nothing
    }

    //look for a listitems.json file for this template
    try {
      var listJsonFileName = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName + ".listitems.json");
      currentPattern.listitems = fs.readJSONSync(listJsonFileName);
      buildListItems(currentPattern);
      if (patternlab.config.debug) {
        console.log('found pattern-specific listitems.json for ' + currentPattern.patternPartial);
      }
    }
    catch (e) {
      // do nothing
    }

    //look for a markdown file for this template
    try {
      var markdownFileName = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + ".md");
      var markdownFileContents = fs.readFileSync(markdownFileName, 'utf8');
      currentPattern.patternDescExists = true;
      currentPattern.patternDesc = md.render(markdownFileContents);
      if (patternlab.config.debug) {
        console.log('found pattern-specific markdown-documentation.md for ' + currentPattern.patternPartial);
      }
    }
    catch (e) {
      // do nothing
    }

    //add the raw template to memory
    currentPattern.template = fs.readFileSync(path.resolve(patternsPath, relPath), 'utf8');

    //find any stylemodifiers that may be in the current pattern
    currentPattern.stylePartials = currentPattern.findPartialsWithStyleModifiers();

    //find any pattern parameters that may be in the current pattern
    currentPattern.parameteredPartials = currentPattern.findPartialsWithPatternParameters();

    //add currentPattern to patternlab.patterns array
    addPattern(currentPattern, patternlab);

    return currentPattern;
  }

  function processPatternRecursive(file, patternlab) {
    var lh = require('./lineage_hunter'),
      pph = require('./pseudopattern_hunter'),
      lih = require('./list_item_hunter');

    var lineage_hunter = new lh(),
      list_item_hunter = new lih(),
      pseudopattern_hunter = new pph();

    //find current pattern in patternlab object using var file as a partial
    var currentPattern, i;

    for (i = 0; i < patternlab.patterns.length; i++) {
      if (patternlab.patterns[i].relPath === file) {
        currentPattern = patternlab.patterns[i];
      }
    }

    //return if processing an ignored file
    if (typeof currentPattern === 'undefined') { return; }

    currentPattern.extendedTemplate = currentPattern.template;

    //find how many partials there may be for the given pattern
    var foundPatternPartials = currentPattern.findPartials(currentPattern);

    //find any listItem blocks that within the pattern, even if there are no partials
    list_item_hunter.process_list_item_partials(currentPattern, patternlab);

    // expand any partials present in this pattern; that is, drill down into
    // the template and replace their calls in this template with rendered
    // results
    if (currentPattern.engine.expandPartials && (foundPatternPartials !== null && foundPatternPartials.length > 0)) {
      // eslint-disable-next-line
      expandPartials(foundPatternPartials, list_item_hunter, patternlab, currentPattern);

      // update the extendedTemplate in the partials object in case this
      // pattern is consumed later
      patternlab.partials[currentPattern.patternPartial] = currentPattern.extendedTemplate;
    }

    //find pattern lineage
    lineage_hunter.find_lineage(currentPattern, patternlab);

    //add to patternlab object so we can look these up later.
    addPattern(currentPattern, patternlab);

    //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
    pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);
  }

  function expandPartials(foundPatternPartials, list_item_hunter, patternlab, currentPattern) {
    var smh = require('./style_modifier_hunter'),
      ph = require('./parameter_hunter');

    var style_modifier_hunter = new smh(),
      parameter_hunter = new ph();

    if (patternlab.config.debug) {
      console.log('found partials for ' + currentPattern.patternPartial);
    }

    // determine if the template contains any pattern parameters. if so they
    // must be immediately consumed
    parameter_hunter.find_parameters(currentPattern, patternlab);

    //do something with the regular old partials
    for (var i = 0; i < foundPatternPartials.length; i++) {
      var partial = currentPattern.findPartial(foundPatternPartials[i]);
      var partialPath;

      //identify which pattern this partial corresponds to
      for (var j = 0; j < patternlab.patterns.length; j++) {
        if (patternlab.patterns[j].patternPartial === partial ||
           patternlab.patterns[j].relPath.indexOf(partial) > -1)
        {
          partialPath = patternlab.patterns[j].relPath;
        }
      }

      //recurse through nested partials to fill out this extended template.
      processPatternRecursive(partialPath, patternlab);

      //complete assembly of extended template
      var partialPattern = getPartial(partial, patternlab);

      //if partial has style modifier data, replace the styleModifier value
      if (currentPattern.stylePartials && currentPattern.stylePartials.length > 0) {
        style_modifier_hunter.consume_style_modifier(partialPattern, foundPatternPartials[i], patternlab);
      }

      currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPatternPartials[i], partialPattern.extendedTemplate);
    }
  }

  function parseDataLinksHelper(patternlab, obj, key) {
    var JSON5 = require('json5');
    var linkRE, dataObjAsString, linkMatches, expandedLink;

    linkRE = /link\.[A-z0-9-_]+/g;
    dataObjAsString = JSON5.stringify(obj);
    linkMatches = dataObjAsString.match(linkRE);

    if (linkMatches) {
      for (var i = 0; i < linkMatches.length; i++) {
        expandedLink = patternlab.data.link[linkMatches[i].split('.')[1]];
        if (expandedLink) {
          if (patternlab.config.debug) {
            console.log('expanded data link from ' + linkMatches[i] + ' to ' + expandedLink + ' inside ' + key);
          }
          dataObjAsString = dataObjAsString.replace(linkMatches[i], expandedLink);
        }
      }
    }

    var dataObj;
    try {
      dataObj = JSON5.parse(dataObjAsString);
    } catch (err) {
      console.log('There was an error parsing JSON for ' + key);
      console.log(err);
    }

    return dataObj;
  }

  //look for pattern links included in data files.
  //these will be in the form of link.* WITHOUT {{}}, which would still be there from direct pattern inclusion
  function parseDataLinks(patternlab) {
    //look for link.* such as link.pages-blog as a value

    patternlab.data = parseDataLinksHelper(patternlab, patternlab.data, 'data.json');

    //loop through all patterns
    for (var i = 0; i < patternlab.patterns.length; i++) {
      patternlab.patterns[i].jsonFileData = parseDataLinksHelper(patternlab, patternlab.patterns[i].jsonFileData, patternlab.patterns[i].partial);
    }
  }

  return {
    find_pattern_partials: function (pattern) {
      return pattern.findPartials();
    },
    find_pattern_partials_with_style_modifiers: function (pattern) {
      return pattern.findPartialsWithStyleModifiers();
    },
    find_pattern_partials_with_parameters: function (pattern) {
      return pattern.findPartialsWithPatternParameters();
    },
    find_list_items: function (pattern) {
      return pattern.findListItems();
    },
    setPatternState: function (pattern, patternlab) {
      setState(pattern, patternlab);
    },
    addPattern: function (pattern, patternlab) {
      addPattern(pattern, patternlab);
    },
    renderPattern: function (template, data, partials) {
      return renderPattern(template, data, partials);
    },
    process_pattern_iterative: function (file, patternlab) {
      return processPatternIterative(file, patternlab);
    },
    process_pattern_recursive: function (file, patternlab, additionalData) {
      processPatternRecursive(file, patternlab, additionalData);
    },
    findPartial: function (partial, patternlab) {
      return getPartial(partial, patternlab);
    },
    combine_listItems: function (patternlab) {
      buildListItems(patternlab);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    }
  };

};

module.exports = pattern_assembler;
