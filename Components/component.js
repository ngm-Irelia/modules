/**
 * @fileoverview 组件.js
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 基于原生js
 * @author NGM
 * @version 1.1
 */

/** 
 * @namespace component的所有类均放在Component命名空间下
 */
var Component = window.Component = Component || {};

(function(){
	
	Component = function(){
		return new Component.ct.init();
	}
	
	//从此以后使用ct
	Component.ct = Component.prototype = {
		constructor: Component,
		init:function(){
			return this;
		}
	}
	
	//这一句是重中重
	Component.ct.init.prototype = Component.ct;
	
	
	
	
	
	// ok 前端基础代码完成了 ~~
	//接下来是具体的功能性代码咯
	
	/**
	 * Promise 动态加载js
	 * @param {*} url 要加载的js
	 */
	Component.ct.loadScriptPromise = function(url) {
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
	
	
	
	
	
	
	
})()

 










/**
 * here 一些组件放在这，不到2万行，不分文件
 */

/**
 * 组件-横向柱状图 v1.0 用户自定义各种效果后续开发
 */
;(function(){
	class BarChart {
		constructor() {
			this.showId = "";//显示的id
			this.showData = '';
		}
		/**
		 * 加载函数
		 * @param showId 显示#id
		 * @param data 显示数据
		 */
		run(showId, data) {
			this.showId = showId;
			this.showData = data;
			
			this.showLineChart();
		}

		/**
		 * 显示柱状图
		 */
		showLineChart() {
			let _that = this;
			let showdata = _that.showData;
			
			if(!showdata){ return '';}
			
			let html = `<div class="common-showLineChart">`;
			
			for(var i=0;i<showdata.length;i++){
				html += `<div class="common-showLineChart-outLine">
					<div class="common-showLineChart-innerLine" style="background-color:${_that.innerLineColorArr(i)};"></div>
					<div class="common-showLineChart-index-background" style="border-color:${_that.indexColorArr(i)} transparent transparent transparent;"></div>
					<div class="common-showLineChart-index">${i+1}</div>
					<div class="common-showLineChart-title">${showdata[i].name}</div>
					<div class="common-showLineChart-number">${showdata[i].number}</div>
				</div>`;
			}
			 
			html += `</div>`;
			
			document.getElementById(_that.showId).innerHTML = html;
			
			setTimeout(function(){
				var doms = document.getElementsByClassName('common-showLineChart-innerLine');
				for(var i=0;i<doms.length;i++){
					doms[i].style.width = (showdata[i].number/showdata[0].number)*100+'%';
				}
			},0);
			
		}
		
		innerLineColorArr(index){
			let arr = ["#ff7575","#ff9a9a","#feb5b5","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6","#ffc6c6"];
			return arr[index];
		}
		
		indexColorArr(index){
			let arr = ["#fe0202","#e6a23a","#f5c478","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc","#c0c4cc"];
			return arr[index];
		}



	}

	Component.prototype.BarChart = new BarChart();
})();

/**
 * #图片虚化组件 v1.0  注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件
 */
;(function(){

	class PictureVirtual {
		constructor() {
			this.showId = ""; //显示的id
			this.showData = '';
		}
		/**
		 * 加载函数
		 * @param showId 显示#id
		 * @param Img 显示图片
		 */
		run(showId, Img) {
			this.showId = showId;
			this.showImg = Img;
			this.elem = document.getElementById(this.showId);
			this.width = this.elem.clientWidth;
			this.height = this.elem.clientHeight;
			
			this.loadImg();
		}

		/**
		 * 加载图片
		 */
		loadImg() {
			let _that = this;

			let html =
				`<div id="${_that.showId}virtual-div" style="position: relative; width:100%; height:100%;">
				<div style="width:100%; height:100%;overflow: hidden;">
					<img src="${_that.showImg}" id="${_that.showId}virtual-img" style="filter: blur(15px);" width="100%" height="100%"/> 
				</div>
				<div style="position: absolute; top:0px; bottom:0px;left:0px;right:0px;">
					<img src="${_that.showImg}"  id="${_that.showId}clear-img" style="position: absolute;"/> 
				</div>
			</div>
			`;

			document.getElementById(_that.showId).innerHTML = html;

			_that.dealImg();

		}

		/**
		 * 处理图片样式
		 */
		dealImg() {
			let _that = this;
			let VImg = document.getElementById(_that.showId + "virtual-img");
			let CImg = document.getElementById(_that.showId + "clear-img");
			VImg.onload = function() {
				let baseH = VImg.naturalHeight;
				let baseW = VImg.naturalWidth;
				if(baseH>=baseW){ // h>=w
					CImg.setAttribute('height',_that.height);
					let left = (_that.width-(baseW*_that.height)/baseH)/2;
					CImg.setAttribute('style', 'position: absolute; left: '+parseInt(left)+'px');
				}else{ // h<w
					CImg.setAttribute('width',_that.width);
					let top = (_that.height-(baseH*_that.width)/baseW)/2;
					CImg.setAttribute('style', 'position: absolute; top: '+parseInt(top)+'px');
				}
			}
		}

	}

	Component.prototype.PictureVirtual = new PictureVirtual();

})()

/**
 *  #图片虚化组件-通过class【picture-virtual】定义 v1.0  注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件
 */
;(function(){


	class PictureVirtualByClass {
		constructor() {
		}
		/**
		 * 加载函数
		 * @param Img 显示图片
		 */
		run() {
			this.elems = document.getElementsByClassName('picture-virtual');
			this.loadImg();
		}

		/**
		 * 加载图片
		 */
		loadImg() {
			let _that = this;
			for(var i=0;i<_that.elems.length;i++){
				let ele = _that.elems[i];
				_that.width = ele.clientWidth;
				_that.height = ele.clientHeight;
				
				_that.showImg = ele.getAttribute("data-src");
				
				let html =
					`<div class="virtual-div" style="position: relative; width:100%; height:100%;">
					<div style="width:100%; height:100%;overflow: hidden;">
						<img src="${_that.showImg}" class="virtual-img" style="filter: blur(15px);" width="100%" height="100%"/> 
					</div>
					<div style="position: absolute; top:0px; bottom:0px;left:0px;right:0px;">
						<img src="${_that.showImg}"  class="clear-img" style="position: absolute;"/> 
					</div>
				</div>
				`;
				
				ele.innerHTML = html;
				
				let VImg = ele.getElementsByClassName("virtual-img")[0];
				let CImg = ele.getElementsByClassName("clear-img")[0];
				
				VImg.onload = function() {
					let baseH = VImg.naturalHeight;
					let baseW = VImg.naturalWidth;
					if(baseH>=baseW){ // h>=w
						CImg.setAttribute('height',_that.height);
						let left = (_that.width-(baseW*_that.height)/baseH)/2;
						CImg.setAttribute('style', 'position: absolute; left: '+parseInt(left)+'px');
					}else{ // h<w
						CImg.setAttribute('width',_that.width);
						let top = (_that.height-(baseH*_that.width)/baseW)/2;
						CImg.setAttribute('style', 'position: absolute; top: '+parseInt(top)+'px');
					}
				}
			}
		}
	}

	Component.prototype.PictureVirtualByClass = new PictureVirtualByClass(); 

})();




