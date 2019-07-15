/**
* 关系图组件 v1.0 
* @author ngm
* 
* @param suspend 搜索该单词，显示暂时禁掉的功能
*/
 
/** 
* @namespace Components的所有类均放在Components命名空间下
*/
var Components = window.Components = Components || {};

/*主要的关系图谱文件*/
; (function () {


	class Analytic {

		constructor() {
			this.imgUrl = '../typeicon/';                              //图片的路径  ！！ 需改这里，里面就不需要修改了
			this.countPosNodesUrl = '../countPosNodes.js'; //countPosNodes.js的路径  ！！ 需改这里，里面就不需要修改了

			this.useType = "show";        // analytic ：分析模式；   show ： 显示模式；  easy : 简单模式，data外面传入，没有交互
			this.showData = [];           // 简单模式 显示的数据
			this.magicGraph = {};         // 全局变量

			this.timeAxisSign = false;    // 时间轴是否显示
			this.searchModuleSign = false;// 搜索框是否
			//analytic 模拟数据
			this.analyticData = [ ];
			
			this.setMouseDownNodeCallBack = {};  // MouseDown节点的回调函数
			this.setMouseUpNodeCallBack = {};    // MouseUp节点的回调函数

			window.nodes = [];
			window.links = [];


			/**
			 * 启动方法
			 *  arguments  [
			 *   domId : 要存放关系图的盒子id,
			 *   config ： 是数组，使用简单模式 ，是{
						type:"analytic",    //分析模式 高级模式
						search:true,        //搜索框启用
						timeaxis:true       //时间轴启用
					}     启动高级模式;
			* ]
			* 
			* 简单模式： 传过来的数组就是需要展示的数据， 并且不会有任何交互操作
			* 分析模式： 传过来 analytic，里面的数据需要修改 pageData 中对应的数据接口
			* 分析模式： 传过来 其他，里面的数据需要修改 pageData 中对应的数据接口，比 分析模式少一些交互
			*/
			
			this.startLoad(...arguments);
		}

		/**
		 * 功能提到Components里面，该方法暂时不用
		 */
		run(){
			let _that = this;
			_that.startLoad(...arguments);
		}

		startLoad(){
			let _that = this;
			
			if(!arguments[0]){return '';}

			let domId = arguments[0];
			let config = arguments[1] || false;
			_that.config = config;
			_that.analyticData = config.data;
			
			if(config instanceof Array){
				_that.useType = "easy";

				_that.showData = config;
				
			}else if(typeof config === "object"){
				_that.useType = "analytic";
				
				if(config.search){  
					_that.searchModuleSign = true;// 搜索框 显示
				}

				if(config.timeaxis){ 
					_that.timeAxisSign = true;    // 时间轴 显示
				}
				
			 

			}
			

			$("#"+domId).html(`<div id="topo_network" class="topo_network" style="height:100%;width:100%;">
				<svg class="topo-console ctrl" id='topo_svgContent'>
					<g class="main" id='gmain'></g>
				</svg>
			</div>`);

			setTimeout(function(){
				_that.load();
			},1);
		}


		/**
		 * 显示一部分关系图
		 * @param show { 	id: "aaa" }
		 */
		showItem(d){
			
			let _that = this;
			let magicGraph = _that.magicGraph;

			if(!d){
				magicGraph.pathUpdate.selectAll("path.link,text").filter(function (y) { return true; }).style("opacity", "1");
				magicGraph.enterNodes.filter(function (t, i) { return true; }).style("opacity", "1");
				return "";
			};
			
			magicGraph.enterNodes.style("opacity", 0.2);
			magicGraph.pathUpdate.selectAll("path.link,text").style("opacity", 0);

			magicGraph.pathUpdate.selectAll("path.link,text")
			.filter(function (y) {
				if(d){
					return (y.source.id === d.id) || (y.target.id === d.id);
				}else{
					return true;
				}
			})
			.style("opacity", "1")
			.each(function (dLinks, iLinks) {
				magicGraph.enterNodes.filter(function (t, i) {
					return (t.id === dLinks.target.id) || (t.id === dLinks.source.id);
				}).style("opacity", "1");
			});
		
			
		}


		/**
		 * 保存图片
		 * @param name string 图片名称
		 */
		savePictue(name){
			let _that = this;
			_that.magicFunctions.screenshot(name);
		}

		/**
		 * 获得 MouseDown点击 节点的信息
		 * @param callback function 回调函数
		 */
		setMouseDownNode(callback){
			let _that = this;
			
			if(typeof callback === 'function'){
				_that.setMouseDownNodeCallBack = callback;
			}
			
		}

		/**
		 * 获得 MouseUp点击 节点的信息
		 * @param callback function 回调函数
		 */
		setMouseUpNode(callback){
			let _that = this;
			
			if(typeof callback === 'function'){
				_that.setMouseUpNodeCallBack = callback;
			}
			
		}
		
		/**
		 * 节点操作菜单 扩展 功能的回调
		 * @param callback function 回调函数
		 */
		extendCallBack(callback){
			let _that = this;
			
			if(typeof callback === 'function'){
				_that.setExtendCallBack = callback;
			}
			
		}
		

		/**
		 * 单纯的新增 节点
		 */
		addNewNode(nodeList){
			let _that = this;
			
			setTimeout(()=>{
				let newnodes = nodes.concat(nodeList);
				_that.magicFunctions.loadSvgStart(newnodes, links);
			},20)
			

		}

		/**
		 * 绑定事件
		 */
		loadEvent(){
			
		}

		/**
		 * 所有的接口请求信息
		 */
		pageData() {
			let _that = this;
			let { searchModule, entityRelations, information, extend} = _that.config.url;
			return {
				/**
				 * 搜索框 搜索按钮
				 * @param param 发送请求，需要的参数
				 */
				getSearchModuleData: function(param) {
					return new Promise(function (resolve, reject) {
						Components.getData(searchModule, '', 'GET').then(function (data) {
							resolve(data);
						}).catch(function (err) {
							reject(err);
						})
					})
				},

				/**
				 * 获得实体相关的所有关系名称
				 * @param param 发送请求，需要的参数
				 */
				getEntityRelations: function(param) {
					return new Promise(function (resolve, reject) {
						resolve(["朋友", "孩子"]);
						return '';
						Components.getData(entityRelations, param, 'GET').then(function (data) {
							resolve(data);
						}).catch(()=>{
							//请求报错的时候，我们模拟的数据
							resolve(["朋友", "孩子"]);
						})
					})
				},

				/**
				 * 获得实体相关的基本信息
				 * @param param 发送请求，需要的参数
				 */
				getInformation: function(param) { 
					return new Promise(function (resolve, reject) {
						resolve(_that.analyticData[0].source);
						return ;
						if(_that.useType === "easy"){
							resolve(_that.showData[0].source);
							return '';
						} 
						Components.getData(information, param, 'GET').then(function (data) {
							resolve(data.data);
						}).catch(()=>{
							//请求报错的时候，我们模拟的数据
							resolve(_that.analyticData[0].source);
						})
					})
				},


				/**
				 * 实体 扩展信息
				 * @param param 发送请求，需要的参数
				 */
				getExtendData: function(param) {
					return new Promise(function (resolve, reject) {//" + "=%QUERY%&"+param_str; +'&&_='+param.data
						if(_that.useType === "easy"){
							resolve(_that.showData);
							return '';
						}
						
						Components.getData(extend, param, 'GET').then(function (data) {
							if(data instanceof Array){
								resolve(data);
							}
							_that.setExtendCallBack(data);
						}).catch(()=>{
							resolve(_that.analyticData);      //这是演示环境
							_that.setExtendCallBack(data);
						})
					})
				},



			}
		
		

			


			
		}

		/**
		 * 这是关系图的重点方法，里面交互太复杂，一些模块很难拆出
		 */
		load() {
			let _that = this;
			//全局变量
			let magicGraph = _that.magicGraph = {
				axisWidth: $("#topology_timeline_axis").width(),
				axisHeight: $("#topology_timeline_axis").height(),
				topoWidth: $("#topo_network").width(),
				topoHeight: $("#topo_network").height(),
				isDrag: false,
				isMove: false,
				layoutIndex: 2,
				depth: 0,
				strokeWidth: 1,//线的粗细
				getMoreMenusData: [], // 后台获得相关 关系名称
				timeout: null,
				numbers: [],
				historytimes: [], //历史时间数据
				selected_node: null,
				selected_link: null,
				mousedown_link: null,
				mousedown_node: null,
				mouseup_node: null,
				virtualScreen: false,
				dragNodes: false, //托选的时候，为true表示集体拖动节点
				virtualdata: null,
				myMakeLinks: {},
				filterNodeId: [],
				DIRECTION_UP: 'up',
				DIRECTION_RIGHT: 'right',
				DIRECTION_DOWN: 'down',
				DIRECTION_LEFT: 'left',
				timedatas: null,
				svg: d3.select("g.main"),
				linkDefaultColor: '#A5ABB6',
				drag_line: d3.select("g.main")
					.attr("transform", 'translate(0,0)')
					.append("svg:path")
					.attr("class", 'links dragline hidden')
					.attr("d", "M0,0L0,0"),
				pathUpdate: d3.select("g.main").append("svg:g").selectAll(".outlink"),
				enterNodes: d3.select("g.main").append("svg:g").selectAll("g"),
				topoTimeLineSvg: d3.select(".topo_timeline_svg")
			};

			 

			const linkColorArray = d3.scale.category20();
			const worker = new Worker(_that.countPosNodesUrl); //启动webworker
			const magicFunctions = new MagicFunctions();
			_that.magicFunctions = new MagicFunctions();
			const reqLeavesApi = new ReqLeavesApi();
		 

			const drawdraglinknode = new Drawdraglinknode();
			//上一步
			const backfun = magicFunctions.revocation();
			//拖动页面的所有节点和关系
			const dragNodes = d3.behavior.drag()
				.on("dragstart", () => {
					d3.event.sourceEvent.stopPropagation();
				})
				.on("drag", function (d) {
					let x = d3.event.x,
						y = d3.event.y;
					d3.select(this).attr("transform", "translate(" + x + "," + y + ")").each((d) => {
						d.px = x;
						d.py = y;
						d.x = x;
						d.y = y;
					});
					drawdraglinknode.dragNodeandLink(d);
					d3.select(".topoMenu").attr("transform", "translate(" + x + "," + y + ")");
					for (let i = 0; i < nodes.length; i++) {
						let nx1 = nodes[i].x - 8;
						let nx2 = nodes[i].x + 8;
						let ny1 = nodes[i].y - 8;
						let ny2 = nodes[i].y + 8;
						if (Math.floor(nx1) <= x && x <= Math.ceil(nx2) && Math.floor(ny1) <= y && y <= Math.ceil(ny2) && nodes[i].id !== d.id && nodes[i].type == d.type) {
							magicGraph.enterNodes.filter(function (node) {
								return node.id === nodes[i].id;
							})
								.select(".outring")
								.style("stroke", "#ffd862");
						}
					}
				})
				//节点信息对比
				.on("dragend", (d) => {
				});

			magicGraph.topoTimeLineSvg.attr("width", magicGraph.axisWidth).attr("height", magicGraph.axisHeight);
			d3.select("#topo_network")
				.on("mousemove", magicFunctions.mousemove) //托动连线
				.on('mouseup', magicFunctions.mouseup);
			d3.select(".topo-console")
				.attr("tabindex", 1)
				.on("keydown", magicFunctions.keyflip)
				.on("keyup", magicFunctions.keyflip)
				.attr("width", magicGraph.topoWidth)
				.attr("height", magicGraph.topoHeight)
				.attr('oncontextmenu', 'return false;')
				.style("outline", "none");
			const menusg = magicGraph.svg.append('g');
			const zoomListener = d3.behavior.zoom()
				.scaleExtent([0.05, 3]) //缩放的倍数区间
				.on("zoom.start", () => {
					if (nodes.length > 200) {
						d3.selectAll("path.overlay,path.link,text.outword").style("display", "none");
					}
				})
				.on("zoom", magicFunctions.zoom);
			

			//功能函数集合
			function MagicFunctions() {

				this.revocation = function () {
					/*
					下面这些变量由于是在闭包里面，所以不会主动被内存清理，需要自己清理掉
					*/
					let preStep = [],
						sNodeLength = [],
						eNodeLength = [],
						sLinkLength = [],
						eLinkLength = [],
						addNodes = [],
						addLinks = [],
						preStepNum = 0,
						snodeNum = 0,
						slinkNum = 0,
						enodeNum = 0,
						elinkNum = 0,
						addNodeNum = 0,
						addLinkNum = 0,

						emptyTime = [{
							y: 0,
							time: '',
							relationName: ''
						}];
					return {
						//扩展之前，保存上一步的最后结束位置，向栈里添加元素
						pushstack: function (oNode, olink) {
							eNodeLength.push(oNode.length);
							eLinkLength.push(olink.length);
							enodeNum = eNodeLength.length;
							elinkNum = eLinkLength.length;
						},
						//删除节点的栈
						deleteList: function (dnode, dlink, order) {
							addNodes[addNodes.length] = dnode;
							addLinks[addLinks.length] = dlink;
							addNodeNum = addNodes.length;
							addLinkNum = addLinks.length;
							preStep.push(order);
							preStepNum = preStep.length;
						},

						//扩展，模型，集合，创建关系调用
						addstatus: function (nodes = undefined, links = undefined, obj) {
							switch (obj) {
								case "makerRelation":
									preStep.push(obj);
									preStepNum = preStep.length;
									break;
								case "collbllor":
									preStep.push(obj);
									preStepNum = preStep.length;
									break;
								default:
									sNodeLength.push(nodes.length);
									sLinkLength.push(links.length);
									//记录当前的长度，用于点击上一步事件时候递减
									snodeNum = sNodeLength.length;
									slinkNum = sLinkLength.length;
									preStep.push(obj);
									preStepNum = preStep.length;
							};
						},
						goBack: function () {
							let thisTimes = null;
							let backstep = preStep[--preStepNum];
							switch (backstep) {
								case "delete":
									let n = addNodes[--addNodeNum];
									let l = addLinks[--addLinkNum];
									for (let i = 0; i < n.length; i++) {
										nodes.splice(n[i].index, 0, n[i]);
									}
									for (let i = 0; i < l.length; i++) {
										links.splice(l[i].index, 0, l[i]);
									}
									addNodes.pop();
									addLinks.pop();
									preStep.pop();
									thisTimes = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据
									thisTimes.length ? timeAxis.disposeTimeData(thisTimes) : timeAxis.disposeTimeData(emptyTime);//删除时间再次调用跑时间轴
									globalFuction.drawTopoMap();
									break;
								case "extend":
									//如果起始长度和终结长度为0，不在递减，表示已经返回到最原始的第一步，不能再撤退了
									if (snodeNum === 0 && enodeNum === 0 && slinkNum === 0 && elinkNum === 0) {
										return;
									} else {
										//每次点击反向递减数组的长度-1，一直到弟0个元素
										//console.log(sNodeLength)
										//console.log(eNodeLength)
										//console.log(sLinkLength)
										//console.log(eLinkLength)

										//console.log(snodeNum)
										//console.log(enodeNum)
										//console.log(slinkNum)
										//console.log(elinkNum)
										const deletenodes = nodes.splice(sNodeLength[--snodeNum], eNodeLength[--enodeNum]);
										const deleteLinks = links.splice(sLinkLength[--slinkNum], eLinkLength[--elinkNum]);
										//console.log(nodes)
										//console.log(deletenodes)
										//console.log(links)
										//console.log(deleteLinks) 
										sNodeLength.pop();
										eNodeLength.pop();
										sLinkLength.pop();
										eLinkLength.pop();
										preStep.pop();
										thisTimes = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据
										thisTimes.length ? timeAxis.disposeTimeData(thisTimes) : timeAxis.disposeTimeData(emptyTime);//删除时间再次调用跑时间轴

										globalFuction.drawTopoMap();
									}
									break;
								case "collbllor":
									let colleNodes = localStorage.getItem("colleNodes"); //集合保存数据
									let localHistoryDatas = JSON.parse(colleNodes);
									let myNode = localHistoryDatas.nodes;
									let myLinks = localHistoryDatas.links;
									nodes.splice(0, nodes.length);
									links.splice(0, links.length);
									nodes.push(...myNode);
									links.push(...myLinks);
									globalFuction.drawTopoMap();
									localStorage.removeItem("colleNodes"); //移除集合缓存数据
									break;
								case "makerRelation": //当创建关系后，不允许再后退到上一步
									preStep = [];
									sNodeLength = [];
									eNodeLength = [];
									sLinkLength = [];
									eLinkLength = [];
									addNodes = [];
									addLinks = [];
									preStepNum = 0;
									snodeNum = 0;
									slinkNum = 0;
									enodeNum = 0;
									elinkNum = 0;
									addNodeNum = 0;
									addLinkNum = 0;
									preStep = [];
									break;
							};

						}
					};
				},

				// 根据现有节点分别计算x、y轴 最小、最大坐标
				this.theMostCoordinate = (xAxises, yAxises) => {
					return {
						xMax: Math.max.apply(Math, xAxises),
						xMin: Math.min.apply(Math, xAxises),
						yMax: Math.max.apply(Math, yAxises),
						yMin: Math.min.apply(Math, yAxises)
					}
				},

				//通过按住键盘的ctrl键，可以多选节点
				this.nodesBrushed = () => {
					let brushNode = d3.select(".topo_brush");
					let isEmpty = brushNode.empty();
					if (isEmpty) {
						let brush = d3.select(".topo-console")
							.append("g")
							.datum(function () {
								return {
									selected: false,
									previouslySelected: false
								};
							})
							.attr("class", "topo_brush")
							.call(
								d3.svg.brush()
									.x(d3.scale.identity().domain([0, magicGraph.topoWidth]))
									.y(d3.scale.identity().domain([0, magicGraph.topoHeight]))
									.on("brushstart", function (d) {
										d3.event.sourceEvent.stopPropagation();
									})
									.on("brush", function () {
										var extent = d3.event.target.extent();
										var scale = zoomListener.scale();
										var translateCoords = d3.transform(d3.select(".main").attr("transform"));
										var tx = translateCoords.translate[0];
										//刷子范围的坐标和页面节点的坐标进行对比
										var rx = extent[0][0];
										var ry = extent[0][1];
										var choseNodes = function (d) {
											return d.previouslySelected ^
												(extent[0][0] <= d.x * scale + tx && d.x * scale + tx < extent[1][0] && extent[0][1] <= d.y * scale + translateCoords.translate[1] && d.y * scale + translateCoords.translate[1] < extent[1][1])
										};
										//整体拖动节点
										if (magicGraph.dragNodes) {
											var selectedNode = magicGraph.enterNodes.filter(function (d) {
												return d.selected;
											});
											var bx = d3.select("rect.extent").attr("data-x");
											var by = d3.select("rect.extent").attr("data-y");
											var lx = rx - bx;
											var ly = ry - by;
											selectedNode.each(function (d) {
												d.x = d.px + lx;
												d.y = d.py + ly;
												d3.select(this).attr("transform", "translate(" + (d.px + lx) + "," + (d.py + ly) + ")");
												drawdraglinknode.dragNodeandLink(d);
											});
											//单纯的多选节点
										} else {
											magicGraph.enterNodes.classed("selected", function (d) {
												return d.selected = !!choseNodes(d);
											}).each(function (d) {
												d3.select(this)
													.selectAll(".outring")
													.style("stroke", function () {
														var _fill = "rgb(252, 49, 26)";
														if (d3.select(this).style("fill") !== _fill) {
															return d.selected ? "#ffd862" : "#33d0ff";
														} else {
															return d.selected ? "#ffd862" : "#ffbcaf";
														};
													});
											})
										}
									})
									.on("brushend", function () {
										magicGraph.dragNodes = true;
										const extent = d3.event.target.extent();
										let bx = d3.select("rect.extent").attr("data-x");
										if (!bx) {
											d3.select("rect.extent")
												.attr("data-x", extent[0][0])
												.attr("data-y", extent[0][1]);
										}
									})
							);
					}
				},

				//得到页面上节点的id,返回结果给右边统计信息调用
				this.getNodesid = () => {
					var allNodeId = {
						ids: [],
						types: []
					}; //所有工作台的已经显示的id
					if (nodes.length) {
						for (var i = 0, len = nodes.length; i < len; i++) {
							allNodeId.ids.push(nodes[i].id);
							allNodeId.types.push(nodes[i].conceptName);
						}
					}
					return allNodeId;
				},

				//截图函数
				this.screenshot = (versionName) => {
					
					//切换主题时，改变节点的字体颜色，截图才可以显示正常 const theme = document.cookie;
					let pngName = "关系图.png";
					if (versionName) {
						pngName = versionName + ".png";
					}
					
					const backgroundColor = "#fff"; //theme.includes("black") ? "#131b21" : theme.includes("white") ? "#fff" : "#f9f9fb";
					saveSvgAsPng(document.getElementById("topo_svgContent"),pngName,{"backgroundColor":backgroundColor});
					
				},

					// here 入口！！！
					this.loadSvgStart = (nodedata, linkdata,id) => {

						localStorage.setItem("saveState", false);
						calculatePos(nodedata, linkdata, null);//, null, "isHistory"

						//进入页面。自动扩展一层
						/* _that.pageData().getExtendData({
							"id": id,
							"extendType": "all",
							"extendBasis": ''
						}).then(function (data) {
							if (data) {
								reqLeavesApi.creatLinks(data);
							}
						}) */

					},

					//通过长按ctrl键托选页面节点
					this.keyflip = () => {
						// var shiftKey = d3.event.shiftKey || d3.event.metaKey;
						const shiftKey = d3.event.shiftKey;
						if (shiftKey) {
							if (d3.event.defaultPrevented) return;
							magicFunctions.nodesBrushed();
						} else {
							d3.selectAll(".topo_brush").remove();
							magicGraph.dragNodes = false;
							magicGraph.enterNodes.filter(function (d) {
								return d.selected;
							}).each(function (d) {
								d.px = d.x;
								d.py = d.y;
							})
						}
					},
					/*
					功能：搜索页面节点
					params {val}string 要搜索的节点名字
					*/
					this.searchNodes = (val) => {
						const str = val.replace(/\s+/gi, '');
						const n = magicGraph.enterNodes.filter(function (d) {
							return d.name === str;
						});
						if (!n[0].length) return;
						magicGraph.enterNodes.classed('selected', false);
						n.classed('selected', true);
						n.selectAll(".outring").style("stroke", "#ffd862");
						/*
						由于页面是可以拖动，当页面被整体拖动后，节点在svg上的位置会相对与父作出改变，
						此时需要得到拖动svg的位置，把它减去得到实际的位置
						*/
						const t = d3.transform(n.attr("transform"));
						const scale = zoomListener.scale();
						let x = -(t.translate[0]);
						let y = -(t.translate[1]);
						x = x * scale + magicGraph.topoWidth / 2;
						y = y * scale + magicGraph.topoHeight / 2;
						d3.select('.main')
							.transition()
							.duration(500)
							.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
						zoomListener.scale(scale);
						zoomListener.translate([x, y]);
					},
					//清空拖动连线的数据
					this.resetMouseVars = () => {
						magicGraph.mousedown_node = null;
						magicGraph.mouseup_node = null;
						magicGraph.mousedown_link = null;
					},
					//缩放函数
					this.zoom = () => {
						//对搜索框进行设置
						//$(".map_select_btn_div").css("width","0px");
						//$(".map_select_btn").css("width","0px");
						let val = $("#map_select_input").val();
						if (val) {
							$(".map_select_resultDiv").css("height", "0px");
							$(".map_select_resultDivSmall").css("height", "40px");
						} else {
							$(".map_select_resultDiv").css("height", "0px");
							$(".map_select_resultDivSmall").css("height", "0px");
						}


						d3.select("g.main")
							.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					},
					//拖动连接线
					this.mousemove = function () {
						if (!magicGraph.mousedown_node) return;
						var translateCoords = d3.transform(d3.select("g.main").attr("transform"));
						var scale = zoomListener.scale(); //svg放大后防止拖动线的位置改变
						magicGraph.drag_line.attr('d', 'M' + magicGraph.mousedown_node.x + ',' + magicGraph.mousedown_node.y + 'L' + (d3.mouse(this)[0] - translateCoords.translate[0]) / scale + ',' + (d3.mouse(this)[1] - translateCoords.translate[1]) / scale);
					},
					//放开鼠标进行连线
					this.mouseup = () => {
						if (magicGraph.mousedown_node) {
							// 隐藏线
							magicGraph.drag_line.classed('hidden', magicGraph.isMove).style('marker-end', '');
						}
						// 清除
						magicFunctions.resetMouseVars();
					},
					//整合关系里面的时间数据，得到一个包含关系名字，关系时间的数组对象
					this.getTimesFromLinks = (link) => {
						let objtiems = [];
						for (let i = 0; i < link.length; i++) {
							const element = link[i];
							
							const objtimeschild = {};
							if (element.time) {
								if (element.time.includes("|")) {
									const timeArr = element.time.split('|');
									for (let j = 0; j < timeArr.length; j++) {
										const objtimeschild = {};
										objtimeschild.relationName = element.relationTypeName;
										objtimeschild.time = timeArr[j].slice(0, 10);//maybe .replace(/,/g, "-")
										objtimeschild.y = 1;
										objtimeschild.sortId = objtimeschild.relationName + objtimeschild.time;
										objtiems.push(objtimeschild);
									}
								} else {
									objtimeschild.relationName = element.relationTypeName;
									objtimeschild.time = element.time.slice(0, 10);//maybe .replace(/,/g, "-")
									objtimeschild.y = 1;
									objtimeschild.sortId = objtimeschild.relationName + objtimeschild.time;
									objtiems.push(objtimeschild);
								}
							}
						}
						objtiems.sort(compare("sortId"));
						for (let i = 1; i < objtiems.length; i++) {
							const element1 = objtiems[i];
							const element2 = objtiems[i - 1];
							delete element1.sortId;
							delete element2.sortId;
							//对时间和关系名字一样的数据进行合并
							if (element1.time === element2.time && element1.relationName === element2.relationName) {
								element2.y = element1.y + element2.y;
								objtiems.splice(i, 1);
								i--;
							}
						}
						
						return objtiems;
					},
					//函数节流
					this.throttle = (myFunc, context) => {
						clearTimeout(myFunc.id);
						myFunc.id = setTimeout(() => {
							myFunc.apply(null, context);
						}, 350);
					}
			}
			//这是对扩展请求的数据进行处理的函数
			function ReqLeavesApi() {
				//把请求的源数据进行处理，得到source和target数据
				this.creatLinks = (data) => {
					let reqDatas = data;
					let noRepeatNodes = [];
					let parseNodes = [];
					reqDatas.forEach(d => {
						d.sortId = d.id + d.relationTypeName;
					});
					//给请求来的数据去重，如果按照多个点扩展，会有相同的关系
					let myNoRepeatArray = removeRepeatArray(reqDatas, "relationId");
					this.removeduplicate(myNoRepeatArray);
					//let myNoRepeatArray = removeRepeatArray(myNoRepeatRelationIdArray, "id");
					//拆分数据为节点
					//:这里的数据属性的添加或者删除，需要保持这个项目和工作台联动的数据也一致
					//topology.js、searchlist.js、relation.js、gis.js、message.js、doncument.js、event.js、entity.js
					myNoRepeatArray.forEach((link) => {

						link.type = link.type ? link.type : 'virtual',

						link.relationParentType = link.relationParentType ? link.relationParentType : "virtualType", //关系的父类

						parseNodes.push(link.target);
						parseNodes.push(link.source);
					});
					noRepeatNodes = removeRepeatArray(parseNodes, "nodeId");

					this.mergeDatas(noRepeatNodes, myNoRepeatArray);
				},

					//对nodes和links进行交集
					this.mergeDatas = (reqNodes, reqLinks) => {
						let lastNodes = new Set(); //集合
						let lastLinks = new Set();
						let length = nodes.length;
						nodes.map(node => lastNodes.add(node.nodeId));
						let newLinks = [],
							newHouses = []; // 去重后，需要新添加的节点
						reqNodes.map(node => lastNodes.has(node.nodeId) ? null : newHouses.push(node));
						newHouses.map(node => (lastNodes.add(node.nodeId), nodes.push(node)));
						if (links.length) {
							for (let i = 0; i < links.length; i++) {
								lastLinks.add(links[i].relationId);
							}
							for (let i = 0; i < reqLinks.length; i++) {
								if (!lastLinks.has(reqLinks[i].relationId)) {
									newLinks.push(reqLinks[i]);
								}
							}
							links.push(...newLinks);
						} else {
							links.push(...reqLinks);
						}

						const objectOriginLinks = links; //JSON.parse(originLinks)
						this.typeLinks(objectOriginLinks);//对数据进行标记

						if (links.length > 20) {
							//console.log("in if ....")
							//console.log(links)
							//return '';
						}

						const linksArray = new Map();
						for (let i = 0; i < links.length; i++) {
							linksArray.set(links[i].relationId, i);
						}
						for (let i = 0; i < objectOriginLinks.length; i++) {
							const index = linksArray.get(objectOriginLinks[i].relationId);
							links[index].linknum = objectOriginLinks[i].linknum;
							links[index].size = objectOriginLinks[i].size;
							objectOriginLinks[i].relationNumber ? links[index].relationNumber = objectOriginLinks[i].relationNumber : null;
						}

						calculatePos(nodes, links, length);
						//把没扩展之前的nodes和links记录下来
						backfun.pushstack(reqNodes, reqLinks);

						//标记状态：未保存
						$("#dsname_tip h4").removeAttr("data-versionid data-id");
						localStorage.setItem("saveState", false);
					},
					//关系分组
					this.typeLinks = (links) => {
						links.sort(compare("sortId"));
						var linkGroup = {};
						//对连接线进行统计和分组，不区分连接线的方向，只要属于同两个实体，即认为是同一组
						var linkmap = {};
						for (let i = 0; i < links.length; i++) {
							const source = links[i].source.id || links[i].source;
							let key = source < links[i].target.id ? source + ':' + links[i].target.id : links[i].target.id + ':' + source;
							if (!linkmap.hasOwnProperty(key)) {
								linkmap[key] = 0;
							}
							linkmap[key] += 1;
							if (!linkGroup.hasOwnProperty(key)) {
								linkGroup[key] = [];
							}
							linkGroup[key].push(links[i]);
							delete links[i].sortId;
						}
						//为每一条连接线分配size属性，同时对每一组连接线进行编号
						for (let i = 0; i < links.length; i++) {
							const source = links[i].source.id || links[i].source;
							let key = source < links[i].target.id ? source + ':' + links[i].target.id : links[i].target.id + ':' + source;
							links[i].size = linkmap[key];
							//links[i].size = 1;
							//links[i].repeat = linkmap[key];
							//同一组的关系进行编号
							let group = linkGroup[key];
							let keyPair = key.split(':');
							let type = 'noself'; //标示该组关系是指向两个不同实体还是同一个实体
							if (keyPair[0] == keyPair[1]) {
								type = 'self';
							}
							//给节点分配编号
							this.setLinkNumber(group, type);
						}
					},
					//给typeLinks分组的结果进行标记，打上linknum属性
					this.setLinkNumber = (group, type) => {
						if (group.length == 0) return;
						//对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分
						let linksA = [],
							linksB = [];
						for (let i = 0; i < group.length; i++) {
							let link = group[i];
							const source = group[i].source.id || group[i].source;
							if (source < link.target.id) {
								linksA.push(link);
							} else {
								linksB.push(link);
							}
						}
						//确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。
						//特殊情况：当关系都是连接到同一个实体时，不平分
						let maxLinkNumber = 0;
						//let mylinknum = 1;
						if (type == 'self') {
							maxLinkNumber = group.length;
						} else {
							maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length + 1) / 2;
						}
						//如果两个方向的关系数量一样多，直接分别设置编号即可
						if (linksA.length == linksB.length) {
							let startLinkNumber = 1;
							for (let i = 0; i < linksA.length; i++) {
								//linksA[i].linknum = mylinknum;
								linksA[i].linknum = startLinkNumber++;
							}
							startLinkNumber = 1;
							for (let i = 0; i < linksB.length; i++) {
								//linksB[i].linknum = mylinknum;
								linksB[i].linknum = startLinkNumber++;
							}
						} else { //当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号
							//如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）
							let biggerLinks, smallerLinks;
							if (linksA.length > linksB.length) {
								biggerLinks = linksA;
								smallerLinks = linksB;
							} else {
								biggerLinks = linksB;
								smallerLinks = linksA;
							}
							let startLinkNumber = maxLinkNumber;
							for (let i = 0; i < smallerLinks.length; i++) {
								//smallerLinks[i].linknum = mylinknum;
								smallerLinks[i].linknum = startLinkNumber--;
							}
							let tmpNumber = startLinkNumber;

							startLinkNumber = 1;
							let p = 0;
							while (startLinkNumber <= maxLinkNumber) {
								biggerLinks[p++].linknum = startLinkNumber++;
							}
							//开始负编号
							startLinkNumber = 0 - tmpNumber;
							for (let i = p; i < biggerLinks.length; i++) {
								//biggerLinks[i].linknum = mylinknum;
								biggerLinks[i].linknum = startLinkNumber++;
							}
						}
					},
					this.removeduplicate = (link) => {
						let count = 1;
						for (let i = 0; i < link.length - 1; i++) {
							if ((link[i].id === link[i + 1].id && link[i].source === link[i + 1].source) && link[i].relationTypeName === link[i + 1].relationTypeName) {
								link[i].relationNumber = ++count;
								if (link[i].time) {
									const time = link[i + 1].time ? '|' + link[i + 1].time : "";
									link[i].time += time;
								}
								link.splice(i + 1, 1);
								i--;
							} else {
								count = 1;
							}
						}
					}
			}
			//所有Window下的函数集合
			window.globalFuction = {
				/*
				@function 删除节点或者关系
				@params {deleteNode}值有效表示删除点
				@params	{deleteLink}值有效表示删除关系
				*/
				deleteNodesLinks: function (deleteNode, deleteLink) {
					let deleteNodes = [],
						deleteLinks = [],//存放删除的数据
						thistimes = null;
					let emptyTime = [{
						y: 0,
						time: '',
						relationName: ''
					}];
					let deleteTarget = function () {
						//删除节点和与其相关的关系

						for (let j = 0; j < links.length; j++) {
							if (links[j].target.selected || links[j].source.selected) {
								deleteLinks.push(links[j]);
								links.splice(j, 1);
								j--;
							}
						}

						thistimes = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据
					};
					if (typeof deleteNode === 'string') { //删除节点
						for (let i = 0; i < nodes.length; i++) {
							if (nodes[i].selected) {
								deleteNodes.push(nodes[i]);
								nodes.splice(i, 1);
								i--;
							}
						}
						deleteTarget();
						backfun.deleteList(deleteNodes, deleteLinks, "delete");
					} else if (typeof deleteNode === 'object') { //统计的刷新实现删除
						for (let i = 0; i < nodes.length; i++) {
							if (deleteNode.includes(nodes[i].id)) {
								deleteNodes.push(nodes[i]);
								nodes.splice(i, 1);
								i--;
							}
						}
						deleteTarget();
						backfun.deleteList(deleteNodes, deleteLinks, "delete");
					} else if (deleteLink) { //删除关系
						deleteTarget();
						backfun.deleteList(deleteNodes, deleteLinks, "delete");
					}
					thistimes.length ? timeAxis.disposeTimeData(thistimes) : timeAxis.disposeTimeData(emptyTime);//删除时间再次调用跑时间轴
					globalFuction.drawTopoMap();
				},
				//功能：绘制图形函数
				drawTopoMap: function (duration = 0) {
					d3.selectAll(".outlink,g.node").style("display", 'block');
					const arc = (innerRadius, outerRadius) => {
						const arc = d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(outerRadius)
							.startAngle(0)
							.endAngle(360)
							.padAngle(0);
						return arc;
					};
					magicGraph.pathUpdate = magicGraph.pathUpdate.data(links, function (d) {
						return d.relationId;
					});
					magicGraph.pathUpdate.enter().append("g")
						.attr("class", "outlink")
						.style("display", d => d.source.display === 'none' || d.target.display === 'none' ? 'none' : 'block')
						.on("click", magicTopoEvents.linkClick())  // 线条的单击事件
						//.on("dblclick", magicTopoEvents.linkDblclick())  // todo线条的双击事件 人工标注
						.on("mouseover", function (d) {
							$("svg.selecting").length ? null : d3.select(this).select("path.overlay").style("opacity", 0.3);
						})
						.on("mouseout", function (d) {
							d3.select(this).select("path.overlay").style("opacity", 0);
						})
						.each(function (d) {
							d3.select(this).append("path")
								.attr("class", "link")
								.style("stroke", "none")
								.attr('id', d => d.id);
							d3.select(this).append("text")
								.attr("text-anchor", "middle")
								.attr("class", "outword")
								.style("font", "10px 微软雅黑")
								.text(function (d) {
									if (d.relationNumber > 1) {
										return d.relationTypeName + "x" + d.relationNumber;
									} else {
										return d.relationTypeName;
									}
								});

							d3.select(this).append("path")
								.attr("class", "overlay")
								.style("fill", "#A5ABB6")
								.style("stroke", "none")
								.style("opacity", 0)
								.attr("id", d => d.relationId);
						});

					drawdraglinknode.drawLinks(magicGraph.pathUpdate, duration, magicGraph.strokeWidth);
					magicGraph.pathUpdate.exit().remove();
					//计算节点数据
					magicGraph.enterNodes = magicGraph.enterNodes.data(nodes, function (d) {
						return d.nodeId;
					});

					window.imgError = function (t){
						$(t).attr("href",_that.imgUrl+"rw.svg")
					}

					magicGraph.enterNodes.enter().append("g")
						.attr("class", "node")
						.attr("id", d => d.id)
						.attr("data-id", d => d.nodeId)
						.attr("data-type", d => d.type)
						.style("display", d => d.display)
						.on("mouseover", magicTopoEvents.fadeNodes(0.2, 0))
						.on("mouseout", function () {
							if(_that.useType !== "analytic"){  // 禁止双击操作
								return ''; 
							}
							if ($("svg.selecting").length) {
								return;
							} else {
								clearTimeout(magicGraph.timeout);
								d3.select(this)
									.classed("filtered", false);
								magicGraph.svg.selectAll("g.node,path.link,.outword,.outwieght").style("opacity", 1);
							}
						})
						.on("dblclick", magicTopoEvents.nodeDblclick())
						.on("mousedown", magicTopoEvents.nodeMouseDown())
						.on('mouseup', magicTopoEvents.nodeMouseUp())
						.call(dragNodes)
						.each(function (d) {
							d3.select(this).append("circle")
								.attr("r", () => {
									let quantity = d.quantity ? 2 : 0;
									return 18 + quantity;
								})
								.attr("class", "outring")
								.attr("cx", 0)
								.attr("cy", 0)
								.style("fill", d => d.fill)
								.style("stroke", d => d.stroke)
								.style("stroke-dasharray", d => {
									return (0, 0)
								})
								.style("stroke-width", "2px");

							if (!d.grouped) {
								d3.select(this).append("image")
									.attr("class", "nodeimg")
									.attr("width", 25)
									.attr("height", 24.5)
									//.attr("xlink:href",d =>_that.imgUrl + d.conceptName + ".svg")
									.attr("xlink:href", d => {
										return '/imgae';
										/* if (d.icon) {
											return d.icon;
										} else {
											let photo = {
												"人物": "rw",
												"政治人物": "rw",
												"组织": "zz",
												"事件": "sj"
											}
											return _that.imgUrl+"rw.svg";//" + photo[d.conceptName] + "
										} */

									})
									.attr("onerror", "imgError(this)")
									//.attr("onerror", "javascript:this.href='"+_that.imgUrl+"rw.svg';")
									.attr("x", function (d) {
										return (-25) / 2;
									})
									.attr("y", (-24.5) / 2);
								if (d.icon) {
									d3.select(this).append("path")
										.attr("class", "raduisImage")
										.style('fill', d.fill)
										.attr("d", (d, i) => arc(17.5, 12)());
								}
							}
							if (d.markIcons && d.markIcons.length) { //标记了的节点
								d3.select(this).append("circle")
									.attr("r", () => {
										let quantity = d.quantity ? 2 : 0;
										return 18 + quantity;
									})
									.attr("class", "outring")
									.attr("cx", 0)
									.attr("cy", 0)
									.style("fill", '#717788')
									.style("stroke", '#a7adbd')
									.style('fill-opacity', 0.7)
									.style("stroke-width", "2px");
							}

							d3.select(this).append("text")
								.attr("class", "nodetext")
								.attr("dy", 3.5 + 'em')
								.attr("text-anchor", "middle")
								.style("font", "10px 微软雅黑")
								.text(d => d.name);
							if (d.grouped) {
								d3.select(this).append("text")
									.attr("class", "nodetext")
									.attr("dy", ".4em")
									.attr("text-anchor", "middle")
									.style("font", "28px 微软雅黑")
									.text(d => d.groupNums);
							}
						});
					drawdraglinknode.drawNodes(magicGraph.enterNodes, duration);
					magicGraph.enterNodes.exit().remove();
					//getTotalMessage(magicFunctions.getNodesid()); //统计信息 
				},

				//功能：扩展的时候，调用此函数进行数据请求
				//entendType 扩展的类型、 entendNodes 扩展节点信息
				getDatatoDraw: function (entendNodes, entendType, extendBasis) {
					let selectNodes = [];
					for (let i = 0; i < nodes.length; i++) {
						if (nodes[i].selected) {
							selectNodes.push(nodes[i]);
						}
					}

					if (selectNodes && selectNodes.length == 1) {   //单选扩展
						//添加上一步操作和移除集合缓存数据 
						backfun.addstatus(nodes, links, "extend");
						localStorage.removeItem("colleNodes");

						_that.pageData().getExtendData({
							"id": selectNodes[0].nodeId,
							"extendType": entendType,
							"extendBasis": extendBasis
						}).then(function (data) {
							if (data) {
								reqLeavesApi.creatLinks(data);
							}

						})
					} else if (selectNodes && selectNodes.length > 1) { // 多选扩展

					}
				}
			}
			//节点操作事件集合
			const magicTopoEvents = {
				//功能：双击节点的事件
				nodeDblclick: function () {
					if(_that.useType !== "analytic"){  // 禁止双击操作
						return ''; 
					}

					return function (d, i) {
						resetMenu.getMoreMenus(); //获得后台传过来的实体相关关系
						let scale = zoomListener.scale();
						if (scale === 1) {
							let menuPos = d3.transform(d3.select(".main").attr("transform")).translate;
							let scale = zoomListener.scale();
							if (((d.y + menuPos[1]) < 200) || ((Math.abs(d.x) * scale - Math.abs(menuPos[0]))) > (magicGraph.topoWidth - 200)) {
								//  当画布的位移改变过后，需要减去它改变的值，保证相互抵消，防止出现位置不和预期
								let x1 = (Math.abs(d.x) - Math.abs(menuPos[0]) > magicGraph.topoWidth - 200) ? ((magicGraph.topoWidth - 200) - d.x) : menuPos[0];
								let y1 = (Math.abs(d.y) - Math.abs(menuPos[1]) < 200) ? (200 - d.y) : menuPos[1];
								d3.select('g.main')
									.transition()
									.duration(750)
									.attr("transform", "translate(" + x1 + "," + y1 + ")scale(" + scale + ")");
								zoomListener.scale(scale);
								zoomListener.translate([x1, y1]);
							};
						}

						const texts = ["删除", "扩展", "标注", "查看", "敬请期待", "取消"];
						const imageName = [["none", "delete"], ["extend", "extend"], ["none", "mark"], ["none", "checkout"], ["show", "show"], ["none", "cancele"]];
						const nodeArray = [d.id, d.nodeId, d.type, d.conceptName];
						const itemNumber = [1, 2, 3, 4, 5, 6];
						const config = {
							arc: [45, 105, 105, 115],
							angle: 2,
							text: texts,
							itemNumber: itemNumber,
							imageName: imageName,
							className: 'ol_menu',
							position: [d.x, d.y],
							nodeArray: nodeArray
						};
						resetMenu.oneTopoMenus(config);

					}
				},
				//功能：单击节点的事件
				nodeMouseDown: function () {
					return function (d, i) {
						
						if(typeof _that.setMouseDownNodeCallBack === 'function'){
							_that.setMouseDownNodeCallBack.call(this, d);
						}

						d.fixed = true;
						if (d3.event.defaultPrevented) return;

						// 可以根据 d.id ，在这调用其他函数操作~

						//magicFunctions.throttle(getBaseMessage,[true,d.id, d.conceptName, true]);//基础信息展示 
						if ((d3.event.ctrlKey) || ($("g.selected").length > 1)) {
							d3.select(this).classed("selected", function (node) {
								return node.selected = d === node;
							})
								.select(".outring").style("stroke", "#ffd862");
						} else {
							const _fill = "rgb(252, 49, 26)";
							const markFill = "rgb(113, 119, 136)";//标记 的指定颜色
							magicGraph.enterNodes.classed("selected", function (node) {
								return node.selected = d === node;
							})
								.select(".outring").style("stroke", function (p) {
									if (d3.select(this).style("fill") !== _fill) {
										if (d3.select(this).style("fill") == markFill) {
											return d === p ? "#ffd862" : "#a7adbd";
										} else {
											return d === p ? "#ffd862" : "#33d0ff";
										}
									} else {
										return d === p ? "#ffd862" : "#ffbcaf";
									};
								});
						}
						if (magicGraph.isMove) {
							magicGraph.mousedown_node = d;
							if (magicGraph.mousedown_node === magicGraph.selected_node) magicGraph.selected_node = null;
							else magicGraph.selected_node = magicGraph.mousedown_node;
							magicGraph.selected_link = null;
							// 重置线
							magicGraph.drag_line.classed('hidden', !magicGraph.isMove)
								.attr('d', 'M' + magicGraph.mousedown_node.x + ',' + magicGraph.mousedown_node.y + 'L' + magicGraph.mousedown_node.x + ',' + magicGraph.mousedown_node.y);
						}
						if ($(".topoMenu").length) {
							resetMenu.remove();
						}
					}
				},
				//功能：单击关系的事件
				linkClick: function () {
					return function (d) {
						//可以获取d的信息，在这进行操作
					};
				},
				//功能：双击关系的事件
				linkDblclick: function () {
					if(_that.useType !== "analytic"){  // 禁止双击操作
						return ''; 
					}
					return function (d, i) {
						return ''; // 禁掉双击关系的操作菜单
						if (d3.event.defaultPrevented) return;
						const xDist = (d.source.x + d.target.x) / 2;
						const yDist = (d.source.y + d.target.y) / 2;
						const pxy = [xDist, yDist];
						const texts = ["删除", "修改", "查看", "取消"];
						const imageType = [["deleteFather", "delete"], ["onLink", "amend"], ["onLink", "checkoutLink"], ["onLink", "cancele"]];
						const nodeArray = [d.relationId];
						const itemNumber = [1, 2, 3, 4];
						const config = {
							arc: [45, 105, 106, 116],
							text: texts,
							angle: 2,
							itemNumber: itemNumber,
							className: 'relO_menu',
							imageName: imageType,
							position: pxy,
							nodeArray: nodeArray,
							sourceName: d.source.name,
							targetName: d.target.name
						};
						resetMenu.oneTopoMenus(config);
					}
				},
				//功能：鼠标从节点抬起的事件
				nodeMouseUp: function () {
					if(_that.useType !== "analytic"){  // 禁止双击操作
						return ''; 
					}
					return function (d, i) {
						if(typeof _that.setMouseUpNodeCallBack === 'function'){
							_that.setMouseUpNodeCallBack.call(this, d);
						}

						if (!magicGraph.mousedown_node) {
							return;
						} else if (magicGraph.isMove) {
							magicGraph.drag_line.classed('hidden', true).style('marker-end', '');
							// 检查终点是不是自身
							magicGraph.mouseup_node = d;
							if (magicGraph.mouseup_node === magicGraph.mousedown_node) {
								magicFunctions.resetMouseVars();
								return;
							}
							//添加新的线
							let source, target;
							if (magicGraph.mousedown_node.id.indexOf(magicGraph.mouseup_node.id) < 0) {
								source = magicGraph.mousedown_node;
								target = magicGraph.mouseup_node;
							} else {
								//在这添加提示，已有关系，不能再添加
								return '';
							}

							const link = {
								source: target,
								target: source
							};
							//有关系的两个点之间不可以再创建关系了- 未实装
							if (link) {
								$(".makelink_box h5").eq(0).html("请选择创建连接的关系类型：");
								window.mouseup_nodes_img(link);
								//makeNodesRelate(link); //使用原来的代码
							}
							backfun.addstatus('', '', "makerRelation");
							// 创建新的path
							magicGraph.selected_link = link;
							magicGraph.selected_node = null;
						}
					}
				},
				//功能：鼠标放在某一个节点上的时候，会进过一段时间的延迟隐藏与当前点无关的节点或者关系
				fadeNodes: function (opacity, filter) {
					if(_that.useType !== "analytic"){  // 禁止双击操作
						return ''; 
					}
					return function (d, i) {
						//如果时间轴选中或者是在进行关系创建操作，则不希望它执行
						if ($("svg.selecting").length || magicGraph.isMove) {
							return;
						} else {
							d3.select(this)
								.classed("filtered", true)
							magicGraph.timeout = setTimeout(() => { //setTimeout会改变this的指向，用箭头函数修正this指向
								magicGraph.enterNodes.style("opacity", opacity);
								magicGraph.pathUpdate.selectAll("path.link,text")
									.style("opacity", filter);
								d3.select(this).style("opacity", 1);
								magicGraph.pathUpdate.selectAll("path.link,text")
									.filter(function (y) {
										return (y.source.id === d.id) || (y.target.id === d.id);
									})
									.style("opacity", "1")
									.each(function (dLinks, iLinks) {
										magicGraph.enterNodes.filter(function (t, i) {
											return (t.id === dLinks.target.id) || (t.id === dLinks.source.id);
										}).style("opacity", "1");
									});
							}, 500);
						}
					};
				}
			};


		

			//新建关系 按钮
			// 添加关系开关
			var add_relation = false;
			$("#add_relation").click(function () {

				if (!add_relation) {
					add_relation = true;
					$(this).addClass("checked");

					magicGraph.isMove = true;
					magicGraph.enterNodes.on('mousedown.drag', null)
						.on('touchstart.drag', null);
					d3.select(".topo-console")
						.call(d3.behavior.zoom()
							.on("zoom", null))
						.on("dblclick.zoom", null);
					d3.select(".topo-console")
						.classed("ctrl", false);
					d3.selectAll("g.node")
						.style("cursor", "crosshair");

				} else {
					add_relation = false;
					$(this).removeClass("checked");

					magicGraph.isMove = false; //是否隐藏拖动的path
					magicGraph.enterNodes.call(dragNodes);
					d3.select(".topo-console")
						.call(zoomListener)
						.on("dblclick.zoom", null);
					d3.select(".topo-console").classed("ctrl", true);
					d3.selectAll("g.node")
						.style("cursor", "pointer");
				}
				$(this).attr("data-check", add_relation);
			});

			window.createNewLink = function (link) {

				reqLeavesApi.creatLinks([link]);

				globalFuction.drawTopoMap(); //更新布局
			}

			//操作菜单
			class MagicTopoWorkMenus {
				constructor() {
					this.removeMenu = true;
					this.arc = (innerRadius, outerRadius, items, itemNumber, angle) => {

						itemNumber -= 1;
						let startAngle = angle * Math.PI / items * itemNumber,
							endAngle = startAngle + angle * Math.PI / items;

						const arc = d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(outerRadius)
							.startAngle(startAngle)
							.endAngle(endAngle)
							.padAngle(0);
						return arc;
					};
					//移除菜单
					this.remove = () => {
						this.removeMenu = false;
						d3.select(".topoMenu")
							.selectAll(".topoMenu_path")
							.transition()
							.duration(100)
							.attr("transform", "scale(0.6)")
							.remove();
						setTimeout(() => {
							this.removeMenu = true;
						}, 200);
					};
					//mouseover选中
					this.over = (name) => {
						d3.selectAll(".topoMenu_inring")
							.filter(function (d) {
								return d[1] === name || d[0] === name;
							})
							.attr("class", "topoMenu_inring topoMenu_inring_enter");
					};
					this.onmenu = (name) => {
						d3.selectAll(".topoMenu_inring")
							.filter(function (d) {
								return d[1] === name;
							})
							.attr("class", "topoMenu_inring topoMenu_inring_enter");
					};


					//统一传参
					this.myConfig = (angle, itemNumber, carc, ctext, cimageName, classNames, ctype = undefined, cdepth = undefined, cdirection = undefined, cpassShipLabel = undefined) => {
						var config = {
							itemNumber: itemNumber,
							angle: angle,
							arc: carc,
							text: ctext,
							imageName: cimageName,
							className: classNames,
							type: ctype,
							depth: cdepth,
							direction: cdirection,
							passShipLabel: cpassShipLabel
						};
						return config;
					};
					//加载可用的更多扩展数据
					this.clickMore = (data) => {
						const moreExtend = data.name;
						const extendSysName = data.id;
						for (let i = 0; i < moreExtend.length; i++) {
							let $ulTemp = i === moreExtend.length - 1 ? $("<li class='extend_type_uli selected_li' id=" + extendSysName[i] + "></li>") : $("<li class=extend_type_uli id=" + extendSysName[i] + "></li>");
							$ulTemp.append("<span  class=extend_span_list/>" +
								moreExtend[i] + "</span>");
							$ulTemp.prependTo(".extend_list_ul");
						}
						$("#extend_more_modalBox").show();
						$(".extend_type_uli").click(function () {
							if ($(this).hasClass("selected_li")) {
								$(this).removeClass("selected_li");
							} else {
								$(this).addClass("selected_li");
							}
						});
						$("#extend-ensured").off().on("click", function () {
							let extendType = [];
							$(".selected_li").each((d, i) => {
								extendType.push($(i).attr("id"));
							})
							globalFuction.getDatatoDraw("", extendType);
							$("#extend_more_modalBox").hide();
							$(".extend_list_ul").empty();
						});
					};
					//对getMoreMenus()得到的数据进行处理
					this.sliceName = (a, s) => {
						var obj = {
							name: [],
							sysname: [],
							id: []
						};
						var str = s;
						if (a[0].name.length > 9) {
							var c = a[0].name.slice(0, 9);
							var d = a[0].sysname.slice(0, 9);
							var e = a[0].id.slice(0, 9);
							//	c.push("更多");
							//	d.push([a[0].sysname[0][0], "more"]);
							//	e.push(str);
							obj.name.push(...c);
							obj.sysname.push(...d);
							obj.id.push(...e);
							return obj;
						} else {
							obj.name = a[0].name;
							obj.sysname = a[0].sysname;
							obj.id = a[0].id;
							return obj;
						}
					};
					//获得实体，文档，事件的更多分类
					this.getMoreMenus = () => {
						var type = ["relation"];
						//从后台获取对应的关系

						let selectNodes = [];
						for (let i = 0; i < nodes.length; i++) {
							if (nodes[i].selected) {
								selectNodes.push(nodes[i]);
							}
						}

						if (selectNodes && selectNodes.length == 1) {   //单选扩展
							_that.pageData().getEntityRelations({
								"id": selectNodes[0].nodeId,
							}).then(function (data) {
								if (data) {
									let menus = {
										"name": [],
										"sysname": [],
										"id": []
									};

									for (var ni = 0; ni < data.length; ni++) {
										menus.name.push(data[ni]);
										menus.sysname.push(["relations", "man", data[ni]]);
										menus.id.push(ni);
									}

									magicGraph.getMoreMenusData = [
										[menus]
									];

								}

							})
						}

					};
					//功能：自定义模型的角度问题，根据自定义模型的个数，有对应的角度显示
					this.getAngel = (length) => {
						length > 11 ? length = 11 : length;
						switch (length) {
							case 1:
								var angle = 0.1666;
								var itemNumber = [4.25]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 2:
								var angle = 0.5;
								var itemNumber = [2.5, 3.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 3:
								var angle = 0.5;
								var itemNumber = [3.25, 4.25, 5.25]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 4:
								var angle = 0.5;
								var itemNumber = [4, 5, 6, 7]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 5:
								var angle = 0.5;
								var itemNumber = [4, 5, 6, 7, 8]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 6:
								var angle = 0.7;
								var itemNumber = [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 7:
								var angle = 1;
								var itemNumber = [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 8:
								var angle = 1;
								var itemNumber = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 9:
								var angle = 1;
								var itemNumber = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 10:
								var angle = 1;
								var itemNumber = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 11:
								var angle = 1;
								var itemNumber = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
							case 12:
								var angle = 1;
								var itemNumber = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5]
								return { angle: angle, itemNumber: itemNumber };
								break;
						}
					};
				}
				//功能：菜单一级生成函数，生成对应的二级菜单
				oneTopoMenus(config) {

					const self = this;

					if (config.position) {
						menusg.attr("class", "topoMenu")
							.attr("transform", function () {
								return "translate(" + config.position[0] + "," + config.position[1] + ")";
							});
					}
					const selectedPath = menusg.selectAll("topoMenu_path").data(config.imageName);
					selectedPath.enter()
						.append("g")
						.attr("class", "topoMenu_path " + config.className)
						.attr("data-depth", (d, i) => config.depth ? config.depth[i] : null)
						.attr("data-direction", (d, i) => config.direction ? config.direction[i] : null)
						.attr("data-passShipLabel", (d, i) => config.passShipLabel ? config.passShipLabel[i] : null)
						.attr("data-type", (d, i) => config.type ? config.type[i] : null)
						.on("mouseenter", function (d, i) {
							if (self.removeMenu) { //不加这个条件判断，会导致在取消菜单时，如果用户同时滑倒了菜单上，或出现父菜单没了，但触发了子菜单生成的显示bug
								d3.select(this)
									.selectAll(".topoMenu_inring")
									.attr("class", "topoMenu_inring topoMenu_inring_enter");
								if (d[1] === 'extend') {
									const config = {
										angle: 0.45,
										arc: [108, 168],
										text: ["All", "按类型", "按关系"],
										imageName: [["extends", "all"], ["extends", "concept"], ["extends", "relation"]],
										className: 'tl_menu menu_extend',
										itemNumber: [3, 4, 5]
									};
									if (!$(".menu_extend").length) {
										resetMenu.oneTopoMenus(config);
									}
									d3.selectAll('.menu_model,.menu_group,.menu_show,.thrl_menu').remove();
								}
								if (d[1] === 'relation') {
									const config = {
										angle: self.getAngel(magicGraph.getMoreMenusData[0][0].name.length).angle,
										arc: [170, 230],
										text: self.sliceName(magicGraph.getMoreMenusData[0], "dmore").name,
										imageName: self.sliceName(magicGraph.getMoreMenusData[0], "dmore").sysname,
										extendType: self.sliceName(magicGraph.getMoreMenusData[0], "dmore").id,
										className: 'thrl_menu menu_extend_document',
										itemNumber: self.getAngel(magicGraph.getMoreMenusData[0][0].name.length).itemNumber//[5, 7, 9, 11, 13 ,15, 17]
									};
									if (!$(".menu_extend_document").length) {
										resetMenu.oneTopoMenus(config);
									}
									d3.selectAll('.menu_extend_type').remove();
								}
								if (d[1] === 'concept') {
									const config = {
										angle: 0.35,
										arc: [170, 230],
										text: ["人", "事件", "组织"],
										imageName: [["types", "人物"], ["types", "事件"], ["types", "组织"]],
										extendType: ["people", "event", "organization"],
										className: 'thrl_menu menu_extend_type',
										itemNumber: [3.8, 4.8, 5.8]
									};
									if (!$(".menu_extend_type").length) {
										resetMenu.oneTopoMenus(config);
									}
									d3.selectAll('.menu_extend_document').remove();
								}

								if (d[1] === 'all') {
									d3.selectAll('.thrl_menu').remove();
								}
								if (d[0] === 'none') {
									d3.selectAll('.tl_menu,.thrl_menu').remove();
								}
								if (d[0] === 'extends') {
									self.over('extend');
								}
								if (d[0] === 'relations') {
									self.over('extend');
									self.over('relation');
								}
								if (d[0] === 'types') {
									self.over('extend');
									self.over('concept');
								}

								if (d[0] === 'show') { // 设置show【显示】功能 暂时不可用
									d3.select(this)
										.selectAll(".topoMenu_inring")
										.attr("class", "topoMenu_inring topoMenu_inring_enter_nouse");
								}
							}
						})
						.on("mouseleave", (d, i) => {
							d3.selectAll(".topoMenu_inring")
								.attr("class", "topoMenu_inring");
							d3.selectAll(".topoMenu_outring")
								.attr("class", "topoMenu_outring");
						})
						.on("click", (d, i) => {
							//1.取消菜单
							if (d[1] === 'cancele') {
								this.remove();
							}
							//2.从前端删除节点 和 菜单
							if (d[1] === 'delete' && d[0] === 'none') {
								//从前端删除节点
								globalFuction.deleteNodesLinks('deleteNode', null);
								//getBaseMessage(false);
								this.remove();
							}

							//3.查看菜单
							if (d[1] === 'checkout') {
								let selectNodes = [];
								for (let s = 0; s < nodes.length; s++) {
									if (nodes[s].selected) {
										selectNodes.push(nodes[s]);
									}
								}

								if (selectNodes && selectNodes.length == 1) {   //单选扩展
									window.open('/instance_detail?eid=' + selectNodes[0].id);
								}

								//window.open('/instance_detail?eid=5c120adae4b0dfda2dfab6bf');
								//location.href = '/show?id=' + config.nodeArray[0] + '&type=' + config.nodeArray[3]; //跳转到详细页面

								this.remove();
							}
							//4.扩展-all
							if (d[1] === 'all') {

								globalFuction.getDatatoDraw("", "all", "");
								this.remove();
							}
							//4.扩展-按类型
							if (d[1] === '人物' || d[1] === "组织" || d[1] === "事件") {
								globalFuction.getDatatoDraw("", "concept", d[1]);
								this.remove();
							}

							//4.扩展-按关系菜单
							// if (d[1] === 'relation') {
							// 	globalFuction.getDatatoDraw("", "relation","");
							// 	this.remove();
							// }
							//4.扩展-按关系菜单
							if (d[0] === 'relations') {
								globalFuction.getDatatoDraw("", "relation", d[2]);
								this.remove();
							}

							// //实体、事件、文档的更多
							// if (d[1] === 'more' && d[0] !== 'customs') {
							// 	switch (d[0]) {
							// 		//对应实体，文档，事件的更多菜单
							// 		case "Entity":
							// 			this.clickMore(getMoreMenus[0][0]);
							// 			break;
							// 	}
							// 	this.remove();
							// }


						});
					const tar = selectedPath.append("path")
						.attr("class", "topoMenu_inring")
						.attr("d", (d, i) => this.arc(config.arc[0], config.arc[0], config.imageName.length, config.itemNumber[i], config.angle)());
					tar.transition()
						.duration(200)
						.attr("d", (d, i) => this.arc(config.arc[0], config.arc[1], config.imageName.length, config.itemNumber[i], config.angle)());
					selectedPath.exit().attr("d", (d, i) => this.arc(config.arc[0], config.arc[0], config.imageName.length, config.itemNumber[i], config.angle)()).remove();

					const tarplus = selectedPath.append("path")
						.attr("class", "topoMenu_inring")
						.attr("d", (d, i) => this.arc(config.arc[0], config.arc[0], config.imageName.length, config.itemNumber[i], config.angle)());
					tarplus.transition()
						.duration(200)
						.attr("d", (d, i) => this.arc(config.arc[0] - 3, config.arc[0] - 0.5, config.imageName.length, config.itemNumber[i], config.angle)());

					// const tarplus2 = selectedPath.append("path")
					// 	.attr("class", "topoMenu_inring")
					// 	.attr("d", (d, i) => this.arc(config.arc[0], config.arc[0], config.imageName.length, config.itemNumber[i], config.angle)());
					// tarplus2.transition()
					// 	.duration(200)
					// 	.attr("d", (d, i) => this.arc(config.arc[1], config.arc[1]+3, config.imageName.length, config.itemNumber[i], config.angle)());

					//菜单操作提示文字信息
					const menuText = selectedPath.append("text")
						.attr("text-anchor", "middle")
						.text((d, i) => {
							return config.text[i];
						})
						.attr("transform", "scale(0.1)")
						.style("fill", "#fff")
						.style("font-size", "14px")
						.attr("x", (d, i) => {
							var x = this.arc(config.arc[0], config.arc[1], config.imageName.length, config.itemNumber[i], config.angle).centroid(d)[0];
							return x;
						})
						.attr("y", (d, i) => {
							var y = this.arc(config.arc[0], config.arc[1], config.imageName.length, config.itemNumber[i], config.angle).centroid(d)[1] + 23;
							return y;
						});
					menuText.attr("transform", "scale(1)");
					//操作菜单图片

					const menuImage = selectedPath.append("image")
						.attr("xlink:href", (d, i) => {
							let photo = {
								"人物": "rw",
								"政治人物": "rw",
								"组织": "zz",
								"事件": "sj"
							};
							if (d[0] === "types") {
								return _that.imgUrl + photo[d[1]] + ".svg";
							}

							return _that.imgUrl + d[1].toLowerCase() + ".svg";
						})
						.attr("transform", "scale(0.1)")
						.attr("x", (d, i) => {
							var x = this.arc(config.arc[0], config.arc[1], config.imageName.length, config.itemNumber[i], config.angle).centroid(d)[0] - 15;
							return x;
						})
						.attr("y", (d, i) => {
							var y = this.arc(config.arc[0], config.arc[1], config.imageName.length, config.itemNumber[i], config.angle).centroid(d)[1] - 20;
							return y;
						})
						.attr("width", 28)
						.attr("height", 28);
					menuImage.attr("transform", "scale(1)");
				}
			};

			const resetMenu = new MagicTopoWorkMenus();

			//时间轴
			class MagicTopoTimeLine {
				constructor() {
					//功能：关系信息对应的时间轴数据，生成对应的时间轴坐标和条形图
					this.stack = d3.layout.stack()
						.x(d => d.time)
						.y(d => d.y),
						this.nest = d3.nest()
							.key(d => d.relationName),
						this.groups = d3.select(".topo_timeline_svg").append('g').selectAll(".rgroups"),
						this.rects = d3.select(".topo_timeline_svg").selectAll(".rgroups").selectAll(".item"),
						this.padding = {
							'left': 30,
							'right': 30,
							'top': 30,
							'bottom': 20
						},
						this.xRangeWidth = magicGraph.axisWidth - 50,
						this.yRangeWidth = magicGraph.axisHeight - this.padding.top - 15,
						this.xScale = function (xScaledata) {
							const xScale = d3.time.scale()
								.domain([d3.time.month.offset(new Date(xScaledata[0][0].time), -1), d3.time.month.offset(new Date(xScaledata[0][xScaledata[0].length - 1].time), 1)])
								.rangeRound([0, this.xRangeWidth]);
							return xScale;
						},
						this.yScale = function (yScaledata) {
							const yScale = d3.scale.linear()
								.domain([0,
									d3.max(yScaledata, function (d) {
										return d3.max(d, function (d) {
											return d.y0 + d.y;
										});
									})
								])
								.range([0, this.yRangeWidth]);
							return yScale;
						},
						//功能：对时间数组进行补全，因为stack图的数据要求必须为对齐的数据格式
						this.assignDefaultValues = function (dataset, relationName) {
							dataset.forEach(data => data.y = parseInt(data.y));
							let defaultValue = 0;
							let hadData = [true, true, true];
							let newData = [];
							let previousdate = new Date();
							dataset.forEach(function (row) {
								if (row.time.valueOf() !== previousdate.valueOf()) {
									for (var i = 0, leng = relationName.length; i < leng; ++i) {
										if (hadData[i] === false) {
											newData.push({
												relationName: relationName[i],
												y: defaultValue,
												time: previousdate
											});
										}
										hadData[i] = false;
									}
									previousdate = row.time;
								}
								hadData[relationName.indexOf(row.relationName)] = true;
							});
							for (var i = 0, len = relationName.length; i < len; ++i) {
								if (hadData[i] === false) {
									newData.push({
										relationName: relationName[i],
										y: defaultValue,
										time: previousdate
									});
								}
							}
							return dataset.concat(newData).sort(compare("time"));
						},
						//点击时间轴右边的列表，调用此函数更刷新时间轴
						this.UpdateAxis = function (indexArray, times) {
							let jsonStackTimes = JSON.parse(times);
							let endTime = []; //保存时间数组中对应的子集
							//用户单一选择时间显示
							if (indexArray !== 0) {
								indexArray.forEach((d) => {
									endTime.push(jsonStackTimes[d - 1]);
								});
								let stack = this.stack(endTime);
								this.creatGroup(stack); //重启绘制时间轴
								d3.selectAll("g.rgroups")
									.style("fill", d => linkColorArray(d[0].relationName));
							} else { //index为0，表示用户点击了所有关系列表
								let stack = this.stack(jsonStackTimes);
								this.creatGroup(stack);
								d3.selectAll("g.rgroups")
									.style("fill", d => linkColorArray(d[0].relationName));
							}
						},
						//时间轴右边的列表，更新列表和点击列表操作
						this.getAxis = function (data, name) {
							const self = this;
							let stringTimes = JSON.stringify(data);
							let content = '';
							d3.select("g.brush").remove();//需要每次都把上一次的清除，否则数据不对应
							if (name.length > 1) {
								//时间轴右边的列表生成
								for (var i = 0; i < name.length; i++) {
									let $html = name[i];
									let color = i === 0 ? "null" : linkColorArray(name[i]);
									let selected = "'radioTime icon-check-square-o'";
									content += `<div class=axisList style=color:${color}><div class=${selected}></div>${$html}</div>`;
								}
							}
							$("#event_list_child").mCustomScrollbar("destroy");
							$("#event_list_child").html(content);
							$("#event_list_child").mCustomScrollbar({
								autoHideScrollbar: true
							});
							let jsonStackTimes = JSON.parse(stringTimes);
							let stack = this.stack(jsonStackTimes);
							this.creatGroup(stack);

							d3.selectAll("g.rgroups")
								.style("fill", d => {
									return linkColorArray(d[0].relationName)
								});
							//点击改变坐标轴
							$("div.axisList").off("click");
							$("div.axisList").on("click", function (e) {
								e.stopPropagation();
								let indexArray = [];
								//隐藏此项关系时间
								if ($(this).find("div").hasClass('icon-check-square-o')) {
									if ($(this).index() === 0) {
										$(this).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
										$(this).siblings().find("div").removeClass('icon-check-square-o').addClass('icon-square-o-blue');
									} else {
										$(this).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
										$("div.axisList").eq(0).find("div").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
									}
									//显示此项关系时间
								} else {
									if ($(this).index() === 0) {
										$(this).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
										$(this).siblings().find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
									} else {
										$(this).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
										if ($("div.axisList").find('.icon-check-square-o').length == $("p.axisList").length - 1) {
											$("div.axisList").eq(0).find("div").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
										}
									}
								}
								//得到列表的索引，用来得到对应的时间
								$("div.axisList").each((d, i) => {
									if ($(i).find('div').hasClass('icon-check-square-o')) {
										indexArray.push($(i).index());
									}
								})
								//全选中显示全部时间
								if (indexArray.length == $("div.axisList").length) {
									self.UpdateAxis(0, stringTimes);
									//全没选中
								} else if (!indexArray.length) {
									const emptyTime = [[{
										y: '',
										time: ''
									}]];
									const stringTime = JSON.stringify(emptyTime);
									self.UpdateAxis(0, stringTime);
									//逐一选中
								} else {
									self.UpdateAxis(indexArray, stringTimes);
								}
							})
								.on("mouseover", function (e) {
									e.stopPropagation();
									let $width = $(this).find("label").width();
									if ($width > 90) {
										let interpolation = ($width - 80) + 115;
										$("#topology_timeline_axis").stop(true).animate({
											left: interpolation
										})
									}
								})
								.on("mouseout", function (e) {
									e.stopPropagation();
									$("#topology_timeline_axis").stop(true).animate({
										left: '140px'
									})
								});
						},
						//每次更新时间轴
						this.creatGroup = function (dataStack) {
							const islegend = magicGraph.topoTimeLineSvg.selectAll("g.legend"); //年份提示文字信息
							const legendExits = islegend.empty();
							//格式化本地时间
							const defined = {
								"decimal": ".",
								"thousands": ",",
								"grouping": [3],
								"currency": ["$", ""],
								"dateTime": "%a %b %e %X %Y",
								"date": "%m/%d/%Y",
								"time": "%H:%M:%S",
								"periods": ["AM", "PM"],
								"days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
								"shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
								"months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
								"shortMonths": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
							};
							let myMonth = d3.locale(defined);
							d3.time.format = myMonth.timeFormat; //将时间转化为中文
							let xScale = this.xScale(dataStack);
							let yScale = this.yScale(dataStack);
							//添加分组元素
							this.groups = this.groups.data(dataStack);
							this.groups.enter()
								.append("g")
								.attr("class", "rgroups")
								.attr("transform", "translate(40,15)");
							//.style("fill",d => linkColorArray(d[0].relationName));

							this.rects = this.groups.selectAll(".item")
								.data(d => d);
							this.rects.enter()
								.append("rect")
								.attr("class", "item")
								.attr("width", 5)
								.style("fill-opacity", 1);
							//添加矩形
							this.rects.transition()
								.duration(450)
								.attr("x", function (d) {
									if (typeof d.time === 'string' && d.time !== '') {
										var time = new Date(d.time);
										return xScale(time);
									} else {
										return 0;
									};
								})
								.attr("y", d => this.yRangeWidth - 20 - yScale(d.y0 + d.y))
								.attr("width", 5)
								.attr("height", d => yScale(d.y))
								.attr("transform", "translate(" + (this.padding.left - 40) + "," + (this.padding.top - 5) + ")")
								.style("fill-opacity", 1);
							//添加坐标轴
							const xAxis = d3.svg.axis()
								.scale(xScale)
								.orient("bottom")
								.ticks(d3.time.month, 6)
								.tickFormat(d3.time.format("%Y/%b"));
							yScale.range([this.yRangeWidth, 0]);
							const yAxis = d3.svg.axis()
								.scale(yScale)
								.ticks(2)
								.orient("left");
							this.rects.exit().remove();
							this.groups.exit().remove();
							//绑定时间轴坐标数据
							magicGraph.topoTimeLineSvg.select("#xtime_axis")
								.transition()
								.duration(450)
								.call(xAxis);
							magicGraph.topoTimeLineSvg.select("#ytime_axis")
								.transition()
								.duration(450)
								.call(yAxis);
							let dateWord = function () {
								if (dataStack[0][0].time && dataStack[0][dataStack[0].length - 1].time) {
									var sData = new Date(dataStack[0][0].time);
									var eData = new Date(dataStack[0][dataStack[0].length - 1].time);
									return sData.getFullYear() + "年" + "-" + (sData.getMonth() + 1) + "月" + "~" + eData.getFullYear() + "年" + "-" + (eData.getMonth() + 1) + "月";
								} else {
									return '';
								}
							};
							//已经存在则不再生产文字信息
							if (legendExits) {
								let legend = magicGraph.topoTimeLineSvg.append("g") //年份提示文字信息
									.attr("class", "legend")
									.append("text")
									.attr("class", "legendTitle")
									.attr("x", magicGraph.axisWidth - 160)
									.attr("y", 15);
							}
							d3.selectAll("g.legend").select("text").text(dateWord());
							this.brushAxis(xScale);
						},
						//功能：时间轴的筛选函数，生成矩形选择时间轴的坐标
						this.brushAxis = function (_xScale) {
							//刷子（拖选框）生成
							const self = this;
							const brushed = d3.selectAll("g.brush");
							const isBrushed = brushed.empty();
							let data = d3.svg.symbolTypes;
							const x = d3.scale.ordinal()
								.domain(data)
								.rangePoints([0, magicGraph.axisWidth - 30], 1);
							if (isBrushed) {
								const time_axis = magicGraph.topoTimeLineSvg.append("g")
									.attr("class", "brush")
									.attr("transform", "translate(32,20)")
									.call(d3.svg.brush().x(x)
										.on("brushstart", brushstart)
										.on("brush", brushmove)
										.on("brushend", brushend)
									)
									.selectAll("rect")
									.attr("height", magicGraph.axisHeight - 45);
								d3.select(".brush").selectAll(".resize")
									.selectAll("rect")
									.attr("width", "1px")
									.style("visibility", "visible");
							}
							//开始拖动
							function brushstart() {
								magicGraph.topoTimeLineSvg.classed("selecting", true);
							}
							//选中的时候让对应的元素选中
							function brushmove() {
								let s = d3.event.target.extent();
								let s1 = s[0] - 20;
								let s2 = s[1] - 20;
								magicGraph.svg.selectAll("g.node").style("opacity", 0.1);
								magicGraph.svg.selectAll("path.link,.outword,.outwieght").style("opacity", 0);
								self.rects.classed("time_selected", false);
								magicGraph.enterNodes.classed("selected", (d, i) => {
									d.selected = false;
									return false;
								})
									.selectAll(".outring")
									.style("stroke", function () {
										return d3.select(this).style("fill") !== "rgb(252, 49, 26)" ? "#33d0ff" : "#ffbcaf"
									});
								//选择对应时间的节点
								self.rects.filter(d => s1 <= (d = _xScale(new Date(d.time))) && d <= s2)
									.filter(d => d.y)
									.classed("time_selected", true)
									.each(function (dLinks) {
										let dLinkstime = dLinks.time;
										magicGraph.pathUpdate.filter(function (p) {
											let time = null;
											if (p.time) {
												if (p.time.includes("|")) {
													time = p.time.split("|");
												} else {
													time = p.time;
												}
												let bool = false;
												if (typeof time == 'object') {
													for (let i = 0; i < time.length; i++) {
														if (time[i].slice(0, 10).includes(dLinkstime)) {
															bool = true;
															break;
														}
													}
												} else {
													bool = time.includes(dLinkstime);
												}
												return bool;
											}
										})
											.selectAll("path.link,.outword,.outwieght")
											.classed("selected", false)
											.style("opacity", 1)
											.each((pLinks) => {
												let pId = (pLinks.id == pLinks.target.id) ? pLinks.target.id : pLinks.source.id;
												magicGraph.enterNodes.filter(e => {
													return e.id === pLinks.target.id || e.id === pLinks.source.id;
												})
													.classed("selected", (d, i) => {
														d.id === pId ? d.selected = true : '';
														return true;
													})
													.style("opacity", 1)
													.selectAll(".outring")
													.style("stroke", "#ffd862");
											});
									});
							};
							//不拖选的时候恢复
							function brushend() {
								magicGraph.topoTimeLineSvg.classed("selecting", !d3.event.target.empty());
								const width = d3.select(".extent").attr("width");
								if (width < 20) {
									magicGraph.svg.selectAll("g.node,path.link,text.outword,.outwieght").style("opacity", 1);
								}
							};
						},
						//处理请求到的杂乱的时间轴数据，使其可以用来绘制时间轴
						this.disposeTimeData = function (timeData) {
							let assignName = ["所有关系"];
							let alltimeArray = [];
							let assignData = null;
							let dataset = null;
							//timeData.sort(compare("relationName"));
							for (let i = 0; i < timeData.length; i++) {
								if (!assignName.includes(timeData[i].relationName)) {
									assignName.push(timeData[i].relationName);
								}
							}
							//动态改变时间轴右边列表内容,allrelationName按照此数据对齐
							assignData = this.assignDefaultValues(timeData, assignName);
							//会把assignData按照allrelationName进行一个个的分组，成为数组对象
							dataset = this.nest.entries(assignData);
							//过滤掉其中的“所有关系”数据
							for (let i = 0; i < dataset.length; i++) {
								if (dataset[i].key !== "所有关系") {
									alltimeArray.push(dataset[i].values);
								}
							}
							//需要重置allrelationName，使allrelationName的元素和alltimeArray的元素对应
							let relationName = ["所有关系"];
							for (let i = 0; i < alltimeArray.length; i++) {
								if (alltimeArray[i][0].relationName) {
									relationName.push(alltimeArray[i][0].relationName);
								}
							}
							this.getAxis(alltimeArray, relationName);
							magicGraph.svg.selectAll("g.node,path.link,text.outword,.outwieght").style("opacity", 1);
						}
				}
				// 进页面生成时间轴，清屏调用
				resetAxis() {
					$("#event_list_child").mCustomScrollbar("destroy");
					$("#event_list_child").html('');
					var axis = d3.selectAll("g.time_axis");
					var isAxis = axis.empty();
					var objs = [[
						{
							"y": '',
							"time": ''
						}
					]];
					//堆叠布局
					var dStack = this.stack(objs);
					//添加坐标轴
					if (isAxis) {
						var xAxis = d3.svg.axis()
							.scale(this.xScale(dStack))
							.orient("bottom")
							.tickFormat(d3.time.format("%b"));
						var yAxis = d3.svg.axis()
							.scale(this.yScale(dStack))
							.orient("left");
					}
					magicGraph.topoTimeLineSvg.append("g")
						.attr("class", "time_axis")
						.attr("id", "xtime_axis")
						.attr("transform", "translate(" + this.padding.left + "," + (magicGraph.axisHeight - this.padding.bottom - 5) + ")")
						.call(xAxis);
					magicGraph.topoTimeLineSvg.append("g")
						.attr("class", "time_axis")
						.attr("id", "ytime_axis")
						.attr("transform", "translate(" + this.padding.left + "," + (magicGraph.axisHeight - this.padding.bottom - this.yRangeWidth - 5) + ")")
						.call(yAxis);
				}
			};
			const timeAxis = new MagicTopoTimeLine();
			//webworker的数据入口
			function calculatePos(node, link, length, layout, history) {
				worker.postMessage({
					allNodes: node,
					allLinks: link,
					svgWidth: magicGraph.topoWidth, //工作台的宽度
					svgHeight: magicGraph.topoHeight,
					nodesLength: length, //扩展数据之前的nodes的长度
					isLayout: layout, //传值代表是进行环形布局的操作
					isHistory: history, //传值代表是保存的数据的展示
					layoutIndex: magicGraph.layoutIndex
				})
				worker.onmessage = (event) => {
					switch (event.data.type) {
						case "tick":
							return ticked(event.data);
						case "end":
							return getworkNodes(event.data);
					}
				};
			}
			//可以用来显示进度条(现在没用上)
			function ticked(data) {
				return data;
			}
			//得到webworker的返回数据，启动布局
			function getworkNodes(data) {
				nodes.splice(0, nodes.length);
				links.splice(0, links.length);
				nodes.push(...data.nodes);
				links.push(...data.links);

				if(_that.timeAxisSign){
					magicGraph.timedatas = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据 suspend
				}
				
				globalFuction.drawTopoMap();

				//只有当有时间数据的时候才执行下面的函数  todo 注掉时间操作

				if (magicGraph.timedatas && magicGraph.timedatas.length) {
					timeAxis.disposeTimeData(magicGraph.timedatas);
				}
				const operate = (operate) => {
					if (operate !== 'open') {
						magicGraph.numbers.push(nodes.length, links.length);
						var eleLength = $('.dsc_num').length;
						for (var i = 0; i < eleLength; i++) {
							for (var j = 0, len = magicGraph.numbers.length; j < len; j++) {
								if (i === j) {
									$('.dsc_num').eq(i).html(magicGraph.numbers[j]);
								};
							};
						};
					}
				}
			}
			//数组对象去重
			function removeRepeatArray(parent, element) {
				let result = [];
				let temp = {};
				let child = null;
				let repeat = null;
				for (let i = 0; i < parent.length; i++) {
					child = parent[i];
					repeat = child[element];
					//如果temp里面存在了这个元素，判断条件为true，跳出此次循环
					if (temp[repeat]) {
						continue;
					}
					temp[repeat] = true;
					result.push(child);
				}
				return result;
			}
			//数组对象由大到小排序
			function compare(prop) {
				return (a, b) => {
					const prop1 = a[prop];
					const prop2 = b[prop];
					return prop1 > prop2 ? 1 : -1;
				}
			}


			//绘制线和节点一节拖动节点函数集合
			function Drawdraglinknode() {
				//返回曲线
				this.arcArrow = function (startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength) {
					let angleTangent, arcRadius, c1, c2, coord, cx, cy, deflectionRadians, endAngle, endAttach, endNormal, endOverlayCorner, endTangent,
						g1,
						g2,
						headRadius,
						homotheticCenter,
						intersectWithOtherCircle,
						midShaftAngle,
						negativeSweep,
						positiveSweep,
						radiusRatio,
						shaftRadius,
						square,
						startAngle,
						startAttach,
						startTangent,
						sweepAngle,
						shaftLength,
						midShaftPoint,
						coordy;
					square = l => l * l;
					deflectionRadians = deflection * Math.PI / 180;
					startAttach = {
						x: Math.cos(deflectionRadians) * startRadius,
						y: Math.sin(deflectionRadians) * startRadius
					};
					radiusRatio = startRadius / (endRadius + headLength),
						homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);
					intersectWithOtherCircle = function (fixedPoint, radius, xCenter, polarity) {
						let A, B, C, gradient, hc, intersection;
						return gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter),
							hc = fixedPoint.y - gradient * fixedPoint.x, A = 1 + square(gradient),
							B = 2 * (gradient * hc - xCenter), C = square(hc) + square(xCenter) - square(radius),
							intersection = {
								x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
							}, intersection.y = (intersection.x - homotheticCenter) * gradient, intersection
					};
					endAttach = intersectWithOtherCircle(startAttach, endRadius + headLength, endCentre, -1);
					g1 = -startAttach.x / startAttach.y;
					c1 = startAttach.y + square(startAttach.x) / startAttach.y;
					g2 = -(endAttach.x - endCentre) / endAttach.y;
					c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;
					cx = (c1 - c2) / (g2 - g1);
					cy = g1 * cx + c1;
					arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));
					startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y);
					endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y);
					sweepAngle = endAngle - startAngle, deflection > 0 && (sweepAngle = 2 * Math.PI - sweepAngle);
					shaftLength = sweepAngle * arcRadius, startAngle > endAngle && (shaftLength = 0);
					midShaftAngle = (startAngle + endAngle) / 2, deflection > 0 && (midShaftAngle += Math.PI);
					midShaftPoint = {
						x: cx + arcRadius * Math.sin(midShaftAngle),
						y: cy - arcRadius * Math.cos(midShaftAngle)
					};
					startTangent = function (dr) {
						let dx, dy;
						return dx = (0 > dr ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1))), dy = g1 * dx, {
							x: startAttach.x + dx,
							y: startAttach.y + dy
						}
					};
					endTangent = function (dr) {
						let dx, dy;
						return dx = (0 > dr ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2))), dy = g2 * dx, {
							x: endAttach.x + dx,
							y: endAttach.y + dy
						}
					};
					angleTangent = function (angle, dr) {
						return {
							x: cx + (arcRadius + dr) * Math.sin(angle),
							y: cy - (arcRadius + dr) * Math.cos(angle)
						}
					};
					endNormal = function (dc) {
						let dx, dy;
						return dx = (0 > dc ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2))), dy = dx / g2, {
							x: endAttach.x + dx,
							y: endAttach.y - dy
						}
					};
					endOverlayCorner = (dr, dc) => {
						let arrowTip, shoulder;
						return shoulder = endTangent(dr), arrowTip = endNormal(dc), {
							x: shoulder.x + arrowTip.x - endAttach.x,
							y: shoulder.y + arrowTip.y - endAttach.y
						}
					};
					coord = point => point.x + "," + point.y;
					coordy = point => point.y;
					shaftRadius = arrowWidth / 2;
					headRadius = headWidth / 2;
					positiveSweep = startAttach.y > 0 ? 0 : 1;
					negativeSweep = startAttach.y < 0 ? 0 : 1;
					let outext = function (shortCaptionLength) {
						let captionSweep, endBreak, startBreak, dy;
						captionSweep = shortCaptionLength / arcRadius;
						deflection > 0 && (captionSweep *= -1);
						startBreak = midShaftAngle - captionSweep / 2;
						endBreak = midShaftAngle + captionSweep / 2;
						return dy = coordy(angleTangent(startBreak, shaftRadius)) + 3;
					};
					let outline = function (shortCaptionLength) {
						let captionSweep, endBreak, startBreak, dy;
						captionSweep = shortCaptionLength / arcRadius;
						deflection > 0 && (captionSweep *= -1);
						startBreak = midShaftAngle - captionSweep / 2;
						endBreak = midShaftAngle + captionSweep / 2;
						return ["M", coord(startTangent(shaftRadius)), "L", coord(startTangent(-shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)), "L", coord(angleTangent(startBreak, shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)), "Z", "M", coord(angleTangent(endBreak, shaftRadius)), "L", coord(angleTangent(endBreak, -shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), "L", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "L", coord(endTangent(shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))].join(" ");
					};
					let overlay = minWidth => {
						let radius;
						return radius = Math.max(minWidth / 2, shaftRadius), ["M", coord(startTangent(radius)), "L", coord(startTangent(-radius)), "A", arcRadius - radius, arcRadius - radius, 0, 0, positiveSweep, coord(endTangent(-radius)), "L", coord(endOverlayCorner(-radius, headLength)), "L", coord(endOverlayCorner(radius, headLength)), "L", coord(endTangent(radius)), "A", arcRadius + radius, arcRadius + radius, 0, 0, negativeSweep, coord(startTangent(radius))].join(" ")
					};
					return {
						outext: outext,
						outline: outline,
						overlay: overlay
					};
				},
					//返回直线
					this.straightArrow = function (startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight) {
						let length, shaftLength, endArrow, endShaft, headRadius, shaftRadius, startArrow, midShaftPoint;
						length = centreDistance - (startRadius + endRadius);
						shaftLength = length - headHeight;
						startArrow = startRadius;
						endShaft = startArrow + shaftLength;
						endArrow = startArrow + length;
						shaftRadius = shaftWidth / 2;
						headRadius = headWidth / 2;
						midShaftPoint = {
							x: startArrow + shaftLength / 2,
							y: 0
						};
						let outline = function (shortCaptionLength) {
							let endBreak, startBreak;
							startBreak = startArrow + (shaftLength - shortCaptionLength) / 2;
							endBreak = endShaft - startBreak + startRadius + 8;
							return ["M", startRadius, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", startRadius, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" ");
						};
						let overlay = function (minWidth) {
							let radius;
							return radius = Math.max(minWidth / 2, shaftRadius), ["M", startRadius, radius, "L", endArrow, radius, "L", endArrow, -radius, "L", startRadius, -radius, "Z"].join(" ")
						};
						return {
							outline: outline,
							overlay: overlay
						};
					},
					//实例化生成曲线和直线
					this.arcPath = function (d, strokeWidth, weight, textlength) {
						let square = num => num * num;
						let xDist = d.source.x - d.target.x;
						let yDist = d.source.y - d.target.y;
						let edgeHalfLength = Math.sqrt(square(xDist) + square(yDist)); //两点之间的距离
						let midpoint = 10;//控制多条关系得拱形大小的阀值
						let arcCaptionLenght = textlength + 10;//关系名得长度
						let deflection = d.linknum > 0 ? (d.id !== d.target.id) ? (midpoint * -d.linknum) : (midpoint * d.linknum) : (d.id !== d.target.id) ? (midpoint * -d.linknum) : midpoint * d.linknum;
						let arcArrowed = this.arcArrow(weight, weight, edgeHalfLength, deflection, strokeWidth, weight / 2, weight / 2);
						let straightArrowed = this.straightArrow(weight, weight, edgeHalfLength, strokeWidth, weight / 2, weight / 2);
						let outline = d.linknum !== 1 ? arcArrowed.outline(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outline(arcCaptionLenght) : straightArrowed.outline(arcCaptionLenght);
						let dy = d.linknum !== 1 ? arcArrowed.outext(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outext(arcCaptionLenght) : 3;
						let overline = d.linknum !== 1 ? arcArrowed.overlay(10) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.overlay(10) : straightArrowed.overlay(10);
						return [outline, dy, overline];
					},
					//更新links的位置
					this.drawLinks = function (topoLinks, durations, strokeWidth) {
						topoLinks.attr("transform", function (d) {
							let xDist = d.target.x - d.source.x;
							let yDist = d.target.y - d.source.y;
							let naturalAngle = (Math.atan2(yDist, xDist) / Math.PI * 180 + 180) % 360;

							return "translate(" + d.source.x + "," + d.source.y + ")rotate(" + (naturalAngle + 180) + ")";
						}).each(function (d) {
							let xDist = d.source.x - d.target.x;
							let yDist = d.source.y - d.target.y;
							let yt = d.target.y - d.source.y;
							let xt = d.target.x - d.source.x;

							//两个点与x轴形成的夹角
							let naturalAngle = (180 + Math.atan2(yt, xt) / Math.PI * 180) % 360;
							//两点之间的距离
							let edgeLength = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
							let lineColors = (edgeLength < 50) ? 'none' : magicGraph.linkDefaultColor !== "#A5ABB6" ? magicGraph.linkDefaultColor : linkColorArray(d.relationTypeName);//距离太近拉近两个点的时候线会很难看
							let dx = (d.linknum !== 1) ? (edgeLength / 2 - 4) : (d.size % 2 === 0) ? (edgeLength / 2 - 4) : (edgeLength / 2);

							const weight = 18;//节点的半径

							const linkSize = strokeWidth;//线的粗细
							const textlength = d3.select(this).selectAll('.outword').node().getBBox().width;
							let dy = drawdraglinknode.arcPath(d, linkSize, weight, textlength)[1];
							let linkPath = drawdraglinknode.arcPath(d, linkSize, weight, textlength)[0];
							let overline = drawdraglinknode.arcPath(d, linkSize, weight, textlength)[2];
							d3.select(this).selectAll("path.link")
								.transition()
								.duration(durations)
								.attr("d", linkPath)
								.style("fill", lineColors);
							d3.select(this).selectAll('text')
								.attr("transform", function () {
									return naturalAngle < 90 || naturalAngle > 270 ? "rotate(180 " + dx + " " + (dy - 3) + ")" : null;
								})
								.style("fill", lineColors);
							// d3.select(this).selectAll('.outwieght')
							// 	.attr('x', textlength)
							// 	.style("fill", opacity3)
							// 	.attr("y", dy);
							d3.select(this).selectAll('.outword')
								.attr('x', dx)
								.attr("y", dy);
							d3.select(this).selectAll("path.overlay")
								.attr("d", overline);
						});
					},
					//更新nodes的位置
					this.drawNodes = function (topoNode, durations) {
						topoNode.transition().duration(durations).attr("transform", function (d) {
							return "translate(" + d.x + "," + d.y + ")";
						});
					},
					//拖动的时候匹配关系一起联动
					this.dragNodeandLink = function (d) {
						var source = magicGraph.pathUpdate.filter(function (l) {
							return l.source.id === d.id;
						})
							.each(function (l) {
								l.source.x = d.x;
								l.source.y = d.y;
							});
						this.drawLinks(source, 0, magicGraph.strokeWidth);
						var targrt = magicGraph.pathUpdate.filter(function (l) {
							return l.target.id === d.id;
						})
							.each(function (l) {
								l.target.x = d.x;
								l.target.y = d.y;
							});
						this.drawLinks(targrt, 0, magicGraph.strokeWidth);
					}
			}

			//对画布进行拖动和缩放
			d3.selectAll(".topo-console").call(zoomListener)
				.on("dblclick.zoom", null) //防止双击事件
				.on("mouseup", function () {
					d3.selectAll("path.overlay,path.link,text.outword").style("display", "block");
				});

			//工具栏 上一步
			$("#back").on("click", function (d, i) {
				/* 	console.log(nodes);
					console.log(links); */
				backfun.goBack();
			})

			$(".topo-console").on("dblclick", function (e) {
				if (this === e.target) {
					magicGraph.enterNodes.selectAll(".outring")
						.style("stroke", function (p) {
							const color = d3.select(this).style("fill");
							const colorMark = d3.select(this).style("fill");
							return color !== "rgb(252, 49, 26)" ? colorMark == "rgb(113, 119, 136)" ? "#a7adbd" : "#33d0ff" : "#ffbcaf";
						});
					magicGraph.enterNodes.classed("selected", function (node) {
						return node.selected = false;
					});
					resetMenu.remove();
				}
			})

			$(window).keydown(function (e) {
				e = window.event || e;
				var key = e.keyCode;
				if (key === 83 && e.ctrlKey) { //ctrl+s
					return false;
				};
			})

			$(window).resize(function () {
				d3.select(".topo-console")
					.attr('width', $("#topo_network").width());
				d3.select(".topo-console")
					.attr('height', $(document).height() - $(".head-wrap").height() - $("#topology_timeline").height());
				//时间轴的该变
				magicGraph.topoTimeLineSvg.attr('width', $("#topology_timeline_axis").width());
				magicGraph.topoTimeLineSvg.attr('height', $("#topology_timeline_axis").height());
			})


			// -------------------------------   优化代码   ------------------------
			d3.select("#save").on("click", function () {
				var saveOptions = {
					selectorRemap: function (s) {
						return s.replace('#relational_graph ', '')
					},
					"backgroundColor": "#131b21"
				}
				saveSvgAsPng(document.getElementById("topo_svgContent"), 'capture-' + (new Date().getTime()) + '.png', saveOptions);

			});
			// 鼠标在节点上弹起
			window.mouseup_nodes_img = function (d) {
				$(".js_doc").attr("disabled", true);
				$(".doc_filter").hide(); // 隐藏文档筛选列表

				var link = d;
				var from = {
					id: d.source.id,
					name: d.source.name,
					cid: d.source.conceptId
				};

				var fromName = d.source.name;
				var fid = d.source.conceptId;

				var to = {
					id: d.target.id,
					name: d.target.name,
					cid: d.target.conceptId
				};

				var toName = d.target.name;
				var toid = d.target.conceptId;

				//先根据cid查询cname
				$.post("kbdef_concept/queryConcept", {
					from: from.cid,
					to: to.cid
				}, function (res) {
					if (res.code == 200) {
						var fromCname = res.data[fid].name;
						var toCname = res.data[toid].name;
						$.post("maintain/entity_relation_save_type_analytic", {
							from: JSON.stringify(from),
							to: JSON.stringify(to)
						}, function (data) {
							iModalbox.show(data); // 显示弹框
							$("#zt_input").attr("value", fromName + "(" + fromCname + ")");
							$("#kt_input").attr("value", toName + "(" + toCname + ")");
							$("#zt_input").val(fromName + "(" + fromCname + ")");
							$("#kt_input").val(toName + "(" + toCname + ")");
							$("#zt_input").attr("data-cid", from.cid);
							$("#kt_input").attr("data-cid", to.cid);
							$(".new_relate .sure").off("click");
							save_relation(link);
						});
					}
				});



				// 重新绑定关系窗口的事件
				function save_relation(newlink) {
					// 确定
					$(".new_relate .sure").click(function () {
						var fromid = $("#zt_input").attr("data-id");
						var fromtype = $("#zt_input").attr("data-type");
						//			var fromname = $("#zt_input").val();
						var toid = $("#kt_input").attr("data-id");
						var totype = $("#kt_input").attr("data-type");
						var start = $(".relStartTime").val();
						var end = $(".relEndTime").val();
						var rid = $("#select_rel_add").find("option:selected").attr("data-id");
						var rname = $("#select_rel_add").find("option:selected").attr("data-relation");
						var location = $(".eventplace").val().trim();
						var param = {};
						param.fromid = fromid,
							param.fromtype = fromtype,
							param.toid = toid,
							param.totype = totype,

							param.start = start;
						param.end = end;
						param.rid = rid;
						if (location != "请选择" && location != "") {
							param.location = location;
						}
						if (!rid || rid == "") {
							$("#select_rel_add").parent().parent().css("border", "1px solid #fd2727");
							notie.alert(2, '请选择关系后再试', 2);
							return false;
						} else if (!toid || toid == "") {
							notie.alert(2, '请选择客体后再试', 2);
							return false;
						} else {
							// 判断开始时间和结束时间
							if ($(".modalbox .inputwrap").find($(".relStartTime")).hasClass("must") && (!start || start == "")) {
								$(".modalbox .inputwrap").find($(".relStartTime")).css("border", "1px solid #f00");
								notie.alert(2, "“" + rname + "”关系开始时间为必选条件", 2);
								return false;
							}
							$(".modalbox .inputwrap").find($(".relStartTime")).css("border", "");
							if ($(".modalbox .inputwrap").find($(".relEndTime")).hasClass("must") && (!end || end == "")) {
								$(".modalbox .inputwrap").find($(".relEndTime")).css("border", "1px solid #f00");
								notie.alert(2, "“" + rname + "”关系结束时间为必选条件", 2);
								return false;
							}
							$(".modalbox .inputwrap").find($(".relEndTime")).css("border", "");



							relation_save(param);

							function relation_save(param) {
								$.post("maintain/entity_relation_save", {
									param: JSON.stringify(param)
								}, function (rel) {
									if (rel.status == "SUCCESS") {
										var irid = rel.id;
										// 在这拼接link，放到工作台
										newlink.id = newlink.source.id + newlink.target.id;
										newlink.relationId = irid;
										newlink.relationTypeName = rname;
										newlink.relationNumber = 1;
										// newlink.linknum= 1;
										// newlink.relationParentType= "virtualType";
										// newlink.size= 1;

										createNewLink(newlink);

										$(".modalbox").empty().hide();
									}
								});
							}
						}

					});
				}


			}




			//console.log("调用接口 start");

			let testId = "testId";
			if(_that.useType === "easy"){
				magicFunctions.loadSvgStart([_that.showData[0].source],[], testId);
			}else if(_that.useType === "analytic"){
				reqLeavesApi.creatLinks(_that.analyticData);
				 
				if(_that.timeAxisSign){  // 时间轴 显示
					timeAxis.resetAxis();  //这里注掉了时间轴的操作！！！ suspend
				}
			}

				/* magicFunctions.loadSvgStart([{
					id: "yyy",
					nodeId: "yyy",
					name: "洋务派",
					conceptId: "csry",
					conceptName: "测试",
					confirm: true,
					fill: "#e60012",
					stroke: "rgb(51, 208, 255)",
					icon: false,
				}], [], testId); */

				 
				




			// ------------- 搜索框 --------------
			
			/* let searchModuleShow = false; //搜索框 是否显示
			let searchModuleLoad = false; //搜索框 是否加载

			if(searchModuleShow){
				$("#analytic-search-module").css("display","none"); 
				searchModuleShow= false;
			}else{
				searchModuleShow = true;
				$("#analytic-search-module").css("display","block");
				if(!searchModuleLoad){
						window.sModule = _that.searchModule();
						sModule.addModule("analytic-search-module");
						sModule.moduleEvent();
						searchModuleLoad = true;
						console.log("here ~~")
				}
			} */


			if(_that.searchModuleSign){  // 搜索框 显示
				$("#analytic-search-module").css("display","block");
				 
				window.sModule = _that.searchModule();
				sModule.addModule("analytic-search-module");
				sModule.moduleEvent(); 
			 
			}


		}

		/**
		 * 搜索框组件
		 */
		searchModule(){
			let _that = this;

			class SearchModule {
				constructor(){

				}

				/**
				 * 搜索框:添加
				 */
				addModule(domid){
					var mapSet = document.createElement("div");
					mapSet.className = "map_select";
					//用来设置外层边框阴影
					var mapSetPanel = document.createElement("div");
					mapSetPanel.className = "map_select_panel";
					mapSet.appendChild(mapSetPanel);
					//'<button id="selectSuper" class="map_select_btn map_select_btn_background">高级检索</button>'+
					mapSetPanel.innerHTML =`
						<div class="map_selectDiv">
								<div class="map_select_input_div">
										<input type="text" id="map_select_input" placeholder="  输入进行搜索..." autocomplete="off" />
								</div>
								<div class="map_select_btn_div">
										<div id="selectObject" class="map_select_btn map_select_btn_background">
												<span class="left_top1"></span><span class="left_top2"></span><span class="left_bottom1"></span><span class="left_bottom2"></span>
												<span class="right_top1"></span><span class="right_top2"></span><span class="right_bottom1"></span><span class="right_bottom2"></span>
												查询
										</div>
								</div>
						</div>
						<div class="map_select_resultDiv">
								<div id="mapSelectResult">
	
								</div>
								<div id="mapSelectResultPage">
	
								</div>
						</div>
						<div class="map_select_resultDivSmall">显示详细0条信息!</div>
					`;
					document.getElementById(domid).appendChild(mapSet);// 添加DOM元素到地图中
				}

				/**
				 * 搜索框:事件
				 */
				moduleEvent(){
					let _thatSM = this;
			
					var mapSelectValue = '';//左侧搜索内容
	
					$(".map_select_resultDivSmall").bind("mouseover",function(){
						$(".map_select_resultDiv").css("height","560px");
						$(".map_select_resultDivSmall").css("height","0px");
					});
	
					$("#map_select_input").bind("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						//$(".map_select_btn_div").css("width","100px");
						//$(".map_select_btn").css("width","82px");
					}).keydown(function(event){
						if (event.keyCode == 13) {
							searchValue();
						}
					});// 搜索功能
					$("#selectObject").bind("click",function(){
						searchValue();
					});
					
					function searchValue(){
						var value = $("#map_select_input").val();
						mapSelectValue = $("#map_select_input").val();
						if(Components.trim(value)){
							$("#mapSelectResultPage").css("display","block");
							//_thatSM.searchModulePagination(Components.trim(value),"All"); //分页搜索
							_thatSM.searchModuleData(Components.trim(value),"All"); //分页搜索
							//下方div显示
							$(".map_select_resultDiv").css("height","560px");
							$(".map_select_resultDivSmall").css("height","0px");
						}else {
							$("#mapSelectResultPage").css("display","none");
							$("#mapSelectResult").html(" ");
							$(".map_select_resultDivSmall").html("没有搜索结果!");
							$(".map_select_resultDiv").css("height","0px");
							$(".map_select_resultDivSmall").css("height","40px");
						}
					} 
				}

				/**
				 * 搜索框:拖拽开始
				 */
				dragDomToMap(className){
					let _thatSM = this;
					let targetMap = $('#topo_network').get(0);
				
					targetMap.removeEventListener("drop", _thatSM.dragDomToMapEnd, false);
	
					var dragNodes = document.querySelectorAll(className);
					var len = dragNodes.length;
					for (var i = 0; i < len; i++) {
						dragNodes[i].addEventListener('dragstart', function(e) {
							var dragObject = {
								name: this.dataset.name,
								type: this.dataset.type,
								conceptName: this.dataset.conceptName,
								id: this.dataset.id,
								nodeId: this.dataset.nodeId,
								dragFlag: true
							};
							e.dataTransfer.setData('maptext', JSON.stringify(dragObject));
						});
					}
					targetMap.addEventListener('dragover', function(e) {
						e.preventDefault();
						e.dataTransfer.dropEffect = 'move';
						return false;
					});
					targetMap.addEventListener('drop', _thatSM.dragDomToMapEnd, false);
				}

				/**
				 * 搜索框:拖拽结束
				 * @param {*} e 
				 */
				dragDomToMapEnd(e){
					e.preventDefault();
					if (!e.dataTransfer.getData('maptext').match("dragFlag")) { return false; }
					let dropObj = JSON.parse(e.dataTransfer.getData('maptext'));
					
					_that.pageData().getInformation({id : dropObj.id}).then(function (data) {
						if(data.code && data.code == 500){
								console.log("提示报错信息");// 提示报错！！
						}
						if (data) {
								data.x = e.x;
								data.y = e.y;
								nodes.push(data);
								globalFuction.drawTopoMap();
						}
					})
				}

				/**
				 * 搜索框：搜索结果，不使用分页
				 */
				searchModuleData(keyword,searchType){
					let _thatSM = this;
					_that.pageData().getSearchModuleData({"keyword":keyword}).then(function (data) {
							let otherHTML = '';
							
							if(!data){ return "" }
							
							let dataSource = data;
						
							for (let i = 0; i < dataSource.length; i++) {
								
								otherHTML += `<div class="mapResultPanel" draggable="true" data-name="${dataSource[i].name}" data-pageType="entity" data-conceptName="entity" data-id="${dataSource[i].id}" data-nodeId="${dataSource[i].id}" data-type="${dataSource[i].concepts_[ dataSource[i].concept[0] ]}">
								<div class="mapResultPanelIn">
									<div class="mapSelectResultImg">
										<img src="../../images/typeicon/man.svg" alt="头像"/>
									</div>
									<div class="mapSelectResultOne">
									<div class="mapSelectMsgDivTwo">
								
									<div class="mapSelectMsgTwo"  title="${dataSource[i].name}"><span title="${dataSource[i].name}"> ${dataSource[i].name}</span></div>
									<div class="mapSelectMsgTwo"  title="${dataSource[i].concepts_[ dataSource[i].concept[0] ]}"><span> </span>${dataSource[i].concepts_[ dataSource[i].concept[0] ]}</div>
									<div class="mapSelectMsgOne"  title="${dataSource[i].update_time}">更新时间：${dataSource[i].update_time}</div>
								
								</div></div></div></div>`;
							}
					
							$("#mapSelectResult").html(otherHTML);
							
							$(".mapResultPanel").unbind("click").bind("click",function () {
								$(this).siblings().addClass("nomapResultPanelbackground").removeClass("mapResultPanelbackground");
								$(this).addClass("mapResultPanelbackground").removeClass("nomapResultPanelbackground");
							});
					

							$(".map_select_resultDivSmall").html("显示详细" + dataSource.length + "条信息!");

							_thatSM.dragDomToMap(".mapResultPanel");//左侧搜索拖拽功能
						}).catch(function () {
							//代码出错，暂时不提示
						});
				}

			}

			return new SearchModule();
			
		}

	}


	Components.analytic = function(){
		return (new Analytic(...arguments));
	};

	//Components.analytic.run("topo_network_base"); 
	//Components.analytic.showItem({ 	id: "aaa" });
})();