;(function(root) {
'use strict';

var Backbone = root.Backbone || require('backbone');

// Cache the event values to return on getValue because math expressions will use the getValueForKey method
root._inputscope = root._inputscope || {};

var NAMESPACE = 'input';
var CURSOR_X = 'cursorX';
var CURSOR_Y = 'cursorY';
var SCROLL_X = 'scrollX';
var SCROLL_Y = 'scrollY';
var WINDOW_WIDTH = 'windowWidth';
var WINDOW_HEIGHT = 'windowHeight';

function _cursorListener(e) {
	root._inputscope[CURSOR_X] = e.clientX;
	root._inputscope[CURSOR_Y] = e.clientY;
	this._invokeObservers(NAMESPACE, CURSOR_X, e.clientX);
	this._invokeObservers(NAMESPACE, CURSOR_Y, e.clientY);
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
	this._invokeObservers(NAMESPACE, SCROLL_X, root._inputscope[SCROLL_X]);
	this._invokeObservers(NAMESPACE, SCROLL_Y, root._inputscope[SCROLL_Y]);
}

function _resizeListener() {
	root._inputscope[WINDOW_WIDTH] = window.innerWidth;
	root._inputscope[WINDOW_HEIGHT] = window.innerHeight;
	this._invokeObservers(NAMESPACE, WINDOW_WIDTH, window.innerWidth);
	this._invokeObservers(NAMESPACE, WINDOW_HEIGHT, window.innerHeight);
}

Backbone.Cord.plugins.push({
	name: 'inputscope',
	scope: {
		namespace: NAMESPACE,
		observe: function(key) {
			switch(key) {
				case CURSOR_X:
				case CURSOR_Y:
					if(!this._hasObservers(NAMESPACE, CURSOR_X) && !this._hasObservers(NAMESPACE, CURSOR_Y)) {
						this._cursorListener = _cursorListener.bind(this);
						window.addEventListener('mousemove', this._cursorListener);
					}
					break;
				case SCROLL_X:
				case SCROLL_Y:
					if(!this._hasObservers(NAMESPACE, SCROLL_X) && !this._hasObservers(NAMESPACE, SCROLL_Y)) {
						this._scrollListener = _scrollListener.bind(this);
						window.addEventListener('scroll', this._scrollListener);
						// Set the initial values
						root._inputscope[SCROLL_X] = _scrollX();
						root._inputscope[SCROLL_Y] = _scrollY();
					}
					break;
				case WINDOW_WIDTH:
				case WINDOW_HEIGHT:
					if(!this._hasObservers(NAMESPACE, WINDOW_WIDTH) && !this._hasObservers(NAMESPACE, WINDOW_HEIGHT)) {
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
					if(!this._hasObservers(NAMESPACE, CURSOR_X) && !this._hasObservers(NAMESPACE, CURSOR_Y))
						window.removeEventListener('mousemove', this._cursorListener);
					break;
				case SCROLL_X:
				case SCROLL_Y:
					if(!this._hasObservers(NAMESPACE, SCROLL_X) && !this._hasObservers(NAMESPACE, SCROLL_Y))
						window.removeEventListener('scroll', this._scrollListener);
					break;
				case WINDOW_WIDTH:
				case WINDOW_HEIGHT:
					if(!this._hasObservers(NAMESPACE, WINDOW_WIDTH) && !this._hasObservers(NAMESPACE, WINDOW_HEIGHT))
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
