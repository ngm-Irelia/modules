document.addEventListener("DOMContentLoaded", function(event) {
  //这里是使用方式
//   Components.ct.extend({
// 		aaaa:function(){
// 			console.log("tttttt");
// 		}
// 	})
	
	/* let getMaterialProTable = function(param){
		let _thatData = this;
		return new Promise(function(resolve, reject) {
			Components.getData('common/getQuerycolumn',{table:"material"}, 'GET').then(function(data) {
				resolve(data);
			}).catch(function() {
				reject(false);
			})
		}) 
	};


	getMaterialProTable({}).then(()=>{
		console.log("then ...")
	}).catch(()=>{
		console.log("catch ...")
	}) */

	//loading 组件
	Components().loading("loading-demo");//"loading-demo"
	Components().loading("loading-demo2");
	setTimeout(function(){
		Components().loading("loading-demo",false);
	},3000)	



	//alert 弹框 组件
	$("#alert1").bind("click",function(){
		Components().alert({
			title:"标题",
			content:"弹框内容-支持html"
		});

	})

	//notice 公告栏 组件
	$("#notice-btn").bind("click",function(){
		Components().notice({
			title:"<span style='color:red;'>标题</span>:",
			content:"弹框内容-支持html",
			color:"red",
			speed:10,
			size:2,
			dom:'notice'
		});

	})





});