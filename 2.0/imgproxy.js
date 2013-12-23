(function($) {
	"use strict";
	
	var $singleEl, //the swf used for remote loading
		loading = false,
		ready = false,
		id = 0,
		waiting = [],
		callbacks = {};
	
	function createSwf(idOrEl, vars) {
		if ($.fn.flash) {
			if (typeof idOrEl === "string") {
				idOrEl = $('#' + idOrEl);
			}
			
			idOrEl.flash({
				height: '100%',
				flashvars: vars,
				swf: window.imgproxy.SWF,
				width: '100%',
				wmode: 'transparent'
			});
		} else {
			console.error('jquery.swfobject not found.  Cannot load imgproxy.');
		}
	}
	
	function loadSwf() {
		if (loading) {
			return;
		}
		loading = true;
		
		$singleEl = $('<div />')
			.attr('id', 'imgproxy')
			.css({
				height: 1,
				position: 'absolute',
				top: 0,
				width: 1
			});
		
		$('body').append($singleEl);
		
		createSwf('imgproxy');
	}
	
	window.imgproxy = {
		SWF: 'imgproxy.swf',
		
		load: function(url, successCallback, failCallback) {
			if (!ready) {
				waiting.push(Array.prototype.slice.call(arguments));
				loadSwf();
				return;
			}
			
			var localId = id++;
			
			this._callbacks(localId, true, successCallback, failCallback);
			
			$singleEl.flash(function() {
				this.load(localId, url);
			});
		},
		
		_callbacks: function(id, single, successCallback, failCallback) {
			callbacks[id] = {
				single: single,
				success: successCallback,
				error: failCallback
			};
		},
		
		_onLoad: function() {
			var i;
			
			ready = true;
			
			if (waiting.length) {
				for (i = 0; i < waiting.length; i++) {
					window.imgproxy.load.apply(this, waiting[i]);
				}
			}
			
			waiting = null;
		},
		_onSuccess: function(id, img) {
			var fn = callbacks[id].success;
			if (fn) {
				fn('data:image/png;base64,' + img);
			}
			
			if (callbacks[id].single) {
				delete callbacks[id];
			}
		},
		_onError: function(id, error) {
			var fn = callbacks[id].error;
			if (fn) {
				fn(error);
			}
			
			if (callbacks[id].single) {
				delete callbacks[id];
			}
		}
	};
	
	$.fn.imgproxy = function(successCallback, failCallback) {
		var localId = id++;
		
		this.each(function() {
			createSwf($(this), {id: localId, local: true});
		});
		
		window.imgproxy._callbacks(localId, false, successCallback, failCallback);
		
		return this;
	};
}(jQuery));