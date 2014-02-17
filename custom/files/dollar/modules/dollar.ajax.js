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
 * Module: Ajax
 * Requires: Each
 */

$['Ajax'] = {
	'post': function(url, data, callbacks){
		return $.Ajax._send(url, 'post', data, callbacks);
	},
	'get': function(url, data, callbacks){
		return $.Ajax._send(url, 'get', data, callbacks);
	},
	'_send': function(url, method, data, callbacks) {
		if (!url){
			url = document.location.pathname;
		}
		
		method = method.toLowerCase();
		
		data = $.Ajax._toQueryString(data);
		
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		}
		else {
			return;
		}
		
		if (data && method == 'get'){
			url += (url.contains('?') ? '&' : '?') + data;
			data = null;
		}
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				if ('onSuccess' in callbacks) {
					callbacks.onSuccess(xmlhttp.responseText, xmlhttp.responseXML);
				}
			}
		}
		
		xmlhttp.open(method.toUpperCase(), url, true);
		xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		xmlhttp.send(data);
	},
	'_toQueryString': function(data, base) {
		var queryString = [];
		
		$.Each(data, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch($.Typeof(value)) {
				case 'object':
					result = $.Ajax._toQueryString(value, key);
					break;
				case 'array':
					var qs = {};
					$.Each(value, function(val, i){
						qs[i] = val;
					});
					result = $.Ajax._toQueryString(qs, key);
					break;
				default:
					result = key + '=' + encodeURIComponent(value);
					break;
			}
			if (value != null) {
				queryString.push(result);
			}
		});
		return queryString.join('&');
	}
};
