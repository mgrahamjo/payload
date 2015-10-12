'use strict';

describe('payload', () => {

	let foo;

	payload(test => {
		foo = test;
	});

	it('should not run module until dependencies are loaded', () => {
		expect(foo).not.toBeDefined();
	});

	it('should run module when dependencies are loaded', () => {
		payload.define('test', 'bar');
		expect(foo).toEqual('bar');
	});

	it('should grab globals off the window object', () => {
		window.$ = true;
		payload($ => {
			foo = 'baz';
		});
		expect(foo).toEqual('baz');
	});

	it('should not init if unrelated dependency is loaded (and support function syntax)', () => {
		payload(function($, test, secret) {
			foo = 'quux';
		});
		payload.define('other', 'thing');
		expect(foo).toEqual('baz');
	});

	it('should handle dependency-free modules', () => {
		payload(() => {
			foo = 'grault';
		});
		expect(foo).toEqual('grault');
	});

	it('should support AMD syntax', () => {
		payload(['$', 'test'], ($, test) => {
			foo = 'foobar';
		});
		expect(foo).toEqual('foobar');
	});

	it('should error if you try to redefine a module', () => {
		spyOn(console, 'error');
		payload.define('test', 'bing');
		expect(console.error).toHaveBeenCalled();
	});

	it('should handle invalid callback', () => {
		spyOn(console, 'error');
		payload('test');
		expect(console.error).toHaveBeenCalled();
	});

});