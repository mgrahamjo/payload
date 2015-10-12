/**
* Payload.js V1.0
* Mike Johnson
* https://github.com/mgrahamjo/payload
*/

(function() {

	'use strict';

	let loadedDependencyList = [],
		loadedDependencies = {},
		modules = [];

	// Shim for string trim
	function trim(str) {
		return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	}

	/**
	* Filter a module's dependency list to those which haven't yet loaded.
	* @param {array} dependencies - All dependencies required by the module
	* @returns {array} missing - The dependencies that have not yet been loaded
	*/
	function getMissing(dependencies) {
		return dependencies.filter(name => {
			return loadedDependencyList.indexOf(name) === -1 && typeof window[name] === 'undefined';
		});
	}

	/**
	* Filter a module's dependency list to those which are already loaded.
	* @param {array} dependencies - All dependencies required by the module
	* @returns {array} loaded - The dependencies that are loaded and ready to use
	*/
	function getLoaded(dependencies) {
		return dependencies.filter(name => {
			return loadedDependencyList.indexOf(name) !== -1 || typeof window[name] !== 'undefined';
		});
	}

	/**
	* Convert an array of dependency names to an array of the actual dependencies.
	* @param {array} dependencies - List of dependency names
	* @returns {array} dependencies - List of the corresponding dependencies
	*/
	function getInjectable(dependencies) {
		return dependencies.map(name => {
			return loadedDependencies[name] || window[name];
		});
	}

	/**
	* Update a module's list of loaded and missing dependencies,
	* and initialize it if no dependencies are missing.
	* @param {object} module - The module to check
	*/
	function update(module) {

		let dependencies = module.loaded.concat(module.missing);

		module.loaded = getLoaded(dependencies);

		module.missing = getMissing(dependencies);

		if (module.missing.length === 0) {
			modules.splice(modules.indexOf(module), 1);
			module.fn.apply(module.fn, getInjectable(dependencies));
		}
	}

	/**
	* Update all uninitialized modules
	*/
	function updateAll() {
		modules.forEach(module => {
			update(module);
		});
	}

	/**
	* Figure out what dependency names to use for a module.
	* Allows payload(function(dep1, dep2) {}) syntax 
	* instead of payload(['dep1', 'dep2'], function(dep1, dep2) {})
	* @param {function} fn - the module function
	* @returns {array} dependencies - list of dependency names
	*/
	function parseDependencies(fn) {

		let dependencies,
			match = fn.toString().match(/.*?\((.*?)\)|(.*?)=>/);

		match = match[1] || match[2];

		dependencies = match ? match.split(',').map(dependency => {
			return trim(dependency);
		}) : [];

		return dependencies;
	}

	/**
	* Associate a list of dependencies with a module.
	* If the dependencies are already loaded, initialize the module with them.
	* @param {array|function} dependencies - Either a list of the dependencies needed, or the module itself
	* @param {function} callback - The function to call when the dependencies are loaded
	*/
	function payload(dependencies, callback) {

		// If the first argument is the callback, parse out the dependencies
		if (typeof dependencies === 'function') {
			callback = dependencies;
			dependencies = parseDependencies(dependencies);
		} else if (Object.prototype.toString.call(dependencies) !== '[object Array]' ) {
		    console.error('First argument must be an array or function.');
		    return;
		}

		let module = {
			fn: callback,
			loaded: getLoaded(dependencies),
			missing: getMissing(dependencies)
		};

		if (module.missing.length === 0) {
			callback.apply(callback, getInjectable(module.loaded));
		} else {
			modules.push(module);
		}
	}

	/**
	* Inform everybody that the given module is now loaded.
	* @param {string} name - the name of the dependency
	* @param {anything} item - the dependency
	*/
	function define(name, item) {

		if (loadedDependencyList.indexOf(name) !== -1) {
			console.error('A dependency with the name "' + name + '" has already been loaded.');
		} else {

			loadedDependencyList.push(name);

			loadedDependencies[name] = item;

			updateAll();
		}
	}

	/**
	* The public API
	*/
	window.payload = payload;

	window.payload.define = define;

})();