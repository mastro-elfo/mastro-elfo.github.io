
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
 */

var $ = {};

// TODO: separate "protected" and "public" methods like in dollar.content.js

// TODO: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
// this is useful to parse XML
// I can create a `parse` module and than an `xml` module that works with `parse` and `xpath`

// TODO: https://developer.mozilla.org/en-US/docs/WebAPI/Using_geolocation

// TODO: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
/**
 * Manages Ajax queries
 * requires: Each, Typeof
 */

$['Ajax'] = {
	/**
	 * Send data with 'post' method
	 * param url: url to send data to; if empty $.Ajax will use <document.location.pathname>
	 * param data: data to send
	 * param callbacks: actually only 'onSuccess' is supported
	 */
	'post': function(url, data, callbacks){
		return $.Ajax._send(url, 'post', data, callbacks);
	},
	
	/**
	 * Send data with 'get' method
	 * param url: url to send data to; if empty $.Ajax will use <document.location.pathname>
	 * param data: data to send
	 * param callbacks: actually only 'onSuccess' is supported
	 */
	'get': function(url, data, callbacks){
		return $.Ajax._send(url, 'get', data, callbacks);
	},
	
	/**
	 * Send data with XMLHttpRequest
	 * param url: url to send data to
	 * param method: 'get'|'post'
	 * param data: data to send
	 * param callbacks: {'onSuccess': function(responseText, responseXML){ ... }}
	 */
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
	
	/**
	 * Convert data to query string
	 * param data: data to be converted
	 * param base: used only for recursive call
	 */
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

/**
 * Manages asyncronous processes
 * requires: Timeout
 */

$.Async = {
	/**
	 * Store different processes
	 */
	'_ids': {},
	
	/**
	 * This function is called at each timeout and calls the callback function of the process
	 * param id: id of the process
	 */
	'_loop': function(id){
		var stop = false;
		if ($.Async._ids[id].runtime.run) {
			stop = $.Async._ids[id].callback($.Async._ids[id].data, $.Async._ids[id].runtime, $.Async._ids[id].options) === false;
			$.Async._ids[id].runtime.step++;
			$.Async._ids[id].runtime.elapsed = Date.now() - $.Async._ids[id].runtime.start;
			
		}
		
		if (!stop && $.Async._ids[id].options.recall($.Async._ids[id].data, $.Async._ids[id].runtime, $.Async._ids[id].options)) {
			$.Timeout.set(id, function(){$.Async._loop(id);}, $.Async._ids[id].options.delay);
		}
		else {
			$.Async._ids[id].runtime.run = false;
		}
	},
	
	/**
	 * Start an asyncronous process
	 * param id: id of the process to start
	 * param callback: the asyncornous process function `function(data, runtime, options){ ... }`
	 *
	 *	runtime: {
	 *		'run': true,
	 * 		'start': Date.now(),
	 * 		'step': 0,
	 * 	}
	 * 
	 * param data: data that will be passed to the callback function
	 * param options: process options
	 *
	 * 	{
	 * 		'delay': 0,
	 * 		'onStop': function(){},
	 * 		'recall': function(){return true;}
	 * 	}
	 *
	 * requires: Each, Timeout
	 */
	'start': function(id, callback, data, options) {
		var _options = {
			'delay': 0,
			'onStop': function(){},
			'recall': function(){return true;}
		};
		$.Each(options, function(value, id){
			_options[id] = value;
		});
		
		if (!$.Async._ids[id]) {
			$.Async._ids[id] = {
				'callback': callback,
				'data': data,
				'options': _options,
				'runtime': {
					'run': true,
					'start': Date.now(),
					'step': 0,
				}
			};
			$.Timeout.set(id, function(){$.Async._loop(id);}, options.delay);
		}
		else if (!$.Async._ids[id].runtime.run) {
			$.Async._ids[id].runtime.run = true;
			$.Timeout.set(id, function(){$.Async._loop(id);}, options.delay);
		}
	},
	
	/**
	 * Stop an active process withoud deleteing it
	 * param id: id of the process to be stopped
	 * requires: Timeout
	 */
	'stop': function(id) {
		$.Timeout.clear(id);
		$.Async._ids[id].runtime.run = false;
	},
	
	/**
	 * Delete an active process
	 * param id: id of the process to be deleted
	 * requires: Timeout
	 */
	'delete': function(id) {
		$.Timeout.clear(id);
		delete($.Async._ids[id]);
	}
};

/**
 * Encodes/decodes strings to/from Base64
 */

$['Base64'] = {
	/**
	 *
	 */
	'_keys': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
	
	/**
	 * Decode a base64 string
	 * param data: srting to be decoded
	 * requires: Utf8.decode
	 */
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
	},
	
	/**
	 * Encode a string into Base64
	 * param string: the string to be encoded
	 * requires: Utf8.encode
	 */
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
	}
};

/**
 * Create an object extending another
 * requires: Each
 */

$['Class'] = function(base, properties, defaults) {
	properties = typeof properties == 'undefined' ? {} : properties;
	defaults = typeof defaults == 'undefined' ? {} : defaults;
	
	var new_class = {};
	
	$.Each(base, function(value, key){
		new_class[key] = value;
	});
	
	$.Each(properties, function(value, key){
		new_class[key] = value;
	});
	
	var _foo = function(prop, key, value){
		if (!prop[key]) {
			prop[key] = value;
		}
		else {
			// prop[key] = {};
			$.Each(value, function(v, k){
				_foo(prop[key], k, v);
			});
		}
	}
	$.Each(defaults, function(v, k){
		_foo(new_class, k, v);
	});
	
	return new_class;
};

/**
 * A base set of commands for contentEditable elements.
 *
 * Not all command provided! Some are useful shortcuts.
 */

$['Content'] = {
	/**
	 * Calls `execCommand` function
	 */
	'_exec': function (aCommandName, aValue) {
		execCommand(aCommandName, false, aValue);
	}
};

$.Content.bold = function() {
	this._exec('bold');
};

$.Content.copy = function () {
	this._exec('copy');
};

$.Content.link = function (uri) {
	this._exec('createLink', uri || ' ');
};

$.Content.cut = function () {
	this._exec('cut');
};

$.Content['delete'] = function () {
	this._exec('delete');
};

$.Content.enableInlineTableEditing = function () {
	this._exec('enableInlineTableEditing');
};

$.Content.enableObjectResizing = function () {
	this._exec('enableObjectResizing');
};

/**
 * Shortcut for formatBlock
 *
 * All block tag:
 * * H1 - H6
 * * P
 * * DIV
 * * BLOCKQUOTE
 * * ...
 */
$.Content.block = function (aBlockTag) {
	this._exec('formatBlock', aBlockTag);
};

$.Content.div = function () {
	this.block('DIV');
};
$.Content.h1 = function () {
	this.block('H1');
};
$.Content.h2 = function () {
	this.block('H2');
};
$.Content.h3 = function () {
	this.block('H3');
};
$.Content.h4 = function () {
	this.block('H4');
};
$.Content.h5 = function () {
	this.block('H5');
};
$.Content.h6 = function () {
	this.block('H6');
};
$.Content.p = function () {
	this.block('P');
};

$.Content.html = function (htmlString) {
	this._exec('insertHTML', htmlString);
};

$.Content.image = function (uri) {
	this._exec('insertImage', uri || ' ');
};

$.Content.ol = function () {
	this._exec('insertOrderedList');
};

$.Content.ul = function () {
	this._exec('insertUnorderedList');
};

$.Content.text = function (textString) {
	this._exec('insertText', textString);
};

$.Content.italic = function () {
	this._exec('italic');
};

$.Content.paste = function () {
	this._exec('paste');
};

$.Content.redo = function () {
	this._exec('redo');
};

$.Content.strike = function () {
	this._exec('strikeThrough');
};

$.Content.subscript = function() {
	this._exec('subscript');
};

$.Content.superscript = function() {
	this._exec('superscript');
};

$.Content.underline = function () {
	this._exec('underline');
};

$.Content.undo = function () {
	this._exec('undo');
};

$.Content.unlink = function () {
	this._exec('unlink');
};

/**
 * Time/date functions
 * requires: $.Each
 */

$.Date = {
	_getDateObject: function(set_time){
		var d = new Date();
		if (typeof set_time != 'undefined') {
			// d.setTime(set_time);
			$.Each(set_time, function(value, key){
				switch (key) {
					default:				d.setTime(value); break;
					case 'day':				d.setDate(value); break;
					case 'month':			d.setMonth(value); break;
					case 'year':			d.setFullYear(value); break;
					case 'hours':			d.setHours(value); break;
					case 'minutes':			d.setMinutes(value); break;
					case 'seconds':			d.setSeconds(value); break;
					case 'milliseconds':	d.setMilliseconds(value); break;
				}
			});
		}
		return d;
	},
	_date: new Date()
};

$.Date.now = function(set_time) {
	return this._getDateObject(set_time).getTime();
};

$.Date.day = function(set_time) {
	return this._getDateObject(set_time).getDate();
};

$.Date.weekDay = function(set_time) {
	return this._getDateObject(set_time).getDay();
};

$.Date.month = function(set_time) {
	return this._getDateObject(set_time).getMonth();
};

$.Date.year = function(set_time) {
	return this._getDateObject(set_time).getFullYear();
};

$.Date.hours = function(set_time) {
	return this._getDateObject(set_time).getHours();
};

$.Date.minutes = function(set_time) {
	return this._getDateObject(set_time).getMinutes();
};

$.Date.seconds = function(set_time) {
	return this._getDateObject(set_time).getSeconds();
};

$.Date.milliseconds = function(set_time) {
	return this._getDateObject(set_time).getMilliseconds();
};

/**
 * Returns the time difference between UTC time and local time, in minutes
 */
$.Date.offset = function(set_time) {
	return this._getDateObject(set_time).getTimezoneOffset();
};

/**
 * Parses a date string and returns the number of milliseconds since January 1, 1970
 */
$.Date.parse = function(string) {
	return Date.parse(string);
};

$.Date.toString = function(set_time) {
	return this._getDateObject(set_time).toString();
};

/**
 * The toJSON() method converts a Date object into a string, formatted as a JSON date: YYYY-MM-DDTHH:mm:ss.sssZ
 */
$.Date.toJson = function(set_time) {
	return this._getDateObject(set_time).toJSON();
};
/**
 * Manage Dom Nodes
 */

$['Dom'] = {
	/**
	 * Alias of `document.getElementById`
	 * param id: id of the node to get
	 */
	'id': function(id) {
		return document.getElementById(id);
	},
	
	/**
	 * Returns an array of elements, children of a given one
	 * param element: element or id
	 * param tag: tagName of the children to get
	 * param a_class: class attribute to match
	 * return: array
	 * requires: Dom.id, Each, Dom.hasClass
	 */
	'children': function(element, tag, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		// tag = tag.toUpperCase(); // ??
		
		var list = element.getElementsByTagName(tag);
		var elements = [];
		$.Each(list, function(item){
			if (!a_class || $.Dom.hasClass(item, a_class)) {
				elements.push(item);
			}
		});
		return elements;
	},
	
	/**
	 * Returns an array of elements, parents of a given one
	 * param element: element or id
	 * param tag: tagName of the children to get
	 * param a_class: class attribute to match
	 * return: array
	 * requires: Dom.id, Dom.hasClass
	 */
	'parents': function(element, tag, a_class){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		tag = tag.toUpperCase();
		var parents = [];
		var parent = element.parentNode;
		while(parent && parent.tagName) {
			if (parent.tagName == tag && (!a_class || $.Dom.hasClass(parent, a_class))) {
				parents.push(parent);
			}
			parent = parent.parentNode;
		}
		return parents;
	},
	
	/**
	 * Alias of document.querySelectorAll
	 * param selector: selector
	 */
	'select': function(selector) {
		return document.querySelectorAll(selector);
	},
	
	/**
	 * Return `true` if the given element has `a_class` in its `class` attribute, `false` otherwise
	 * param element: element or id
	 * param a_class: a class name
	 * return boolean
	 * requires: Dom.id
	 */
	'hasClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		return element.className.split(' ').indexOf(a_class) != -1;
	},
	
	/**
	 * Add a class to an element
	 * param element: element or id
	 * param a_class: a class name
	 * requires: Dom.id, Dom.hasClass
	 */
	'addClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		if (!$.Dom.hasClass(element, a_class)) {
			element.className += ' '+a_class;
		}
	},
	
	/**
	 * Remove a class from an element
	 * param element: element or id
	 * param a_class: a class name
	 * requires: Dom.id, Each
	 */
	'removeClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var classes = element.className.split(' ');
		var idx = 0;
		while((idx = classes.indexOf(a_class)) != -1) {
			classes.splice(idx, 1);
		}
		element.className = '';
		$.Each(classes, function(item){
			element.className += ' '+item;
		});
	},
	
	/**
	 * Add an event to an element
	 * param element: element or id
	 * param event: the event name
	 * param fn: the callback function
	 * requires: Dom.id
	 */
	'addEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.addEventListener(event, fn);
	},
	
	/**
	 * Remove an event from an element
	 * param element: element or id
	 * param event: an event name
	 * param fn: a callback function
	 * requires: Dom.id
	 */
	'removeEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.removeEventListener(event, fn);
	},
	
	/**
	 * Fire an event
	 * param element: element or id
	 * param event_name: the event name
	 * param data: data that will be passed to callback functions
	 * requires: Dom.id
	 */
	'fireEvent': function(element, event_name, data) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var event = new CustomEvent(event_name, data);
		element.dispatchEvent(event);
	},
	
	/**
	 * Create a new DOM element
	 * param tag: the tag name
	 * param attributes: attributes
	 * param content: innerHTML
	 * param events: event to be attached to this element
	 * return the new element
	 * requires: Each, Dom.addEvent
	 */
	'element': function(tag, attributes, content, events) {
		typeof attributes == 'undefined' ? attributes = {} : 0;
		typeof content == 'undefined' ? content = '' : 0;
		typeof events == 'undefined' ? events = {} : 0;
		
		var element = document.createElement(tag);
		$.Each(attributes, function(value, key){
			element.setAttribute(key, value);
		});
		$.Each(events, function(value, key){
			$.Dom.addEvent(element, key, value);
		});
		element.innerHTML = content;
		
		return element;
	},
	
	/**
	 * Inject an element into the DOM
	 * param element: the element to be injected
	 * param container: an element or id of the container or reference element
	 * param where: ''|'first'|'before'|'after'
	 * * ''|default: append the element into container
	 * * 'first': inject element as first child of container
	 * * 'before': inject element before container
	 * * 'after': inject element after container
	 *
	 * requires: Dom.id
	 */
	'inject': function(element, container, where) {
		typeof container == 'string'? container = $.Dom.id(container) : 0;
		typeof where == 'undefined'? where = 'append' : 0;
		switch(where) {
			default:
				// Append element into container
				container.appendChild(element);
				break;
			case 'first':
				// Insert element into container in the first position
				if (container.childNodes[0]) {
					container.insertBefore(element, container.childNodes[0]);
				}
				else {
					container.appendChild(element);
				}
				break;
			case 'before':
				// Insert element before container
				container.parentNode.insertBefore(element, container);
				break;
			case 'after':
				// Insert element after container
				if (container.nextSibling) {
					container.parentNode.insertBefore(element, container.nextSibling);
				}
				else {
					container.parentNode.appendChild(element);
				}
				break;
		}
	},
	
	/**
	 * Destroy an element
	 * param element: element or id
	 * param container: element container (don't use it)
	 * requires: Dom.id
	 */
	'destroy': function(element, container) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		typeof container == 'undefined' ? container = element.parentNode : 0;
		container.removeChild(element);
	},
	
	/**
	 * Set element style
	 * param element: element or id
	 * param css_property: a property name or an object like {property_name: property_value, ...}
	 * param value: a property value if css_property is a string, ignored otherwise
	 * requires: Dom.id, Each
	 */
	'style': function(element, css_property, value){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		
		var _foo = function(key, value){
			key = key.replace(/(\-)([a-z])/, function(a){return a[1].toUpperCase();});
			element.style[key] = value;
		}
		
		if (typeof css_property == 'object') {
			$.Each(css_property, function(value, key){
				_foo(key, value);
			});
		}
		else {
			_foo(css_property, value);
		}
	}
};

/**
 * Iterate over objects and apply a given function
 *
 * Correctly iterate objects, arrays, XPathResult and single values
 * requires: Typeof
 * param list: a list to iterate
 * param callback: callback function called at each iteration
 *
 * 	function(item, key, flags) {}
 *
 * * item: an item in the list
 * * key: the key associated to item
 * * flags: {'first': true|false, 'last': true|false}
 */

$['Each'] = function(list, callback) {
	var flags = {
		'first': true,
		'last': false
	};
	
	var type = $.Typeof(list);
	if (type == 'array') {
		for(var i=0; i<list.length; i++) {
			flags = {
				'first': i==0,
				'last': i==list.length -1
			};
			if (callback(list[i], i, flags) === false) {
				break;
			}
		}
	}
	else if (typeof list.iterateNext != 'undefined') {
		var node = list.iterateNext();
		var i=0;
		flags.last = null;
		while(node) {
			if (callback(node, i, flags) === false) {
				break;
			}
			flags.first = false;
			node = list.iterateNext();
		}
	}
	else if (type == 'object') {
		var size = 0;
		for(var i in list) {
			size++;
		}
		
		var count = 0;
		for(var i in list) {
			flags = {
				'first': count==0,
				'last': count==size -1
			};
			if (callback(list[i], i, flags) === false) {
				break;
			}
			count++;
		}
	}
	else {
		callback(list, 0, {
			'first': true,
			'last': true
		});
	}
};

/**
 * Add gesture to an element
 */
$.Gesture = {};

/**
 * Add swipe to an element
 * requires: $.Dom.id, $.Timeout.set, $.Dom.fireEvent, $.Dom.addEvent, $.Gesture._swipe
 */
$.Gesture.swipe = function(element, options) {
	new $.Gesture._swipe(element, options);
};

$.Gesture._swipe = function (element, options) {
	if (typeof element == 'string') {
		element = $.Dom.id(element);
	}
	this.element = element;
	this.options = options || {
		length: 200,
		delay: 150,
		id: 'swipe-timeout',
		acceptance: 20
	};
	this.start = {
		x: null,
		y: null
	};
	(function(self){
		var events = {
			'start': function(event){
				self.start.x = event.clientX;
				self.start.y = event.clientY;
				if (event.touches) {
					self.start.x = event.touches[0].clientX;
					self.start.y = event.touches[0].clientY;
				}
				$.Timeout.set(self.options.id, function(){
					self.start.x = null;
					self.start.y = null;
				}, self.options.delay);
			},
			'move': function(event){
				if (self.start.x !== null && self.start.y !== null) {
					var delta = {
						x: event.clientX - self.start.x,
						y: event.clientY - self.start.y
					};
					if (event.touches) {
						delta.x = event.touches[0].clientX - self.start.x;
						delta.y = event.touches[0].clientY - self.start.y;
					}
					delta.ax = Math.abs(delta.x);
					delta.ay = Math.abs(delta.y);
					if (delta.ax > delta.ay && delta.ax > self.options.length) {
						if (delta.ay /2 < self.options.acceptance) {
							self.start.x = null;
							self.start.y = null;
							$.Dom.fireEvent(self.element, 'swipe', {
								dir: delta.x > 0? 'right': 'left',
								target: event.target
							});
						}
					}
					else if (delta.ay > self.options.length){
						if (delta.ax /2 < self.options.acceptance) {
							self.start.x = null;
							self.start.y = null;
							$.Dom.fireEvent(self.element, 'swipe', {
								dir: delta.y > 0? 'down': 'up',
								target: event.target
							});
						}
					}
				}
			},
			'end': function(event){
				self.start.x = null;
				self.start.y = null;
				$.Timeout.clear(self.options.id);
			}
		};
		$.Dom.addEvent(self.element, 'mousedown', events.start);
		$.Dom.addEvent(self.element, 'touchstart', events.start);
		
		$.Dom.addEvent(self.element, 'mousemove', events.move);
		$.Dom.addEvent(self.element, 'touchmove', events.move);
		
		$.Dom.addEvent(self.element, 'mouseup', events.end);
		$.Dom.addEvent(self.element, 'mouseleave', events.end);
		$.Dom.addEvent(self.element, 'touchleave', events.end);
		$.Dom.addEvent(self.element, 'touchend', events.end);
		$.Dom.addEvent(self.element, 'touchcancel', events.end);
	})(this);
};

/**
 * Add long press gesture
 * requires: $.Dom.id, $.Timeout.set, $.Dom.fireEvent, $.Dom.addEvent, $.Gesture._longPress
 */
$.Gesture.longPress = function(element, options) {
	new $.Gesture._longPress(element, options);
};

$.Gesture._longPress = function (element, options) {
	if (typeof element == 'string') {
		element = $.Dom.id(element);
	}
	this.element = element;
	this.options = options || {
		delay: 750,
		id: 'longpress-timeout'
	};
	(function(self){
		var events = {
			'start': function(event){
				$.Timeout.set(self.options.id, function(){
					$.Dom.fireEvent(self.element, 'longpress', {
						target: self.element
					});
				}, self.options.delay);
			},
			'end': function(event){
				$.Timeout.clear(self.options.id);
			}
		};
		
		$.Dom.addEvent(self.element, 'mousedown', events.start);
		$.Dom.addEvent(self.element, 'touchstart', events.start);
		$.Dom.addEvent(self.element, 'mouseup', events.end);
		$.Dom.addEvent(self.element, 'mouseleave', events.end);
		$.Dom.addEvent(self.element, 'touchleave', events.end);
		$.Dom.addEvent(self.element, 'touchend', events.end);
		$.Dom.addEvent(self.element, 'touchcancel', events.end);
	})(this);
};
/**
 * Manage intervals
 */

$['Interval'] = {
	/**
	 *
	 */
	'_id': {},
	
	/**
	 * Set a new interval
	 *
	 * Interval is cleared if id is already set
	 * param id: interval id
	 * param fn: the callbackfunction
	 * param delay: delay in milliseconds
	 * requires: Interval.clear
	 */
	'set': function(id, fn, delay) {
		$.Interval.clear(id);
		$.Interval._id[id] = setInterval(function(){fn();}, delay);
	},
	
	/**
	 * Clear an interval
	 * param id: interval id
	 */
	'clear': function(id) {
		if ($.Interval._id[id]) {
			clearInterval($.Interval._id[id]);
		}
	},
};
/**
 * Encodes/decodes strings to/from JSON
 */

$['Json'] = {
	/**
	 * Decode a JSON string
	 * 
	 * It uses `JSON.parse`
	 * param string: the string to be parsed
	 */
	'decode': function(string) {
		try { // if parse fails it rises an exception
			return JSON.parse(string);
		}
		catch(e) {
			return null;
		}
	},
	
	/**
	 * Encode data to JSON
	 *
	 * It uses `JSON.stringify`
	 * param data: data to be encoded
	 */
	'encode': function(data) {
		return JSON.stringify(data)
	}
};

/**
 * Localization module to translate in different languages
 */


$.L10n = {
	/**
	 * Actual language, set with setLanguage()
	 */
	_language: '',
	
	/**
	 * Translation strings
	 *
	 * 		_strings: {
	 * 			<language>: {
	 * 				<data-l10n>: <some string for innerHTML>,
	 * 				<data-l10n>: {
	 * 					'html': <some string for innerTML>,
	 * 					<attribute>: <some string for attribute>,
	 * 					...
	 * 				},
	 * 				...
	 * 			},
	 * 			...
	 * 		}
	 */
	_strings: {},
	
	/**
	 * Set the actual language
	 */
	setLanguage: function(language) {
		this._language = language;
	},
	
	/**
	 * Sniff browser language
	 */
	sniff: function(){
		return navigator.language || navigator.userLanguage;
	},
	
	/**
	 * Translate a single string in the given language or the default one
	 * return null if translation is not found
	 */
	translate: function(string, language) {
		language = language ? language : this._language;
		return  this._strings[language] ? (this._strings[language][string] || null) : null;
	},
	
	/**
	 * Apply translation in the default language
	 */
	translateAll: function() {
		var self = this;
		
		// Get all elements in Dom with 'data-l10n' attribute
		$.Each(document.body.querySelectorAll('[data-l10n]'), function(item){
			// Get the translation in the default language for the identifier given by 'data-l10n' value
			var translation = self.translate(item.getAttribute('data-l10n'));
			if (translation) {
				if (typeof translation == 'string') {
					// Translation for html
					item.innerHTML = translation;
				}
				else {
					$.Each(translation, function(value, key){
						if (key == 'html') {
							// Translation for html
							item.innerHTML = value;
						}
						else {
							// Translation for attribute
							item.setAttribute(key, value);
						}
					});
				}
			}
		});
	}
};


/**
 * Exec, test, search or replace with regular expressions
 * 
 */
$.Regexp = {};

/**
 * Test for a match in a string and return the matched test if any or null.
 * param string:
 * param expressions: can be a string, a RegExp, a string that represents a regular expression
 * return: the match or null
 */
$.Regexp.exec = function(string, expression) {
	var re = new RegExp(expression);
	return re.exec(string);
};

/**
 * Tests for a match in a string. Returns true or false.
 * param string:
 * param expressions: can be a string, a RegExp, a string that represents a regular expression
 * return: true or false
 */
$.Regexp.test = function(string, expression) {
	var re = new RegExp(expression);
	return re.test(string);
};

/**
 * The method searches a string for a specified value, or a regular expression, and returns a new string where the specified values are replaced. This doesn't change the original string.
 * param string:
 * param expression:
 * param replace:
 * return: The new string
 */
$.Regexp.replace = function(string, expression, replace) {
	return string.replace(expression, replace);
};

/**
 * The method searches a string for a specified value, and returns the position of the match. The search value can be string or a regular expression. This method returns -1 if no match is found.
 * param string:
 * param expression:
 * return: The position of expression in string if found; -1 otherwise.
 */
$.Regexp.search = function(string, expression) {
	return string.search(expression);
};

/**
 * Manages browser local storage
 *
 * Uses browser localStorage object
 */

$['Storage'] = {
	/**
	 * Get a value with a given key
	 * param key: a key
	 * requires: Json.decode
	 */
	'get': function(key) {
		return $.Json.decode(localStorage[key]);
	},
	
	/**
	 * Get a value with given namespace and key
	 * param namespace: a namespace
	 * param key: a key
	 * requires: Storage.get
	 */
	'getns': function(namespace, key) {
		var out = $.Storage.get(namespace);
		if (!out || typeof out[key] == 'undefined') {
			return null;
		}
		else {
			return out[key];
		}
	},
	
	/**
	 * requires: Each, Storage.set, Storage.get
	 */
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
	
	/**
	 * Set a value with a give key
	 * param key: a key
	 * param value: a value
	 * requires: Each, Json.encode
	 */
	'set': function(key, value) {
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				localStorage[key] = $.Json.encode(value);
			});
		}
		else {
			localStorage[key] = $.Json.encode(value);
		}
	},
	
	/**
	 * Set a value with given namespace and key
	 * param namespace: a namespace
	 * param key: a key
	 * param value: a value
	 * requires: Storage.get, Typeof, Each, Storage.set
	 */
	'setns': function (namespace, key, value) {
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
	}
};

/**
 * Manage timeouts
 */

$['Timeout'] = {
	/**
	 *
	 */
	'_id': {},
	
	/**
	 * Clear a timeout
	 * param id: timeout id to be cleared
	 */
	'clear': function(id) {
		if ($.Timeout._id[id]) {
			clearTimeout($.Timeout._id[id]);
		}
	},
	
	/**
	 * Set a new timeout
	 *
	 * If timeout already exists it will be cleared
	 * param id: the timeout id
	 * param fn: the callback function
	 * param delay: the timeout delay
	 * requires: Timeout.clear
	 */
	'set': function(id, fn, delay) {
		$.Timeout.clear(id);
		$.Timeout._id[id] = setTimeout(function(){fn();}, delay);
	}
};

/**
 * Extends javascript typeof function
 * param obj: obj test
 */

$['Typeof'] = function(obj) {
	var type = typeof(obj);
	if (obj == null) {
		return 'undefined';
	}
	else if (type == 'object') {
		return !!obj.length || obj.length == 0 ? 'array' : 'object';
	}
	else {
		return type;
	}
};

/**
 * Encodes/decodes strings to/from UTF-8
 */

$['Utf8'] = {
	/**
	 * Decode a string from UTF-8
	 * param utftext: string to be decoded
	 */
	'decode': function (utftext) {
		var string = '';
		var i = 0;
		var c = c1 = c2 = 0;
		
		while ( i < utftext.length ) {
			
			c = utftext.charCodeAt(i);
			
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
			
		}
		
		return string;
	},
	
	/**
	 * Encode a string to UTF-8
	 * param string: the string to be encoded
	 */
	'encode': function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = '';
		
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			
		}
		
		return utftext;
	}
};

/**
 * Performs an xpath search on an xml document
 *
 * Uses `document.evaluate` to perform an xpath search. The result is an `XPathResult` object.
 * param xpath: xpath
 * param xml: an xml document; if undefined uses <document>
 * param context: context; if undefined uses <xml>
 */

$['Xpath'] = function(xpath, xml, context) {
	typeof xml == 'undefined'? xml = document : 0;
	typeof context == 'undefined'? context = xml : 0;
	return xml.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE ,null);
};
