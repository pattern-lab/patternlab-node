'use strict';
module.exports = ({
	version,
	dependencies: {
		'patternlab-node': coreVersion
	}
}) => `${version} (PatternLab Node Core version: ${coreVersion})`;
