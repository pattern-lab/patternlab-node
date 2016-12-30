const crypto = require('crypto');

module.exports = () => {
	const UUID = crypto.randomBytes(16).toString('hex');
	return `./test/tmp/${UUID}`;
};
