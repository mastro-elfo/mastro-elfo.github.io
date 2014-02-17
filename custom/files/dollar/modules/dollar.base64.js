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
 * Module: Base64
 * Requires: Utf8
 */

$['Base64'] = {
	'_keys': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
	'encode': function(string){
		var output = '';
		var ch1, ch2, ch3, enc1, enc2, enc3, enc4;
		var i = 0;
		
		string = $.Utf8.encode(string);
		
		while (i < string.length) {
			
			ch1 = string.charCodeAt(i++);
			ch2 = string.charCodeAt(i++);
			ch3 = string.charCodeAt(i++);
			
			enc1 = ch1 >> 2;
			enc2 = ((ch1 & 3) << 4) | (ch2 >> 4);
			enc3 = ((ch2 & 15) << 2) | (ch3 >> 6);
			enc4 = ch3 & 63;
			
			if (isNaN(ch2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(ch3)) {
				enc4 = 64;
			}
			
			output = output + $.Base64._keys.charAt(enc1) + $.Base64._keys.charAt(enc2) + $.Base64._keys.charAt(enc3) + $.Base64._keys.charAt(enc4);
			
		}
		
		return output;
	},
	'decode': function(data){
		if (!data) {
			return '';
		}
		
		var output = '';
		var ch1, ch2, ch3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		
		data = data.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		while (i < data.length) {
			enc1 = $.Base64._keys.indexOf(data.charAt(i++));
			enc2 = $.Base64._keys.indexOf(data.charAt(i++));
			enc3 = $.Base64._keys.indexOf(data.charAt(i++));
			enc4 = $.Base64._keys.indexOf(data.charAt(i++));
			
			ch1 = (enc1 << 2) | (enc2 >> 4);
			ch2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			ch3 = ((enc3 & 3) << 6) | enc4;
			
			output = output + String.fromCharCode(ch1);
			
			if (enc3 != 64) {
				output = output + String.fromCharCode(ch2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(ch3);
			}
		}
		output = $.Utf8.decode(output);
		return output;
	}
};
