document.addEventListener("DOMContentLoaded", function(event) {
	
	
	// 简单模式
	// 模拟数据 
	let testdata11 = [
		{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			target: {
				id: "bbb",
				nodeId: "bbb",
				name: "左宗棠",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			id: "aaabbb",                   //只要关系相关的两个实体相同，id就要相同
			relationId: "relation111",     //关系线的id
			relationIds: [],                 //存放多个relationId ，如果两个实体间有多个关系，前端需要每个关系的id
			relationTypeName: "对手",      //关系的中文名
			relationNumber: 2,               //相同关系线的个数
			time:'2019-11-01'
		},
		{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			target: {
				id: "ccc",
				nodeId: "ccc",
				name: "曾国藩",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			id: "aaaccc",
			relationId: "relation222",
			relationIds: [],
			relationTypeName: "师徒",
			relationNumber: 1,
			time:'2019-06-01'
		},
		{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			target: {
				id: "ddd",
				nodeId: "ddd",
				name: "慈禧",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			id: "cccddd",
			relationId: "relation333",
			relationIds: [],
			relationTypeName: "上司",
			relationNumber: 1,
			time:'2019-04-01'
		},
		{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			target: {
				id: "eee",
				nodeId: "eee",
				name: "伊藤博文",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			id: "aaaeee",
			relationId: "relation444",
			relationIds: [],
			relationTypeName: "朋友",
			relationNumber: 1,
			time:'2019-03-01'
		},
		{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			target: {
				id: "ggg",
				nodeId: "ggg",
				name: "轮船招商局",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#2da5da",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			},
			id: "aaaggg",
			relationId: "relationggg",
			relationIds: [],
			relationTypeName: "创办",
			relationNumber: 1,
			time:'2019-01-01'
			
		},
		//
	];
	
	//window.Components.analytic.run("showarea", testdata);
	
	let testdata = [{
			source: {
				id: "aaa",
				nodeId: "aaa",
				name: "李鸿章",
				conceptId: "csry",
				conceptName: "测试",
				confirm: true,
				fill: "#e60012",
				stroke: "rgb(51, 208, 255)",
				icon: false,
			}
		}]
	//分析模式
	window.Components.analytic.run("showarea", {
		type:"analytic",
		search:true,
		timeaxis:true,
		data:testdata
	});
	
	//只显示某个节点相关的节点
	//Components.analytic.showItem({ 	id: "aaa" });
	
	/**
	 * 获得 点击的节点信息
	 * @param function 回调函数
	 */
	Components.analytic.getClickNode(function(data){
		
		//console.log(this);  // 改变了this的指向， 现在指向点击的节点， 可以自主进行一些操作
		//console.log(data);

	});
	
	
	
});