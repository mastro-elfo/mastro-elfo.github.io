/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mastro-elfo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Module: Storage
 * Requires: Each, Json
 */

$['Storage'] = {
	'load': function(defaults) {
		if (typeof defaults == 'undefined') {
			return;
		}
		$.Each(defaults, function(value, key){
			if ($.Storage.get(key) === null) {
				$.Storage.set(key, value);
			}
		});
	},
	'set': function(key, value) {
		if (typeof Storage == 'undefined') {
			return;
		}
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				localStorage[key] = $.Json.encode(value);
			});
		}
		else {
			localStorage[key] = $.Json.encode(value);
		}
	},
	'get': function(key) {
		if (typeof Storage == 'undefined') {
			return null;
		}
		return $.Json.decode(localStorage[key]);
	},
	'setns': function (namespace, key, value) {
		if (typeof Storage == 'undefined') {
			return;
		}
		
		var obj = $.Storage.get(namespace);
		if ($.Typeof(obj) != 'object') {
			obj = {};
		}
		
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				obj[key] = value;
			});
		}
		else {
			obj[key] = value;
		}
		
		$.Storage.set(namespace, obj);
	},
	'getns': function(namespace, key) {
		if (typeof Storage == 'undefined') {
			return null;
		}
		var out = $.Storage.get(namespace);
		if (!out || typeof out[key] == 'undefined') {
			return null;
		}
		else {
			return out[key];
		}
	}
};
