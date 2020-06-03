/**
 * 关于继承，《JavaScript高级程序设计》里面已经讲得很好，我这是只是做一个学习总结
 */

/**
 * 原型链继承
 */
function Parent1() {
    this.name = 'jack';
}
Parent1.prototype.getName = function () {
    return this.name;
};
function Child1() {}
Child1.prototype = new Parent1();
var child1 = new Child1();
// 缺点：引用类型的属性被共享，一旦被修改，其他实例的对应方法也会修改


/**
 * 借用构造函数（经典继承）
 */
function Parent2() {
    this.names = ['jack', 'kevin', 'spider'];
}
function Child2() {
    Parent2.call(this);
}
var child2 = new Child2();
// 优点：
// 1、避免了引用类型的属性被共享
// 2、可以在 Child 中向 Parent 传值
// 缺点：
// 1、每次创建 Child 实例，都要调用一次 Parent 方法

/**
 * 组合继承
 * 原型链继承 和 经典继承 双剑合璧
 */
function Parent3() {
    this.names = ['jack', 'kevin', 'spider'];
}
Parent3.prototype.getNames = function () {
    return this.names;
};
function Child3() {
    Parent3.call(this);
}
Child3.prototype = new Parent3(); // Child3.prototype.__proto__ === Parent3.prototype
Child3.prototype.constructor = Child3;
var child3 = new Child3();
// 结合了经典继承和原型链继承的优点，是常用的继承方法
// 缺点：
// 1、调用两次父构造函数

/**
 * 原型式继承
 */
function createObj(o) {
    function F() {}
    F.prototype = o;
    return new F();
}
var person = {
    name: 'jack',
    friends: ['daisy', 'kelly']
};
var person1 = createObj(person);
var person2 = createObj(person);
// 缺点：
// 1、引用类型属性被共享

/**
 * 寄生式继承
 */
function createObj2(o) {
    var clone = Object.create(o);
    clone.getName = function () {
        console.log('text');
    };
    return clone;
}
// 缺点：
// 1、和经典继承一样，每次创建对象都会创建一次方法

/**
 * 寄生组合式继承
 */
function Parent4(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}
Parent4.prototype.getName = function () {
    console.log(this.name)
};
function Child4 (name, age) {
    Parent4.call(this, name);
    this.age = age;
}
Child4.prototype = Object.create(Parent4.prototype);
Child4.prototype.constructor = Child4;

var child4 = new Child4('jack', 18);

// 优化一下这个继承方法：
function prototype(child, parent) {
    var proto = Object.create(parent.prototype);
    proto.constructor = child;
    child.prototype = proto;
}
// prototype(Child, Parent);
// 优点：
// 只调用了一次父构造函数，可以用 instanceof 、isPrototypeOf，原型链保持不变，是最理想的继承方法












