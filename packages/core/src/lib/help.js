'use strict';

/**
 * @function help
 * @desc A small helper function returning the man page string
 * @param {string} version - The version to include in the string literal
 * @return {string} - The man string
 */
const help = version => `
  Pattern Lab Node v${version}

  Usage: patternlab.<FUNCTION>()

  Functions:

    build                    Builds patterns, copies assets, and constructs ui into config.paths.public
    patternsonly             Builds patterns only, leaving existing public files intact
    liststarterkits          Fetches starterkit repos from pattern-lab github org
    loadstarterkit           Loads starterkit already available via node_modules/ into config.paths.source/*
                             NOTE: In most cases, npm install starterkit-name will precede this call.
      Parameters:
        kit                  The name of the starter kit to load (string)
        clean                Whether or not to remove all files from config.paths.source/ prior to load (bool)
                             NOTE: Overwrites existing content. Prunes existing directory if --clean=true argument is passed.
    version                  Logs current version to stdout
    v                        Return current version as a string

  ===============================
  - More info about Pattern Lab: http://patternlab.io/
  - Open an issue: https://github.com/pattern-lab/patternlab-node/issues
  - View the changelog, roadmap, and other info: https://github.com/pattern-lab/patternlab-node/wiki
  ===============================`;
module.exports = help;
