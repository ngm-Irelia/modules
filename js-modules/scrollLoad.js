/*
 * @Author: ngm 
 * @Date: 2019-02-02 21:36:35 
 * @Last Modified by: ngm
 * @Last Modified time: 2019-02-02 22:03:52
 */


//加载 符合要求的图片
function checkImgs() {
  let imgs = document.getElementsByTagName('img');
  Array.from(imgs).map(elem => {
    if (isInShow(elem)) {
      console.log(elem)
      loadImg(elem);
    }
  })
}

//查看哪些图片符合要求
function isInShow(elem) { // 增加一条新的判断,如果img已经加载就不要再让他 重复加载了,.在img元素上增加一个属性,控制
  let imgClient = elem.getBoundingClientRect();
  if (!elem.getAttribute("loaded")) {
    // 滚动加载
    return imgClient.top < window.innerHeight + 100;
  } else {
    return false; // 不用加载就可以	
  }
}

//加载某个图片
function loadImg(elem) {
  elem.src = elem.dataset.lazyload;
  elem.setAttribute('loaded', 'true');
}

//滚动事件 函数节流 
//使用 时间date
// 我们在初始的时候定义一个begin开始时间，当时间间隔超过duration时，则执行一次函数，这样我们做到了不重复调用，又能保证500秒执行一次。
/**
 * 
 * @param {*} method   加载的方法
 * @param {*} delay    滚动条的节流时间
 * @param {*} duration 最大时间间隔
 */
function throttle(method, delay, duration) {
  var timer = null;
  var begin = new Date();
  return function () {
    var context = this, args = arguments;
    //console.log(this); // 看下这个this到底是啥
    var current = new Date();
    clearTimeout(timer);
    if (current - begin >= duration) {
      method.apply(context, args); //为什么要这么写呢,是为了能给兼容任何方法!!!
      //method(); // 嘿,我这么写也是没问题
      //checkImgs(); // 嘿,我直接这么写也是可以的饿
      begin = current;
    } else {
      timer = setTimeout(function () {
        method.apply(context, args);
      }, delay);
    }
  }
} 

export { throttle, checkImgs}

/* 使用方式：
    1.加载图片
			checkImgs(); 
		2.页面滚动事件
			window.onscroll=throttle(checkImgs,100,500);

   注意事项：
    1.img图片需要有 data-lazyload 属性，存放需要加载的图片路径

    //后续优化：
    1.获取元素，应由用户传入，现在写死； 
    2.图片属性应该由用户传入
*/


// 未使用  暂放
/* var scrollFunc = function (e) {
  var direct = 0;
  e = e || window.event;
  if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
    if (e.wheelDelta > 0) { //当滑轮向上滚动时
      //操作
    }
    if (e.wheelDelta < 0) { //当滑轮向下滚动时
       //操作
    }
  } else if (e.detail) {  //Firefox滑轮事件
    if (e.detail > 0) { //当滑轮向上滚动时
       //操作
    }
    if (e.detail < 0) { //当滑轮向下滚动时
       //操作
    }
  }
}; */
