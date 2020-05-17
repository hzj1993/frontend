/**
 * 防抖：
 * 一段时间内多次触发，最终只会执行一次
 */

// 第一版
function debounce1(fn, wait) {
    var timer;
    return function () {
        var self = this,
            args = Array.prototype.slice.apply(arguments);
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(self, args);
        }, wait);
    };
}

/**
 * 防抖
 * 新需求：不希望非要等到事件停止触发后才执行，我希望立刻执行函数，
 * 然后等到停止触发 n 秒后，才可以重新触发执行。
 * @param {function} fn 触发的函数
 * @param {number} wait 防抖等待的时间
 * @param {boolean} immediate 是否触发后立即执行
 * @returns {function(...[*]=)}
 */
function debounce2(fn, wait, immediate) {
    var timer;
    return function () {
        var self = this,
            args = Array.prototype.slice.apply(arguments);

        if (timer) clearTimeout(timer);

        if (immediate) {
            var callNow = !timer;
            timer = setTimeout(function () {
                timer = null;
            }, wait);
            if (callNow) fn.apply(self, args);
        } else {
            timer = setTimeout(function () {
                fn.apply(self, args);
            }, wait);
        }
    };
}

// 在上面的基础上优化...
// fn可能会有返回值
function debounce3(fn, wait, immediate) {
    var timer;
    return function () {
        var self = this,
            ret,
            args = Array.prototype.slice.apply(arguments);

        if (timer) clearTimeout(timer);

        if (immediate) {
            var callNow = !timer;
            timer = setTimeout(function () {
                timer = null;
            }, wait);
            if (callNow) ret=fn.apply(self, args);
        } else {
            timer = setTimeout(function () {
                fn.apply(self, args);
            }, wait);
        }
        return ret
    };
}