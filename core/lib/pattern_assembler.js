"use strict";

var path = require('path'),
  fs = require('fs-extra'),
  Pattern = require('./object_factory').Pattern,
  pph = require('./pseudopattern_hunter'),
  mp = require('./markdown_parser'),
  plutils = require('./utilities'),
  patternEngines = require('./pattern_engines'),
  lh = require('./lineage_hunter'),
  lih = require('./list_item_hunter'),
  smh = require('./style_modifier_hunter'),
  ph = require('./parameter_hunter'),
  JSON5 = require('json5');

var markdown_parser = new mp();

var pattern_assembler = function () {
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
        case patternlab.patterns[i].relPath:
        case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName:
          return patternlab.patterns[i];
      }
    }

    //return the fuzzy match if all else fails
    for (var i = 0; i < patternlab.patterns.length; i++) {
      var partialParts = partialName.split('-'),
        partialType = partialParts[0],
        partialNameEnd = partialParts.slice(1).join('-');

      if (patternlab.patterns[i].patternPartial.split('-')[0] === partialType && patternlab.patterns[i].patternPartial.indexOf(partialNameEnd) > -1) {
        return patternlab.patterns[i];
      }
    }
    plutils.logOrange('Could not find pattern referenced with partial syntax ' + partialName + '. This can occur when a pattern was renamed, moved, or no longer exists but it still called within a different template somewhere.');
    return undefined;
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

  /*
   * Deprecated in favor of .md 'status' frontmatter inside a pattern. Still used for unit tests at this time.
   * Will be removed in future versions
   */
  function setState(pattern, patternlab, displayDeprecatedWarning) {
    if (patternlab.config.patternStates && patternlab.config.patternStates[pattern.patternPartial]) {

      if (displayDeprecatedWarning) {
        plutils.logRed("Deprecation Warning: Using patternlab-config.json patternStates object will be deprecated in favor of the state frontmatter key associated with individual pattern markdown files.");
        console.log("This feature will still work in it's current form this release (but still be overridden by the new parsing method), and will be removed in the future.");
      }

      pattern.patternState = patternlab.config.patternStates[pattern.patternPartial];
    }
  }

  function addPattern(pattern, patternlab) {

    //add the link to the global object
    patternlab.data.link[pattern.patternPartial] = '/patterns/' + pattern.patternLink;

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
      if (pattern.isPattern) {
        patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate || pattern.template;

        // do plugin-specific registration
        pattern.registerPartial();
      } else {
        patternlab.partials[pattern.patternPartial] = pattern.patternDesc;
      }

      patternlab.patterns.push(pattern);

    }
  }

  function addSubtypePattern(subtypePattern, patternlab) {
    patternlab.subtypePatterns[subtypePattern.patternPartial] = subtypePattern;
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

  function parsePatternMarkdown(currentPattern, patternlab) {

    try {
      var markdownFileName = path.resolve(currentPattern.sourcePath, currentPattern.subdir, currentPattern.fileName + ".md");
      var markdownFileContents = fs.readFileSync(markdownFileName, 'utf8');

      var markdownObject = markdown_parser.parse(markdownFileContents);
      if (!plutils.isObjectEmpty(markdownObject)) {
        //set keys and markdown itself
        currentPattern.patternDescExists = true;
        currentPattern.patternDesc = markdownObject.markdown;

        //consider looping through all keys eventually. would need to blacklist some properties and whitelist others
        if (markdownObject.state) {
          currentPattern.patternState = markdownObject.state;
        }
        if (markdownObject.order) {
          currentPattern.order = markdownObject.order;
        }
        if (markdownObject.hidden) {
          currentPattern.hidden = markdownObject.hidden;
        }
        if (markdownObject.excludeFromStyleguide) {
          currentPattern.excludeFromStyleguide = markdownObject.excludeFromStyleguide;
        }
        if (markdownObject.tags) {
          currentPattern.tags = markdownObject.tags;
        }
        if (markdownObject.links) {
          currentPattern.links = markdownObject.links;
        }
      } else {
        if (patternlab.config.debug) {
          console.log('error processing markdown for ' + currentPattern.patternPartial);
        }
      }

      if (patternlab.config.debug) {
        console.log('found pattern-specific markdown for ' + currentPattern.patternPartial);
      }
    }
    catch (err) {
      // do nothing when file not found
      if (err.code !== 'ENOENT') {
        console.log('there was an error setting pattern keys after markdown parsing of the companion file for pattern ' + currentPattern.patternPartial);
        console.log(err);
      }
    }
  }

  /**
   * A helper that unravels a pattern looking for partials or listitems to unravel.
   * The goal is really to convert pattern.template into pattern.extendedTemplate
   * @param pattern - the pattern to decompose
   * @param patternlab - global data store
   * @param ignoreLineage - whether or not to hunt for lineage for this pattern
     */
  function decomposePattern(pattern, patternlab, ignoreLineage) {

    var lineage_hunter = new lh(),
      list_item_hunter = new lih();

    pattern.extendedTemplate = pattern.template;

    //find how many partials there may be for the given pattern
    var foundPatternPartials = pattern.findPartials();

    //find any listItem blocks that within the pattern, even if there are no partials
    list_item_hunter.process_list_item_partials(pattern, patternlab);

    // expand any partials present in this pattern; that is, drill down into
    // the template and replace their calls in this template with rendered
    // results

    if (pattern.engine.expandPartials && (foundPatternPartials !== null && foundPatternPartials.length > 0)) {
      // eslint-disable-next-line
      expandPartials(foundPatternPartials, list_item_hunter, patternlab, pattern);

      // update the extendedTemplate in the partials object in case this
      // pattern is consumed later
      patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate;
    }

    //find pattern lineage
    if (!ignoreLineage) {
      lineage_hunter.find_lineage(pattern, patternlab);
    }

    //add to patternlab object so we can look these up later.
    addPattern(pattern, patternlab);
  }

  function processPatternIterative(sourcePath, relPath, patternlab) {

    var relativeDepth = relPath.match(/\w(?=\\)|\w(?=\/)/g || []).length;
    if (relativeDepth > 2) {
      console.log('');
      plutils.logOrange('Warning:');
      plutils.logOrange('A pattern file: ' + relPath + ' was found greater than 2 levels deep from ' + sourcePath + '.');
      plutils.logOrange('It\'s strongly suggested to not deviate from the following structure under _patterns/');
      plutils.logOrange('[patternType]/[patternSubtype]/[patternName].[patternExtension]');
      console.log('');
      plutils.logOrange('While Pattern Lab may still function, assets may 404 and frontend links may break. Consider yourself warned. ');
      plutils.logOrange('Read More: http://patternlab.io/docs/pattern-organization.html');
      console.log('');
    }

    //check if the found file is a top-level markdown file
    var fileObject = path.parse(relPath);
    if (fileObject.ext === '.md') {
      try {
        var proposedDirectory = path.resolve(sourcePath, fileObject.dir, fileObject.name);
        var proposedDirectoryStats = fs.statSync(proposedDirectory);
        if (proposedDirectoryStats.isDirectory()) {
          var subTypeMarkdownFileContents = fs.readFileSync(proposedDirectory + '.md', 'utf8');
          var subTypeMarkdown = markdown_parser.parse(subTypeMarkdownFileContents);
          var subTypePattern = new Pattern(sourcePath, relPath, null, patternlab);
          subTypePattern.patternSectionSubtype = true;
          subTypePattern.patternLink = subTypePattern.name + '/index.html';
          subTypePattern.patternDesc = subTypeMarkdown.markdown;
          subTypePattern.flatPatternPath = subTypePattern.flatPatternPath + '-' + subTypePattern.fileName;
          subTypePattern.isPattern = false;
          subTypePattern.engine = null;

          addSubtypePattern(subTypePattern, patternlab);
          return subTypePattern;
        }
      } catch (err) {
        // no file exists, meaning it's a pattern markdown file
        if (err.code !== 'ENOENT') {
          console.log(err);
        }
      }

    }

    var pseudopattern_hunter = new pph();

    //extract some information
    var filename = fileObject.base;
    var ext = fileObject.ext;
    var patternsPath = sourcePath;

    // skip non-pattern files
    if (!patternEngines.isPatternFile(filename, patternlab)) { return null; }

    //make a new Pattern Object
    var currentPattern = new Pattern(sourcePath, relPath, null, patternlab);

    //if file is named in the syntax for variants
    if (patternEngines.isPseudoPatternJSON(filename)) {
      return currentPattern;
    }

    //can ignore all non-supported files at this point
    if (patternEngines.isFileExtensionSupported(ext) === false) {
      return currentPattern;
    }

    //see if this file has a state
    setState(currentPattern, patternlab, true);

    //look for a json file for this template
    try {
      var jsonFilename = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName + ".json");
      try {
        var jsonFilenameStats = fs.statSync(jsonFilename);
      } catch (err) {
        //not a file
      }
      if (jsonFilenameStats && jsonFilenameStats.isFile()) {
        currentPattern.jsonFileData = fs.readJSONSync(jsonFilename);
        if (patternlab.config.debug) {
          console.log('processPatternIterative: found pattern-specific data.json for ' + currentPattern.patternPartial);
        }
      }
    }
    catch (err) {
      console.log('There was an error parsing sibling JSON for ' + currentPattern.relPath);
      console.log(err);
    }

    //look for a listitems.json file for this template
    try {
      var listJsonFileName = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName + ".listitems.json");
      try {
        var listJsonFileStats = fs.statSync(listJsonFileName);
      } catch (err) {
        //not a file
      }
      if (listJsonFileStats && listJsonFileStats.isFile()) {
        currentPattern.listitems = fs.readJSONSync(listJsonFileName);
        buildListItems(currentPattern);
        if (patternlab.config.debug) {
          console.log('found pattern-specific listitems.json for ' + currentPattern.patternPartial);
        }
      }
    }
    catch (err) {
      console.log('There was an error parsing sibling listitem JSON for ' + currentPattern.relPath);
      console.log(err);
    }

    //look for a markdown file for this template
    parsePatternMarkdown(currentPattern, patternlab);

    //add the raw template to memory
    currentPattern.template = fs.readFileSync(path.resolve(patternsPath, relPath), 'utf8');

    //find any stylemodifiers that may be in the current pattern
    currentPattern.stylePartials = currentPattern.findPartialsWithStyleModifiers();

    //find any pattern parameters that may be in the current pattern
    currentPattern.parameteredPartials = currentPattern.findPartialsWithPatternParameters();

    //add currentPattern to patternlab.patterns array
    addPattern(currentPattern, patternlab);

    //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
    pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);

    return currentPattern;
  }

  function processPatternRecursive(sourcePath, file, patternlab) {

    //find current pattern in patternlab object using var file as a partial
    var currentPattern, i;

    for (i = 0; i < patternlab.patterns.length; i++) {
      if (patternlab.patterns[i].relPath === file) {
        currentPattern = patternlab.patterns[i];
      }
    }

    //return if processing an ignored file
    if (typeof currentPattern === 'undefined') { return; }

    //we are processing a markdown only pattern
    if (currentPattern.engine === null) { return; }

    //call our helper method to actually unravel the pattern with any partials
    decomposePattern(currentPattern, patternlab);
  }

  function expandPartials(foundPatternPartials, list_item_hunter, patternlab, currentPattern) {

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
      console.log('currentPattern', currentPattern.sourcePath)
      processPatternRecursive(currentPattern.sourcePath, partialPath, patternlab);

      //complete assembly of extended template
      //create a copy of the partial so as to not pollute it after the getPartial call.
      var partialPattern = getPartial(partial, patternlab);
      var cleanPartialPattern = JSON5.parse(JSON5.stringify(partialPattern));

      //if partial has style modifier data, replace the styleModifier value
      if (currentPattern.stylePartials && currentPattern.stylePartials.length > 0) {
        style_modifier_hunter.consume_style_modifier(cleanPartialPattern, foundPatternPartials[i], patternlab);
      }

      currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPatternPartials[i], cleanPartialPattern.extendedTemplate);
    }
  }

  function parseDataLinksHelper(patternlab, obj, key) {
    var linkRE, dataObjAsString, linkMatches;

    //check for 'link.patternPartial'
    linkRE = /(?:'|")(link\.[A-z0-9-_]+)(?:'|")/g;

    //stringify the passed in object
    dataObjAsString = JSON5.stringify(obj);
    if (!dataObjAsString) { return obj; }

    //find matches
    linkMatches = dataObjAsString.match(linkRE);

    if (linkMatches) {
      for (var i = 0; i < linkMatches.length; i++) {
        var dataLink = linkMatches[i];
        if (dataLink && dataLink.split('.').length >= 2) {

          //get the partial the link refers to
          var linkPatternPartial = dataLink.split('.')[1].replace('"', '').replace("'", "");
          var pattern = getPartial(linkPatternPartial, patternlab);
          if (pattern !== undefined) {

            //get the full built link and replace it
            var fullLink = patternlab.data.link[linkPatternPartial];
            if (fullLink) {
              fullLink = path.normalize(fullLink).replace(/\\/g, '/');
              if (patternlab.config.debug) {
                console.log('expanded data link from ' + dataLink + ' to ' + fullLink + ' inside ' + key);
              }

              //also make sure our global replace didn't mess up a protocol
              fullLink = fullLink.replace(/:\//g, '://');
              dataObjAsString = dataObjAsString.replace('link.' + linkPatternPartial, fullLink);
            }
          } else {
            if (patternlab.config.debug) {
              console.log('pattern not found for', dataLink, 'inside', key);
            }
          }
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
      patternlab.patterns[i].jsonFileData = parseDataLinksHelper(patternlab, patternlab.patterns[i].jsonFileData, patternlab.patterns[i].patternPartial);
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
    setPatternState: function (pattern, patternlab, displayDeprecatedWarning) {
      setState(pattern, patternlab, displayDeprecatedWarning);
    },
    addPattern: function (pattern, patternlab) {
      addPattern(pattern, patternlab);
    },
    addSubtypePattern: function (subtypePattern, patternlab) {
      addSubtypePattern(subtypePattern, patternlab);
    },
    decomposePattern: function (pattern, patternlab, ignoreLineage) {
      decomposePattern(pattern, patternlab, ignoreLineage);
    },
    renderPattern: function (template, data, partials) {
      return renderPattern(template, data, partials);
    },
    process_pattern_iterative: function (sourcePath, file, patternlab) {
      return processPatternIterative(sourcePath, file, patternlab);
    },
    process_pattern_recursive: function (sourcePath, file, patternlab, additionalData) {
      processPatternRecursive(sourcePath, file, patternlab, additionalData);
    },
    getPartial: function (partial, patternlab) {
      return getPartial(partial, patternlab);
    },
    combine_listItems: function (patternlab) {
      buildListItems(patternlab);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    },
    parse_data_links_specific: function (patternlab, data, label) {
      return parseDataLinksHelper(patternlab, data, label);
    },
    parse_pattern_markdown: function (pattern, patternlab) {
      parsePatternMarkdown(pattern, patternlab);
    }
  };

};

module.exports = pattern_assembler;
