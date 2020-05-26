/**
 * Promise
 * 具体API有：then、catch、finally、all、race、try、allSettled、resolve、reject、any
 * promise一共有3个状态：pending、fulfilled、rejected
 *
 * promise解决了回调地狱的问题
 */

// 经典红绿灯问题
// 题目：红灯3秒亮一次，绿灯1秒亮一次，黄灯2秒亮一次；如何让三个灯不断交替重复亮灯？（用 Promise 实现）
function red() {
    console.log('red');
}

function green() {
    console.log('green');
}

function yellow() {
    console.log('yellow');
}

// 解答：
function light(callback, time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            callback();
            resolve();
        }, time);
    });
}

function step() {
    Promise.resolve().then(() => {
        return light(red, 3000);
    }).then(() => {
        return light(green, 1000);
    }).then(() => {
        return light(yellow, 2000);
    }).then(() => {
        step();
    });
}
step();

/* ====================================================================================== */

// 实现promisify，将callback类型转成promise实现
// 假设callback函数第一个参数时错误信息，没有错误时为null
function promisify(original) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            args.push(function callback(err, ...values) {
                if (err) return reject(err);
                return resolve(...values);
            });
            original.call(this, ...args);
        });
    };
}
// var getID = promisify(fetchID);
// getID('123').then(res => {/* ... */});



