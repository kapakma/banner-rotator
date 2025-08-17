import { isNone, getRandomItem, getNonNegInt, getValue, camelToDash } from '../../util/helpers';
import { SUPPORT } from '../../util/support';

//KenBurns Class
class KenBurns {
    constructor($img, effect, opts) {
        this._$img = $img;
        this._effect = effect;
        this._options = {};

        if (SUPPORT.animation && !isNone(this._effect)) {
            opts = opts || {};

            if (/^random/.test(this._effect)) {
                this._effect = this.getRandom();
            }
            else {
                this._effect = camelToDash(this._effect);
            }

            if (this._effect in KenBurns.REVERSES) {
                this._effect = KenBurns.REVERSES[this._effect];
                opts.direction = 'reverse';
            }

            this._effect = `br-${ this._effect}`;
            this._options = {
                duration: getNonNegInt(opts.duration, 5000),
                easing: getValue(opts.easing, 'linear'),
                playState: 'paused',
                direction: opts.direction,
            };

            this.set();
        }
    }

    set() {
        this._$img.stopAnimation(true).animation(this._effect, this._options);
    }

    start() {
        this._$img.css({ animationPlayState: 'running' });
    }

    stop() {
        this._$img.css({ animationPlayState: 'paused' });
    }

    restart() {
        this.set();
        this.start();
    }

    getRandom() {
        let name = this._effect.substring('random'.length).toUpperCase(),
            effects = KenBurns[name];

        if (!Array.isArray(effects)) {
            effects = KenBurns.EFFECTS;
        }

        return getRandomItem(effects);
    }
}

(function() {
    KenBurns.PAN = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];

    KenBurns.ZOOMIN = ['zoom-in'];

    KenBurns.ZOOMOUT = ['zoom-out'];

    $.each(KenBurns.PAN, function(i, val) {
        KenBurns.PAN[i] = `pan-${ val}`;
        KenBurns.ZOOMIN.push(`zoom-in-${ val}`);
        KenBurns.ZOOMOUT.push(`zoom-out-${ val}`);
    });

    KenBurns.ZOOM = KenBurns.ZOOMIN.concat(KenBurns.ZOOMOUT);

    KenBurns.EFFECTS = KenBurns.PAN.concat(KenBurns.ZOOM);

    KenBurns.REVERSES = {
        'pan-left': 'pan-right',
        'pan-up': 'pan-down',
        'pan-up-left': 'pan-down-right',
        'pan-up-right': 'pan-down-left',
        'zoom-out': 'zoom-in',
        'zoom-out-left': 'zoom-in-right',
        'zoom-out-right': 'zoom-in-left',
        'zoom-out-up': 'zoom-in-down',
        'zoom-out-down': 'zoom-in-up',
        'zoom-out-up-left': 'zoom-in-down-right',
        'zoom-out-up-right': 'zoom-in-down-left',
        'zoom-out-down-left': 'zoom-in-up-right',
        'zoom-out-down-right': 'zoom-in-up-left',
    };
}());

export default KenBurns;
