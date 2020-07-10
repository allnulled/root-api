module.exports = function() {
	return typeof this === "object" && typeof this.classicMessage === "string";
}