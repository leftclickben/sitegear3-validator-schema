/*jslint node: true, nomen: true, white: true*/
/*!
 * Sitegear3
 * Copyright(c) 2014 Ben New, Sitegear.org
 * MIT Licensed
 */

(function (_, JaySchema) {
	"use strict";

	module.exports = function (schema, loader, mapErrorMessage) {
		mapErrorMessage = mapErrorMessage || function (error) {
			return error.message || 'Constraint "' + error.constraintName + '" broken by "' + error.testedValue + '", expected "' + error.constraintValue + '"' + (error.desc ? ' (' + error.desc + ')' : '');
		};

		var js = new JaySchema(loader || module.exports.loaders.local);

		return function (data, callback) {
			js.validate(data, schema, function (errors) {
				if (errors && errors.length > 0) {
					var messages = _.map(errors, mapErrorMessage);
					callback(new Error('Received ' + errors.length + ' errors from JSON schema validator: [[ ' + messages.join(' ]]; [[ ') + ' ]]'));
				} else {
					callback();
				}
			});
		};
	};

	module.exports.loaders = {
		local: function (ref, callback) {
			if (module.exports.localSchema.hasOwnProperty(ref)) {
				callback(null, module.exports.localSchema[ref]);
			}
			callback(new Error('Attempted to load unknown local schema with ref "' + ref + '"'));
		}
	};

	module.exports.localSchema = require('./local.schema.json');

}(require('lodash'), require('jayschema')));
