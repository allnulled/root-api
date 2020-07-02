module.exports = async function(hello, world) {
	return await new Promise(function(ok, fail) {
		setTimeout(() => ok(hello + " " + world + " x " + 1000), 100);
	});
}