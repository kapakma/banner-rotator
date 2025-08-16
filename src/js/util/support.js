import { camelToDash, capitalize } from "./helpers";

export const SUPPORT = {};
export let PREFIX;
export let PREFIXES;
export let CSS_TRANSITION_END;
export let CSS_ANIMATION_END;
	
(function() {
    $.each(['transform', 'transition', 'transformStyle', 'animation', 'backgroundSize', 'pointerEvents'], function(i, val) {
        styleSupport(val);
    });
    
    SUPPORT.transform3d = propertySupport(SUPPORT.transform, 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
    SUPPORT.preserve3d = propertySupport(SUPPORT.transformStyle, 'preserve-3d');
    SUPPORT.cssFilter = filterSupport();

    switch(SUPPORT.transition) {
    case 'WebkitTransition':
        CSS_TRANSITION_END = 'webkitTransitionEnd';
        break;
    case 'OTransition':
        CSS_TRANSITION_END = 'otransitionend';
        break;
    default:
        CSS_TRANSITION_END = 'transitionend';
    }

    switch(SUPPORT.animation) {
    case 'WebkitAnimation':
        CSS_ANIMATION_END = 'webkitAnimationEnd';
        break;
    case 'OAnimation':
        CSS_ANIMATION_END = 'oanimationend';
        break;
    default:
        CSS_ANIMATION_END = 'animationend';
    }

    if (SUPPORT.animation && /^(Moz|Webkit|O)/.test(SUPPORT.animation)) {
        PREFIX = `-${ SUPPORT.animation.replace('Animation', '').toLowerCase() }-`;
        PREFIXES = [PREFIX];
    }
    else {
        PREFIX = '';
        PREFIXES = ['-moz-', '-ms-', '-webkit-'];
    }
}());


//check css property support
export function propertySupport(prop, val) {
    if (prop === false) {
        return false;
    }

    let dashProp = camelToDash(prop).replace(/^(moz-|webkit-|o-|ms-)/, '-$1'),
        el = document.createElement('div'),
        support;
    
    el.style[dashProp] = val;
    support = (`${el.style[dashProp] }`).indexOf(val) > -1;
    el = null;
    
    return support;
}

//check css filter support
export function filterSupport() {
    const el = document.createElement('div'),
        prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
        cssText = prefixes.join('filter:blur(2px); ');

    el.style.cssText = cssText;
    return !!el.style.length && (document.documentMode === undefined || document.documentMode > 9);
}

//check style property support
export function styleSupport(prop) {
    let el = document.createElement('div'),
        style = el.style,
        supported = false;

    if (prop in style) {
        supported = prop;
    }
    else {
        const capProp = capitalize(prop),
            prefixes = ['Moz', 'Webkit', 'O', 'ms'];
        
        for (let i = 0; i < prefixes.length; i++) {
            const prefixProp = prefixes[i] + capProp;
            if (prefixProp in style) {
                supported = prefixProp;
                break;
            }
        }
    }
    
    el = null;
    SUPPORT[prop] = supported;
    return supported;
}