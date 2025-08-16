import { getTransformProperty } from "./helpers";
export const FROM_KEYFRAME = '0% { ' + getTransformProperty('translateZ(0px)') + ' } ';
export const TO_KEYFRAME = '10' + FROM_KEYFRAME;

(function() {
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    cancelAnimationFrame  = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || $.noop;

    if (!requestAnimationFrame) {
        requestAnimationFrame = function(callback, element) {
            callback.call(null);
        };
    } 	
}());