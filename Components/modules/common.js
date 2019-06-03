/**
 * @fileoverview 通用的一些方法
 * v1.0 
 *
 * 
 * @author NGM
 * @version 1.0
 * 
 * #包括 
 * promise封装ajax请求，
 * 封装时间方法， 
 * 解析search ，
 * 禁止文字选择
 * 动态加载js
 * 
 * 
 * 等...
 * 
 */

/** 
 * @namespace component的所有类均放在Component命名空间下
 */
var Component = window.Component = Component || {};


(function(){

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
	
	//在这开放通用的方法
	Component.common = {
		/**
		 * 获取数据的通用接口
		 */
		getData:new getData(),
		/**
		 * 根据字段，处理对应的时间范围
		 */
		dealTime: new getTime(),
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

		/**
		 * 前端也能解决sql注入？ 前端能起到震慑作用！！
		 * @param {*} str 需要验证sql注入的字符串
		 * @returns 存在sql注入风险，return false;  没有风险return true;
		 */
		SqlValid(str){
			let re=/select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i ;
			if(re.test(str)){
				return false;// 错误！！
			}else{
				return true; // 正常
			}
		},
		/**
		 * 用户输入数据XSS预防
		 * !! 切记，所有属于用户输入的值想要显示到浏览器都需要经过该方法处理
		 * 当然，本来就是后端给的html代码的数据，不可以放到这，否则会导致里面的html失效
		 * @param {*} str 未处理字符串
		 * @returns str 处理后的字符串
		 */
		XSSWall : function(str){
				var hex = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
				var preescape = str;
				var escaped = "";
				for (var i = 0; i < preescape.length; i++) {
					var p = preescape.charAt(i);
					escaped = escaped + escapeCharx(p);
				}

				return escaped;

				function escapeCharx(original) {
					var found = true;
					var thechar = original.charCodeAt(0);
					switch (thechar) {
						case 10:
							return "<br/>";
							break; //newline
						case 32:
							return "&nbsp;";
							break; //space
						case 34:
							return "&quot;";
							break; //"
						case 38:
							return "&amp;";
							break; //&
						case 39:
							return "&#x27;";
							break; //'
						case 47:
							return "&#x2F;";
							break; // /
						case 60:
							return "&lt;";
							break; //<
						case 62:
							return "&gt;";
							break; //>
						case 198:
							return "&AElig;";
							break;
						case 193:
							return "&Aacute;";
							break;
						case 194:
							return "&Acirc;";
							break;
						case 192:
							return "&Agrave;";
							break;
						case 197:
							return "&Aring;";
							break;
						case 195:
							return "&Atilde;";
							break;
						case 196:
							return "&Auml;";
							break;
						case 199:
							return "&Ccedil;";
							break;
						case 208:
							return "&ETH;";
							break;
						case 201:
							return "&Eacute;";
							break;
						case 202:
							return "&Ecirc;";
							break;
						case 200:
							return "&Egrave;";
							break;
						case 203:
							return "&Euml;";
							break;
						case 205:
							return "&Iacute;";
							break;
						case 206:
							return "&Icirc;";
							break;
						case 204:
							return "&Igrave;";
							break;
						case 207:
							return "&Iuml;";
							break;
						case 209:
							return "&Ntilde;";
							break;
						case 211:
							return "&Oacute;";
							break;
						case 212:
							return "&Ocirc;";
							break;
						case 210:
							return "&Ograve;";
							break;
						case 216:
							return "&Oslash;";
							break;
						case 213:
							return "&Otilde;";
							break;
						case 214:
							return "&Ouml;";
							break;
						case 222:
							return "&THORN;";
							break;
						case 218:
							return "&Uacute;";
							break;
						case 219:
							return "&Ucirc;";
							break;
						case 217:
							return "&Ugrave;";
							break;
						case 220:
							return "&Uuml;";
							break;
						case 221:
							return "&Yacute;";
							break;
						case 225:
							return "&aacute;";
							break;
						case 226:
							return "&acirc;";
							break;
						case 230:
							return "&aelig;";
							break;
						case 224:
							return "&agrave;";
							break;
						case 229:
							return "&aring;";
							break;
						case 227:
							return "&atilde;";
							break;
						case 228:
							return "&auml;";
							break;
						case 231:
							return "&ccedil;";
							break;
						case 233:
							return "&eacute;";
							break;
						case 234:
							return "&ecirc;";
							break;
						case 232:
							return "&egrave;";
							break;
						case 240:
							return "&eth;";
							break;
						case 235:
							return "&euml;";
							break;
						case 237:
							return "&iacute;";
							break;
						case 238:
							return "&icirc;";
							break;
						case 236:
							return "&igrave;";
							break;
						case 239:
							return "&iuml;";
							break;
						case 241:
							return "&ntilde;";
							break;
						case 243:
							return "&oacute;";
							break;
						case 244:
							return "&ocirc;";
							break;
						case 242:
							return "&ograve;";
							break;
						case 248:
							return "&oslash;";
							break;
						case 245:
							return "&otilde;";
							break;
						case 246:
							return "&ouml;";
							break;
						case 223:
							return "&szlig;";
							break;
						case 254:
							return "&thorn;";
							break;
						case 250:
							return "&uacute;";
							break;
						case 251:
							return "&ucirc;";
							break;
						case 249:
							return "&ugrave;";
							break;
						case 252:
							return "&uuml;";
							break;
						case 253:
							return "&yacute;";
							break;
						case 255:
							return "&yuml;";
							break;
						case 162:
							return "&cent;";
							break;
						case '\r':
							break;
						default:
							found = false;
							break;
					}
					if (!found) {
						if (thechar > 127) {
							var c = thechar;
							var a4 = c % 16;
							c = Math.floor(c / 16);
							var a3 = c % 16;
							c = Math.floor(c / 16);
							var a2 = c % 16;
							c = Math.floor(c / 16);
							var a1 = c % 16;
							return "&#x" + hex[a1] + hex[a2] + hex[a3] + hex[a4] + ";";
						} else {
							return original;
						}
					}
				}
			
		},
		/**
     * Promise 动态加载js
     * @param {*} url 要加载的js
     */
    mapLoadScriptPromise : function (url) {
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
		},
		

	}


})();

