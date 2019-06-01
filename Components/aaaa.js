
(function(){

  let  Components = function () {
    return new  Components.ct.init();
  }

   Components.ct =  Components.prototype = {

    constructor:  Components,

    init: function () {
      return this;
    }


  }

   Components.ct.init.prototype =  Components.ct; // 改变指向

   Components.extend =  Components.ct.extend = function () {
    let args = arguments[0] || {};
    let target = this;
    if (typeof args === "object" || typeof args === "function") {

      for (name in args) {
        target[name] = args[name];
      }

    }
    return target;
  }


  window. Components =  Components;

   Components.ct.extend({ });  //在这独立扩展工具方法
   Components.extend({ });     //在这独立扩展实例方法

})()