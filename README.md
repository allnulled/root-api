# root-api

Organize your API with flexible customization in a breeze. No dependencies.

## Installation

`$ npm i -s root-api`

## Usage

There are 2 steps:

1. Define the tree. When you **define the tree**, you specify the **structure**, so you, mainly, nest `objects`.
2. Define the leaves. When you **define the leaves**, you specify the **contents**, so you use direct `values`, references to `files` and `factories` (through `functions` or `files`). Here is where the `root-api` helps.

## Test

This is a test that demonstrates almost all the parameters in action separatedly:

```js
// STEP ONE: DEFINE THE TREE:
const $api = rootAPI.create({
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
// STEP TWO: DEFINE THE LEAVES:
$api.set({ property: "data.code", value: 200 })
$api.set({ property: "data.code800", file: "data.example.js" });
$api.set({ property: "data.message", factory: "data.message.factory.js" });
$api.set({ property: "getMessage", file: "function.getMessage.js" });
$api.set({ property: "setMessage", factory: "function.setMessage.factory.js" });
await $api.set({ property: "data.externalSource", factory: "data.externalSource.factory.js", with: ["data.strings.hello", "data.strings.world"], promised: true });
$api.set({ property: "aboutData", factory: "function.aboutData.factory.js", scope: "data" });
$api.set({ property: "aboutDataBound", factory: "function.aboutData.factory.js", scope: "data", with: ["data.prop"] });
$api.set({ property: "sum", factory: function() { return 800 + this.code800 }, scope: "data", with: ["data.prop"] });
// STEP THREE: TEST THE RESULTS:
const api = $api.root;
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
```

To see the complete example, you will have to go to the `test` folder.

## Property options

This logical expression represents the combinations of parameters that makes sense to the internal algorythm:

`property & ( factory | file | value ) & ( with )? & ( scope )?`

- `property` indicates, as a `string` and using the `separator` option which defaults to `.`, the property which is going to be modified.
- `( factory | file | value )`  indicates the source, and implicitly its type, by which the property is going to be set.
  - `factory` can receive `function` or `string`. On `strings`, it is understood as the path of a file which is a `function` module.
  - `file` can receive `string` as the path of a file which is a `function` module.
  - `value` can receive `any` as the direct value.
- `with` is optional. Used with functions, it indicates the parameters attached to the main function. In the case of the `factory`, the `factory`'s main function is attached only.
- `scope` is optional. Used with functions, it indicates the scope bound to the main function. In the case of the the `factory`, the `factory`'s main function is attached only.

## License

This project is licensed under [`WTFPL` or `[do] W[hat] T[he] F[uck] [you] [want] [to] P[ublic] L[icense]`](https://es.wikipedia.org/wiki/WTFPL).

## Issues

You can leave an issue on the repository.

