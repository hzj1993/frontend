/**
 * 我们先来看看如下代码：
 * 比较简单，就是 Child 类继承了 Parent 类，继承了 Parent 中的 name，同时 Child 本身拥有 age 属性
 * class 关键字其实是 JavaScript 的语法糖，实质上离不开构造函数
 * extends 关键字实质上也是通过 prototype 实现继承的
 */
class Parent {
    constructor(name) {
        this.name = name;
    }
}

class Child extends Parent {
    constructor(name, age) {
        super(name); // 调用父类的 constructor(name)
        this.age = age;
    }
}

var child1 = new Child('kevin', '18');

console.log(child1);

// 继承后可以得到这样的结果：
console.log(Child.__proto__ === Parent); // true
console.log(Child.prototype.__proto__ === Parent.prototype); // true
// 因为 Child 本身也是函数对象，也有 __proto__ 属性，__proto__ 指向 Parent
// 同时 Child.prototype.__proto__ 指向Parent.prototype

// 我们可以想象一下 ES5 中继承的实现：
function Parent1(name) {
    this.name = name;
}

function Child1(name, age) {
    Parent.call(this, name);
    this.age = age;
}

Child1.prototype = Object.create(Parent1.prototype);
Child1.prototype.constructor = Child1;
var child2 = new Child1('Jack', '26');
console.log(child2);
// 其中 Object.create 的实现过程如下：
// function create(obj) {
//     function F() {}
//     F.prototype = obj;
//     return new F();
// }
// 通过上面create的实现就可以得出： Child.prototype.__proto__ === Parent.prototype

// extends 的继承中，Parent 可以为 null，即：
// class Chlid extends null {
//     ...
// }
// console.log(Child.__proto__ === Function.prototype); // true
// console.log(Child.prototype.__proto__ === undefined); // true

/**
 * 知识介绍的差不多，来到重头戏，看看 Babel 会编译成什么样子
 * 下面是 ES6 的代码：
 *
 class Parent {
    constructor(name) {
        this.name = name;
    }
 }
 class Child extends Parent {
    constructor(name, age) {
        super(name); // 调用父类的 constructor(name)
        this.age = age;
    }
 }
 var child1 = new Child('kevin', '18');
 console.log(child1);
 *
 */

// 下面是 Babel 的 Try it out 编译出来的代码：
// 容我慢慢解释...

"use strict";

// 该函数用于设置继承关系链
function _inherits(subClass, superClass) {
    // 如果父类不是函数和不为null，就抛出错误
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }

    // 如果 superClass 是函数，则 subClass 继承 superClass，并且设置 constructor 成为 值是subClass，不可枚举
    // 如果 superClass == null，则 subClass.prototype = Object.create(null)，同时设置 constructor 的值
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });

    // 如果 superClass 不为 null，subClass.__proto__ = superClass
    if (superClass) _setPrototypeOf(subClass, superClass);
}

// 设置 o 的 __proto__ 为 p
function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}

// _createSuper(Child)
function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived), result;
        if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else {
            // 获得 Parent.apply(this, arguments) 的结果，如下
            // class Parent {
            //     constructor(name) {
            //         this.name = name;
            //     }
            // }
            // Parent.apply(this, arguments) 返回 undefined
            //
            // class Parent {
            //     constructor(name) {
            //         return {name: name};
            //     }
            // }
            // Parent.apply(this, arguments) 返回一个对象
            result = Super.apply(this, arguments);
        }
        return _possibleConstructorReturn(this, result);
    };
}

function _possibleConstructorReturn(self, call) {
    // 如果 Parent.apply(this, arguments) 的结果为 object 或者 function，则返回这个结果
    // 否则返回 Child 创建出的实例
    if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
    // 这里判断实例是否已经被创建
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}

function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Date.prototype.toString.call(Reflect.construct(Date, [], function () {
        }));
        return true;
    } catch (e) {
        return false;
    }
}

function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}

function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left); // 相当于 left instanceof right
    } else {
        return left instanceof right;
    }
}

// 检查类的调用方式是否是通过 new 调用
function _classCallCheck(instance, Constructor) {
    // ES6 中 class 关键字定义的类不能通过调用函数的形式进行调用，如：
    // class Abc {}
    // Abc(); // 不允许！
    // 如果以调用函数的形式直接调用类，类中的 this 会指向 Window，但由于这里是严格模式，this 不指向 Window，而是 undefined，也就是 void 0
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Parent = function Parent(name) {
    _classCallCheck(this, Parent);

    this.name = name;
};

var Child = /*#__PURE__*/function (_Parent) {
    _inherits(Child, _Parent);

    var _super = _createSuper(Child);

    function Child(name, age) {
        var _this;

        _classCallCheck(this, Child);

        _this = _super.call(this, name); // 调用父类的 constructor(name)

        _this.age = age;
        return _this;
    }

    return Child;
}(Parent);

var child1 = new Child('kevin', '18');
console.log(child1);
// 综上， 使用 extends 继承的时候，
// constructor 函数内必须要调用 super()，
// 而且 class 定义的类只能用 new 进行调用，
// 如果 Parent 的 constructor 返回的是 object 或者 function ，子类的 constructor 的 this 指向的是这个对象或函数
// extends 同时继承构造函数和构造函数的原型对象