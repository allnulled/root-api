const {
	expect
} = require("chai");
const RootAPI = require(__dirname + "/../index.js");

describe("RootAPI TEST", function() {
	this.timeout(1000 * 5);

	let $api, api;

	const getAPI = async function() {
		$api = RootAPI.create({
			directory: __dirname + "/lib",
			separator: ".",
			root: {
				classicMessage: "Hi all!",
				data: {
					strings: {
						hello: "hello",
						world: "world"
					},
					externalSource: undefined,
					code: undefined,
					code800: undefined,
					message: undefined,
					prop: "code800"
				},
				getMessage: undefined,
				setMessage: undefined,
				aboutData: undefined,
				stack: [],
				methods: {
					talk: undefined,
					run: undefined,
					jump: undefined,
					breath: undefined,
					swim: undefined,
					meditate: undefined,
				},
				tests: {},
				classes: {},
				doEverything: undefined,
				classExample: undefined,
			}
		});
		$api.set({
			property: "data.code",
			value: 200
		})
		$api.set({
			property: "data.code800",
			file: "data.example.js"
		});
		$api.set({
			property: "data.message",
			factory: "data.message.factory.js"
		});
		$api.set({
			property: "getMessage",
			file: "function.getMessage.js"
		});
		$api.set({
			property: "setMessage",
			factory: "function.setMessage.factory.js"
		});
		await $api.set({
			property: "data.externalSource",
			factory: "data.externalSource.factory.js",
			with: ["data.strings.hello", "data.strings.world"],
			promised: true
		});
		$api.set({
			property: "aboutData",
			factory: "function.aboutData.factory.js",
			scope: "data"
		});
		$api.set({
			property: "aboutDataBound",
			factory: "function.aboutData.factory.js",
			scope: "data",
			with: ["data.prop"]
		});
		$api.set({
			property: "sum",
			factory: function() {
				return 800 + this.code800
			},
			scope: "data",
			with: ["data.prop"]
		});
		$api.set({
			property: "methods.talk",
			value: function(arg) {
				this.stack.push("Talking: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "methods.run",
			value: function(arg) {
				this.stack.push("Running: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "methods.jump",
			value: function(arg) {
				this.stack.push("Jumping: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "methods.breath",
			value: function(arg) {
				this.stack.push("Breathing: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "methods.swim",
			value: function(arg) {
				this.stack.push("Swiming: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "methods.meditate",
			value: function(arg) {
				this.stack.push("Meditating: " + (arg ? arg : ""))
			}
		});
		$api.set({
			property: "doEverything",
			value: function() {
				this.methods.talk("something");
				this.methods.run("something");
				this.methods.jump("something");
				this.methods.breath("something");
				this.methods.swim("something");
				this.methods.meditate("something");
			}
		});
		$api.set({
			property: "classExample",
			with: [{
				msg: "My fixed message"
			}],
			value: function(data = undefined) {
				this.a = "a";
				this.b = "b";
				this.c = "c";
				this.message = data.msg;
			},
		});
		return $api.root;
	};

	it("can get asynchronously", async function() {
		api = await getAPI();
		expect(typeof api).to.equal("object");
		expect(typeof api.getMessage).to.equal("function");
		expect(typeof api.setMessage).to.equal("function");
		expect(typeof api.data).to.equal("object");
		expect(typeof api.data.externalSource).to.equal("string");
		expect(api.data.externalSource).to.equal("hello world x 1000");
		expect(api.classicMessage).to.equal("Hi all!");
		expect(api.data.message).to.equal("Hi all!!");
		expect(api.data.code800).to.equal(800);
		expect(api.data.code).to.equal(200);
		api.setMessage("okay!");
		expect(api.data.message).to.equal("okay!");
	});

	it("must receive an object to <create>", function() {
		expect(() => require(__dirname + "/../index.js").create()).to.throw();
		expect(() => require(__dirname + "/../index.js").create({})).to.throw();
	});

	it("must receive <options.root> as a string to <create>", function() {
		expect(() => require(__dirname + "/../index.js").create({
			root: "r"
		})).to.throw();
	});

	it("must set <property> as a string to <ok>", async function() {
		expect(() => $api.property().ok()).to.throw();
	});

	it("can use <scope>", async function() {
		expect(typeof api.aboutData).to.equal("function");
		expect(api.aboutData("code800")).to.equal(800)
		expect(api.aboutData("code")).to.equal(200)
		expect(typeof api.aboutData("message")).to.equal("string")
	});

	it("can use <with> in factories or functions", async function() {
		expect(typeof api.aboutDataBound).to.equal("function");
		expect(api.aboutDataBound()).to.equal(800);
		expect(api.aboutDataBound("code")).to.equal(800);
		expect(api.aboutDataBound("message")).to.equal(800);
		expect(api.sum).to.equal(1600);
	});

	it("throws when a property is not found (property(...), scope(...), with(...))", async function() {
		try {
			await $api.property("data.notfound.one").value(1000).ok();
			throw new Error("Failed test 1");
		} catch (error) {
			expect(error.message).to.equal("Property <notfound> was not found in its parent (of type object)");
		}
		try {
			await $api.property("callback").value(function() {
				console.log(this)
			}).scope("data.notfound.two").ok();
			api.callback();
			throw new Error("Failed test 2");
		} catch (error) {
			expect(error.message).to.equal("Property <notfound> was not found in its parent (of type object)");
		}
		try {
			await $api.property("callback").value(function() {
				console.log(this)
			}).with("data.notfound.two").ok();
			api.callback();
			throw new Error("Failed test 2");
		} catch (error) {
			expect(error.message).to.equal("Property <notfound> was not found in its parent (of type object)");
		}
	});

	it("can compose functions easily", async function() {
		expect(api.stack.length).to.equal(0);
		api.doEverything();
		expect(api.stack.length).to.equal(6);
	});

	it("can create classes effortlessly", async function() {
		const example1 = new api.classExample();
		expect(example1 instanceof api.classExample).to.equal(true);
		expect(example1.a).to.equal("a");
		expect(example1.message).to.equal("My fixed message");
	});

	it("can create functions from files setting by default the 'scope' to the root", function() {
		$api.set({ property: "tests.TestOK", file: "function.TestOK.js" })
		const itemOK = api.tests.TestOK();
		expect(itemOK).to.equal(true);
	});

	it("can force the scope to oneself", function() {
		$api.set({ property: "classes.ClassOK", file: "class.ClassOK.js" })
		const itemOK = new api.classes.ClassOK();
		expect(itemOK instanceof api.classes.ClassOK).to.equal(true);
		expect(itemOK.a).to.equal("a");
		expect(itemOK.b).to.equal("b");
	});

});