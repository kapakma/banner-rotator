/**
 * jQuery Banner Rotator v4.1.2
 */
import '../styles/banner-rotator.css';

import { CUBIC_BEZIER, SIDES } from './constants';
import { SUPPORT, CSS_ANIMATION_END, CSS_TRANSITION_END } from './util/support';
import { 
	isAndroid, capitalize, 
	isEmptyStr, getValue, 
	saveStyle, createWrapper,
	restoreStyle, removeWrapper,
} from './util/helpers';

import Rotator from './BannerRotator';

(function($) {
	"use strict";

	const ANDROID2 = isAndroid(2.9);

	//slide effect
	$.fn.brSlideEffect = function(opts) {
		const props = ['display', 'position', 'top', 'left', 'bottom', 'right', 'width', 'height'],
			isHorizontal = opts.direction === 'left' || opts.direction === 'right',
			inverse = (opts.direction === 'right' || opts.direction === 'down' ? -1 : 1),
			hide = opts.mode === 'hide';
		
		return this.each(function() {
			const $el = $(this),
				from = {},
				to = {};
			
			if (opts.transform) {
				let translate = `translate${ isHorizontal ? 'X' : 'Y'}`,
					begin = inverse * 100,
					end = 0;
				
				if (hide) {
					end = -begin;
					begin = 0;
				}

				from.transform = `${translate }(${ begin }%)`;
				to.transform = `${translate }(${ end }%)`;
			}
			else {
				let pos, dist;
				if (isHorizontal) {
					pos = 'left';
					dist = $el.outerWidth(true);
				}
				else {
					pos = 'top';
					dist = $el.outerHeight(true);
				}

				from[pos] = inverse * dist;
				to[pos] = 0;
				
				if (hide) {
					to[pos] = -from[pos];
					from[pos] = 0;
				}
			}

			saveStyle($el, props);
			createWrapper($el);

			$el.css(from).transition(to, opts.duration, opts.easing, function() {
				restoreStyle($el, props);
				if (hide) {
					$el.hide();
				}
				removeWrapper($el);
			});
		});
	};

	$.each(['width', 'height'], function(i, val) {
		const natural = `natural${ capitalize(val)}`; 
		$.fn[natural] = function() {
			let el = this[0],
				size;

			if (typeof el[natural] !== 'undefined') {
				size = el[natural];
			}
			else {
				const img = document.createElement('img');
				img.src = this.attr('src');
				size = img[val];
			}
			return size;
		};
	});

	//center content to viewpoint
	$.fn.brCenter = function(winWidth, winHeight) {
		return this.each(function() {
			$(this).css({ top:(winHeight - $(this).naturalHeight())/2, left:(winWidth - $(this).naturalWidth())/2 });
		});
	};
	
	//fill (cover) content to viewpoint
	$.fn.brFill = function(winWidth, winHeight) {
		return this.each(function() {
			const imgRatio = $(this).naturalWidth()/$(this).naturalHeight(),
				winRatio = winWidth/winHeight;
			
			if (imgRatio < winRatio) {
				$(this).css({ width:winWidth, height:winWidth / imgRatio });
			}
			else {
				$(this).css({ width:winHeight * imgRatio, height:winHeight });
			}
			$(this).css({ top:(winHeight - $(this).height())/2, left:(winWidth - $(this).width())/2 });
		});
	};

	//fit (contain) content to viewpoint
	$.fn.brFit = function(winWidth, winHeight) {
		return this.each(function() {
			const imgRatio = $(this).naturalWidth()/$(this).naturalHeight(),
				winRatio = winWidth/winHeight;
			
			if (imgRatio < winRatio) {
				$(this).css({ width:winHeight * imgRatio, height:winHeight });
			}
			else {
				$(this).css({ width:winWidth, height:winWidth / imgRatio });
			}
			$(this).css({ top:(winHeight - $(this).height())/2, left:(winWidth - $(this).width())/2 });
		});
	};

	//stretch content to viewpoint
	$.fn.brStretch = function(winWidth, winHeight) {
		return this.each(function() {
			$(this).css({ top:0, left:0, width:winWidth, height:winHeight });
		});
	};

	//map shorthand data
	$.fn.brMapShorthand = function(key, props) {
		return this.each(function() {
			const val = $(this).data(key);
			if (!isEmptyStr(val)) {
				const values = val.split(' ');
				for (let i = 0; i < values.length && i < props.length; i++) {
					$(this).data(props[i], values[i]);
				}
			}
		});
	};

	//get total width of elements
	$.fn.brTotalWidth = function(includeMargin) {
		let width = 0;
		this.each(function() {
			width += $(this).outerWidth(includeMargin);
		});
		return width;
	};

	//get total height of elements
	$.fn.brTotalHeight = function(includeMargin) {
		let height = 0;
		this.each(function() {
			height += $(this).outerHeight(includeMargin);
		});
		return height;
	};
		
	//bind image handler
	$.fn.brHandleImage = function(src, settings) {
		let complete = $.isFunction(settings.complete) ? settings.complete : $.noop, 
			error = $.isFunction(settings.error) ? settings.error : $.noop,
			loadEvent = 'load';
			
		if (!isEmptyStr(settings.namespace)) {
			loadEvent += `.${ settings.namespace}`;
		}

		return this.each(function(n, img) {
			const $img = $(img);
			if ($img.is('img')) {
				$img.attr('src', '').one(loadEvent, complete).error(error).attr('src', src);
				if (typeof img.readyState !== 'undefined') {
					if (img.readyState === 'complete') {
						$img.trigger('load');
					}
				}
				else if (img.complete) {
					$img.trigger('load');
				}
			}
		});
	};

	$.fn.brPrev = function(selector) {
    	selector = selector || '';
	    return this.prev(selector).length ? this.prev(selector) : this.siblings(selector).addBack(selector).last();
	};

	$.fn.brNext = function(selector) {
    	selector = selector || '';
	    return this.next(selector).length ? this.next(selector) : this.siblings(selector).addBack(selector).first();
	};

	//check for border
	$.fn.brHasBorder = function() {
		for (let i = 0; i < SIDES.length; i++) {
			if (parseInt($(this).css(`border-${ SIDES[i] }-width`), 10) > 0) {
				return true;
			}
		}
		return false;
	};

	//copy border
	$.fn.brCopyBorder = function($el) {
		const props = ['width', 'style', 'color'],
			corners = ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'];
		
		return this.each(function() {
			for (let i = 0; i < SIDES.length; i++) {
				for (let j = 0; j < props.length; j++) {
					const name = `border-${ SIDES[i] }-${ props[j]}`;
					$(this).css(name, $el.css(name));
				}
			}
			
			for (let k = 0; k < corners.length; k++) {
				const radius = `border${ corners[k] }Radius`;
				$(this).css(radius, $el.css(radius));
			}
		});
	};

	//animation
	$.fn.animation = function() {
		let name = arguments[0], duration, easing, 
			direction, playState, fillMode,
			complete, always;

		if (typeof arguments[1] === 'object') {
			const opts = arguments[1];
			duration = opts.duration;
			easing = opts.easing;
			direction = opts.direction;
			playState = opts.playState;
			fillMode = opts.fillMode;
			complete = opts.complete;
			always = opts.always;
		}
		else {
			duration = arguments[1];
			easing = arguments[2];
			complete = arguments[3];
		}
		duration = getValue(duration, 400);
		easing = getValue(easing, 'ease');
		direction = getValue(direction, 'normal');
		playState = getValue(playState, 'running');
		fillMode = getValue(fillMode, 'forwards');
		
		const timingFn = (easing in CUBIC_BEZIER ? CUBIC_BEZIER[easing] : easing),
			props = { animationName:name, animationDuration:`${duration }ms`, animationTimingFunction:timingFn, animationDirection:direction, animationPlayState:playState, animationFillMode:fillMode };

		return this.each(function() {
			const $el = $(this);
			$el.queue(function(){
				if ($.isFunction(complete)) {
					$el.one(CSS_ANIMATION_END, complete);
				}
				
				if ($.isFunction(always)) {
					$el.one(`${CSS_ANIMATION_END }.always`, always);
				}
				
				$el.one(CSS_ANIMATION_END, function() {
					$el.dequeue();
				});
				
				$el.reflow().css(props);
			});
		});
	};

	//stop animation
	$.fn.stopAnimation = function(clearQueue, jumpToEnd) {
		return this.each(function() {
			const $el = $(this);
			if (clearQueue) {
				$el.clearQueue();
			}
			
			clearTimeout($el.data('timeout'));
			
			if (jumpToEnd) {
				$el.trigger(CSS_ANIMATION_END);
			}
			else {
				$el.trigger(`${CSS_ANIMATION_END }.always`).off(CSS_ANIMATION_END);
			}
			
			$el.css({ animation:'none' }).dequeue();
		});
	};

	//transition
	$.fn.transition = function() {
		let props = arguments[0],
			duration, easing, delay, 
			complete, always;
		
		if (typeof arguments[1] === 'object') {
			const opts = arguments[1];
			duration = opts.duration;
			easing = opts.easing;
			delay = opts.delay;
			complete = opts.complete;
			always = opts.always;
		}
		else {
			duration = arguments[1];
			easing = arguments[2];
			complete = arguments[3];
		}
		duration = getValue(duration, 400);
		easing = getValue(easing, 'ease');
		delay = getValue(delay, 0);
		props.transition = `all ${ duration }ms ${ CUBIC_BEZIER[easing] } ${ delay }ms`;

		return this.each(function() {
			const $el = $(this);
			$el.queue(function() {
				if ($.isFunction(complete)) {
					$el.one(CSS_TRANSITION_END, complete);
				}
				
				if ($.isFunction(always)) {
					$el.one(`${CSS_TRANSITION_END }.always`, always);
				}
				
				$el.one(CSS_TRANSITION_END, function() { 
					$el.dequeue();
				});
				
				$el.forceEnd(CSS_TRANSITION_END, duration).reflow().css(props);
			});
		});
	};
	
	//stop transition
	$.fn.stopTransition = function(clearQueue, jumpToEnd) {
		return this.each(function() {
			const $el = $(this);
			if (clearQueue) {
				$el.clearQueue();
			}
			
			clearTimeout($el.data('timeout'));
			
			if (jumpToEnd) {
				$el.trigger(CSS_TRANSITION_END);
			}
			else {
				$el.trigger(`${CSS_TRANSITION_END }.always`).off(CSS_TRANSITION_END);
			}
			
			$el.css({ transition:'none', transitionDuration:'0s' }).dequeue();
		});
	};
	
	//force reflow
	$.fn.reflow = function() {
		return this.each(function() {
			const reflow = this.offsetWidth;
		});
	};
	
	//force transition end
	$.fn.forceEnd = function(endEvent, duration) {
		return this.each(function() {
			let $el = $(this),
				called = false;
			
			$el.one(endEvent, function() { 
				called = true; 
			}).data('timeout', setTimeout(function() {
				if (!called) {
					$el.trigger(endEvent);
				}
			}, duration + 50));
		});
	};
	
	//add transition class
	$.fn.addTransitionClass = function(className) {
		return this.each(function() {
			if (SUPPORT.transition && !ANDROID2) {
				$(this).reflow().addClass(className);
			}
		});
	};
	
	const METHODS = {
  		play:'play',
  		pause:'pause',
		togglePlay:'togglePlay',
		prev:'prevSlide',
		next:'nextSlide',
		to:'selectSlide',
		option:'getOption',
		destroy:'destroy',
 	};
		
	$.fn.bannerRotator = function() {
		const args = arguments,
			params = args[0];
		
		if (params in METHODS) {
			let method = METHODS[params],
				val;

			this.each(function(n, el) {
				const instance = $(el).data(Rotator.PLUGIN); 
				if (instance) {
					val = instance[method].apply(instance, Array.prototype.slice.call(args, 1));
					if (typeof val !== 'undefined') {
						return false;
					}
				}
			});
			
			return (typeof val !== 'undefined' ? val : this);
		}
		else if (typeof params === 'object' || !params) {
			return this.each(function(n, el) {
				const opts = $.extend(true, {}, $.fn.bannerRotator.defaults, params),
					o = ($.metadata ? $.extend({}, opts, $.metadata.get(this)) : opts);

				$(el).data(Rotator.PLUGIN, new Rotator(el, o));
			});
		}
	};

	$.fn.bannerRotator.defaults = {
		responsive:true,
		width:1000,
		height:400,
		thumbWidth:32,
		thumbHeight:32,
		thumbMargin:3,
		buttonWidth:32,
		buttonHeight:32,
		buttonMargin:3,
		sideButtonMargin:0,
		tooltipWidth:'auto',
		tooltipHeight:'auto',
		navThumbWidth:100,
		navThumbHeight:75,
		autoPlay:true,
		delay:6000,
		startIndex:0,
		pauseOnHover:false,
		pauseOnInteraction:false,
		playOnce:false,
		timer:'pie',
		timerPosition:'right top',
		cssTransition:true,
		effect:'fade',
		duration:800,
		easing:'',
		effectOnStart:true,
		columns:1,
		rows:1,
		interval:100,
		alternate:false,
		autoReverse:true,
		depth:0,
		shapeShading:true,
		shapeDepth:0,
		kbEffect:'none',
		kbDuration:'auto',
		kbEasing:'linear',
		cpanelPosition:'left bottom',
		cpanelOrientation:'horizontal',
		cpanelOutside:false,
		cpanelOnHover:false,
		thumbnails:'number',
		selectOnHover:false,
		tooltip:'text',
		tooltipDelay:0,
		navButtons:'small',
		navButtonsOnHover:false,
		navThumbs:false,
		playButton:true,
		groupButtons:false,
		cpanelGap:0,
		hideControl:false,
		effectOnInteraction:true,
		layerEffect:'fade',
		layerDuration:500,
		layerEasing:'',
		layerDelay:0,
		layerEffectOut:'fade',
		layerDurationOut:500,
		layerEasingOut:'',
		layerDelayOut:0,
		layerSync:true,
		layerOutSync:true,
		layerOnHover:false,
		imagePosition:'fill',
		preload:false,
		shuffle:false,
		keyboard:true,
		mousewheel:false,
		swipe:'horizontal',
		swipeDirection:'normal',
		playText:'play',
		pauseText:'pause',
		prevText:'previous',
		nextText:'next',
	};
})(jQuery);