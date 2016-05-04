;(function(root) {
'use strict';

var Backbone = root.Backbone;

// Cache the event values to return on getValue because math expressions will use the getValueForKey method
root._inputscope = root._inputscope || {};

var SCOPE_NAME = 'inputscope';
var CURSOR_X = 'cursorX';
var CURSOR_Y = 'cursorY';

function _cursorListener(e) {
	root._inputscope[CURSOR_X] = e.clientX;
	root._inputscope[CURSOR_Y] = e.clientY;
	this._invokeObservers(CURSOR_X, e.clientX, SCOPE_NAME);
	this._invokeObservers(CURSOR_Y, e.clientY, SCOPE_NAME);
}

Backbone.Cord.plugins.push({
	name: SCOPE_NAME,
	config: {
		inputPrefix: '@'
	},
	scope: {
		getKey: function(key) {
			if(key.indexOf(Backbone.Cord.config.inputPrefix) === 0)
				return key.substr(Backbone.Cord.config.inputPrefix.length);
		},
		observe: function(key) {
			switch(key) {
				case CURSOR_X:
				case CURSOR_Y:
					if(!Object.keys(this._getObservers(CURSOR_X, SCOPE_NAME)).length && !Object.keys(this._getObservers(CURSOR_Y, SCOPE_NAME)).length) {
						this._cursorListener = _cursorListener.bind(this);
						document.addEventListener('mousemove', this._cursorListener);
					}
					break;
			}
		},
		unobserve: function(key) {
			switch(key) {
				case CURSOR_X:
				case CURSOR_Y:
					if(!Object.keys(this._getObservers(CURSOR_X, SCOPE_NAME)).length && !Object.keys(this._getObservers(CURSOR_Y, SCOPE_NAME)).length)
						document.removeEventListener('mousemove', this._cursorListener);
					break;
			}
		},
		getValue: function(key) {
			return root._inputscope[key] || 0;
		},
		setValue: function() {}
	},
	remove: function() {
		document.removeEventListener('mousemove', this._cursorListener);
	}
});

})(((typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global)));
