import { isFunction } from '../../utils/helpers';

//Timer Class
class Timer {
    constructor(context, opts) {
        if (context) {
            this._running = false;
            this._complete = true;
            this._$timer = $('<div/>').appendTo(context._$screen).addTransitionClass('br-element-transition');

            if (isFunction(opts.click)) {
                this._$timer.css({ cursor: 'pointer' }).on('click', opts.click);
            }

            this.addOnHover(context._$outmost, context._namespace);
        }
    }

    start() {
        this._running = true;
        this._complete = false;
        this._$timer.addClass('br-on');
        this.wake();
    }

    stop() {
        this._running = false;
        this._complete = true;
        this._$timer.removeClass('br-on');
    }

    pause() {
        this._running = false;
        this.sleep();
    }

    wake() {
        this._$timer.removeClass('br-timer-sleep');
    }

    sleep() {
        if (!this._running) {
            this._$timer.addClass('br-timer-sleep');
        }
    }

    addOnHover($parent, namespace) {
        $parent.on(`mouseenter${namespace}`, this.wake.bind(this))
            .on(`mouseleave${namespace}`, this.sleep.bind(this));
    }
}

export default Timer;
