# Payload

A simpler, smaller module loader for the browser. 

Don't worry about the order in which your JavaScript files are included. Just declare which dependencies each module needs, and Payload will initialize that module as soon as all of its dependencies are loaded.

### Yet another module loader??

Yeah, I know. CommonJS, Require, SystemJS, and a million others have all solved this problem. Look, I'm not saying you need to use Payload. I'm just saying that sometimes the popular solutions feel like using a sledgehammer to stick a thumb tack in the wall. Payload is less than 2kb (and a third of that is shims for IE<9) and it just has two simple methods. 

### Installation

```
bower install payload
```

or:

```
npm install payload --save
```

Then include it in your HTML before your modules:
```
<script src="/bower_components/payload/dist/payload.min.js"></script>
<script src="/my-module.js"></script>
```

### Declare a module's dependencies


```
payload(['foo', 'bar'], (foo, bar) => {
	doSomethingWith(foo).then(() => {
		console.log(bar());
	});
});
```

Sweet! Now this module won't run until `foo` and `bar` are loaded. Plus, I borrowed a trick from Angular so you can accomplish the same thing without even passing the array of dependencies:

```
payload((foo, bar) => {
	doSomethingWith(foo).then(() => {
		console.log(bar());
	});
});
```

But watch out! Like other non-annotated AMD implementations, this shorthand syntax isn't minification-safe unless you account for it in a build step (see [grunt-payload](https://github.com/mgrahamjo/grunt-payload));

### Export modules

In the example above, nothing will happen until `foo` and `bar` are defined using `payload.define()`:

```
payload.define('foo', {
	property: 'value'
});

payload.define('bar', () => {
	return 'hello!'
});
```

A module can have dependencies and be a dependency too:

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

Obviously we want to avoid using globals, because that's the opposite of modularity, and it causes the load-order issues that we're trying to put behind us. But people will want to use jQuery and lodash and all, and I don't want to have to publish Payload-specific versions of every plugin that exports a global. 

So, if a dependency name already exists on the `window` object, Payload will use that without waiting for a module by that name to be defined:

```
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script src="/node_modules/payload/dist/payload.min.js"></script>
<script>
	payload(function($) {
		if ($('script').length === 3) {
			console.log('This module runs using window.$ even though we never called payload.define("$")');
		}
	});
</script>
```

### Browser support

Payload works in Chrome, Safari, Firefox, and IE 7+. Probably Opera too but I haven't checked.
