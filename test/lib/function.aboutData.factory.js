module.exports = function(...args) {
	return (function(prop) {
		if(prop in this) {
			return this[prop];
		}
		throw new Error("Property <" + prop + "> not found in data");
	}).bind(this, ...args)
}