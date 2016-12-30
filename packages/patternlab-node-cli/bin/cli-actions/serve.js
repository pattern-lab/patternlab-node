'use strict';
const resolveConfig = require('../resolve-config');
const preview = require('../preview');
const wrapAsync = require('../utils').wrapAsync;

const serve = options => wrapAsync(function*() {
	const config = yield resolveConfig(options.parent.config);
	preview(config);
});

module.exports = serve;
