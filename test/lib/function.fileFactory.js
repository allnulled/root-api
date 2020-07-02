module.exports = function() {
	return function(a = 0, b = 0) {
		return a + b + (this.one ? this.one : 0);
	}
};