/**
 * 节流
 * 用户连续触发，每隔一段时间只执行一次
 */

// 第一版
// 使用时间戳
function throttle1(fn, wait) {
    var timer, previous = 0;
    return function () {
        var self = this,
            now = new Date().getTime(); // 也可以使用 +new Date()
        if (now - previous >= wait) {
            fn.apply(self, arguments);
            previous = now;
        }
    }
}

// 第二版
// 使用定时器
function throttle2(fn, wait) {
    var timer;
    return function () {
        var self = this,
            args = Array.prototype.slice.apply(arguments);
        if (!timer) {
            timer = setTimeout(function () {
                fn.apply(self, args);
                timer = null;
            }, wait);
        }
    }
}

// 第三版
// 第一次触发立刻执行，停止触发后隔一段时间后再次执行
function throttle3(fn, wait) {
    var timer, previous = 0;

    return function () {
        var self = this,
            args = Array.prototype.slice.apply(arguments),
            now = new Date().getTime(),
            interval = now - previous;
        if (interval >= wait) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            fn.apply(self, args);
            previous = now;
        } else {
            timer = setTimeout(function () {
                previous = new Date().getTime();
                fn.apply(self, args);
                timer = null;
            }, wait - interval);
        }
    }
}