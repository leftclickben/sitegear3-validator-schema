/*jslint node: true, nomen: true, white: true, unparam: true, plusplus: true, stupid: true*/
/*globals describe, beforeEach, afterEach, it, expect, spyOn*/
/*!
 * Sitegear3
 * Copyright(c) 2014 Ben New, Sitegear.org
 * MIT Licensed
 */

(function (_, jasmine, path, fs, schemaValidator) {
	"use strict";
	require('./setupTests');

	var inputRoot = path.join(__dirname, '_input'),
		errorMessageRegex = /Received \d+ errors? from JSON schema validator: \[\[ [a-z0-9"',.\/\-_\+<>\$\s]* \]\](?:; \[\[ [a-z0-9"',.\/\-_\+<>\$] \]\])*/i;

	describe('Validator: schemaValidator', function () {
		it('Exports a function', function () {
			expect(_.isFunction(schemaValidator)).toBeTruthy();
		});
		it('Returns a function when invoked', function () {
			expect(_.isFunction(schemaValidator())).toBeTruthy();
		});
		describe('When invoked with schema argument only', function () {
			var validator, callbackSpy, schemaFilename, validDataRoot, invalidDataRoot;
			_.each(fs.readdirSync(inputRoot), function (dirname) {
				schemaFilename = path.join(inputRoot, dirname, dirname + '.schema.json');
				validDataRoot = path.join(inputRoot, dirname, 'valid-data');
				invalidDataRoot = path.join(inputRoot, dirname, 'invalid-data');
				beforeEach(function () {
					validator = schemaValidator(require(schemaFilename));
				});
				describe('When data set "' + dirname + '" is invoked with valid data', function () {
					_.each(fs.readdirSync(validDataRoot), function (filename) {
						describe('When invoked with "' + filename + '"', function () {
							beforeEach(function (done) {
								callbackSpy = jasmine.createSpy().andCallFake(function () {
									done();
								});
								validator(require(path.join(validDataRoot, filename)), callbackSpy);
							});
							it('Calls the callback without any errors', function () {
								expect(callbackSpy).toHaveBeenCalledWith();
								expect(callbackSpy.callCount).toBe(1);
							});
						});
					});
				});
				describe('When data set "' + dirname + '" is invoked with invalid data', function () {
					_.each(fs.readdirSync(invalidDataRoot), function (filename) {
						describe('When invoked with "' + filename + '"', function () {
							beforeEach(function (done) {
								callbackSpy = jasmine.createSpy().andCallFake(function () {
									done();
								});
								validator(require(path.join(invalidDataRoot, filename)), callbackSpy);
							});
							it('Calls the callback with error', function () {
								expect(callbackSpy).toHaveBeenCalled();
								expect(callbackSpy.callCount).toBe(1);
								expect(callbackSpy.mostRecentCall.args.length).toBe(1);
								expect(callbackSpy.mostRecentCall.args[0] instanceof Error).toBeTruthy();
								expect(errorMessageRegex.test(callbackSpy.mostRecentCall.args[0].message)).toBeTruthy();
							});
						});
					});
				});
			});
		});
		describe('When invoked with schema and custom loader', function () {
			var validator, loader, schemaFilename, testData, callback;
			beforeEach(function (done) {
				schemaFilename = path.join(inputRoot, 'example1', 'example1.schema.json');
				testData = { value: 'test data' };
				loader = jasmine.createSpy('schema loader').andCallFake(function (ref, loaderCallback) {
					loaderCallback(null, { schema: 'from loader' });
				});
				callback = jasmine.createSpy('callback').andCallFake(function () {
					done();
				});
				validator = schemaValidator(require(schemaFilename), loader);
				validator(testData, callback);
			});
			it('Calls the custom loader for any unresolved schema references', function () {
				expect(loader).toHaveBeenCalled();
				expect(loader.callCount).toBe(1);
				expect(loader.mostRecentCall.args.length).toBe(2);
				expect(loader.mostRecentCall.args[0]).toBe('http://json-schema.org/geo');
				expect(_.isFunction(loader.mostRecentCall.args[1])).toBeTruthy();
			});
			it('Calls the callback', function () {
				expect(callback).toHaveBeenCalled();
				expect(callback.callCount).toBe(1);
			});
		});
		describe('When invoked with schema and custom error message mapper', function () {
			var validator, mapErrorMessage, schemaFilename, testData, callback;
			beforeEach(function (done) {
				schemaFilename = path.join(inputRoot, 'example1', 'example1.schema.json');
				testData = { value: 'test data' };
				mapErrorMessage = jasmine.createSpy('map error message').andReturn('Sample error message');
				callback = jasmine.createSpy('callback').andCallFake(function () {
					done();
				});
				validator = schemaValidator(require(schemaFilename), null, mapErrorMessage);
				validator(testData, callback);
			});
			it('Calls the error message mapper for any schema errors', function () {
				expect(mapErrorMessage).toHaveBeenCalled();
				expect(mapErrorMessage.callCount).toBe(1);
			});
			it('Calls the callback', function () {
				expect(callback).toHaveBeenCalled();
				expect(callback.callCount).toBe(1);
			});
		});
		describe('When invoked with schema, custom loader and custom error message mapper', function () {
			var validator, loader, mapErrorMessage, schemaFilename, testData, callback;
			beforeEach(function (done) {
				schemaFilename = path.join(inputRoot, 'example1', 'example1.schema.json');
				testData = { value: 'test data' };
				loader = jasmine.createSpy('schema loader').andCallFake(function (ref, loaderCallback) {
					loaderCallback(null, { schema: 'from loader' });
				});
				mapErrorMessage = jasmine.createSpy('map error message').andReturn('Sample error message');
				callback = jasmine.createSpy('callback').andCallFake(function () {
					done();
				});
				validator = schemaValidator(require(schemaFilename), loader, mapErrorMessage);
				validator(testData, callback);
			});
			it('Calls the custom loader for any unresolved schema references', function () {
				expect(loader).toHaveBeenCalled();
				expect(loader.callCount).toBe(1);
				expect(loader.mostRecentCall.args.length).toBe(2);
				expect(loader.mostRecentCall.args[0]).toBe('http://json-schema.org/geo');
				expect(_.isFunction(loader.mostRecentCall.args[1])).toBeTruthy();
			});
			it('Calls the error message mapper for any schema errors', function () {
				expect(mapErrorMessage).toHaveBeenCalled();
				expect(mapErrorMessage.callCount).toBe(1);
			});
			it('Calls the callback', function () {
				expect(callback).toHaveBeenCalled();
				expect(callback.callCount).toBe(1);
			});
		});
	});
}(require('lodash'), require('jasmine-node'), require('path'), require('graceful-fs'), require('../../')));
