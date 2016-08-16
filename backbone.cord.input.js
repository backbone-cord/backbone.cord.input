;(function(root) {
'use strict';

var Backbone = root.Backbone || require('backbone');

// Cache the event values to return on getValue because math expressions will use the getValueForKey method
root._inputscope = root._inputscope || {};

var SCOPE_NAME = 'inputscope';
var CURSOR_X = 'cursorX';
var CURSOR_Y = 'cursorY';
var SCROLL_X = 'scrollX';
var SCROLL_Y = 'scrollY';
var WINDOW_WIDTH = 'windowWidth';
var WINDOW_HEIGHT = 'windowHeight';

function _cursorListener(e) {
	root._inputscope[CURSOR_X] = e.clientX;
	root._inputscope[CURSOR_Y] = e.clientY;
	this._invokeObservers(CURSOR_X, e.clientX, SCOPE_NAME);
	this._invokeObservers(CURSOR_Y, e.clientY, SCOPE_NAME);
}

// For cross-browser compatibility, use window.pageYOffset instead of window.scrollY.
// https://developer.mozilla.org/en-US/docs/Web/API/window.scrollY
// window.pageYOffset (at bottom) + window.innerHeight = document.documentElement.clientHeight
function _scrollX() {
	return Math.abs(window.pageXOffset / (document.documentElement.clientWidth - window.innerWidth));
}
function _scrollY() {
	return Math.abs(window.pageYOffset / (document.documentElement.clientHeight - window.innerHeight));
}
function _scrollXOffset(p) {
	return p * (document.documentElement.clientWidth - window.innerWidth);
}
function _scrollYOffset(p) {
	return p * (document.documentElement.clientHeight - window.innerHeight);
}

function _scrollListener() {
	root._inputscope[SCROLL_X] = _scrollX();
	root._inputscope[SCROLL_Y] = _scrollY();
	this._invokeObservers(SCROLL_X, root._inputscope[SCROLL_X], SCOPE_NAME);
	this._invokeObservers(SCROLL_Y, root._inputscope[SCROLL_Y], SCOPE_NAME);
}

function _resizeListener() {
	root._inputscope[WINDOW_WIDTH] = window.innerWidth;
	root._inputscope[WINDOW_HEIGHT] = window.innerHeight;
	this._invokeObservers(WINDOW_WIDTH, window.innerWidth, SCOPE_NAME);
	this._invokeObservers(WINDOW_HEIGHT, window.innerHeight, SCOPE_NAME);
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
						window.addEventListener('mousemove', this._cursorListener);
					}
					break;
				case SCROLL_X:
				case SCROLL_Y:
					if(!Object.keys(this._getObservers(SCROLL_X, SCOPE_NAME)).length && !Object.keys(this._getObservers(SCROLL_Y, SCOPE_NAME)).length) {
						this._scrollListener = _scrollListener.bind(this);
						window.addEventListener('scroll', this._scrollListener);
						// Set the initial values
						root._inputscope[SCROLL_X] = _scrollX();
						root._inputscope[SCROLL_Y] = _scrollY();
					}
					break;
				case WINDOW_WIDTH:
				case WINDOW_HEIGHT:
					if(!Object.keys(this._getObservers(WINDOW_WIDTH, SCOPE_NAME)).length && !Object.keys(this._getObservers(WINDOW_HEIGHT, SCOPE_NAME)).length) {
						this._resizeListener = _resizeListener.bind(this);
						window.addEventListener('resize', this._resizeListener);
						// Set the initial values
						root._inputscope[WINDOW_WIDTH] = window.innerWidth;
						root._inputscope[WINDOW_HEIGHT] = window.innerHeight;
					}
					break;
			}
		},
		unobserve: function(key) {
			switch(key) {
				case CURSOR_X:
				case CURSOR_Y:
					if(!Object.keys(this._getObservers(CURSOR_X, SCOPE_NAME)).length && !Object.keys(this._getObservers(CURSOR_Y, SCOPE_NAME)).length)
						window.removeEventListener('mousemove', this._cursorListener);
					break;
				case SCROLL_X:
				case SCROLL_Y:
					if(!Object.keys(this._getObservers(SCROLL_X, SCOPE_NAME)).length && !Object.keys(this._getObservers(SCROLL_Y, SCOPE_NAME)).length)
						window.removeEventListener('scroll', this._scrollListener);
					break;
				case WINDOW_WIDTH:
				case WINDOW_HEIGHT:
					if(!Object.keys(this._getObservers(WINDOW_WIDTH, SCOPE_NAME)).length && !Object.keys(this._getObservers(WINDOW_HEIGHT, SCOPE_NAME)).length)
						window.removeEventListener('resize', this._resizeListener);
					break;
			}
		},
		getValue: function(key) {
			return root._inputscope[key] || 0;
		},
		setValue: function(key, value) {
			// Scroll to the specified key and let the event listeners invoke the observers
			if(key === SCROLL_X)
				window.scrollTo(_scrollXOffset(value), root._inputscope[SCROLL_Y]);
			else if(key === SCROLL_Y)
				window.scrollTo(root._inputscope[SCROLL_X], _scrollYOffset(value));
		}
	},
	remove: function() {
		window.removeEventListener('mousemove', this._cursorListener);
		window.removeEventListener('scroll', this._scrollListener);
		window.removeEventListener('resize', this._scrollListener);
	}
});

})(((typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global)));
