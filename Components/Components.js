/**
 * @fileoverview 组件.js
 * v1.0 简单实现功能，用户自定义各种效果后续开发
 * 基于原生js
 * @author NGM
 * @version 1.1
 * 
 * # 搜索字段 含义  
 * yh   ： 待优化的部分
 * todo ： 待做的部分
 * 
 */

/** 
 * @namespace Components的所有类均放在Components命名空间下
 */
//var Components = window.Components = Components || {};

var Components = window.Components = Components || {};

(function() {
	
	// 哎呀，超级喜欢这种方式，我们也加上，后面使用 call apply 调用
	let
		core_obj = {},
		core_arr = [],
		core_str = "ngm",
	
		core_from    = core_arr.from,
		core_concat  = core_arr.concat,
		core_push    = core_arr.push,
		core_slice   = core_arr.slice,
		core_indexOf = core_arr.indexOf,
		
		core_toString= core_obj.toString,
		core_hasOwn  = core_obj.hasOwnProperty,
		
		core_trim    = core_str.trim;
	

	Components = function() {
		return new Components.ct.init();
	}

	//从此以后使用ct
	Components.ct = Components.prototype = {
		author: "ngm", //哈哈，当然是要把我加上了~
		constructor: Components,
		init: function() {
			return this;
		}
	}

	//这一句是重中重  // 改变指向
	Components.ct.init.prototype = Components.ct;


	// ok 前面基础代码完成了 ~~
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
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let strDate = date.getDate();
			if (month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if (strDate >= 0 && strDate <= 9) {
				strDate = "0" + strDate;
			}
			
			return year + "-" + month + "-" + strDate;
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

	//扩展工具方法 通用的一些方法
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
		/**
		 * Blob 下载文件功能
		 * @param {*} filename 文件名
		 * @param {*} content 文件内容
		 */
		downloadByBlob: function(filename,content){
			// 创建隐藏的可下载链接
			let eleLink = document.createElement('a');
			eleLink.download = filename;
			eleLink.style.display = 'none';
			// 字符内容转变成blob地址
			let blob = new Blob([content]);
			eleLink.href = URL.createObjectURL(blob);
			// 触发点击
			document.body.appendChild(eleLink);
			eleLink.click();
			// 然后移除
			document.body.removeChild(eleLink);
		},
		
		/**
		 * a标签 下载文件功能
		 * @param {*} url 下载地址
		 */
		downloadByA: function (url) {
			let eleLink = document.createElement('a');
			eleLink.href = url;
			eleLink.style.display = 'none';
			// 触发点击
			document.body.appendChild(eleLink);
			eleLink.click();
			// 然后移除
			document.body.removeChild(eleLink);
    },
		
		/**
		 * 文件上传功能 包括：上传进度等获取
		 * @param urls	   请求的url	
		 * @param param	   请求的参数  document.getElementById("file").files[0]  //获取文件对象
		 * @param type	   请求的类型GET POST 等
		 */
		uploadFile:function(urls, param, type){
			let xhr;
			let ot;
			xhr = new XMLHttpRequest();   // XMLHttpRequest 对象
			xhr.open(type, urls, true);   //true 该参数规定请求是否异步处理。
			xhr.onload = successFunc;  //请求完成
			xhr.onerror =  failFunc;  //请求失败
		
			xhr.upload.onprogress = progressFunction;//调用 上传进度 方法 
			xhr.upload.onloadstart = function(){//上传开始执行方法
				ot = new Date().getTime();   //设置上传开始时间
				oloaded = 0;//设置上传开始时，以上传的文件大小为0
			};
		
			xhr.send(param); //开始上传,参数
			
			//上传成功响应
			function successFunc(evt) {
				let data = JSON.parse(evt.target.responseText);//服务断接收完文件返回的结果
				if (data.success) {
					Components().alert({
						title: "提示",
						content: "上传成功！"
					})
				} else {
					Components().alert({
						title: "提示",
						content: "上传失败！",
						color: "red"
					})
				}
			
			}
			//上传失败
			function failFunc(evt) {
			    Components().alert({
			    	title:"提示",
			    	content:"上传失败！",
			    	color:"red"
			    })
			}
			//取消上传
			function cancleUploadFile(){
			    xhr.abort();
			}
			
			
			//上传进度 方法
			function progressFunction(evt) {
				let progressBar = document.getElementById("progressBar");
				let percentageDiv = document.getElementById("percentage");
				// event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
				if (evt.lengthComputable) {//
					progressBar.max = evt.total;
					progressBar.value = evt.loaded;
					percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + "%";
				}
				let time = document.getElementById("time");
				let nt = new Date().getTime();//获取当前时间
				let pertime = (nt - ot) / 1000; //计算出上次调用该方法时到现在的时间差，单位为s
				ot = new Date().getTime(); //重新赋值时间，用于下次计算
				let perload = evt.loaded - oloaded; //计算该分段上传的文件大小，单位b
				oloaded = evt.loaded;//重新赋值已上传文件大小，用以下次计算
				//上传速度计算
				let speed = perload / pertime;//单位b/s
				let bspeed = speed;
				let units = 'b/s';//单位名称
				if (speed / 1024 > 1) {
					speed = speed / 1024;
					units = 'k/s';
				}
				if (speed / 1024 > 1) {
					speed = speed / 1024;
					units = 'M/s';
				}
				speed = speed.toFixed(1);
				//剩余时间
				let resttime = ((evt.total - evt.loaded) / bspeed).toFixed(1);
				time.innerHTML = '，速度：' + speed + units + '，剩余时间：' + resttime + 's';
				if (bspeed == 0) time.innerHTML = '上传已取消';
			}
		}
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
			let regexp = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
			
			return (regexp.test(card));
		},
		/**
		 * 正则表达式 去除两侧空格 ~ 当然，有自带的trim方法了
		 * @param {*} v 要处理的字符串
		 */
		trim: function (v) {
			return v.replace(/(^\s*)|(\s*$)/g, "");
		},


	}); 


	// ------------- 涉及到 设计模式的封装 ------------- 

	//扩展工具方法 动画相关的操作：
	//缓动策略算法
	let tween = {
		linear: function(t, b, c, d) {
			return c * t / d + b;
		},
		easeIn: function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},
		strongEaseIn: function(t, b, c, d) {
			
			return c * (t /= d) * t * t * t * t + b;
		},
		strongEaseOut: function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		},
		sineaseIn: function(t, b, c, d) {
			return c * (t /= d) * t * t + b;
		},
		sineaseOut: function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		}
	};

	/**
	 * dom动画
	 */
	class DomAnimate{
		constructor(dom){
			this.dom = dom; // 进行运动的 dom 节点
			this.startTime = 0; // 动画开始时间
			this.startPos = 0; // 动画开始时，dom 节点的位置，即 dom 的初始位置
			this.endPos = 0; // 动画结束时，dom 节点的位置，即 dom 的目标位置
			this.propertyName = null; // dom 节点需要被改变的 css 属性名
			this.easing = null; // 缓动算法
			this.duration = null; // 动画持续时间
		}

		start (propertyName, endPos, duration, easing) {
			this.startTime = +new Date; // 动画启动时间
			this.startPos = this.dom.getBoundingClientRect()[propertyName]; // dom 节点初始位置
			this.propertyName = propertyName; // dom 节点需要被改变的 CSS 属性名
			this.endPos = endPos; // dom 节点目标位置
			this.duration = duration; // 动画持续事件
			this.easing = tween[easing]; // 缓动算法
			let self = this;
			let timeId = setInterval(function() { // 启动定时器，开始执行动画
				if (self.step() === false) { // 如果动画已结束，则清除定时器
					clearInterval(timeId);
				}
			}, 19);
		}

		step (){ 
			let t = +new Date; // 取得当前时间 5 
			if ( t >= this.startTime + this.duration ){ // 动画运行结束 操作
				this.update( this.endPos ); // 更新小球的 CSS 属性值
				return false; 
			} 
			
			let pos = this.easing( t - this.startTime, this.startPos, 
			this.endPos - this.startPos, this.duration ); 
			// pos 为小球当前位置
			this.update( pos ); // 更新小球的 CSS 属性值  
		}

		update ( pos ){ 
			this.dom.style[ this.propertyName ] = pos + 'px'; 
		}

	}

	/**
	 * 发布订阅模式 
	 * 
	 * 发布者
	 */
	class Publisher{
		constructor(){
			this.listenList = []; //订阅队列
		}

		/**
		 * 订阅方法
		 * @param {*} key 
		 * @param {*} fn 
		 */
		listen(key, fn){
			let _that = this;

			if (!_that.listenList[key]) {
				_that.listenList[key] = [];
			}
			_that.listenList[key].push(fn);
		}

		/**
		 * 发布方法
		 */
		trigger() {
			let _that = this;

			let key = Array.prototype.shift.call(arguments),
				fns = _that.listenList[key];
			if (!fns || fns.length === 0) {
				return false;
			}
			for (let i = 0, fn; fn = fns[i++];) {
				fn.apply(this, arguments);
			}
		}

		/**
		 * 取消订阅方法
		 * @param {*} key 
		 * @param {*} fn 
		 */
		remove(key, fn) {
			let _that = this;

			let fns = _that.listenList[key];
			if (!fns) {
				return false;
			}

			if (!fn) {
				fns && (fns.length = 0);
			} else {
				for (let l = fns.length - 1; l >= 0; l--) {
					if (fns[l] === fn) {
						fns.splice(l, 1);
					}
				}
			}
		}


	}

	Components.extend({
		/**
		 * 单例模式 
		 */
		singleTon: function(fn, ...args){
			
			let fproxy = new Proxy(fn, {
				construct: function(target, args) {
					if(!this.singleton){
						this.singleton = new target(...args);
					}
					return this.singleton;
				},
				singleton:0   // 这个属性是重点,控制单例
			});

			return new fproxy(...args);

		},
		
		/**
		 * 哈哈，提供 链式调用~~
		 * 策略模式-代理模式-暴露式模块模式，实现缓动动画。
		 * @param { string } domid 元素的id
		 */
		AnimateStrategy: function(domid){
			let dom = document.getElementById( domid );
			let _self = this;
			return {
				/**
				 * 
				 * @param  {...any} args  
				 * propertyName：要改变的 CSS 属性名，比如'left'、'top'，分别表示左右移动和上下移动。
				 * endPos：      小球运动的目标位置。
				 * duration：    动画持续时间。  
				 * easing：      缓动算法。
				 */
				run:function(...args){
					(new DomAnimate( dom )).start( ...args );
					return _self.AnimateStrategy(domid);
				}
			}
		},
		
		/**
		 * 策略模式-Proxy，实现缓动动画。
		 */
		AnimateProxy: function(){
			//todo Proxy construct监听 new方法 。  
			//实现后，意义不大~
		},

		/**
		 * 发布-订阅模式 
		 * Publisher / Subscriber
		 * 
		 */
		Publisher: function(){
			return new Publisher();
		}

	})



	//扩展实例方法
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


	//扩展实例方法 
		/**
	 * 
	 * @param {*} id  需要加载的父元素  如果为空，则全页面覆盖的loading，不为空则为局部loading
	 * @param {boolean} sign  false 清除，true和 空 ，添加loading
	 */
	Components.ct.loading = function (id,sign){
		if(typeof sign === "boolean"){
			if(!sign){//清除
				let fatherL;
				let loaddiv;
				if(id && typeof id === "string"){
					fatherL = document.getElementById(id);
					loaddiv=document.getElementById(id+"-loading");//找到子元素    
				}else if(id == null){
					fatherL = document.body;
					loaddiv=document.getElementById("components-body-loading");//找到子元素    
				}
				
				fatherL.removeChild(loaddiv);
				return '';  
			}else{
				//no deal
			}
		}

		let loadhtml = `<svg x="0px" y="0px" width="70px" height="150px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">
				<rect x="0" y="13" width="4" height="5" fill="#F56C6C">
					<animate attributeName="height" attributeType="XML"
						values="5;21;5" 
						begin="0s" dur="0.6s" repeatCount="indefinite" />
					<animate attributeName="y" attributeType="XML"
						values="13; 5; 13"
						begin="0s" dur="0.6s" repeatCount="indefinite" />
				</rect>
				<rect x="10" y="13" width="4" height="5" fill="#F56C6C">
					<animate attributeName="height" attributeType="XML"
						values="5;21;5" 
						begin="0.15s" dur="0.6s" repeatCount="indefinite" />
					<animate attributeName="y" attributeType="XML"
						values="13; 5; 13"
						begin="0.15s" dur="0.6s" repeatCount="indefinite" />
				</rect>
				<rect x="20" y="13" width="4" height="5" fill="#F56C6C">
					<animate attributeName="height" attributeType="XML"
						values="5;21;5" 
						begin="0.3s" dur="0.6s" repeatCount="indefinite" />
					<animate attributeName="y" attributeType="XML"
						values="13; 5; 13"
						begin="0.3s" dur="0.6s" repeatCount="indefinite" />
				</rect>
				
			</svg>`;

			let divL = document.createElement("div");
			divL.setAttribute("class", "loading-model");
			divL.innerHTML = loadhtml;

		if(id && typeof id === "string"){
			let fatherL = document.getElementById(id);
			
			if(fatherL.style.position && fatherL.style.position != "static"){
				//no deal
			}else{
				fatherL.style.position = 'relative';
			}

			divL.setAttribute("id", id+"-loading");
			fatherL.appendChild(divL);

		}else if(id == null){//body add loading
			divL.setAttribute("id", "components-body-loading");
			document.body.appendChild(divL);
		}else if(typeof id === "boolean"){// boolean
			if(id){ //加载
				divL.setAttribute("id", "components-body-loading");
				document.body.appendChild(divL);
			}else{ //清除
				let fatherL = document.body;
				let loaddiv=document.getElementById("components-body-loading");//找到子元素 
				
				fatherL.removeChild(loaddiv);
			}
		}
	}




	/**
	 * 提示信息弹框                       yh: 里面的生成元素， divL 可以写成单例模式！！
	 * @param {*} config  弹框需要的字段信息
	 * {
			title:"弹框标题-支持html"
			content:"弹框内容-支持html"
			color:标题文字颜色
			time:弹框过time时间后，隐藏
			btn:"确定"
		}
	 */
	Components.ct.alert = function(config){
		if(typeof title === "boolean"){
			document.body.removeChild(document.getElementById("ct_page_alert"));
			return '';
		}
		let showtitle = config.title?config.title:'提示';
		let showcontent = config.content?config.content:'';
		let showcolor = config.color ? config.color:'#09a5ee';
		let showTime = config.time?config.time:'';
		let showBtn = config.btn?config.btn:'确定';
		let alertHtml = `<div id="ct_page_alert_box">
				<div id="ct_page_alert_title" style="color:${showcolor}">${showtitle}</div>
				<div id="ct_page_alert_content">${showcontent}</div>
				<button type="button" id="ct_page_alert_button" >${showBtn}</button>
			</div>`;

		let divL = document.createElement("div");
		divL.setAttribute("id", "ct_page_alert");
		divL.innerHTML = alertHtml;
		document.body.appendChild(divL);


		let timeout = '';
		//绑定事件
		document.getElementById("ct_page_alert_button").addEventListener("click",function(){
			document.body.removeChild(document.getElementById("ct_page_alert"));
			
			if(timeout){
				clearTimeout(timeout);
			}
			
		})
		if(showTime){
			timeout = setTimeout(function(){
				document.body.removeChild(document.getElementById("ct_page_alert"));
			},showTime)
		}

	}

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

