const path = require("path");

const RootAPI = {};

RootAPI.SELF = {};

RootAPI.methods = {};

RootAPI.methods.getProperty = function(selectorP, root, separator, selfitem) {
	if(typeof selectorP === "string") {
		const selector = selectorP.split(separator);
		let temp = root;
		for(let index=0; index < selector.length; index++) {
			const selection = selector[index];
			if(!(selection in temp)) {
				throw new Error("Property <" + selection + "> was not found in its parent (of type " + typeof temp + ")");
			}
			temp = temp[selection];
		}
		return temp;
	} else if(typeof selectorP !== "undefined") {
		return selectorP;
	} else if(selectorP === RootAPI.SELF) {
		return selfitem;
	} else {
		return root;
	}
}

RootAPI.classes = {};

RootAPI.classes.ScopedRoot = function(options) {
	if(typeof options !== "object") {
		throw new Error("Argument <options> must be an <object> to <RootAPI>");
	}
	if(typeof options.root !== "object") {
		throw new Error("Argument <options.root> must be an <object> to <RootAPI>");
	}
	Object.assign(this, { directory: process.cwd(), separator: "." }, options);
	this.statement = {};
};

RootAPI.classes.ScopedRoot.prototype = {
	reset: function() {
		this.statement = {};
	},
	set: function(opts = {}) {
		this.reset();
		if("property" in opts) {
			this.property(opts.property);
		}
		if("factory" in opts) {
			this.factory(opts.factory);
		}
		if("file" in opts) {
			this.file(opts.file);
		}
		if("value" in opts) {
			this.value(opts.value);
		}
		if("scope" in opts) {
			this.scope(opts.scope);
		}
		if("with" in opts) {
			this.with(...opts.with);
		}
		if("promised" in opts) {
			this.promised(opts.promised);
		}
		return this.ok();
	},
	property: function(prop) {
		this.statement.property = prop;
		return this;
	},
	factory: function(factory) {
		this.statement.factory = factory || true;
		return this;
	},
	file: function(file) {
		this.statement.file = file;
		return this;
	},
	value: function(value) {
		this.statement.value = value;
		return this;
	},
	scope: function(scope) {
		this.statement.scope = scope;
		return this;
	},
	with: function(...withP) {
		if(!Array.isArray(withP)) {
			throw new Error("Parameter <with> must be an array");
		}
		this.statement.with = withP;
		return this;
	},
	promised: function(isPromise = true) {
		this.statement.promise = isPromise;
		return this;
	},
	ok: function() {
		const statement = Object.assign({}, this.statement);
		this.reset();
		if(typeof statement.property === "undefined") {
			throw new Error("Property <statement.property> must be a <string> to <ok>");
		}
		let output = undefined;
		if("file" in statement) {
			try {
				const fileId = path.resolve(this.directory, statement.file);
				output = require(fileId);
			} catch(error) {
				throw error;
			}
		} else if("factory" in statement) {
			if(typeof statement.factory === "string") {
				try {
					const factoryId = path.resolve(this.directory, statement.factory);
					const factoryFunction = require(factoryId);
					const refScope = RootAPI.methods.getProperty(statement.scope, this.root, this.separator);
					const refArguments = "with" in statement ? [].concat(statement.with).map(item => RootAPI.methods.getProperty(item, this.root, this.separator)) : [];
					output = factoryFunction.call(refScope, ...refArguments)
				} catch(error) {
					throw error;
				}
			} else if(typeof statement.factory === "function") {
				const refScope = RootAPI.methods.getProperty(statement.scope, this.root, this.separator);
				const refArguments = "with" in statement ? [].concat(statement.with).map(item => RootAPI.methods.getProperty(item, this.root, this.separator)) : [];
				output = statement.factory.call(refScope, ...refArguments);
			} else {
				throw new Error("Property <statement.factory> must be a <string|function>");
			}
		} else if ("value" in statement) {
			if(typeof statement.value === "function") {
				const refScope = RootAPI.methods.getProperty(statement.scope, this.root, this.separator, statement.value);
				const refArguments = "with" in statement ? [].concat(statement.with).map(item => RootAPI.methods.getProperty(item, this.root, this.separator)) : [];
				output = statement.value.bind(refScope, ...refArguments);
			} else {
				output = statement.value;
			}
		} else {
			throw new Error("Property <statement.(factory|file|value)> must be something to <ok>");
		}
		if((!("factory" in statement)) && (statement.scope || statement.with) && typeof output === "function") {
			const refScope = RootAPI.methods.getProperty(statement.scope, this.root, this.separator, output);
			const refArguments = "with" in statement ? [].concat(statement.with).map(item => RootAPI.methods.getProperty(item, this.root, this.separator)) : [];
			output = output.bind(refScope, ...refArguments);
		}
		if(typeof statement.property !== "string") {
			throw new Error("Property <statement.property> must be a <string> to <ok>");
		}
		const setPropertyTo = function(statement, context, data) {
			const props = statement.property.split(context.separator);
			let temp = context.root;
			if(props.length === 0) {
				throw new Error("Property <statement.property> cannot be an empty string");
			}
			const lastIndex = props.length - 1;
			for(let index=0; index < props.length; index++) {
				const prop = props[index];
				if(index === lastIndex) {
					temp[prop] = data;
				} else {
					if(!(prop in temp)) {
						throw new Error("Property <" + prop + "> was not found in its parent (of type " + typeof temp + ")");
					}
					temp = temp[prop];
				}
			}
		};
		if(statement.promise && (output instanceof Promise)) {
			output.then(data => {
				setPropertyTo(statement, this, data);
				return data;
			});
		} else {
			setPropertyTo(statement, this, output);
		}
		return output;
	},
}
RootAPI.create = (...args) => new RootAPI.classes.ScopedRoot(...args);

module.exports = RootAPI;