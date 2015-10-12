# Payload

A simpler, smaller module loader for the browser. 

Don't worry about the order in which your JavaScript files are included. Just declare which dependencies each module needs, and payload will initialize that module as soon as all of its dependencies are loaded.

### Yet another module loader??

Yeah, I know. CommonJS, Require, SystemJS, and a million others have all solved this problem. And I'm stoked that ES6 brings native support for modules, but we can't just wait around until browsers catch up. Look, I'm not saying you need to use payload. I'm just saying that, to me, the popular solutions feel like using a sledgehammer to stick a thumb tack in the wall. Meanwhile, Payload is 1kb and has two simple methods.

### Declare a module's dependencies


```
payload(['foo', 'bar'], (foo, bar) => {
	doSomethingWith(foo).then(() => {
		console.log(bar());
	});
});
```

Sweet! Now this module won't run until `foo` and `bar` are loaded. I borrowed a trick from Angular so you can accomplish the same thing without even passing the array of dependencies:

```
payload((foo, bar) => {
	doSomethingWith(foo).then(() => {
		console.log(bar());
	});
});
```

But watch out! This syntax isn't minification-safe unless you account for it in a build step. I haven't yet published a plugin for that.

### Export modules

In the example above, nothing will happen until `foo` and `bar` are defined like this:

```
payload.define('foo', {
	property: 'value'
});

payload.define('bar', () => {
	return 'hello!'
});
```

Often, a module will have dependencies and export stuff too:

```
payload(['foo', 'bar'], (foo, bar) => {
	
	function doWork() {
		doSomethingWith(foo).then(() => {
			console.log(bar());
		});
	}

	payload.define('newModule', doWork);
});
```

### Working with globals

Payload will automatically check the `window` object for any required dependencies, so you don't need to write a wrapper to define jQuery, for example.