const { expect } = require("chai");
const rootAPI = require(__dirname + "/../index.js");

describe("RootAPI TEST", function() {
	this.timeout(1000 * 5);

	let $api, api;

	const getAPI = async function() {
		$api = rootAPI.create({
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
			}
		});
		$api.set({ property: "data.code", value: 200 })
		$api.set({ property: "data.code800", file: "data.example.js" });
		$api.set({ property: "data.message", factory: "data.message.factory.js" });
		$api.set({ property: "getMessage", file: "function.getMessage.js" });
		$api.set({ property: "setMessage", factory: "function.setMessage.factory.js" });
		await $api.set({ property: "data.externalSource", factory: "data.externalSource.factory.js", with: ["data.strings.hello", "data.strings.world"], promised: true });
		$api.set({ property: "aboutData", factory: "function.aboutData.factory.js", scope: "data" });
		$api.set({ property: "aboutDataBound", factory: "function.aboutData.factory.js", scope: "data", with: ["data.prop"] });
		$api.set({ property: "sum", factory: function() { return 800 + this.code800 }, scope: "data", with: ["data.prop"] });
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
		expect(() => require(__dirname + "/../index.js").create({ root: "r" })).to.throw();
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
			await $api.property("callback").value(function() { console.log(this) }).scope("data.notfound.two").ok();
			api.callback();
			throw new Error("Failed test 2");
		} catch (error) {
			expect(error.message).to.equal("Property <notfound> was not found in its parent (of type object)");
		}
		try {
			await $api.property("callback").value(function() { console.log(this) }).with("data.notfound.two").ok();
			api.callback();
			throw new Error("Failed test 2");
		} catch (error) {
			expect(error.message).to.equal("Property <notfound> was not found in its parent (of type object)");
		}
	});

	it("can demonstrate the readme example", async function() {
		
	})
});