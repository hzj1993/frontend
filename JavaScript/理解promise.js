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

/** ============================================================================================================= **/

// 实现一个简单的promise

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromiseSimple(fn) {
    const self = this;
    self.value = null;
    self.error = null;
    self.state = PENDING;
    self.resolvedCallbacks = [];
    self.rejectedCallbacks = [];

    const resolve = value => {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = FULFILLED;
                self.value = value;
                self.resolvedCallbacks.map(cb => cb(self.value));
            }
        });
    };

    const reject = error => {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = REJECTED;
                self.error = error;
                self.rejectedCallbacks.map(cb => cb(self.error));
            }
        });
    };

    fn(resolve, reject);
}

MyPromiseSimple.prototype.then = function (onFulfilled, onRejected) {
    const self = this;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {
        throw r;
    };
    if (self.state === PENDING) {
        self.resolvedCallbacks.push(onFulfilled);
        self.rejectedCallbacks.push(onRejected);
    } else if (self.state === FULFILLED) {
        onFulfilled(self.value);
    } else if (self.state === REJECTED) {
        onRejected(self.error);
    }
    return self;
};

/** ============================================================================================================== **/

// 实现一个符合 Promise/A+ 规范的 Promise
// Promise/A+ 规范地址：https://www.ituring.com.cn/article/66566

function MyPromise(fn) {
    const self = this;
    self.state = PENDING;
    self.value = null;
    self.resolvedCallbacks = [];
    self.rejectedCallbacks = [];

    function resolve(value) {
        // 如果resolve的参数是promise对象，返回它
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        setTimeout(() => {
            if (self.state === PENDING) {
                self.state = FULFILLED;
                self.value = value;
                self.resolvedCallbacks.map(cb => cb(self.value));
            }
        }, 0);
    }

    function reject(error) {
        setTimeout(() => {
            if (self.state === PENDING) {
                self.state = REJECTED;
                self.value = error;
                self.rejectedCallbacks.map(cb => cb(self.value));
            }
        }, 0);
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
    const self = this;
    let promise2;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
        throw err;
    };
    if (self.state === PENDING) {
        return (promise2 = new MyPromise((resolve, reject) => {
            self.resolvedCallbacks.push(() => {
                try {
                    const x = onFulfilled(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.rejectedCallbacks.push(() => {
                try {
                    const x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        }));
    }
};

function resolutionProcedure(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('error'));
    }

}



























