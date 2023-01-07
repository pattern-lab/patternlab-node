module.exports = {
	random() {
		const segment = () => {
			// eslint-disable-next-line no-bitwise
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return `${segment()}-${segment()}-${segment()}`;
	},
	now: Date.now(),
};
