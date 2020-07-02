module.exports = new Promise(function(ok, fail) {
	return setTimeout(() => ok(500), 200);
});