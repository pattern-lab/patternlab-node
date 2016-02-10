/*
 * patternlab-node - v1.1.1 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

// IMPORTANT: Remember that `./` matches the root of the grunt file that requires this one!
// However, this does not apply to the `require('...')`
module.exports = function(grunt, config) {
    var patternlab = require('./patternlab.js')(config);

    grunt.registerTask('patternlab', 'create design systems with atomic design', function(arg) {
        if(arguments.length === 0){
            patternlab.build(true);
        }

        if(arg && arg === 'v'){
            patternlab.version();
        }

        if(arg && arg === "only_patterns"){
            patternlab.build_patterns_only(true);
        }

        if(arg && arg === "help"){
            patternlab.help();
        }

        if(arg && (arg !== "v" && arg !=="only_patterns" && arg !=="help")){
            patternlab.help();
        }
    });
};