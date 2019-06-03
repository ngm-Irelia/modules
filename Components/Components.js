/**
 * @fileoverview 组件.js
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 基于原生js
 * @author NGM
 * @version 1.1
 */

/** 
 * @namespace Components的所有类均放在Components命名空间下
 */
var Components = window.Components = Components || {};

(function(){
	
	Components = function(){
		return new Components.ct.init();
	}
	
	//从此以后使用ct
	Components.ct = Components.prototype = {
		constructor: Components,
		init:function(){
			return this;
		}
	}
	
	//这一句是重中重  // 改变指向
	Components.ct.init.prototype = Components.ct;
	
	
	
	
	
	// ok 前端基础代码完成了 ~~
	//接下来是具体的功能性代码咯
	
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

	
	/**
	 * Promise 动态加载js
	 * @param {*} url 要加载的js
	 */
	let loadScriptPromise = function(url) {
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
	
	/**
	 * 处理接口的通用类
	 */
	let getData = function () {
		this.getAjaxBase = function (urls,param,type,tradit) {
			return new Promise(function (resolve,reject) {
				let getTradit = tradit? true:false;
				$.ajax({
					url: urls,
					traditional: getTradit, //是否自动解析数组
					type: type,
					data: param,
					//dataType: "json",
					success: function(data) {
						if (data){
							resolve(data);
						}else{
							reject("接口出错!");
						}
					},
					error: function(error) {
						reject("未查询到数据!");
					}
				})
			});
		}
	};


	/**
	 * only a example !!
	 * @param param 发送请求，需要的参数
	 */
	getData.prototype.getMaterialProTable = function(param){
		let _thatData = this;
		return new Promise(function(resolve, reject) {
			_thatData.getAjaxBase('search/card',param,'GET').then(function (data) {
				resolve(data);
			}).catch(function(){
				reject(false);
			})
		}) 
	};




	
	/**
	 * 处理时间的通用类
	 */
	let getTime = function(){
		//获取当前日期方法
		this.getNowFormatDate = function () {
			var date = new Date();
			var seperator1 = "-";
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var strDate = date.getDate();
			if (month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if (strDate >= 0 && strDate <= 9) {
				strDate = "0" + strDate;
			}
			var currentdate = year + seperator1 + month + seperator1 + strDate;
			return currentdate;
		}
		//获取当前日期，包括时分秒
		this.getNowFormatDateHMS = function () {
			var date = new Date();
			var seperator1 = "-";
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var strDate = date.getDate();
			var hour = date.getHours();       //获取当前小时数(0-23)
			var minute = date.getMinutes();   //获取当前分钟数(0-59)
			var second = date.getSeconds();   //获取当前秒数(0-59)
			
			if (month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if (strDate >= 0 && strDate <= 9) {
				strDate = "0" + strDate;
			}

			if (hour >= 0 && hour <= 9) {
				hour = "0" + hour;
			}
			if (minute >= 0 && minute <= 9) {
				minute = "0" + minute;
			}
			if (second >= 0 && second <= 9) {
				second = "0" + second;
			}

			var currentdate = year + seperator1 + month + seperator1 + strDate+" "+hour+ ":" + minute + ":" +second;
			return currentdate;
		}
		
		//获取指定日期前一天
		this.getBeforeDay = function (d) {
			d = new Date(d);
			d = +d - 1000 * 60 * 60 * 24;
			d = new Date(d);
			var year = d.getFullYear();
			var mon = d.getMonth() + 1;
			var day = d.getDate();
			var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前七天
		this.getBeforeWeek = function (d) {
			d = new Date(d);
			d = +d - 1000 * 60 * 60 * 24 * 6;
			d = new Date(d);
			var year = d.getFullYear();
			var mon = d.getMonth() + 1;
			var day = d.getDate();
			var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前一个月
		this.getBeforeMonth = function (d) {
			d = new Date(d);
			d = +d - 1000 * 60 * 60 * 24 * 29;
			d = new Date(d);
			var year = d.getFullYear();
			var mon = d.getMonth() + 1;
			var day = d.getDate();
			var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前一个年
		this.getBeforeYear = function (d) {
			d = new Date(d); 
			var year = d.getFullYear()-1;
			var mon = d.getMonth() + 1;
			var day = d.getDate();
			var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
	
	}
	
	/**
	 * 获取当前日期的函数
	 */
	getTime.prototype.getNowTime = function(){
		return this.getNowFormatDate();
	}
	/**
	 * 根据字段，处理对应的时间范围
	 * @param {*} time 时间范围字符串 { day|week|month|year }
	 * @return jsonData {
	 * 		startTime:" ",
	 * 		endTime:" "
	 * }
	 */
	getTime.prototype.getTimeByString = function(time){
		let _that = this;
		
		switch(time){
			case "day" : {
				return _that.getBeforeDay(_that.getNowFormatDate());
			}
			
		case "week" : {
			return _that.getBeforeWeek(_that.getNowFormatDate());
			}
		
		case "month" : {
			return _that.getBeforeMonth(_that.getNowFormatDate());
		}
		case "year" : {
			return _that.getBeforeYear(_that.getNowFormatDate());
		}
		}
	}
	
	Components.extend({ 
		getData:new getData(),
		getTime:new getTime(),
		loadScriptPromise:loadScriptPromise,
		/**
		 * 解析search的值，转为json对象
		 * @param {*} search window.location.search
		 */
		dealSearch:function (search){
			if(search && search.indexOf("?")!=-1) { 
				var str = search.substring(1);
				var strs = str.split("&"); 
				var searchJson = {};
				for(var i=0;i<strs.length;i++){ 
					searchJson[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
				}
				return searchJson;
			}
		},
		
		/**
		 * 禁止文字选择 
		 */
		selectText : function () {
			"getSelection" in window
				?
				window.getSelection().removeAllRanges() :
				document.selection.empty();
		},

		
	});  //在这独立扩展工具方法
	
	
	// here ~ 为防止开发冲突，每个开发人员自己写自己的 extend
	
	// example
	
	// 人员1
	Components.extend({ });  //在这独立扩展工具方法
	Components.ct.extend({ });     //在这独立扩展实例方法
	
	//人员2
	Components.extend({ });  //在这独立扩展工具方法
	Components.ct.extend({ });     //在这独立扩展实例方法
	
	
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

	Components.prototype.BarChart = new BarChart();
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

	Components.prototype.PictureVirtual = new PictureVirtual();

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

	Components.prototype.PictureVirtualByClass = new PictureVirtualByClass(); 

})();




