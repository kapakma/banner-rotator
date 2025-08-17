import { getKeys, roundTo, degreesToRadians, getPosInt, getNonNegInt, capitalize, getTransformProperty, getRandomItem, shuffleArray, isFunction, isNumeric } from "../../util/helpers";
import { SUPPORT, PREFIX } from "../../util/support";
import PRESETS from '../../util/presets';

//Transition Class
class Transition {
    constructor(context) {
        if (context) {
            this._timeout = null;
            this._requestId = null;
            this._context = context;
            this._$container = $('<div/>', { 'class': 'br-effects' }).appendTo(this._context._$screen);
            this._transform = this._context._transform;
            this._support3d = SUPPORT.transform3d && SUPPORT.preserve3d && this._context._cssTransition;
        }
    }

    //create elements
    createElements() {
        let total = this._rows * this._columns,
            inner = this._is3D ? Transition.CUBOID : Transition.PLANE,
            content = '';

        while (total--) {
            content += `<div class="br-effect">${ inner }</div>`;
        }
        this._$container.toggleClass('br-2d', !this._is3D).html(content);
        this._$el = this._$container.children();

        if (this._shapeColor) {
            this._$el.find('>.br-shape').children().css({ backgroundColor: this._shapeColor });
        }
    }

    //set elements
    initElements() {
        let $curr = this.getCurrImage(),
            currTop = $curr.position().top,
            currLeft = $curr.position().left,
            $prev = this.getPrevImage(),
            prevTop,
            prevLeft;

        if ($prev) {
            prevTop = $prev.position().top;
            prevLeft = $prev.position().left;
        }

        this.addImage();
        let availHeight = this._$container.height();
        for (let i = 0; i < this._rows; i++) {
            let availWidth = this._$container.width(),
                height = Math.min(this._height, availHeight);
            availHeight -= height;
            for (let j = 0; j < this._columns; j++) {
                const width = Math.min(this._width, availWidth),
                    top = i * this._height,
                    left = j * this._width,
                    $el = this._$el.eq(i * this._columns + j),
                    $shape = $($el[0].firstChild);

                $el.css({ top: top, left: left, width: width, height: height });
                $shape.find('>.br-prev-side>img').css({ left: (prevLeft - left), top: (prevTop - top) }).end()
                    .find('>.br-active-side>img').css({ left: (currLeft - left), top: (currTop - top) });

                if (this._is3D) {
                    this.setCuboid($shape, width, height, $el.data('depth'));
                }

                availWidth -= width;
            }
        }

        this._$el.css({ visibility: 'visible' });

        if (this._hideItems) {
            this._context._$items.css({ visibility: 'hidden' });
        }
    }

    //clear elements
    clear() {
        clearTimeout(this._timeout);
        cancelAnimationFrame(this._requestId);
        this._$container.empty();
        this._progress = false;
    }

    //get type
    getType() {
        if (this._rows > 1) {
            if (this._columns > 1) {
                return Transition.GRID;
            }
            else {
                return Transition.ROW;
            }
        }
        else if (this._columns > 1) {
            return Transition.COLUMN;
        }

        return 'none';
    }

    //init order
    initOrder() {
        if ($.inArray(this._order, Transition.ORDERS) < 0) {
            this._order = 'right';
        }

        if (this._context._backward && this._autoReverse) {
            this._order = this.getOpposite(this._order);
        }
    }

    //init direction
    initDirection() {
        if ($.inArray(this._direction, ['up', 'down', 'left', 'right', 'random']) < 0) {
            this._direction = 'right';
        }

        if (this._context._backward && this._autoReverse) {
            this._direction = this.getOpposite(this._direction);
        }
    }

    //get opposite
    getOpposite(val) {
        if (val in Transition.OPPOSITE) {
            return Transition.OPPOSITE[val];
        }
        return val;
    }

    //get current image
    getCurrImage() {
        if (this._context._$currItem) {
            return this._context._$currItem.find('>img.br-img');
        }
    }

    //get previous image
    getPrevImage() {
        if (this._context._$prevItem) {
            return this._context._$prevItem.find('>img.br-img');
        }
    }

    //add element's image
    addImage() {
        $.each({ '>.br-active-side': this.getCurrImage(), '>.br-prev-side': this.getPrevImage() },
            $.proxy(function(selector, $img) {
                if ($img && $img.length) {
                    const rect = $img[0].getBoundingClientRect(),
                        width = rect.width || $img.width(),
                        height = rect.height || $img.height(),
                        $newImg = $('<img/>', { src: $img.attr('src'), alt: '', css: { width: width, height: height } });
                    this._$el.find('>.br-shape').find(selector).html($newImg);
                }
            }, this));
    }

    //set cuboid
    setCuboid($cuboid, width, height, depth) {
        const widthZ = `translateZ(${ width/2 }px)`,
            heightZ = `translateZ(${ height/2 }px)`,
            depthZ = `translateZ(${ depth/2 }px)`,
            left = (width - depth)/2,
            top = (height - depth)/2,
            invert = $cuboid.find('>.br-face-back').hasClass('br-inverted') ? 'rotate(180deg) ' : '';

        $cuboid.find('>.br-face-front').css({ transform: depthZ }).end()
            .find('>.br-face-back').css({ transform: `rotateY(180deg) ${ invert }${depthZ}` }).end()
            .find('>.br-face-left').css({ width: depth, left: left, transform: `rotateY(-90deg) ${ widthZ}` }).end()
            .find('>.br-face-right').css({ width: depth, left: left, transform: `rotateY(90deg) ${ widthZ}` }).end()
            .find('>.br-face-top').css({ height: depth, top: top, transform: `rotateX(90deg) ${ heightZ}` }).end()
            .find('>.br-face-bottom').css({ height: depth, top: top, transform: `rotateX(-90deg) ${ heightZ}` });
    }

    //update keyframes
    updateKeyframes() {
        let sheet = this._context._sheet,
            index = this._context._activeIndex,
            size, arr, pct,
            offset = 0;

        if (isNumeric(this._depth)) {
            size = this._depth;
            arr = [0, 1, 0];
            pct = ['0%', '50%', '100%'];
        }
        else {
            if (this._effect === 'flip') {
                size = (this._direction === 'up' || this._direction === 'down' ? this._height : this._width)/2;
                arr = Transition.SINES;
                pct = Transition.FLIP_PCT;
            }
            else {
                size = this._$el.data('depth')/2;
                offset = size;
                size /= Math.cos(degreesToRadians(45));
                arr = Transition.COSINES;
                pct = Transition.ROTATE_PCT;
            }
        }

        let length = arr.length,
            rule = `@${ PREFIX }keyframes ` + `br-${ this._context._uid }-${ index}` + ` { `;

        for (let i = 0; i < length; i++) {
            const val = (arr[i] * size);
            rule += (`${pct[i] } { ${ getTransformProperty(`translateZ(${ Math.min(0, offset - val) }px)`) } } `);
        }
        rule += '} ';

        try {
            sheet.deleteRule(index);
            sheet.insertRule(rule, index);
        }
        catch (error) {
            throw new Error(`Failed to update rule: ${error.message}`);
        }
    }

    //animate elements
    animate(elArray, duration, easing) {
        if (this._is3D) {
            this.updateKeyframes();

            if (this._shapeShading) {
                const shadeDuration = (this._effect === 'flip' ? duration/2 : duration);
                this._$el.find('>.br-shape>.br-prev-side').each(function() {
                    $('<div/>', { 'class': 'br-shading' }).animation('br-shade-in',
                        { duration: shadeDuration, easing: easing, playState: 'paused', complete: function(e) {
                            e.stopPropagation();
                        } }).appendTo($(this));
                });
            }
        }

        const props = { duration: duration, easing: easing };
        this._requestId = requestAnimationFrame($.proxy(function() {
            this.animateElement(elArray, props);
        }, this));
    }

    //animate active element
    animateElement(elArray, options) {
        const $el = $(elArray.shift()),
            selector = $el.data('selector'),
            $active = (selector ? $el.find(selector) : $el),
            promises = [],
            isLast = !elArray.length;

        if (this._is3D) {
            const opts = $.extend({}, options);
            if (isLast) {
                const d2 = $.Deferred();
                promises.push(d2.promise());
                opts.complete = function() {
                    d2.resolve();
                };
            }
            $el.animation(`br-${ this._context._uid }-${ this._context._activeIndex}`, opts)
                .find('>.br-shape>.br-prev-side>.br-shading').css({ animationPlayState: 'running' });
        }

        if (isLast) {
            const d1 = $.Deferred();
            promises.push(d1.promise());
            options.complete = function() {
                d1.resolve();
            };

            $.when.apply(null, promises).always($.proxy(function() {
                this._context.activateItem(false);
                this._$container.empty();
                this._progress = false;
            }, this));
        }

        $active.transition($el.data('to'), options);

        if (!isLast) {
            this._timeout = setTimeout($.proxy(function() {
                this._requestId = requestAnimationFrame($.proxy(function() {
                    this.animateElement(elArray, options);
                }, this));
            }, this), this._interval);
        }
    }

    getPromises() {
        const promises = [];
        this.getCurrImage().add(this.getPrevImage()).each(function(n, el) {
            const $el = $(el);
            if ($el && $el.length) {
                const $img = $el.clone(),
                    img = $img[0];

                if (typeof img.readyState !== 'undefined') {
                    if (img.readyState === 'complete') {
                        return false;
                    }
                }
                else if (img.complete) {
                    return false;
                }

                const deferred = $.Deferred();
                promises.push(deferred.promise());
                $img.brHandleImage($img.attr('src'), {
                    complete: function() {
                        deferred.resolve();
                    },
                    error: function() {
                        deferred.reject();
                    },
                });
            }
        });

        return promises;
    }

    inProgress() {
        return this._progress;
    }

    //get ordered element array
    getElementArray() {
        let elements;
        switch (this._order) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
            elements = this.getDirectionalArray(this._order);
            break;
        case 'upLeft':
        case 'upRight':
        case 'downLeft':
        case 'downRight':
            elements = this.getDiagonalArray(this._order);
            break;
        case 'spiralIn':
        case 'spiralOut':
            elements = this.getSpiralArray();
            break;
        case 'zigZagUp':
        case 'zigZagDown':
        case 'zigZagLeft':
        case 'zigZagRight':
            elements = this.getZigZagArray(this._order);
            break;
        case 'random':
            elements = this._$el.toArray();
            shuffleArray(elements);
            break;
        default:
            elements = this._$el.toArray();
        }

        if (this._isReverse) {
            elements.reverse();
        }

        return elements;
    }

    setFn(fn, dir) {
        let setter = `set${ capitalize(fn)}`,
            name = setter + capitalize(dir);

        if (!isFunction(this[name])) {
            name = setter + capitalize(this._direction);
        }
        return name;
    }

    setAlternate(fn) {
        this[this.setFn(fn, this._direction)](this._$el.filter(':even'));
        this[this.setFn(fn, this.getOpposite(this._direction))](this._$el.filter(':odd'));
    }

    setRandomDirection($el, fn, directions) {
        if (!directions) {
            directions = ['up', 'down', 'left', 'right'];
        }

        $el.each(function() {
            $(this).data({ dir: getRandomItem(directions) });
        });

        $.each(directions, $.proxy(function(i, dir) {
            const $items = $el.filter(function() {
                return $(this).data('dir') === dir;
            });
            this[this.setFn(fn, dir)]($items);
        }, this));
    }

    //cover helper
    setCoverDown($el) {
        this.setPush($el, 'hidden', 'Y', true);
    }

    setCoverUp($el) {
        this.setPush($el, 'hidden', 'Y', false);
    }

    setCoverRight($el) {
        this.setPush($el, 'hidden', 'X', true);
    }

    setCoverLeft($el) {
        this.setPush($el, 'hidden', 'X', false);
    }

    setCoverRandom($el) {
        this.setRandomDirection($el, 'cover');
    }

    //push helper
    setPushDown($el) {
        this.setPush($el, 'visible', 'Y', true);
    }

    setPushUp($el) {
        this.setPush($el, 'visible', 'Y', false);
    }

    setPushRight($el) {
        this.setPush($el, 'visible', 'X', true);
    }

    setPushLeft($el) {
        this.setPush($el, 'visible', 'X', false);
    }

    setPushRandom($el) {
        this.setRandomDirection($el, 'push');
    }

    setPush($el, visibility, axis, fwd) {
        let active = 'front',
            prev = 'back',
            dim = (axis === 'Y' ? 'height' : 'width'),
            from, to;

        if (this._transform) {
            const translate = `translate${ axis}`;
            from = { transform: `${translate }(-50%)` };
            to = { transform: `${translate }(0)` };
        }
        else {
            const pos = (axis === 'Y' ? 'top' : 'left');
            from = {};
            to = {};
            from[pos] = -this[`_${ dim}`];
            to[pos] = 0;
        }

        if (!fwd) {
            let temp = from;
            from = to;
            to = temp;

            temp = prev;
            prev = active;
            active = temp;
        }

        $el.data({ to: to }).find('>.br-shape').addClass(`br-extend-${ dim}`).css(from)
            .find(`>.br-${ active}`).addClass('br-active-side').end()
            .find(`>.br-${ prev}`).addClass('br-prev-side').css('visibility', visibility);
    }

    //move helper
    setMoveDown($el) {
        this.setMove($el, 'Y', -this._$container.height());
    }

    setMoveUp($el) {
        this.setMove($el, 'Y', this._$container.height());
    }

    setMoveRight($el) {
        this.setMove($el, 'X', -this._$container.width());
    }

    setMoveLeft($el) {
        this.setMove($el, 'X', this._$container.width());
    }

    setMoveRandom($el) {
        this.setRandomDirection($el, 'move');
    }

    setMove($el, axis, dist) {
        let from, to;
        if (this._transform) {
            const translate = `translate${ axis}`;
            from = { transform: `${translate }(${ dist }px)` };
            to = { transform: `${translate }(0)` };
        }
        else {
            if (axis === 'Y') {
                from = { marginTop: dist };
                to = { marginTop: 0 };
            }
            else {
                from = { marginLeft: dist };
                to = { marginLeft: 0 };
            }
        }

        $el.data({ to: to }).css(from).find('>.br-shape')
            .find('>.br-front').addClass('br-active-side').end()
            .find('>.br-back').hide();
    }

    //rotate helper fns
    setRotateDown($el) {
        this.setRotate($el, 'X', false);
    }

    setRotateUp($el) {
        this.setRotate($el, 'X', true);
    }

    setRotateRight($el) {
        this.setRotate($el, 'Y', true);
    }

    setRotateLeft($el) {
        this.setRotate($el, 'Y', false);
    }

    setRotateRandom($el) {
        this.setRandomDirection($el, 'rotate', ['up', 'down']);
    }

    setRotate($el, axis, positive) {
        let transform = `translateZ(${ -$el.data('depth')/2 }px) rotate${ axis}`,
            sign, side;

        if (positive) {
            sign = '';
            side = (axis === 'X' ? 'bottom' : 'left');
        }
        else {
            sign = '-';
            side = (axis === 'X' ? 'top' : 'right');
        }

        $el.data({ to: { transform: `${transform }(${ sign }90deg)` } })
            .find('>.br-shape').css({ transform: `${transform }(0deg)` })
            .find(`>.br-face-${ side}`).addClass('br-active-side').end()
            .find('>.br-face-front').addClass('br-prev-side');
    }

    //flip helper fns
    setFlipDown($el) {
        this.setFlip($el, 'X', false);
    }

    setFlipUp($el) {
        this.setFlip($el, 'X', true);
    }

    setFlipRight($el) {
        this.setFlip($el, 'Y', true);
    }

    setFlipLeft($el) {
        this.setFlip($el, 'Y', false);
    }

    setFlipRandom($el) {
        this.setRandomDirection($el, 'flip');
    }

    setFlip($el, axis, positive) {
        const transform = `translateZ(${ -$el.data('depth')/2 }px) rotate${ axis}`,
            sign = positive ? '' : '-';

        $el.data({ to: { transform: `${transform }(${ sign }180deg)` } })
            .find('>.br-shape').css({ transform: `${transform }(0deg)` })
            .find('>.br-face-front').addClass('br-prev-side').end()
            .find('>.br-face-back').addClass('br-active-side').toggleClass('br-inverted', axis === 'X');
    }

    //fade effect
    fade() {
        const selector = '>.br-shape';
        this._$el.data({ selector: selector, to: { opacity: 1 } })
            .find(selector).css({ opacity: 0 })
            .find('>.br-front').addClass('br-active-side').end()
            .find('>.br-back').hide();
    }

    //zoom effect
    zoom() {
        let front = 'br-active-side',
            back = 'br-prev-side',
            from = { opacity: 1, transform: 'scale(1)' },
            to = { opacity: 0, transform: 'scale(2)' };

        if (this._direction === 'out') {
            let temp = from;
            from = to;
            to = temp;

            temp = front;
            front = back;
            back = temp;
        }

        this._$el.data({ selector: '>.br-shape>.br-back', to: to })
            .find('>.br-shape').addClass('br-stack')
            .find('>.br-front').addClass(front).end()
            .find('>.br-back').addClass(back).css(from);
    }

    //expand effect
    expand() {
        let selector = '>.br-shape',
            from, to;

        if (this._transform) {
            from = { transform: 'scale(0)' };
            to = { transform: 'scale(1)' };
        }
        else {
            from = { width: 0, height: 0 };
            to = { width: this._width, height: this._height };
        }

        this._$el.data({ selector: selector, to: to })
            .find(selector).css(from)
            .find('>.br-front').addClass('br-active-side').end()
            .find('>.br-back').hide();
    }

    //push effect
    push() {
        if (this._alternate) {
            this.setAlternate('push');
        }
        else {
            this[this.setFn('push', this._direction)](this._$el);
        }

        this._$el.data({ selector: '>.br-shape' });
    }

    //cover transition
    cover() {
        if (this._alternate) {
            this.setAlternate('cover');
        }
        else {
            this[this.setFn('cover', this._direction)](this._$el);
        }

        this._$el.data({ selector: '>.br-shape' });
    }

    //slide transition
    slide() {
        this._autoReverse = true;
        this._direction = this.getOpposite(this._direction);

        if (this._alternate) {
            this.setAlternate('push');
        }
        else {
            this[this.setFn('push', this._direction)](this._$el);
        }

        this._$el.data({ selector: '>.br-shape' });
    }

    //move transition
    move() {
        this._isReverse = !this._isReverse;
        this[this.setFn('move', this._direction)](this._$el);
    }

    //flip transition
    flip() {
        this._$el.data({ selector: '>.br-shape', depth: this._shapeDepth });
        if (this._alternate) {
            this.setAlternate('flip');
        }
        else {
            this[this.setFn('flip', this._direction)](this._$el);
        }
    }

    //rotate transition
    rotate() {
        this._$el.data({ selector: '>.br-shape', depth: (this._direction === 'left' || this._direction === 'right' ? this._width : this._height) });
        if (this._alternate) {
            this.setAlternate('rotate');
        }
        else {
            this[this.setFn('rotate', this._direction)](this._$el);
        }
    }

    start(opts) {
        this._progress = true;

        $.each(Transition.DATA, $.proxy(function(i, val) {
            this[`_${ val}`] = opts[val];
        }, this));

        this._columns = getPosInt(this._columns, 1);
        this._rows = getPosInt(this._rows, 1);
        this._width = Math.ceil(this._$container.width()/this._columns);
        this._height = Math.ceil(this._$container.height()/this._rows);

        if (this._effect === 'random') {
            this.setRandomEffect();
        }

        this._is3D = $.inArray(this._effect, ['flip', 'rotate']) > -1;
        if (this._is3D && !this._support3d) {
            this._effect = 'push';
            this._is3D = false;
        }

        this._interval = getNonNegInt(this._interval, 0);
        this._shapeDepth = getNonNegInt(this._shapeDepth, 0);
        this.initDirection();
        this.initOrder();
        this._isReverse = $.inArray(this._order, Transition.REVERSE) > -1;
        this._hideItems = $.inArray(this._effect, ['flip', 'push', 'rotate', 'slide', 'zoom']) > -1;

        this.createElements();
        this[this._effect]();
        this.initElements();

        const arr = this.getElementArray(),
            duration = getNonNegInt(opts.duration, $.fn.bannerRotator.defaults.duration),
            easing = opts.easing;

        this.animate(arr, duration, easing);
    }

    setRandomEffect() {
        const type = this.getType(),
            preset = getRandomItem(PRESETS[type]);

        $.each(['effect', 'direction', 'order'], $.proxy(function(i, val) {
            this[`_${ val}`] = preset[val];
        }, this));
    }

    //get diagonal array
    getDiagonalArray(order) {
        let elArray = [],
            start = 0,
            end = (this._rows - 1) + (this._columns - 1) + 1,
            flip = (order === 'downLeft' || order === 'upRight');

        while (start !== end) {
            let i = Math.min(this._rows - 1, start);
            while(i >= 0) {
                let j;
                if (flip) {
                    j = (this._columns - 1) - Math.abs(i - start);
                    if (j < 0) {
                        break;
                    }
                }
                else {
                    j = Math.abs(i - start);
                    if (j >= this._columns) {
                        break;
                    }
                }

                elArray.push(this._$el.eq(i * this._columns + j));
                i--;
            }
            start++;
        }

        return elArray;
    }

    //get zig-zag array
    getZigZagArray(order) {
        let i = 0,
            j = 0,
            fwd = true,
            elArray = [],
            total = this._$el.length,
            count;

        if (order === 'zigZagUp' || order === 'zigZagDown') {
            for (count = 0; count < total; count++) {
                elArray[count] = this._$el.eq(i * this._columns + j);

                if (fwd) {
                    j++;
                }
                else {
                    j--;
                }

                if (j === this._columns || j < 0) {
                    fwd = !fwd;
                    j = (fwd ? 0 : this._columns - 1);
                    i++;
                }
            }
        }
        else {
            for (count = 0; count < total; count++) {
                elArray[count] = this._$el.eq(i * this._columns + j);

                if (fwd) {
                    i++;
                }
                else {
                    i--;
                }

                if (i === this._rows || i < 0) {
                    fwd = !fwd;
                    i = (fwd ? 0 : this._rows - 1);
                    j++;
                }
            }
        }

        return elArray;
    }

    //get directional array
    getDirectionalArray(order) {
        let elArray;
        if (order === 'right' || order === 'left') {
            elArray = [];
            for (let j = 0; j < this._columns; j++) {
                for (let i = 0; i < this._rows; i++) {
                    elArray.push(this._$el.eq(i * this._columns + j));
                }
            }
        }
        else {
            elArray = this._$el.toArray();
        }

        return elArray;
    }

    //get spiral array
    getSpiralArray() {
        let i = 0,
            j = 0,
            rowCount = this._rows - 1,
            colCount = this._columns - 1,
            dir = 0,
            limit = colCount,
            elArray = [];

        while (rowCount >= 0 && colCount >=0) {
            let count = 0;
            while(true) {
                elArray.push(this._$el.eq(i * this._columns + j));
                if ((++count) > limit) {
                    break;
                }
                switch(dir) {
                case 0:
                    j++;
                    break;
                case 1:
                    i++;
                    break;
                case 2:
                    j--;
                    break;
                case 3:
                    i--;
                    break;
                }
            }
            switch(dir) {
            case 0:
                dir = 1;
                limit = (--rowCount);
                i++;
                break;
            case 1:
                dir = 2;
                limit = (--colCount);
                j--;
                break;
            case 2:
                dir = 3;
                limit = (--rowCount);
                i--;
                break;
            case 3:
                dir = 0;
                limit = (--colCount);
                j++;
                break;
            }
        }

        return elArray;
    }
}

Transition.DATA = ['effect', 'columns', 'rows', 'interval', 'direction', 'order', 'alternate', 'autoReverse', 'depth', 'shapeColor', 'shapeShading', 'shapeDepth'];

Transition.CUBOID= '<div class="br-cuboid br-shape">\
                    <div class="br-face-front"></div>\
                    <div class="br-face-back"></div>\
                    <div class="br-face-left"></div>\
                    <div class="br-face-right"></div>\
                    <div class="br-face-top"></div>\
                    <div class="br-face-bottom"></div>\
                </div>';

Transition.PLANE = '<div class="br-plane br-shape">\
                    <div class="br-front"></div>\
                    <div class="br-back"></div>\
                </div>';

Transition.COLUMN = 'column';

Transition.ROW = 'row';

Transition.GRID = 'grid';

Transition.EFFECTS = ['cover', 'expand', 'fade', 'flip', 'move', 'push', 'rotate', 'slide', 'zoom'];

Transition.OPPOSITE = {
    down: 'up',
    right: 'left',
    downLeft: 'upRight',
    downRight: 'upLeft',
    spiralIn: 'spiralOut',
    zigZagDown: 'zigZagUp',
    zigZagRight: 'zigZagLeft',
};

(function() {
    Transition.REVERSE = [];
    $.each(Transition.OPPOSITE, function(key, val) {
        Transition.OPPOSITE[val] = key;
        Transition.REVERSE.push(val);
    });

    Transition.ORDERS = getKeys(Transition.OPPOSITE);
    Transition.ORDERS.push('random');
}());

(function() {
    Transition.SINES = [];
    Transition.FLIP_PCT = [];
    let num = 20,
        radian = Math.PI,
        step = radian/num;

    for (let i = 0; i <= num; i++) {
        Transition.FLIP_PCT[i] = `${Math.round(i/num * 100) }%`;
        Transition.SINES[i] = roundTo(Math.sin(radian), 5);
        radian -= step;
    }
}());

(function() {
    Transition.COSINES = [];
    Transition.ROTATE_PCT = [];
    let num = 45,
        radian = degreesToRadians(45),
        step = radian/(num/2);

    for (let i = 0; i <= num; i++) {
        Transition.ROTATE_PCT[i] = `${Math.round(i/num * 100) }%`;
        Transition.COSINES[i] = roundTo(Math.cos(radian), 5);
        radian -= step;
        if (radian <= 0) {
            step = -step;
        }
    }
}());

export default Transition;
