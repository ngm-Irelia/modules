/**
 * @fileoverview 组件-所有组件加载 
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 基于原生js
 *
 * @author NGM
 * @version 1.0
 */

/** 
 * @namespace component的所有类均放在Component命名空间下
 */
var Component = window.Component = Component || {};


(function(){
  class LoadComponent {
		constructor() {
			this.compList = [
        {
          id:"barChart",
          js:"bar-chart.js"
        },
        {
          id:"pictureVirtual",
          js:"picture-virtual.js"
        }
      ]; //所有的组件列表
			
		}
		/**
		 * 加载组件 默认加载所有组件
		 * @param comps 要加载的组件数组 ["barChart","pictureVirtual"] 里面的值为对应的id，其实也是各组件的文件夹名称
		 */
		run(comps) {
      let _that = this;
      if(comps && comps instanceof Array){
        for(var c=0;c<comps.length;c++){
          for(var i=0;i<_that.compList.length;i++){
            if( comps[c] === _that.compList[i].id ){
              let url = './modules/'+_that.compList[i].id+'/'+_that.compList[i].js;
              _that.loadScriptPromise(url);
            }
          }
        }
      }else{//加载所有组件 动态加载js
        for(var i=0;i<_that.compList.length;i++){
          let url = './modules/'+_that.compList[i].id+'/'+_that.compList[i].js;
          _that.loadScriptPromise(url);
        }
        
      }
      
    }
    
    /**
     * Promise 动态加载js
     * @param {*} url 要加载的js
     */
    loadScriptPromise(url) {
      return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {// ie
          script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              resolve();
            }
          };
        } else {//Others: Firefox, Safari, Chrome, and Opera
          script.onload = function () {
            resolve();
          };
        }

        if(!url){
          reject('url is error!');
        }
        script.src = url;
        document.body.appendChild(script);
      })
    }

	}

  Component.LoadComponent = LoadComponent; 
})()

 
