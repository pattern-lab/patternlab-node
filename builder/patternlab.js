/* 
 * patternlab-node - v0.1.3 - 2014 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

/* 
 * patternlab-node - v0.1.3 - 2014 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

/* 
 * patternlab-node - v0.1.3 - 2014 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

/* 
 * patternlab-node - v0.1.3 - 2014 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

/* 
 * patternlab-node - v0.1.3 - 2014 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

/*jslint indent:4*/

var patternlab_engine = function () {
    var path            = require('path'),
        fs              = require('fs-extra'),
        diveSync        = require('diveSync'),
        of              = require('./object_factory'),
        //pa = require('./pattern_assembler'),
        markdown        = require('markdown').markdown,
        patternlab      = {},
        renderEngines   = {},
        templates       = {};

    patternlab.package  = fs.readJSONSync('./package.json');
    patternlab.config   = fs.readJSONSync('./config.json');

    // add rendering engines
    if (!patternlab.config['rendering-engines']) {
        throw new Error('Missing "rendering-engines" in config');
    }
    Object.keys(patternlab.config['rendering-engines']).every(function (engine) {
        renderEngines[engine] = require(patternlab.config['rendering-engines'][engine]);
    });

    function getVersion() {
        console.log(patternlab.package.version);
    }

    function help() {
        console.log('Patternlab Node Help');
        console.log('===============================');
        console.log('Command Line Arguments');
        console.log('patternlab:only_patterns');
        console.log(' > Compiles the patterns only, outputting to ./public/patterns');
        console.log('patternlab:v');
        console.log(' > Retrieve the version of patternlab-node you have installed');
        console.log('patternlab:help');
        console.log(' > Get more information about patternlab-node, pattern lab in general, and where to report issues.');
        console.log('===============================');
        console.log('Visit http://patternlab.io/docs/index.html for general help on pattern-lab');
        console.log('Visit https://github.com/pattern-lab/patternlab-node/issues to open a bug.');
    }

    function printDebug() {
        //debug file can be written by setting flag on config.json
        if (patternlab.config.debug) {
            console.log('writing patternlab debug file to ./patternlab.json');
            fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, null, 3));
        }
    }

    function _getExtension(filename) {
        var ext = filename.split('.');
        return ext[ext.length - 1];
    }

    function _renderTemplate(name, data, partials) {
        var template = templates[name] || false;

        if (!template) {
            console.log('Template ' + name + ' not found');
            return '';
        }

        if (!renderEngines[template.type]) {
            throw new Error('Missing rendering engine for "' + templates.type + '"-templates');
        }
        if (partials) {
            return renderEngines[template.type].render(template.template, data, partials);
        }
        return renderEngines[template.type].render(template.template, data);
    }

    function _readTemplate(src, type) {
        var name = src;
        if (arguments.length === 1) {
            if (typeof src === 'object') {
                name    = src.name || src.src;
                type    = src.type || _getExtension(src.src);
                src     = src.src;
            } else {
                type    = _getExtension(src);
            }
        }
        var template = fs.readFileSync(src, 'utf8');

        templates[name] = {
            template: template,
            type    : type
        };
        return {
            render: function (data, partials) {
                return _renderTemplate(name, data, partials);
            }
        };
    }

    function buildPatterns() { // removed callback variable - not used
        patternlab.data = fs.readJSONSync('./source/_data/data.json');
        patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');

        // Read header and footers
        patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
        patternlab.footer = _readTemplate({
            src     : './source/_patternlab-files/pattern-header-footer/footer.html',
            name    : 'footer',
            type    : 'mustache'
        });
        patternlab.readme = _readTemplate({
            src     : './source/_patternlab-files/pattern-header-footer/readme.html',
            name    : 'readme',
            type    : 'mustache'
        });

        patternlab.patterns = [];
        patternlab.patternIndex = [];
        patternlab.partials = {};

        diveSync(patternlab.config.patterns.source, function (err, file) {
            //log any errors
            if (err) {
                console.log(err);
                return;
            }

            //extract some information
            var abspath = file.substring(2),
                subdir = path.dirname(path.relative('./source/_patterns', file)),
                filename = path.basename(file);

            //check if the pattern already exists.  
            var patternName = filename.substring(0, filename.indexOf('.')),
                //patternIndex = patternlab.patternIndex.indexOf(subdir + '-' +  patternName),
                currentPattern,
                flatPatternPath;

            //Get file extension
            var fileType = path.extname(file);

            //ignore _underscored patterns, json, and dotfiles
            if (filename.charAt(0) === '_' || fileType === '.json' || fileType === '.md' || filename.charAt(0) === '.') {
                return;
            }

            //make a new Pattern Object
            var flatPatternName = subdir.replace(/[\\\/]/g, '-') + '-' + patternName;
            flatPatternName = flatPatternName.replace(/\\/g, '-');
            currentPattern = new of.oPattern(flatPatternName, subdir, filename, {});
            currentPattern.patternName = patternName.substring(patternName.indexOf('-') + 1);
            currentPattern.data = null;

            //see if this file has a state
            if (patternlab.config.patternStates[currentPattern.patternName]) {
                currentPattern.patternState = patternlab.config.patternStates[currentPattern.patternName];
            }

            //look for a json file for this template
            try {
                var jsonFilename = abspath.substr(0, abspath.lastIndexOf(".")) + ".json";
                currentPattern.data = fs.readJSONSync(jsonFilename);
            } catch (ignore) {}

            currentPattern.template = fs.readFileSync(abspath, 'utf8');

            //render the pattern. pass partials object just in case.
            if (currentPattern.data) { // Pass JSON as data
                currentPattern.patternPartial = _readTemplate(abspath).render(currentPattern.data, patternlab.partials);
            } else { // Pass global patternlab data
                currentPattern.patternPartial = _readTemplate(abspath).render(patternlab.data, patternlab.partials);
            }

            // Add readme docs
            var readme = '';
            try {
                var doc = abspath.substr(0, abspath.lastIndexOf('.')) + '.md';
                readme = patternlab.readme.render({
                    readme: markdown.toHTML(fs.readFileSync(doc, {encoding: 'utf8'}))
                });
                console.log(readme);
            } catch (ignore) {}

            //write the compiled template to the public patterns directory
            flatPatternPath = currentPattern.name + '/' + currentPattern.name + '.html';

            //add footer info before writing
            var currentPatternFooter = patternlab.footer.render(currentPattern);

            fs.outputFileSync('./public/patterns/' + flatPatternPath, patternlab.header + currentPattern.patternPartial + readme + currentPatternFooter);
            currentPattern.patternLink = flatPatternPath;

            //add as a partial in case this is referenced later.  convert to syntax needed by existing patterns
            var sub = subdir.substring(subdir.indexOf('-') + 1);
            var folderIndex = sub.indexOf('/'); //THIS IS MOST LIKELY WINDOWS ONLY.  path.sep not working yet
            var cleanSub = sub.substring(0, folderIndex);

            //add any templates found to an object of partials, so downstream templates may use them too
            //exclude the template patterns - we don't need them as partials because pages will just swap data
            if (cleanSub !== '') {
                var partialname = cleanSub + '-' + patternName.substring(patternName.indexOf('-') + 1);

                patternlab.partials[partialname] = currentPattern.template;

                //done
            }

            //add to patternlab arrays so we can look these up later.  this could probably just be an object.
            //patternlab.patternIndex.push(currentPattern.name);
            patternlab.patterns.push(currentPattern);
        });

    }

    function addToPatternPaths(bucketName, pattern) {
        //this is messy, could use a refactor.
        patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.filename.substring(0, pattern.filename.indexOf('.'));
    }

    function buildFrontEnd() {
        patternlab.buckets = [];
        patternlab.bucketIndex = [];
        patternlab.patternPaths = {};
        patternlab.viewAllPaths = {};

        var styleguideHtml,
            i,
            l,
            pattern,
            bucket,
            bucketName,
            bucketIndex,
            navItem,
            navSubItem,
            navSubItemName,
            navItemName,
            navItemIndex,
            flatPatternItem;

        //build the styleguide
        styleguideHtml = _readTemplate('./source/_patternlab-files/styleguide.mustache', 'mustache').render({partials: patternlab.patterns});
        fs.outputFileSync('./public/styleguide/html/styleguide.html', styleguideHtml);

        //loop through all patterns.  deciding to do this separate from the recursion, even at a performance hit, to attempt to separate the tasks of styleguide creation versus site menu creation
        for (i = 0, l = patternlab.patterns.length; i < l; i++) {
            pattern = patternlab.patterns[i];
            bucketName = pattern.name.replace(/\\/g, '-').split('-')[1];

            //check if the bucket already exists
            bucketIndex = patternlab.bucketIndex.indexOf(bucketName);
            if (bucketIndex === -1) {
                //add the bucket
                bucket = new of.oBucket(bucketName);

                //add paternPath
                patternlab.patternPaths[bucketName] = {};

                //get the navItem
                navItemName = pattern.subdir.split('-').pop();

                //get the navSubItem
                navSubItemName = pattern.patternName.replace(/-/g, ' ');

                //test whether the pattern struture is flat or not - usually due to a template or page
                flatPatternItem = false;
                if (navItemName === bucketName) {
                    flatPatternItem = true;
                }

                //assume the navItem does not exist.
                navItem = new of.oNavItem(navItemName);

                //assume the navSubItem does not exist.
                navSubItem = new of.oNavSubItem(navSubItemName);
                navSubItem.patternPath = pattern.patternLink;
                navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

                //add the patternState if it exists
                if (pattern.patternState) {
                    navSubItem.patternState = pattern.patternState;
                }

                //if it is flat - we should not add the pattern to patternPaths
                if (flatPatternItem) {
                    bucket.patternItems.push(navSubItem);

                    //add to patternPaths
                    addToPatternPaths(bucketName, pattern);
                } else {
                    bucket.navItems.push(navItem);
                    bucket.navItemsIndex.push(navItemName);
                    navItem.navSubItems.push(navSubItem);
                    navItem.navSubItemsIndex.push(navSubItemName);

                    //add to patternPaths
                    addToPatternPaths(bucketName, pattern);
                }

                //add the bucket.
                patternlab.buckets.push(bucket);
                patternlab.bucketIndex.push(bucketName);

                //done

            } else {
                //find the bucket
                bucket = patternlab.buckets[bucketIndex];

                //get the navItem
                navItemName = pattern.subdir.split('-').pop();

                //get the navSubItem
                navSubItemName = pattern.patternName.replace(/-/g, ' ');

                //assume the navSubItem does not exist.
                navSubItem = new of.oNavSubItem(navSubItemName);
                navSubItem.patternPath = pattern.patternLink;
                navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

                //add the patternState if it exists
                if (pattern.patternState) {
                    navSubItem.patternState = pattern.patternState;
                }

                //test whether the pattern struture is flat or not - usually due to a template or page
                flatPatternItem = false;
                if (navItemName === bucketName) {
                    flatPatternItem = true;
                }

                //if it is flat - we should not add the pattern to patternPaths
                if (flatPatternItem) {

                    //add the navItem to patternItems
                    bucket.patternItems.push(navSubItem);

                    //add to patternPaths
                    addToPatternPaths(bucketName, pattern);

                } else {
                    //check to see if navItem exists
                    navItemIndex = bucket.navItemsIndex.indexOf(navItemName);
                    if (navItemIndex === -1) {

                        navItem = new of.oNavItem(navItemName);

                        //add the navItem and navSubItem
                        navItem.navSubItems.push(navSubItem);
                        navItem.navSubItemsIndex.push(navSubItemName);
                        bucket.navItems.push(navItem);
                        bucket.navItemsIndex.push(navItemName);

                    } else {
                        //add the navSubItem
                        navItem = bucket.navItems[navItemIndex];
                        navItem.navSubItems.push(navSubItem);
                        navItem.navSubItemsIndex.push(navSubItemName);
                    }

                    // just add to patternPaths
                    addToPatternPaths(bucketName, pattern);
                }

            }

        }

        //the patternlab site requires a lot of partials to be rendered.
        //patternNav
        var patternNavPartialHtml = _readTemplate('./source/_patternlab-files/partials/patternNav.mustache').render(patternlab);

        //ishControls
        var ishControlsPartialHtml = _readTemplate('./source/_patternlab-files/partials/ishControls.mustache').render(patternlab.config);

        //patternPaths
        var patternPathsPartialHtml = _readTemplate('./source/_patternlab-files/partials/patternPaths.mustache').render({'patternPaths': JSON.stringify(patternlab.patternPaths)});

        //viewAllPaths
        var viewAllPathersPartialHtml = _readTemplate('./source/_patternlab-files/partials/viewAllPaths.mustache').render({'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

        //websockets
        patternlab.contentsyncport = patternlab.config.contentSyncPort;
        patternlab.navsyncport = patternlab.config.navSyncPort;

        var websocketsPartialHtml = _readTemplate('./source/_patternlab-files/partials/websockets.mustache').render(patternlab);

        //render the patternlab template, with all partials
        var patternlabSiteHtml = _readTemplate('./source/_patternlab-files/index.mustache').render({}, {
            'ishControls': ishControlsPartialHtml,
            'patternNav': patternNavPartialHtml,
            'patternPaths': patternPathsPartialHtml,
            'websockets': websocketsPartialHtml,
            'viewAllPaths': viewAllPathersPartialHtml
        });
        fs.outputFileSync('./public/index.html', patternlabSiteHtml);
    }

    return {
        version: function () {
            return getVersion();
        },
        build: function () {
            buildPatterns();
            buildFrontEnd();
            printDebug();
        },
        help: function () {
            help();
        },
        build_patterns_only: function () {
            buildPatterns();
            printDebug();
        }
    };

};

module.exports = patternlab_engine;

