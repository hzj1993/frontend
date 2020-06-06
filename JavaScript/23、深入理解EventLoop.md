
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


**参考文章：**
- [一次弄懂Event Loop](https://zhuanlan.zhihu.com/p/55511602)
- [如何理解EventLoop——宏任务和微任务篇](http://47.98.159.95/my_blog/js-v8/004.html)
- [前端进阶之道 (EventLoop)](https://yuchengkai.cn/docs/frontend/browser.html#event-loop)
- [Eventloop不可怕，可怕的是遇上Promise](https://juejin.im/post/5c9a43175188252d876e5903)
- [Node 官方文档](https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/)
- https://v8.js.cn/blog/fast-async/
- https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
- 掘金《前端面试之道》(付费)
- 极客时间《浏览器工作原理与实践》(付费)

