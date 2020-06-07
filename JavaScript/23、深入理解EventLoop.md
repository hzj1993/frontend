
### EventLoop

关于 EventLoop 我看了很多文章，大多讲的比较浅显，我觉得还是不够深入，我决定还是要深入源码和官方文档去理解，
苦于不会找 EventLoop 相关源码，只能看 Node 官网关于 Node 的事件循环的解释，以后找到浏览器相关的事件循环的源码一定补上。

#### 数据结构
- 栈
- 堆
- 队列
 
这块不细说

#### 基本知识

##### 宏任务（macrotask）：

script全部代码、setTimeout、setInterval、setImmediate、I/O、window.postMessage、UI Render

##### 微任务（microtask）：

Promise、process.nextTick、MutationObserver

##### 浏览器 EventLoop 基本流程

1、整段脚本作为一个宏任务执行 

2、执行过程中同步代码执行，宏任务进入宏任务队列，微任务进入微任务队列

3、同步代码执行完毕，检查微任务队列是否为空，不为空则依次从队头取出微任务执行，如果执行过程中
遇到微任务，则放到微任务队列末尾，直到微任务队列为空

4、执行浏览器UI渲染工作

5、检查是否有 web worker 任务，有就执行

6、从宏任务队列取出队首的任务执行，回到2，一直循环，直到宏任务和微任务队列为空

##### 浏览器怎么实现 setTimeout

渲染进程所有运行在主线程上面的任务都要先添加到消息队列，然后事件循环系统根据消息队列的顺序
执行任务。

在 Chrome 中除了消息队列还有一个延迟队列，JavaScript 调用 setTimeout 设置回调函数的时候，
渲染进程会创建一个回调任务，包含了回调函数、延迟执行时间、当前发起时间

```
struct DelayTask{
  int64 id；
  CallBackFunction cbf;
  int start_time;
  int delay_time;
};
DelayTask timerTask;
timerTask.cbf = showName; // 回调函数
timerTask.start_time = getCurrentTime(); //获取当前时间
timerTask.delay_time = 200;//设置延迟执行时间
```

创建好之后，就会把该任务添加到延迟队列中

```
delayed_incoming_queue.push(timerTask)；
```

再来看看消息循环系统怎么触发延迟队列：

```
void ProcessTimerTask(){
  //从delayed_incoming_queue中取出已经到期的定时器任务
  //依次执行这些任务
}

TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;
void MainTherad(){
  for(;;){
    //执行消息队列中的任务
    Task task = task_queue.takeTask();
    ProcessTask(task);
    
    //执行延迟队列中的任务
    ProcessDelayTask()

    if(!keep_running) //如果设置了退出标志，那么直接退出线程循环
        break; 
  }
}
```

处理完一个消息队列的任务后就会执行延迟队列的任务，等到期的任务都执行完之后再继续下一个循环。

**setTimeout 需要注意的一些问题**

1、 当前任务执行太久，会影响是定时器的执行

```javascript
function bar() {
    console.log('bar');
}
function foo() {
    setTimeout(bar, 0);
    for (let i = 0; i < 5000; i++) {
        let k = 5+8+8+8;
        console.log(k);
    }
}
foo();
```

这里设置了 0 毫秒后执行 bar ，但是由于 setTimeout 设置的任务被放在了延迟队列中，而延迟队列
中的任务需要等到当前任务执行完毕后再执行，所以这里会将 for 循环执行完，并判断有没有同步的代码，
再执行 bar ，由于这里循环了 5000 次，执行的时间肯定是超出 0 毫秒的。

2、如果 setTimeout 存在嵌套调用，浏览器会设置最短时间间隔为 4 毫秒

```javascript
function cb() { setTimeout(cb, 0); }
setTimeout(cb, 0);
```

这里设置了 0 毫秒循环调用 cb，看一下 Performance 的记录，前5次调用间隔比较小，嵌套调用5次以上，
后面的时间间隔变成了 4 毫秒。

![avatar](../img/setTimeout_1.png)

在 Chrome 中，定时器嵌套调用5次以上，系统会判断该函数被阻塞，如果
设置的时间间隔小于4毫秒，会设置为4毫秒。

```
static const int kMaxTimerNestingLevel = 5;

// Chromium uses a minimum timer interval of 4ms. We'd like to go
// lower; however, there are poorly coded websites out there which do
// create CPU-spinning loops.  Using 4ms prevents the CPU from
// spinning too busily and provides a balance between CPU spinning and
// the smallest possible interval timer.
static constexpr base::TimeDelta kMinimumInterval = base::TimeDelta::FromMilliseconds(4);
```
可以看到源码的注释中写到，有一些代码错误的网站可能会设置了一个 CPU 执行无限循环，设置4毫秒是
为了防止 CPU 一直无限执行循环代码，并在 CPU 循环执行代码和最小间隔定时器之间取得平衡。

因此实时性较高的需求不适用 setTimeout。

3、未激活的页面，setTimeout 最小间隔是 1000 毫秒

```
如果当前不是被激活的标签，定时器最小时间间隔是1000毫秒，目的是为了优化后台加载损耗和减少耗电量
```

4、setTimeout有最大时间间隔限制

```
最大限制为 2147483647 毫秒，原因是Chrome、Safari、Firefox是以32位储存延时值。
如果设置大于 2147483647 毫秒，就会立即执行。
```
```javascript
function showName() { console.log(789); }
console.log(123);
var timerID = setTimeout(showName, 2147483648); //会被理解调用执行
console.log(456);
// 输出结果：
// 123
// 456
// undefined
// 789
```

5、setTimeout 的回调函数中的 this 指向 window 对象，严格模式下为 undefined

```javascript
var name = 1;
var MyObj = {
  name: 2,
  showName: function() {
    console.log(this.name);
  }
};
setTimeout(MyObj.showName, 1000);
// 输出：1
```
解决方法：
```javascript
setTimeout(() => { MyObj.showName(); }, 1000); // 放在匿名函数中执行
```
```javascript
setTimeout(MyObj.showName().bind(MyObj), 1000); // 显式绑定 this
```

##### XMLHttpRequest 怎么工作

![avatar](../img/xhr.png)

XHR 通过 send() 发出请求，浏览器渲染进程会将请求发送给网络进程，网络进程负责资源的下载，等网络进程
收到数据后，会通过 IPC 通知渲染进程，渲染进程把 XHR 设置的回调函数封装成任务，添加到消息队列中，等
到主线程执行到该任务时执行相关的操作。

##### 一些练习题

**练习一**

```html
<div class="outer">
  <div class="inner"></div>
</div>
```

```javascript
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

new MutationObserver(function () {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

function onClick() {
  console.log('click');

  setTimeout(function () {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```
猜猜以上代码分别点击 outer 和 inner ，分别输出什么？

先来看看点击 outer，结果是什么：

```
click
promise
mutate
timeout
```
```
需要注意的是这里 MutationObserver 是微任务，监听了 outer 的 attributes 变化，一旦 outer 的 attributes
被修改，回调函数就会添加到微任务队列等待主线程执行
```

再来看看点击 inner，结果是什么：

```
click
promise
mutate
click
promise
mutate
timeout
timeout
```

```
点击 inner 先输出 click，遇到了 setTimeout 就把 setTimeout 定时器任务添加到延时队列，接着执行到
Promise.resolve().then() 就把 then 任务添加到微任务队列，然后执行 outer.setAttribute ，MutationObserver 
的回调任务添加到微任务队列。然后开始执行微任务队列的任务，输出 promise、mutate。
因为是点击事件，会发生事件冒泡，触发 outer 的 click 事件，因为然后输出 click，遇到setTimeout、promise 和 setAttribute，
并按照点击 inner 的逻辑添加到对应的队列，此时主线程中的同步代码执行完毕，开始执行微任务队列的任务，
此时 microtasks 是这样的：[Promise then, Mutation Observer, Promise then, Mutation Observer]，微任务队列
被执行完之后输出：
```





**参考文章：**
- [一次弄懂Event Loop](https://zhuanlan.zhihu.com/p/55511602)
- [如何理解EventLoop——宏任务和微任务篇](http://47.98.159.95/my_blog/js-v8/004.html)
- [前端进阶之道 (EventLoop)](https://yuchengkai.cn/docs/frontend/browser.html#event-loop)
- [Eventloop不可怕，可怕的是遇上Promise](https://juejin.im/post/5c9a43175188252d876e5903)
- [Node 官方文档](https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/)
- https://github.com/tc39/ecma262/pull/1250
- [更快的异步函数和 Promise](https://v8.js.cn/blog/fast-async/)
- [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- 掘金《前端面试之道》(付费)
- 极客时间《浏览器工作原理与实践》(付费)