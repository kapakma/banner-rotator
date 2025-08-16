import Timer from "./Timer";
import { getEnum } from "../../util/helpers.js";

//Pie Timer Class
class PieTimer extends Timer {
    constructor(context, opts) {
        super(context, opts);

        const css = {};
        const positions = opts.position.split(' ', 2);

        css[getEnum(positions[0], ['left', 'right'], 'right')] = 0;
        css[getEnum(positions[1], ['top', 'bottom'], 'top')] = 0;

        this._$spinner = $('<div/>', {
            'class': 'br-spinner',
            html: '<div/>',
        });

        this._$fill = $('<div/>', {
            'class': 'br-pie-fill',
            html: '<div/>',
        });

        this._$mask = $('<div/>', {
            'class': 'br-pie-mask',
        });

        this._$el = this._$spinner.add(this._$fill).add(this._$mask);

        this._$timer.addClass('br-pie-timer').css(css).append(this._$el);
    }

    start(delay) {
        if (this._complete) {
            this._delay = delay;
        }

        this._startTime = Date.now();
        this._$spinner.transition({ transform: 'rotate(360deg)' }, delay, 'linear');

        if (this._elapsed < this._delay/2) {
            const props = {
                duration: 0,
                easing: 'linear',
                delay: this._delay/2 - this._elapsed,
            };
            this._$fill.transition({ opacity: 1 }, props);
            this._$mask.transition({ opacity: 0 }, props);
        }

        super.start();
    }

    stop() {
        this._elapsed = 0;
        this._$el.stopTransition(true);
        this._$fill.css({ opacity: 0 });
        this._$mask.css({ opacity: 1 });
        this._$spinner.css({ transform: 'rotate(0)' });

        super.stop();
    }

    pause() {
        this._$el.stopTransition(true);
        this._elapsed += (Date.now() - this._startTime);

        const degree = (this._elapsed/this._delay * 360);
        this._$spinner.css({ transform: `rotate(${ degree }deg)` });
        if (this._elapsed < this._delay/2) {
            this._$fill.css({ opacity: 0 });
            this._$mask.css({ opacity: 1 });
        }

        super.pause();
    }
}

export default PieTimer;
