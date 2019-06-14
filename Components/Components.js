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

(function() {

	Components = function() {
		return new Components.ct.init();
	}

	//从此以后使用ct
	Components.ct = Components.prototype = {
		constructor: Components,
		init: function() {
			return this;
		}
	}

	//这一句是重中重  // 改变指向
	Components.ct.init.prototype = Components.ct;


	// ok 前端基础代码完成了 ~~
	//接下来是具体的功能性代码咯

	Components.extend = Components.ct.extend = function() {
		let args = arguments[0] || {};
		let target = this;
		if ( typeof args === "object" && !(typeof args === "function") && !(args instanceof Array) ) {
			for (name in args) {
				target[name] = args[name];
			}

		}
		return target;
	}

	/**
	 * 处理时间的通用类
	 */
	let getTime = function() {
		//获取当前日期方法
		this.getNowFormatDate = function() {
			let date = new Date();
			let seperator1 = "-";
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let strDate = date.getDate();
			if (month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if (strDate >= 0 && strDate <= 9) {
				strDate = "0" + strDate;
			}
			
			return year + seperator1 + month + seperator1 + strDate;
		}
		//获取当前日期，包括时分秒
		this.getNowFormatDateHMS = function() {
			let date = new Date();
			let seperator1 = "-";
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let strDate = date.getDate();
			let hour = date.getHours(); //获取当前小时数(0-23)
			let minute = date.getMinutes(); //获取当前分钟数(0-59)
			let second = date.getSeconds(); //获取当前秒数(0-59)

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

			let currentdate = year + seperator1 + month + seperator1 + strDate + " " + hour + ":" + minute + ":" + second;
			return currentdate;
		}
		//根据数字，获取对应日期
		this.getFormatDateByNumber = function(d){
			let nowDate = new Date();
			d = nowDate - (1000 * 60 * 60 * 24)*d;
			d = new Date(d);
			let year = d.getFullYear();
			let mon = d.getMonth() + 1;
			let day = d.getDate();
			let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前一天
		this.getBeforeDay = function(d) {
			d = new Date(d);
			d = d - 1000 * 60 * 60 * 24;
			d = new Date(d);
			let year = d.getFullYear();
			let mon = d.getMonth() + 1;
			let day = d.getDate();
			let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前七天
		this.getBeforeWeek = function(d) {
			d = new Date(d);
			d = d - 1000 * 60 * 60 * 24 * 6;
			d = new Date(d);
			let year = d.getFullYear();
			let mon = d.getMonth() + 1;
			let day = d.getDate();
			let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前一个月
		this.getBeforeMonth = function(d) {
			d = new Date(d);
			d = d - 1000 * 60 * 60 * 24 * 29;
			d = new Date(d);
			let year = d.getFullYear();
			let mon = d.getMonth() + 1;
			let day = d.getDate();
			let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}
		//获取指定日期前一个年
		this.getBeforeYear = function(d) {
			d = new Date(d);
			let year = d.getFullYear() - 1;
			let mon = d.getMonth() + 1;
			let day = d.getDate();
			let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return s;
		}

	}

	let compGetTime = new getTime();

	//扩展工具方法
	Components.extend({
		/**
		 * 对接口的封装
		 * 
		 * @param urls	   请求的url	
		 * @param param	   请求的参数
		 * @param type	   请求的类型GET POST 等
		 * @param tradit	 是否自动解析数组
		 */
		getData: function(urls, param, type, tradit) {
			return new Promise(function(resolve, reject) {
				let getTradit = tradit ? true : false;
				$.ajax({
					url: urls,
					traditional: getTradit, //是否自动解析数组
					type: type,
					data: param,
					//dataType: "json",
					success: function(data) {
						if (data) {
							resolve(data);
						} else {
							reject("接口出错!");
						}
					},
					error: function(error) {
						reject("未查询到数据!");
					}
				})
			});
		},
		/**
		 * 对时间的相关处理
		 * @params time 字符串 { '' | 'now' | 'day' | 'week' | 'month' | 'year', 数字 }
		 */
		getTime: function(time) {
			if (!time) {
				return compGetTime.getNowFormatDateHMS();
			}

			if(typeof time === 'number'){
				return compGetTime.getFormatDateByNumber(time);
			}

			switch (time) {
				case "now":
					{
						return compGetTime.getNowFormatDate();
					}
					break;
				case "day":
					{
						return compGetTime.getBeforeDay(compGetTime.getNowFormatDate());
					}
					break;
				case "week":
					{
						return compGetTime.getBeforeWeek(compGetTime.getNowFormatDate());
					}
					break;
				case "month":
					{
						return compGetTime.getBeforeMonth(compGetTime.getNowFormatDate());
					}
					break;
				case "year":
					{
						return compGetTime.getBeforeYear(compGetTime.getNowFormatDate());
					}
					break;
			}
		},
		/**
		 * 动态加载js
		 */
		loadScriptPromise: function(url) {
			return new Promise(function(resolve, reject) {
				let script = document.createElement("script");
				script.type = "text/javascript";
				if (script.readyState) { // ie
					script.onreadystatechange = function() {
						if (script.readyState === "loaded" || script.readyState === "complete") {
							script.onreadystatechange = null;
							resolve();
						}
					};
				} else { //Others: Firefox, Safari, Chrome, and Opera
					script.onload = function() {
						resolve();
					};
				}

				if (!url) {
					reject('url is error!');
				}
				script.src = url;
				document.body.appendChild(script);
			})
		},
		/**
		 * 解析search的值，转为json对象
		 * @param {*} search window.location.search
		 */
		getSearch: function(search) {
			if (search && search.indexOf("?") != -1) {
				let str = search.substring(1);
				let strs = str.split("&");
				let searchJson = {};
				for (let i = 0; i < strs.length; i++) {
					searchJson[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
				}
				return searchJson;
			}
		},
		/**
		 * 禁止文字选择 
		 */
		selectText: function() {
			"getSelection" in window
				?
				window.getSelection().removeAllRanges() :
				document.selection.empty();
		},

		/**
		 * 解析cookie 转为json对象
		 */
		getCookie : function () {
			let decodedCookie = decodeURIComponent(document.cookie);
			let ca = decodedCookie.split(';');
			let cm = {};

			for(let i = 0; i <ca.length; i++) {
				let c = ca[i];

				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				
				let ci = c.indexOf('=');
				if (ci >= 0) {
					cm[c.substring(0, ci)] = c.substring(ci+1, c.length);
				}
			}

			return cm;
		},

		/** 
		* 检测是否是IE、Edge浏览器
		*/
		isIE: function () {
			if (window.ActiveXObject || "ActiveXObject" in window || navigator.userAgent.includes("Edge")) return true;
			else return false;
		},

	}); 
  

	//扩展工具方法  正则实现的相关的操作
	Components.extend({
		/**
		 * 邮箱监测
		 * @param {*} email 
		 */
		CheckEmail: function(email) {
			let regexp = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
			
			return (regexp.test(email));
		},
		/**
		 * 身份证检测
		 * @param {*} card 
		 */
		checkIDCard: function (card){
			let regexp = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;
			
			return (regexp.test(card));
		},
		/**
		 * 正则表达式 去除两侧空格
		 * @param {*} v 要处理的字符串
		 */
		trim: function (v) {
			return v.replace(/(^\s*)|(\s*$)/g, "");
		},


	}); 



	//扩展实例方法 
	//扩展工具方法
	Components.ct.extend({
		
		/**
		 * 切换主题   
		 * 
		 * link元素 上 必须有  class='theme' title="xxxx" 属性; class不变，title为对应主题
		 * 需要每份主题的css都写在html中，通过获得theme，给link添加disabled属性来控制
		 * 
		 * @param {*} theme 主题类型
		 * 如果传theme，根据其 切换主题；  如果不传theme，去获取cookie中的theme属性，显示其对应主题
		 */
		switchTheme: function (theme){
			if(theme){
				$("link[class='theme'][title='"+theme+"']").removeAttr("disabled");
				$("link[class='theme'][title!='"+theme+"']").attr("disabled","disabled");
			}else{
				let ctheme = Components.getCookie().theme;
				if(ctheme){ 
					theme = ctheme; 
					$("link[class='theme'][title='"+theme+"']").removeAttr("disabled");
					$("link[class='theme'][title!='"+theme+"']").attr("disabled","disabled");
				}
				
			}

			
		}


	}); 


	// ----------------------------  以上 为 ngm 开发的内容 -------------------------------------- //

	// ----------------------------  以下 为 xxx 开发的内容 -------------------------------------- //


	// ----------------------------  以上 为 xxx 开发的内容 -------------------------------------- //


	/**
	* here 一些组件放在这，不到2万行，暂时不分文件
	*/

	/**
	* 组件-横向柱状图 v1.0 用户自定义各种效果后续开发
	*/
	class BarChart {
		constructor() {
			this.showId = ""; //显示的id
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

			if (!showdata) {
				return '';
			}

			let html = `<div class="common-showLineChart">`;

			for (let i = 0; i < showdata.length; i++) {
				html +=
					`<div class="common-showLineChart-outLine">
					<div class="common-showLineChart-innerLine" style="background-color:${_that.innerLineColorArr(i)};"></div>
					<div class="common-showLineChart-index-background" style="border-color:${_that.indexColorArr(i)} transparent transparent transparent;"></div>
					<div class="common-showLineChart-index">${i+1}</div>
					<div class="common-showLineChart-title">${showdata[i].name}</div>
					<div class="common-showLineChart-number">${showdata[i].number}</div>
				</div>`;
			}

			html += `</div>`;

			document.getElementById(_that.showId).innerHTML = html;

			setTimeout(function() {
				let doms = document.getElementsByClassName('common-showLineChart-innerLine');
				for (let i = 0; i < doms.length; i++) {
					doms[i].style.width = (showdata[i].number / showdata[0].number) * 100 + '%';
				}
			}, 0);

		}

		innerLineColorArr(index) {
			let arr = ["#ff7575", "#ff9a9a", "#feb5b5", "#ffc6c6", "#ffc6c6", "#ffc6c6", "#ffc6c6", "#ffc6c6", "#ffc6c6",
				"#ffc6c6", "#ffc6c6"
			];
			return arr[index];
		}

		indexColorArr(index) {
			let arr = ["#fe0202", "#e6a23a", "#f5c478", "#c0c4cc", "#c0c4cc", "#c0c4cc", "#c0c4cc", "#c0c4cc", "#c0c4cc",
				"#c0c4cc", "#c0c4cc"
			];
			return arr[index];
		}



	}

	Components.ct.BarChart = new BarChart();


	/**
	 * #图片虚化组件 v1.0  注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件
	 */
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
				if (baseH >= baseW) { // h>=w
					CImg.setAttribute('height', _that.height);
					let left = (_that.width - (baseW * _that.height) / baseH) / 2;
					CImg.setAttribute('style', 'position: absolute; left: ' + parseInt(left) + 'px');
				} else { // h<w
					CImg.setAttribute('width', _that.width);
					let top = (_that.height - (baseH * _that.width) / baseW) / 2;
					CImg.setAttribute('style', 'position: absolute; top: ' + parseInt(top) + 'px');
				}
			}
		}

	}

	Components.ct.PictureVirtual = new PictureVirtual();



	/**
	*  #图片虚化组件-通过class【picture-virtual】定义 v1.0  注意，现在要求 父盒子必须要有宽高~，后续有时间，在代码中优化下组件
	*/
	class PictureVirtualByClass {
		constructor() {}
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
			for (let i = 0; i < _that.elems.length; i++) {
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
					if (baseH >= baseW) { // h>=w
						CImg.setAttribute('height', _that.height);
						let left = (_that.width - (baseW * _that.height) / baseH) / 2;
						CImg.setAttribute('style', 'position: absolute; left: ' + parseInt(left) + 'px');
					} else { // h<w
						CImg.setAttribute('width', _that.width);
						let top = (_that.height - (baseH * _that.width) / baseW) / 2;
						CImg.setAttribute('style', 'position: absolute; top: ' + parseInt(top) + 'px');
					}
				}
			}
		}
	}

	Components.ct.PictureVirtualByClass = new PictureVirtualByClass();














})()

