function browserSyncMock() {
	return {
		init: function () {
			return true;
		},
		reload: function () {
			return true;
		},
		use: function () {
			return true;
		},
		watch: function () {
			return true;
		}
	}
}

module.exports = browserSyncMock;
