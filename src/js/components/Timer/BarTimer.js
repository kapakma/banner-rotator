import Timer from './Timer';

//Bar Timer Class
class BarTimer extends Timer {
    constructor(context, opts) {
        super(context, opts);

        this._$bar = $('<div/>');
        this._$timer
            .addClass('br-bar-timer')
            .addClass(/bottom/i.test(opts.position) ? 'br-bottom' : 'br-top')
            .append(this._$bar);
    }

    start(delay) {
        if (this._complete) {
            this._delay = delay;
        }

        this._startTime = Date.now();
        this._$bar.transition({ width: '101%' }, delay, 'linear');

        super.start();
    }

    stop() {
        this._elapsed = 0;
        this._$bar.stopTransition(true).width(0);

        super.stop();
    }

    pause() {
        this._$bar.stopTransition(true);
        this._elapsed += Date.now() - this._startTime;
        this._$bar.width(`${(this._elapsed / this._delay) * 101}%`);

        super.pause();
    }
}

export default BarTimer;
