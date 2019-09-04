/*version ---- baseline 1.0.12*/
$(function () {
	//全局变量
	let magicGraph = {
		axisWidth: $("#topology_timeline_axis").width(),
		axisHeight: $("#topology_timeline_axis").height(),
		topoWidth: $("#topology_topo").width(),
		topoHeight: $("#topology_topo").height(),
		isDrag: false,
		isMove: false,
		layoutIndex: 0,
		depth: 0,
		strokeWidth: 1,//线的粗细
		historyDatas: {
			nodes: [],
			links: []
		},
		timeout: null,
		numbers:[],
		historytimes: [], //历史时间数据
		selected_node: null,
		selected_link: null,
		mousedown_link: null,
		mousedown_node: null,
		mouseup_node: null,
		virtualScreen:false,
		dragNodes:false, //托选的时候，为true表示集体拖动节点
		virtualdata:null,
		myMakeLinks: {},
		filterNodeId: [],
		DIRECTION_UP: 'up',
		DIRECTION_RIGHT: 'right',
		DIRECTION_DOWN: 'down',
		DIRECTION_LEFT: 'left',
		timedatas:null,
		svg: d3.select("g.main"),
		linkDefaultColor:'#A5ABB6',
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
	const worker = new Worker("../js/topology/countPosNodes.js"); //启动webworker
	const magicFunctions = new MagicFunctions();
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
			.on("dragend",(d) => {
				for (let i = 0; i < nodes.length; i++) {
					let ex1 = nodes[i].x - 8;
					let ex2 = nodes[i].x + 8;
					let ey1 = nodes[i].y - 8;
					let ey2 = nodes[i].y + 8;
					if (Math.floor(ex1) <= d.x && d.x <= Math.ceil(ex2) && Math.floor(ey1) <= d.y && d.y <= Math.ceil(ey2) && nodes[i].id !== d.id) {
						if (nodes[i].objectType == d.objectType) {
							$("#obj_message").show();
							//对比节点信息
							setCompareData(d.id, d.nodeId, nodes[i].id, nodes[i].nodeId, d.objectType);
						} else {
							magicFunctions.errors('不同类型的数据不支持碰撞');
						}
					}
				}
			});

	magicGraph.topoTimeLineSvg.attr("width", magicGraph.axisWidth).attr("height", magicGraph.axisHeight);
	d3.select("#topology_main")
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
	window.nodes = [];
	window.links = [];
	console.log(nodes);
	console.log(links);
	//功能函数集合
	function MagicFunctions(){
		
	
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
					allNodeId.types.push(nodes[i].objectType);
				}
			}
			return allNodeId;
		},
		//从搜索页面跳过来的数据处理，可以绘制节点
		this.findLocalStorage = () => {
			var historyDatas = localStorage.getItem("topoNodes"); //跳转出保存的缓存数据
			var searchAddNode = localStorage.getItem("searchAddNode"); //搜索页面或者别的页面加进来的节点数据
			
			var versionName = localStorage.getItem("versionName");
			let addNewNodes = [];
			
			//离开工作台保存数据
			historyDatas ? this.localDataMerge(historyDatas) : null;
			if (searchAddNode) { //往工作台添加新的点
				let alreadyExistNodesIds = [];
				addNewNodes = JSON.parse(searchAddNode);
				if (magicGraph.historyDatas.nodes.length) {
					for (let i = 0; i < magicGraph.historyDatas.nodes.length; i++) {
						alreadyExistNodesIds.push(magicGraph.historyDatas.nodes[i].id);
					}
					//如果工作台已经有相同的点，则不会继续添加
					for (let i = 0; i < addNewNodes.length; i++) {
						if (!alreadyExistNodesIds.includes(addNewNodes[i].id)) {
							magicGraph.historyDatas.nodes.push(addNewNodes[i]);
							//从搜索页面
							localStorage.setItem("saveState", false);
						}
					}
				} else {
					magicGraph.historyDatas.nodes.push(...addNewNodes);
					localStorage.setItem("saveState", false);
				}
			}
			let localeNodes = magicGraph.historyDatas.nodes;
			let localeLinks = magicGraph.historyDatas.links;
			addNewNodes.length ? getBaseMessage(true, addNewNodes[0].id, addNewNodes[0].objectType, true) : null; //基本信息
			localeNodes.length ? calculatePos(localeNodes, localeLinks, null,"notLayout", "isHistory") : null;
		},
		//加载缓存下来的数据
		this.localDataMerge = (str) => {
			let localHistoryDatas = JSON.parse(str);
			let myNode = localHistoryDatas.nodes;
			let myLinks = localHistoryDatas.links;
			magicGraph.filterNodeId = localHistoryDatas.filterNodeId;
			magicGraph.filterNodesLinks = localHistoryDatas.filterNodesLinks || [];
			magicGraph.historytimes = localHistoryDatas.timeDatas || [];
			magicGraph.historyDatas.nodes.push(...myNode);
			magicGraph.historyDatas.links.push(...myLinks);
		},
		//截图函数
		this.screenshot = () => {
			var versionName = $("#dsname_tip h4").html();
			if (typeof versionName === 'string' && versionName == '') {
				versionName = "未命名";
			}
			//切换主题时，改变节点的字体颜色，截图才可以显示正常
			const theme = document.cookie;
			const pngName = versionName + "-数据集.png";
			if (isIE()) {
				const target = document.getElementById("topo_svgContent");
				$("#save_screenShot_modalBox h4").html(versionName + "-数据集快照");
				html2canvas(target).then(function(canvas){
					$("#save_screenShot_modalBox h4").after(canvas);
					canvas.id = "mycanvas";
					const dataUrl = canvas.toDataURL();
					const newImg = document.getElementById("snapShot");
					const newAdown = document.getElementById("downloadSnapshot");
					newImg.src = dataUrl;
					newAdown.href = dataUrl;
					newAdown.download = versionName + "-数据集";
				});
			} else {
				const backgroundColor = theme.includes("black") ? "#131b21" : theme.includes("white") ? "#fff" : "#f9f9fb";
				saveSvgAsPng(document.getElementById("topo_svgContent"),pngName,{"backgroundColor":backgroundColor});
			}
		},
		//通过长按ctrl键托选页面节点
		this.keyflip = () => {
			// var shiftKey = d3.event.shiftKey || d3.event.metaKey;
			const ctrlKey = d3.event.ctrlKey;
			if (ctrlKey) {
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
			const str = val.replace(/\s+/gi,'');
			const n = magicGraph.enterNodes.filter(function (d) {
				return d.name === str;
			});
			if (!n[0].length) return;
			magicGraph.enterNodes.classed('selected',false);
			n.classed('selected',true);
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
		//错误提示
		this.errors = (errors) => {
			console.log("错误提示!!!");
			//$("#page_alert").show();
			//$("#page_alert_content").html(errors);
		},
		//缩放函数
		this.zoom = () => {
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
							objtimeschild.time = timeArr[j].slice(0,10);//maybe .replace(/,/g, "-")
							objtimeschild.y = 1;
							objtimeschild.sortId = objtimeschild.relationName + objtimeschild.time;
							objtiems.push(objtimeschild);
						}
					} else {
						objtimeschild.relationName = element.relationTypeName;
						objtimeschild.time = element.time.slice(0,10);//maybe .replace(/,/g, "-")
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
		this.throttle = (myFunc,context) => {
			clearTimeout(myFunc.id);
			myFunc.id = setTimeout(() => {
				myFunc.apply(null,context);
			},350);
		}
	}
	//这是对扩展请求的数据进行处理的函数
	function ReqLeavesApi(){
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
			//TODO:这里的数据属性的添加或者删除，需要保持这个项目和工作台联动的数据也一致
			//topology.js、searchlist.js、relation.js、gis.js、message.js、doncument.js、event.js、entity.js
			myNoRepeatArray.forEach((link) => {
				link.nodeWeight = link.nodeWeight ? parseInt(link.nodeWeight) : 0,
				link.type = link.type ? link.type : 'virtual',
				link.relationWeight = link.relationWeight ? parseInt(link.relationWeight) : 0,//关系权重？
				link.relationParentType = link.relationParentType ? link.relationParentType : "virtualType", //关系的父类
				link.target = {
						name: link.target,
						type: link.type,
						id: link.id,
						icon:link.icon,
						page_type: link.page_type,
						nodeWeight: link.nodeWeight,
						quantity:link.quantity,//(虚拟点的数量)
						nodeType: link.nodeType,
						objectType: link.objectType,
						//relationParentType: link.relationParentType ? link.relationParentType : link.relationTypeName, //关系的父类
						relationTypeName: link.relationTypeName,
						nodeId: link.nodeId,
						markIcons: link.markIcons, //是否标记了节点
						fill: link.mark ? "#fc311a" : "#0088b1", //是否标记了节点
						stroke: link.mark ? "#ffbcaf" : "#33d0ff", //是否标记了节点
						display: "block"
				};
				delete link.icon;
				delete link.objectType;
				delete link.nodeId;
				delete link.markIcons;
				delete link.mark;
				delete link.type;
				delete link.nodeType;
				delete link.page_type;
				delete link.quantity;
				parseNodes.push(link.target);
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
					if (!lastLinks.has(reqLinks[i].relationId)){
						newLinks.push(reqLinks[i]);
					}
				}
				links.push(...newLinks);
			} else {
				links.push(...reqLinks);
			}
			const originLinks = JSON.stringify(links);
			const objectOriginLinks = JSON.parse(originLinks)
			this.typeLinks(objectOriginLinks);//对数据进行标记
			const linksArray = new Map();
			for (let i = 0; i < links.length; i++) {
				linksArray.set(links[i].relationId,i);
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
				let key = source < links[i].id ? source + ':' + links[i].id : links[i].id + ':' + source;
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
				let key = source < links[i].id ? source + ':' + links[i].id : links[i].id + ':' + source;
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
				if (source < link.id) {
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
				if ((link[i].id === link[i+1].id && link[i].source === link[i+1].source) && link[i].relationTypeName === link[i+1].relationTypeName) {
					link[i].relationNumber = ++count;
					if (link[i].time) {
						const time = link[i+1].time ? '|' + link[i+1].time: "";
						link[i].time += time;
					}
					link.splice(i+1,1);
					i--;
				} else {
					count = 1;
				}
			}
		}
	}
	//所有Window下的函数集合
	window.globalFuction = {
		saveLocalStorage: function(){
			if (nodes.length || magicGraph.historytimes.length) { //当页面有时间和有数据点的时候保存信息
				var topoData = {
					nodes: nodes,
					links: links,
					filterNodeId: magicGraph.filterNodeId
					// timeDatas: timeAxis.magicTopoTime
				};
				//topoData.totalHtml = $("#total_type_box").html(); //保存统计信息
				var topoStr = JSON.stringify(topoData); // 将对象转换为字符串
				localStorage.setItem("topoNodes", topoStr);
			
			}
			//mapload ? mapSaveLocalStorage() : null;
		},
		//功能：保存集合的数据，为了进行上一步的操作，数据保存到localStroge里面
		saveLocalColl: function(){
			var collData = {
				nodes: nodes,
				links: links
			};
			var collStr = JSON.stringify(collData); // 将对象转换为字符串
			localStorage.setItem("colleNodes", collStr);
		},
		//清除工作台的数据点，放入新的数据
		radwTopo: function(node, link){
			const stringNode = JSON.stringify(node);
			const stringLink = JSON.stringify(link);
			const newNodes = [];
			const newLinks = [];
			nodes.splice(0, nodes.length);
			links.splice(0, links.length);
			newNodes.push(...JSON.parse(stringNode));
			newLinks.push(...JSON.parse(stringLink));
			calculatePos(newNodes, newLinks, null,"notLayout", "isHistory");
		},
		
		//获取cookie的值
		getCookie: function(cookie_name){
			var allcookies = document.cookie;
			var cookie_pos = allcookies.indexOf(cookie_name); //索引的长度
			// 如果找到了索引，就代表cookie存在，
			// 反之，就说明不存在。
			if (cookie_pos !== -1) {
				// 把cookie_pos放在值
				// 的开始，只要给值加1即可。
				cookie_pos += cookie_name.length + 1; //这里容易出问题，所以请大家参考的时候自己好好研究一下
				var cookie_end = allcookies.indexOf(";", cookie_pos);

				if (cookie_end === -1) {
					cookie_end = allcookies.length;
				}
				var value = unescape(allcookies.substring(cookie_pos, cookie_end)); //这里就可以得到你想要的cookie的值了。。。
			}
			return value;
		},
		//删除cookie指定值
		DelCookie: function(name){
			const exp = new Date();
			exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
			const cval = globalFuction.getCookie(name);
			document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
		},
		/*
		@function 删除节点或者关系
		@params {deleteNode}值有效表示删除点
		@params	{deleteLink}值有效表示删除关系
		@params	{isGroup}值有效表示组合节点
		*/
		deleteNodesLinks: function(deleteNode, deleteLink ,isGroup){
			let deleteNodes = [],
				deleteLinks = [],//存放删除的数据
				thistimes = null;
			let emptyTime = [{
					y: 0,
					time: '',
					relationName:''
				}];
			let deleteTarget = function() {
				if (deleteLink) { //删除关系
					for (let j = 0; j < links.length; j++) {
						if (id.includes(links[j].relationId)) {
							deleteLinks.push(links[j]);
							//deleteLinksIndex.push(j);
							links.splice(j, 1);
							j--;
							deleteLinksIndex.push(j+1);
						}
					}
				} else if(typeof deleteNode === 'object'){  //统计的刷新实现删除
					for (let j = 0; j < links.length; j++) {
						if (deleteNode.includes(links[j].target.id) || deleteNode.includes(links[j].source.id)) {
							deleteLinks.push(links[j]);
							links.splice(j, 1);
							j--;
						}
					}
				} else { //删除节点和与其相关的关系
					for (let j = 0; j < links.length; j++) {
						if (links[j].target.selected || links[j].source.selected) {
							deleteLinks.push(links[j]);
							links.splice(j, 1);
							j--;
						}
					}
				}
				thistimes = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据
			};
			if (typeof deleteNode === 'string') { //删除节点
				for (let i = 0; i < nodes.length; i++) {
					if (nodes[i].selected) {
						deleteNodes.push(nodes[i]);
						nodes.splice(i,1);
						i--;
					}
				}
				deleteTarget();
				backfun.deleteList(deleteNodes, deleteLinks, "delete");
			} else if(typeof deleteNode === 'object'){ //统计的刷新实现删除
				for (let i = 0; i < nodes.length; i++) {
					if (deleteNode.includes(nodes[i].id)) {
						deleteNodes.push(nodes[i]);
						nodes.splice(i,1);
						i--;
					}
				}
				deleteTarget();
				backfun.deleteList(deleteNodes, deleteLinks, "delete");
			} else if (deleteLink) { //删除关系
				deleteTarget();
				backfun.deleteList(deleteNodes, deleteLinks, "delete");
			} else if (isGroup) { //合并节点
				for (let i = 0; i < nodes.length; i++) {
					if (nodes[i].selected) {
						deleteNodes.push(nodes[i]);
						nodes.splice(i,1);
						i--;
					}
				}
				deleteTarget();
				backfun.groupList(deleteNodes, deleteLinks, isGroup);
			}
			thistimes.length ? timeAxis.disposeTimeData(thistimes) : timeAxis.disposeTimeData(emptyTime);//删除时间再次调用跑时间轴
			globalFuction.drawTopoMap();
		},
		//功能：要求保存当前用户的操作数据，调用可以保存到服务器
		collectiveOpera: function(data, dataset, operate, ways,callback){
			//显示集合之后的集合
			if (callback) {
				const operate = 'close';
				callback(operate);
				return null;
			}
			var collectiveData = typeof (data.topojson) === 'object' ? data.topojson : JSON.parse(data.topojson),
				nodesPost = collectiveData.savetnodes || [],
				linksPost = collectiveData.savetlinks || [],
				indexPost = collectiveData.savetindex || [];
			if (nodesPost.length) {
				$("#dsname_tip h4").attr("data-versionId", data.id);
			}
			magicGraph.numbers = [nodes.length, links.length, nodesPost.length, linksPost.length]; // 记录集合操作前后节点及关系的数量
			backfun.addstatus(null, null, "collbllor"); //把数据集加入上一步栈中
			nodes.length ? this.saveLocalColl() : null; //把操作数据集之前的nodes和links保存起来
			const nodesSet = new Set(),
				  linksSet = new Set();
			const mapping = (function (nodes, links) {
				for (let i = 0, linkLen = links.length; i < linkLen; i++) {
					for (let j = 0, nodeLen = nodes.length; j < nodeLen; j++) {
						if (links[i].source.id === nodes[j].id) {
							links[i].source = nodes[j];
						}
						if (links[i].target.id === nodes[j].id) {
							links[i].target = nodes[j];
						}
					}
				}
			});

			resetMenu.remove();
		},
		//删除map
		deleteMapNode: function(markerId){
			backfun.addstatus(nodes, links, "delete");
			this.deleteNodesLinks(markerId, 'deleteNode');
		},
		//过滤器
		toolFilter: function(node = [], link = []){

			var includesNodes = [];
			var sourceNode = [];
			magicGraph.filterNodeId = [];
			if (!node.length && !link.length) return;
			//只进行关系过滤

			if (link.length) {
				links.forEach(function (d) {
					link.includes(d.relationTypeName) ? (d.id !== d.target.id) ? (includesNodes.push(d.source.id), sourceNode.push(d.target.id)) : (includesNodes.push(d.target.id), sourceNode.push(d.source.id)) : null;
				})
			}
			var condition = node.concat(includesNodes);
			condition = [...new Set(condition)];
			d3.selectAll(".outlink,g.node").style("display", 'none');
			magicGraph.enterNodes.filter(function (d, i) {
				return condition.includes(d.id);
			}).style("display", function (d) {
				d.display = 'block';
				return 'block';
			});
			magicGraph.enterNodes.filter(function (d, i) {
				return sourceNode.includes(d.id);
			}).style("display", function (d) {
				d.display = 'block';
				return 'block';
			});
			magicGraph.filterNodeId.push(...condition); //用于扩展显示隐藏的数据
			$(".relation_tip_active").attr("class", "relation_tip");
		},
		/*
		通过右边常用工具栏调用，可以过滤想要的节点
		@Param {node} Array 点的objectid
		@Param {checked} String  控制隐藏/显示 
		*/
		statisticFilter: function(node = [], checked = undefined){
			magicGraph.filterNodeId = [];
			//显示
			if (checked) {
				magicGraph.enterNodes.filter(function (d, i) {
					return node.includes(d.id);
				}).style("display", function (d) {
					d.display = 'block';
					return 'block';
				});
				magicGraph.pathUpdate.filter(function (d) {
					return node.includes(d.target.id) || node.includes(d.source.id);
				})
				.style("display", 'block');
			} else { //隐藏
				magicGraph.enterNodes.filter(function (d, i) {
					return node.includes(d.id);
				}).style("display", function (d) {
					d.display = 'none';
					return 'none';
				});
				magicGraph.pathUpdate.filter(function (d) {
					return node.includes(d.target.id) || node.includes(d.source.id);
				})
				.style("display", 'none');
			}
			//magicGraph.filterNodeId.push(...node); //用于扩展显示隐藏的数据
			//$(".relation_tip_active").attr("class", "relation_tip");
		},
		
		//功能：过滤器所需的节点数据
		getFilterNodesId: function(){
			const filters = [];
			for (const node of nodes) {
				const obj = {
					id: node.id,
					type: node.objectType
				}
				filters.push(obj);
			}
			return filters;
		},
		//功能：绘制图形函数
		drawTopoMap: function(duration = 0){
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
				.on("dblclick", magicTopoEvents.linkDblclick())
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
					// if (d.relationWeight) {
					// 	d3.select(this).append("text")
					// 		.attr("class", "outwieght")
					// 		.style("font", "10px 微软雅黑")
					// 		.style("fill", "#ce1e1e")
					// 		.text(function (d) {
					// 			return ':' + d.relationWeight;
					// 		});
					// }
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
			magicGraph.enterNodes.enter().append("g")
				.attr("class", "node")
				.attr("id", d => d.id)
				.attr("data-id",d => d.nodeId)
				.attr("data-type",d => d.type)
				.style("display",d => d.display)
				.on("mouseover", magicTopoEvents.fadeNodes(0.2, 0))
				.on("mouseout", function () {
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
							return 18 + d.nodeWeight + quantity;
						})
						.attr("class", "outring")
						.attr("cx", 0)
						.attr("cy", 0)
						.style("fill",d => d.fill)
						.style("stroke",d => d.stroke)
						.style("stroke-dasharray",d => (d.nodeType ? (5,5) : (0,0)))
						.style("stroke-width", "2px");
					// if (d.markIcons && d.markIcons.length) {
					// 	const self = this;
					// 	d.markIcons.forEach(function (mark, i) {
					// 		let x = -7 + (18 + d.nodeWeight) * Math.cos(i * 2 * Math.PI / 4);
					// 		let y = -4 + (18 + d.nodeWeight) * Math.sin(i * 2 * Math.PI / 4);
					// 		d3.select(self).append("image")
					// 			.attr("width", 16)
					// 			.attr("height", 16)
					// 			.attr("x", x)
					// 			.attr("y", y)
					// 			.attr("xlink:href", d => "../../image/mark/" + mark + ".svg");
								
					// 	})
					// }
					if (!d.grouped) {
						d3.select(this).append("image")
							.attr("class", "nodeimg")
							.attr("width", 25+ d.nodeWeight)
							.attr("height", 24.5 + d.nodeWeight)
							//.attr("xlink:href",d =>"../../image/typeicon/" + d.objectType.toLowerCase() + ".svg")
							.attr("xlink:href", d => {
								return d.icon || "../../image/typeicon/" + d.objectType.toLowerCase() + ".svg"
							})
							.attr("x", (-25 - d.nodeWeight) / 2)
							.attr("y", (-24.5 - d.nodeWeight) / 2);
						if (d.icon) {
							d3.select(this).append("path")
							.attr("class", "raduisImage")
							.style('fill',d.fill)
							.attr("d",(d,i) => arc(17.5, 12)());
						}
					}
					if (d.markIcons && d.markIcons.length){
						d3.select(this).append("circle")
						.attr("r", () => {
							let quantity = d.quantity ? 2 : 0;
							return 18 + d.nodeWeight + quantity;
						})
						.attr("class", "outring")
						.attr("cx", 0)
						.attr("cy", 0)
						.style("fill",'#717788')
						.style("stroke",'#a7adbd')
						.style('fill-opacity',0.7)
						.style("stroke-width", "2px");
					}
					if (d.nodeWeight) {
						d3.select(this).append("text")
							.attr("class", "nodeWeight")
							.attr("dy", '1em')
							.attr("text-anchor", "middle")
							.style("font", "10px 微软雅黑")
							.style("fill", "#ce1e1e")
							.text(d => d.nodeWeight);
					}
					d3.select(this).append("text")
						.attr("class", "nodetext")
						.attr("dy", 3.5 + d.nodeWeight / 5.5 + 'em')
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
			drawdraglinknode.drawNodes(magicGraph.enterNodes,duration);
			magicGraph.enterNodes.exit().remove();
			getTotalMessage(magicFunctions.getNodesid()); //统计信息
			//magicTopoEvents.canvansHtml();
		},
		//功能：清屏
		clearScapan: function(){
			//清除数据集及版本名称以及相关自定义属性
			$("#dsname_tip h4").empty()
				.removeAttr("data-datasetId data-versionId data-id data-versionName data-datasetName");
			const lengthNodes = nodes.length;
			const lengthLinks = links.length;
			nodes.splice(0, lengthNodes);
			links.splice(0, lengthLinks);
			this.drawTopoMap();
			getBaseMessage(false);
			d3.selectAll("rect.extent").attr("width", 0);
			d3.selectAll("g.resize").style("display", "none");
			//$(".thumb_imgs").attr("src", ""); //清空缩略图
			localStorage.removeItem("topoNodes");
			localStorage.removeItem("datasetName");
			localStorage.removeItem("versionName");
			localStorage.removeItem("datasetId");
			localStorage.removeItem("colleNodes"); //清空缓存
			localStorage.removeItem("searchAddNode");
			localStorage.removeItem("mapOverlays");//地图相关数据
			localStorage.removeItem("versionId");
			localStorage.setItem("saveState", true);
			resetMenu.remove();
			d3.selectAll("g.brush").remove();
			magicGraph.historytimes = []; //清空时间数据
			timeAxis.magicTopoTime = [];
			d3.selectAll("g.time_axis").remove();
			$("g.rgroups").empty();
			timeAxis.resetAxis();
		},
		//功能：扩展的时候，调用此函数进行数据请求
		//entendType扩展的类型、extendUrl扩展的url、entendRelation按照关系扩展的类型、entendNodes暂时没用，传空字符串就行
		getDatatoDraw: function(entendNodes, entendType, extendUrl, entendRelation){
			const dataObject = function(type,relation) {
				const selectedNodes = nodes.filter(function (node) {
					return node.selected === true && node.quantity === 0;
				});
				let data = {
					objectId: [],
					nodeId: [],
					objectType: []
				};
				//let dataRelation = null;
				for (let i = 0; i < selectedNodes.length; i++) {
					data.objectId.push(selectedNodes[i].id);
					data.objectType.push(selectedNodes[i].objectType);
					data.nodeId.push(selectedNodes[i].nodeId);
				}
				//得到关系扩展的接口data数据
				if (relation) {
					let dataRelation = {
						"centerObjectId": data.objectId[0],
						"centerNodeId": data.nodeId[0],
						"centerObjectType": data.objectType[0],
						"passLabelOfRelationship": relation
					};
					return dataRelation;
				//得到节点扩展的接口data数据
				} else {
					data.type = type;
					return data;
				}
			};
			//添加上一步操作和移除集合缓存数据
			backfun.addstatus(nodes, links, "extend");
			localStorage.removeItem("colleNodes");
			//按照关系类型扩展
			if (extendUrl === '/leaves/complex') {
				let url = EPMUI.context.url + extendUrl;
				let completed = function () {
					resetMenu.remove();
				};
				let succeed = function (data) {
					
					if (data.code === 200) {
						const parseDatas = data.magicube_interface_data;
						reqLeavesApi.creatLinks(parseDatas);
					} else {
						magicFunctions.errors('没有数据');
					}
				};
				let data = dataObject('',entendRelation);
				ajaxApp(url, 'POST', data, completed, succeed,undefined);
			}
			//按照节点类型进行扩展
			if (extendUrl === '/leaves/') {
				let url = EPMUI.context.url + extendUrl;
				let completed = function () {
					resetMenu.remove();
				};
				let succeed = function (data) {
					
					if (data.code === 200) {
						const parseDatas = data.magicube_interface_data;
						reqLeavesApi.creatLinks(parseDatas);
					} else {
						magicFunctions.errors('没有数据');
					}
				};
				let data = dataObject(entendType);
				ajaxApp(url, 'POST', data, completed, succeed,undefined);
			}
		}
	}
	//节点操作事件集合
	const magicTopoEvents = {
		//功能：双击节点的事件
		nodeDblclick: function(){
			return function(d, i){
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
				//走虚拟点的菜单
				if (d.nodeType === 1) {
					let vlinks = links.filter(function(t,l){
						return t.id === d.id;
					});
					//根据方向判断source和target谁是中心点
					let father = vlinks[0].target.id === d.id ? vlinks[0].source : vlinks[0].target;
					let texts = ["筛选查看", "查看全部", "取消"];
					let imageName = [["none","screening"],["none","watchall"],["none","cancele"]];
					//要求type、quantity是虚拟点的数据，别的都是中心点的数据
					let nodeArray = [father.id, father.nodeId, father.type,d.objectType,d.quantity,d.id];
					const itemNumber = [1,2,3];
					let config = {
						arc: [45, 105, 105, 115],
						text: texts,
						angle:2,
						itemNumber:itemNumber,
						imageName: imageName,
						className: 'ol_menu',
						position: [d.x, d.y],
						nodeArray: nodeArray
					};
					resetMenu.oneTopoMenus(config);
				//正常点的菜单
				} else if (d.nodeType === 0){
					const china = d.grouped ? "拆分" : "组合";
					const english = d.grouped ? ["none","disperse"] : ["group","group"];
					const texts = ["删除", "扩展", "模型", china, "标注", "查看", "显示", "取消"];
					const imageName = [["none","delete"], ["extend","extend"], ["model","model"], english, ["none","mark"], ["none","checkout"], ["show","show"], ["none","cancele"]];
					const nodeArray = [d.id, d.nodeId, d.type, d.objectType,d.page_type];
					const itemNumber = [1,2,3,4,5,6,7,8];
					const config = {
						arc: [45, 105, 105, 115],
						angle:2,
						text: texts,
						itemNumber:itemNumber,
						imageName: imageName,
						className: 'ol_menu',
						position: [d.x, d.y],
						nodeArray: nodeArray
					};
					resetMenu.oneTopoMenus(config);
				}
			}
		},
		//功能：单击节点的事件
		nodeMouseDown: function(){
			return function(d,i){
				d.fixed = true;
				if (d3.event.defaultPrevented || d.nodeType ) return;
				magicFunctions.throttle(getBaseMessage,[true,d.id, d.objectType, true]);//基础信息展示
				if ((d3.event.shiftKey) || (d3.event.metaKey) || ($("g.selected").length > 1)) {
					d3.select(this).classed("selected", function (node) {
							return node.selected = d === node;
						})
						.select(".outring").style("stroke", "#ffd862");
				} else {
					const _fill = "rgb(252, 49, 26)";
					const markFill = "rgb(113, 119, 136)";//markicons 的指定颜色
					magicGraph.enterNodes.classed("selected", function (node) {
							return node.selected = d === node;
						})
						.select(".outring").style("stroke", function (p) {
							if (d3.select(this).style("fill") !== _fill) {
								if( d3.select(this).style("fill") == markFill){
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
		//功能：双击关系的事件
		linkDblclick: function(){
			return function(d, i){
				if (d3.event.defaultPrevented) return;
				const xDist = (d.source.x + d.target.x) / 2;
				const yDist = (d.source.y + d.target.y) / 2;
				const pxy = [xDist, yDist];
				const texts = ["删除", "修改", "查看","取消"];
				const imageType = [["deleteFather","delete"], ["onLink","amend"], ["onLink","checkoutLink"],["onLink","cancele"]];
				const nodeArray = [d.relationId];
				const itemNumber = [1,2,3,4];
				const config = {
					arc: [45, 105, 106, 116],
					text: texts,
					angle:2,
					itemNumber:itemNumber,
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
		nodeMouseUp: function(){
			return function(d, i){
				if (!magicGraph.mousedown_node || d.nodeType ) {
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
					}
					const link = {
						source: target,
						target: source
					};
					//有关系的两个点之间不可以再创建关系了
					if (link) {
						$(".makelink_box h5").eq(0).html("请选择创建连接的关系类型：");
						makeNodesRelate(link);
					}
					backfun.addstatus('', '', "makerRelation");
					// 创建新的path
					magicGraph.selected_link = link;
					magicGraph.selected_node = null;
				}
			}
		},
		//功能：鼠标放在某一个节点上的时候，会进过一段时间的延迟隐藏与当前点无关的节点或者关系
		fadeNodes: function(opacity, filter){
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
		//功能：小地图截图操作，每次扩展会截图作为缩略图
		// canvansHtml: function() {
		// 	setTimeout(function() {
		// 		const target = document.getElementsByClassName("topo_network")[0];
		// 		html2canvas(target).then(function(canvas){
		// 			canvas.id = "mycanvas";
		// 			let dataUrl = canvas.toDataURL();
		// 			let isrects = d3.select(".brushRect"),
		// 				isrectEmpty = isrects.empty();
		// 			d3.select(".thumb_imgs")
		// 				.attr("xlink:href", function(d) {
		// 					return dataUrl;
		// 				});
		// 		});
		// 	}, 400);
		// }
	};
	//操作菜单
	class MagicTopoWorkMenus{
		constructor(){
			this.removeMenu = true;
			this.arc = (innerRadius, outerRadius,items,itemNumber,angle) => {
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
				},200);
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
			//功能：组合节点
			this.groupNodes = (grouped) => {
				
			};
			
			//统一传参
			this.myConfig = (angle,itemNumber, carc, ctext, cimageName, classNames, ctype = undefined, cdepth = undefined, cdirection = undefined, cpassShipLabel = undefined) => {
				var config = {
					itemNumber:itemNumber,
					angle:angle,
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
					let $ulTemp = i === moreExtend.length-1 ? $("<li class='extend_type_uli selected_li' id=" + extendSysName[i] + "></li>") : $("<li class=extend_type_uli id=" + extendSysName[i] + "></li>");
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
				$("#extend-ensured").off().on("click",function (){
					let extendType = [];
					$(".selected_li").each((d,i) => {
						extendType.push($(i).attr("id"));
					})
					globalFuction.getDatatoDraw("", extendType, '/leaves/');
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
				if (a[0].name.length > 5) {
					var c = a[0].name.slice(0, 4);
					var d = a[0].sysname.slice(0, 4);
					var e = a[0].id.slice(0, 4);
					c.push("更多");
					d.push([a[0].sysname[0][0],"more"]);
					e.push(str);
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
				var type = ["Entity", "Document", "Event"];
				var moreMenusData = [
					[{
						"name": [],
						"sysname": [],
						"id": []
					}],
					[{
						"name": [],
						"sysname": [],
						"id": []
					}],
					[{
						"name": [],
						"sysname": [],
						"id": []
					}]
				];
				//循环请求实体、文档、事件的数据
				for (var i = 0; i < type.length; i++) {
					(function (i) {
						const url = EPMUI.context.url + '/nextType/';
						let data = {
							"objectType": type[i],
							"type": "topology",
							"order": true
						};
						let completed = function () {
							return false;
						};
						let succeed = function (data) {
							if (data.length) {
								for (let j = 0; j < data.length; j++) {
									moreMenusData[i][0].name.push(data[j].displayName);
									moreMenusData[i][0].sysname.push([type[i],data[j].systemName]);
									moreMenusData[i][0].id.push(data[j].systemName);
								}
							}
						};
						ajaxApp(url, 'GET', data, completed, succeed,undefined);
					})(i);
				}
				return moreMenusData;
			};
			
		}
		//功能：菜单一级生成函数，生成对应的二级菜单
		oneTopoMenus(config){
			const self = this;
			if (config.position) {
				menusg.attr("class", "topoMenu")
					.attr("transform", function(){
						return "translate(" + config.position[0] + "," + config.position[1] + ")";
					});
			}
			const selectedPath = menusg.selectAll("topoMenu_path").data(config.imageName);
			selectedPath.enter()
				.append("g")
				.attr("class", "topoMenu_path " + config.className)
				.attr("data-depth", (d,i) => config.depth ? config.depth[i] : null)
				.attr("data-direction", (d,i) => config.direction ? config.direction[i] : null)
				.attr("data-passShipLabel", (d,i) => config.passShipLabel ? config.passShipLabel[i] : null)
				.attr("data-type", (d,i) => config.type ? config.type[i] : null)
				.on("mouseenter", function (d, i) {
					if (self.removeMenu) { //不加这个条件判断，会导致在取消菜单时，如果用户同时滑倒了菜单上，或出现父菜单没了，但触发了子菜单生成的显示bug
						d3.select(this)
							.selectAll(".topoMenu_inring")
							.attr("class", "topoMenu_inring topoMenu_inring_enter");
						if(d[1] === 'extend'){
							const config = {
								angle:0.75,
								arc:[108, 168],
								text:["All", "按实体", "按文档", "按事件", "按关系"],
								imageName:[["extends","all"], ["extends","entity"], ["extends","document"], ["extends","event"], ["extends","relation"]],
								className:'tl_menu menu_extend',
								itemNumber:[1,2,3,4,5,6]
							};
							if (!$(".menu_extend").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_model,.menu_group,.menu_show,.thrl_menu').remove();
						}
						if(d[1] === 'model'){
							const config = {
								angle:0.5,
								arc:[108, 168],
								text:["通用模型", "技战法", "自定义"],
								imageName:[["models","common"], ["models","warmodel"], ["models","custom"]],
								className:'tl_menu menu_model',
								itemNumber:[3.25,4.25,5.25]
							};
							if (!$(".menu_model").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend,.menu_group,.menu_show,.thrl_menu').remove();
						}
						if(d[1] === 'group'){
							const angle = links.length ? 0.333 : 0.25;
							const itemNumber = links.length ? [5.25,6.25] : [4];
							const texts = links.length ? ["关系", "节点"] : ["节点"];
							const imageName = links.length ? [["groups","link"], ["groups","node"]] : [["groups","node"]];
							const config = {
								arc:[108, 168],
								text:texts,
								imageName:imageName,
								angle:angle,
								className:'tl_menu menu_group',
								itemNumber:itemNumber
							};
							if (!$(".menu_group").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend,.menu_model,.menu_show,.thrl_menu').remove();
						}
						if(d[1] === 'show'){
							const config = {
								angle:0.3333,
								arc:[108, 168],
								text:["GIS","图表"],
								imageName:[["shows","gis"],["shows","tabel"]],//0.25 7
								className:'tl_menu menu_show',
								itemNumber:[9.75,10.75],
								// itemNumber:[7]
							};
							if (!$(".menu_show").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend,.menu_model,.menu_group,.thrl_menu').remove();
						}
						//扩展菜单部分
						if(d[1] === 'entity'){
							const config = {
								angle:0.75,
								arc:[170, 230],
								text:self.sliceName(getMoreMenus[0], "eimore").name,
								imageName:self.sliceName(getMoreMenus[0], "eimore").sysname,
								extendType:self.sliceName(getMoreMenus[0], "eimore").id,
								className:'thrl_menu menu_extend_entity',
								itemNumber:[1,2,3,4,5,6]
							};
							if (!$(".menu_extend_entity").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend_document,.menu_extend_event').remove();
						}
						if(d[1] === 'document'){
							const config = {
								angle:0.75,
								arc:[170, 230],
								text:self.sliceName(getMoreMenus[1], "dmore").name,
								imageName:self.sliceName(getMoreMenus[1], "dmore").sysname,
								extendType:self.sliceName(getMoreMenus[1], "dmore").id,
								className:'thrl_menu menu_extend_document',
								itemNumber:[1,2,3,4,5,6]
							};
							if (!$(".menu_extend_document").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend_entity,.menu_extend_event').remove();
						}
						if(d[1] === 'event'){
							const config = {
								angle:0.75,
								arc:[170, 230],
								text:self.sliceName(getMoreMenus[2], "evmore").name,
								imageName:self.sliceName(getMoreMenus[2], "evmore").sysname,
								extendType:self.sliceName(getMoreMenus[2], "evmore").id,
								className:'thrl_menu menu_extend_event',
								itemNumber:[1,2,3,4,5,6]
							};
							if (!$(".menu_extend_event").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_extend_entity,.menu_extend_document').remove();
						}
						//模型菜单
						if(d[1] === 'common') {
							const config = {
								angle:0.5,
								arc:[170, 230],
								text:["最短路径", "环形路径", "分散", "汇聚"],
								imageName:[["commons","mostShort"], ["commons","around"], ["commons","disperse"], ["commons","converge"]],
								className:'thrl_menu menu_model_common',
								itemNumber:[4,5,6,7]
							};
							if (!$(".menu_model_common").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_model_custom,.menu_model_war').remove();
						}
						if(d[1] === 'warmodel') {
							const config = {
								angle:0.5,
								arc:[170, 230],
								text:["同行分析", "同住分析", "同案分析"],
								imageName:[["warmodels","together"], ["warmodels","druged"], ["warmodels","message"]],
								className:'thrl_menu menu_model_war',
								itemNumber:[3.25,4.25,5.25]
							};
							if (!$(".menu_model_war").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_model_custom,.menu_model_common').remove();
						}
						if(d[1] === 'custom') {
							const imageName = [["customs","more"]];
							const text = self.menuDatas.txtModel;
							for (let i = 0; i < text.length - 1; i++) {
								imageName.unshift(["customs","customchild"]);
							}
							const config = {
								arc:[170, 230],
								text:text, //保存自定义模型的名字
								imageName:imageName, //保存自定义模型图片的名字
								angle:self.getAngel(text.length).angle, //根据自定义模型数目获取郊区值
								depth:self.menuDatas.depth,
								direction:self.menuDatas.direction,
								passShipLabel:self.menuDatas.passShipLabel,
								className:'thrl_menu menu_model_custom',
								itemNumber:self.getAngel(text.length).itemNumber
							};
							if (!$(".menu_model_custom").length) {
								resetMenu.oneTopoMenus(config);
							}
							d3.selectAll('.menu_model_common,.menu_model_war').remove();
						}
						//显示删除关系子菜单
						if (d[0] === "deleteFather") {
							const linkConfig = {
								angle:0.6666,
								arc:[108, 168],
								text:["删除关系", "隐藏关系"],
								imageName:[["deleteThisLink","delete"], ["hiddenThisLink","delete"]],
								className:'tl_menu deletelink_menu',
								relateId:config.nodeArray,
								itemNumber:[1,2]
							};
							if (!$(".deletelink_menu").length) {
								resetMenu.oneTopoMenus(linkConfig);
							}
							//d3.selectAll('.menu_model_custom,.menu_model_common').remove();
						}
						if (d[1] === 'all'|| d[1] === 'relation') {
							d3.selectAll('.thrl_menu').remove();
						}
						if (d[0] === 'none') {
							d3.selectAll('.tl_menu,.thrl_menu').remove();
						}
						if (d[0] === "onLink") {
							d3.selectAll('.deletelink_menu').remove();
						}
						if (d[0] === 'extends') {
							self.over('extend');
						}
						if (d[0] === 'deleteThisLink' || d[0] === 'hiddenThisLink') {
							self.over('deleteFather');
						}
						if (d[0] === 'models') {
							self.over('model');
						}
						if (d[0] === 'groups') {
							self.over('group');
						}
						if (d[0] === 'shows') {
							self.over('show');
						}
						if (d[0] === 'shows') {
							self.over('show');
						}
						if (d[0] === 'Entity') {
							self.over('extend');
							self.over('entity');
						}
						if (d[0] === 'Document') {
							self.over('extend');
							self.over('document');
						}
						if (d[0] === 'Event') {
							self.over('extend');
							self.over('event');
						}
						if (d[0] === 'commons') {
							self.over('model');
							self.over('common');
						}
						if (d[0] === 'warmodels') {
							self.over('model');
							self.over('warmodel');
						}
						if (d[0] === 'customs') {
							self.over('model');
							self.over('custom');
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
					//取消菜单
					if (d[1] === 'cancele') {
						this.remove();
					}
					//删除节点菜单
					if (d[1] === 'delete' && d[0] === 'none') {
						//从前端删除节点
						globalFuction.deleteNodesLinks('deleteNode',null,'isGropu');
						getBaseMessage(false);
						this.remove();
					}
					//标注菜单
					if (d[1] === 'mark') {
						$.ajax({
							url: EPMUI.context.url + "/mark?" + "objectId=" + config.nodeArray[0] + "&objectType=" + config.nodeArray[3] + "&systemMark=false",
							type: "GET",
							dataType: 'json',
							success: function (data) {
								//标记状态：未保存
								$("#dsname_tip h4").removeAttr("data-versionid data-id");
								localStorage.setItem("saveState", false);
								if (data.status === "success") {
									var $circle = magicGraph.enterNodes.filter(function (d) {
											return d.id == config.nodeArray[0];
										})
										.select(".outring");
									var fill = "rgb(252, 49, 26)";
									if ($circle.style("fill") !== fill) {
										$circle.style("fill", function (d) {
												d.fill = "#fc311a";
												return "#fc311a";
											})
											.style("stroke", function (d) {
												d.stroke = "#ffbcaf";
												return "#ffbcaf";
											});
									} else {
										$circle.style("fill", "#0088b1")
											.style("stroke", "#33d0ff");
									}
								} else {
									magicFunctions.errors('标记失败');
								}
							},
							error: function () {
								magicFunctions.errors('服务器错误');
							}
						})
						this.remove(config);
					}
					
					if (d[1] === 'checkout') {
						const pageType = config.nodeArray[4];
						if (['entity','event','document'].includes(pageType) ) {
							globalFuction.saveLocalStorage();
							location.href = '/' + config.nodeArray[4] + '?id=' + config.nodeArray[0] + '&type=' + config.nodeArray[3]; //跳转到详细页面
						} else {
							magicFunctions.errors('跳转出错');
						}
						this.remove();
					}
					//扩展-按关系菜单
					if (d[1] === 'relation') {
						$("#relation_extend_modalBox").show();
						this.remove();
					}
					//扩展-按全部、实体、事件、文档菜单
					if (["all","document","entity","event"].includes(d[1])) { 
						let clickarr = {
							'all': 'All',
							'entity': 'Entity',
							'document': 'Document',
							'event': 'Event'
						};
						globalFuction.getDatatoDraw("", clickarr[d[1]], "/leaves/");
					}
					//按照实体、文档、事件的详细类型扩展
					//d[1] 扩展的具体类型
					if (["Event","Entity","Document"].includes(d[0]) && d[1] !== "more") {
						globalFuction.getDatatoDraw("", d[1], "/leaves/");
					}
					
					
					//实体、事件、文档的更多
					if (d[1] === 'more' && d[0] !== 'customs') {
						switch (d[0]) {
							//对应实体，文档，事件的更多菜单
							case "Entity":
								this.clickMore(getMoreMenus[0][0]);
								break;
							case "Document":
								this.clickMore(getMoreMenus[1][0]);
								break;
							case "Event":
								this.clickMore(getMoreMenus[2][0]);
								break;
						}
						this.remove();
					}
					 
				});
			const tar = selectedPath.append("path")
					.attr("class", "topoMenu_inring")
					.attr("d",(d,i) => this.arc(config.arc[0], config.arc[0],config.imageName.length,config.itemNumber[i],config.angle)());
			tar.transition()
				.duration(200)
				.attr("d",(d,i) => this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle)());
			selectedPath.exit().attr("d",(d,i) => this.arc(config.arc[0], config.arc[0],config.imageName.length,config.itemNumber[i],config.angle)()).remove();
			//菜单操作提示文字信息
			const menuText = selectedPath.append("text")
				.attr("text-anchor", "middle")
				.text( (d, i) => {
					return config.text[i];
				})
				.attr("transform", "scale(0.1)")
				.style("fill", "#fff")
				.attr("x", (d, i) => {
					var x = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[0];
					return x;
				})
				.attr("y", (d, i) => {
					var y = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[1] + 23;
					return y;
				});
			menuText.attr("transform", "scale(1)");
			//操作菜单图片

			const menuImage = selectedPath.append("image")
				.attr("xlink:href", (d, i) => {
					return '../../image/typeicon/' + d[1].toLowerCase() + ".svg";
				})
				.attr("transform", "scale(0.1)")
				.attr("x", (d, i) => {
					var x = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[0] - 15;
					return x;
				})
				.attr("y", (d, i) => {
					var y = this.arc(config.arc[0], config.arc[1],config.imageName.length,config.itemNumber[i],config.angle).centroid(d)[1] - 20;
					return y;
				})
				.attr("width", 28)
				.attr("height", 28);
			menuImage.attr("transform", "scale(1)");
		}
	};
	const resetMenu = new MagicTopoWorkMenus();
	const getMoreMenus = resetMenu.getMoreMenus();

	//时间轴
	class MagicTopoTimeLine{
		constructor(){
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
			this.xScale = function(xScaledata) {
				const xScale = d3.time.scale()
					.domain([d3.time.month.offset(new Date(xScaledata[0][0].time), -1), d3.time.month.offset(new Date(xScaledata[0][xScaledata[0].length - 1].time),1)])
					.rangeRound([0, this.xRangeWidth]);
				return xScale;
			},
			this.yScale = function(yScaledata) {
				const yScale = d3.scale.linear()
					.domain([0,
						d3.max(yScaledata, function(d) {
							return d3.max(d, function(d) {
								return d.y0 + d.y;
							});
						})
					])
					.range([0, this.yRangeWidth]);
				return yScale;
			},
			//功能：对时间数组进行补全，因为stack图的数据要求必须为对齐的数据格式
			this.assignDefaultValues = function(dataset, relationName) {
				dataset.forEach(data => data.y = parseInt(data.y));
				let defaultValue = 0;
				let hadData = [true, true, true];
				let newData = [];
				let previousdate = new Date();
				dataset.forEach(function(row) {
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
			this.UpdateAxis = function(indexArray, times) {
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
			this.getAxis = function(data, name) {
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
					theme: Magicube.scrollbarTheme,
					autoHideScrollbar: true
				});
				let jsonStackTimes = JSON.parse(stringTimes);
				let stack = this.stack(jsonStackTimes);
				this.creatGroup(stack);
				d3.selectAll("g.rgroups")
					  .style("fill", d => linkColorArray(d[0].relationName));
				//点击改变坐标轴
				$("div.axisList").off("click");
				$("div.axisList").on("click", function(e) {
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
						$("div.axisList").each((d,i) => {
							if ($(i).find('div').hasClass('icon-check-square-o')){
								indexArray.push($(i).index());
							}
						})
						//全选中显示全部时间
						if (indexArray.length == $("div.axisList").length) {
							self.UpdateAxis(0, stringTimes);
						//全没选中
						} else if (!indexArray.length){
							const emptyTime = [[{
								y:'',
								time: ''
							}]];
							const stringTime = JSON.stringify(emptyTime);
							self.UpdateAxis(0, stringTime);
						//逐一选中
						} else {
							self.UpdateAxis(indexArray, stringTimes);
						}
					})
					.on("mouseover", function(e) {
						e.stopPropagation();
						let $width = $(this).find("label").width();
						if ($width > 90) {
							let interpolation = ($width - 80) + 115;
							$("#topology_timeline_axis").stop(true).animate({
								left:interpolation
							})
						}
					})
					.on("mouseout", function(e) {
						e.stopPropagation();
						$("#topology_timeline_axis").stop(true).animate({
							left : '140px'
						})
					});
			},
			//每次更新时间轴
			this.creatGroup = function(dataStack) {
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
					.attr("x", function(d) {
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
				let dateWord = function() {
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
			this.brushAxis = function(_xScale) {
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
					magicGraph.enterNodes.classed("selected",(d,i)=>{
						d.selected = false;
						return false;
					})
					.selectAll(".outring")
					.style("stroke", function() {
						return d3.select(this).style("fill") !== "rgb(252, 49, 26)" ? "#33d0ff" : "#ffbcaf"
					});
					//选择对应时间的节点
					self.rects.filter(d => s1 <= (d = _xScale(new Date(d.time))) && d <= s2)
						.filter(d => d.y)
						.classed("time_selected", true)
						.each(function(dLinks) {
							let dLinkstime = dLinks.time;
							magicGraph.pathUpdate.filter(function(p) {
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
												if (time[i].slice(0,10).includes(dLinkstime)) {
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
									.classed("selected", (d,i) => {
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
			this.disposeTimeData = function(timeData) {
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
		resetAxis(){
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
	function calculatePos(node, link, length,layout, history) {
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
		magicGraph.timedatas = magicFunctions.getTimesFromLinks(links);//从关系数组links里面更新时间数据
	
		globalFuction.drawTopoMap(); 
		//只有当有时间数据的时候才执行下面的函数
		if (magicGraph.timedatas.length) {
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
		globalFuction.collectiveOpera('', '', '', '',operate);
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
	function Drawdraglinknode(){
		//返回曲线
		this.arcArrow = function (startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength) {
			let angleTangent,arcRadius,c1,c2,coord,cx,cy,deflectionRadians,endAngle,endAttach,endNormal,endOverlayCorner,endTangent,
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
			intersectWithOtherCircle = function(fixedPoint, radius, xCenter, polarity) {
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
			startTangent = function(dr) {
				let dx, dy;
				return dx = (0 > dr ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1))), dy = g1 * dx, {
					x: startAttach.x + dx,
					y: startAttach.y + dy
				}
			};
			endTangent = function(dr) {
				let dx, dy;
				return dx = (0 > dr ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2))), dy = g2 * dx, {
					x: endAttach.x + dx,
					y: endAttach.y + dy
				}
			};
			angleTangent = function(angle, dr) {
				return {
					x: cx + (arcRadius + dr) * Math.sin(angle),
					y: cy - (arcRadius + dr) * Math.cos(angle)
				}
			};
			endNormal = function(dc) {
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
			let outext = function(shortCaptionLength) {
				let captionSweep, endBreak, startBreak, dy;
					captionSweep = shortCaptionLength / arcRadius;
					deflection > 0 && (captionSweep *= -1);
					startBreak = midShaftAngle - captionSweep / 2;
					endBreak = midShaftAngle + captionSweep / 2;
				return dy = coordy(angleTangent(startBreak, shaftRadius)) + 3;
			};
			let outline = function(shortCaptionLength) {
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
				outext:outext,
				outline:outline,
				overlay:overlay
			};
		},
		//返回直线
		this.straightArrow = function (startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight) {
			let length,shaftLength,endArrow, endShaft, headRadius, shaftRadius, startArrow,midShaftPoint;
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
			let outline = function(shortCaptionLength) {
				let endBreak, startBreak;
				startBreak = startArrow + (shaftLength - shortCaptionLength) / 2;
				endBreak = endShaft - startBreak + startRadius + 8;
				return ["M", startRadius, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", startRadius, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" ");
			};
			let overlay = function(minWidth) {
				let radius;
				return radius = Math.max(minWidth / 2, shaftRadius), ["M", startRadius, radius, "L", endArrow, radius, "L", endArrow, -radius, "L", startRadius, -radius, "Z"].join(" ")
			};
			return {
				outline:outline,
				overlay:overlay
			};
		},
		//实例化生成曲线和直线
		this.arcPath = function (d, strokeWidth, weight,textlength) {
			let square = num => num * num;
			let xDist = d.source.x - d.target.x;
			let yDist = d.source.y - d.target.y;
			let edgeHalfLength = Math.sqrt(square(xDist) + square(yDist)); //两点之间的距离
			let midpoint = 10;//控制多条关系得拱形大小的阀值
			let arcCaptionLenght = textlength + 10;//关系名得长度
			let deflection = d.linknum > 0 ? (d.id !== d.target.id) ? (midpoint * -d.linknum) : (midpoint * d.linknum) : (d.id !== d.target.id) ? (midpoint * -d.linknum) : midpoint * d.linknum;
			let arcArrowed = this.arcArrow(weight, weight, edgeHalfLength, deflection, strokeWidth, weight / 2 , weight / 2);
			let straightArrowed = this.straightArrow(weight, weight, edgeHalfLength, strokeWidth, weight / 2, weight / 2);
			let outline = d.linknum !== 1 ? arcArrowed.outline(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outline(arcCaptionLenght) : straightArrowed.outline(arcCaptionLenght);
			let dy = d.linknum !== 1 ? arcArrowed.outext(arcCaptionLenght) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.outext(arcCaptionLenght) : 3;
			let overline = d.linknum !== 1 ? arcArrowed.overlay(10) : (d.size > 1 && d.size % 2 === 0) ? arcArrowed.overlay(10) : straightArrowed.overlay(10);
			return [outline,dy,overline];
		},
		//更新links的位置
		this.drawLinks = function (topoLinks, durations, strokeWidth) {
			topoLinks.attr("transform", function(d) {
				let	xDist = d.target.x - d.source.x;
				let	yDist = d.target.y - d.source.y;
				let naturalAngle = (Math.atan2(yDist, xDist) / Math.PI * 180 + 180) % 360;
				return "translate(" + d.source.x + "," + d.source.y + ")rotate(" + (naturalAngle + 180) + ")";
			}).each(function(d) {
				let xDist = d.source.x - d.target.x;
				let yDist = d.source.y - d.target.y;
				let yt = d.target.y - d.source.y;
				let xt = d.target.x - d.source.x;
				//两个点与x轴形成的夹角
				let naturalAngle = (180 + Math.atan2(yt, xt) / Math.PI * 180) % 360;
				//两点之间的距离
				let edgeLength = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
				let lineColors = (edgeLength < 50 ) ? 'none' : magicGraph.linkDefaultColor !== "#A5ABB6" ? magicGraph.linkDefaultColor : linkColorArray(d.relationTypeName);//距离太近拉近两个点的时候线会很难看
				let dx = (d.linknum !== 1) ? (edgeLength / 2 - 4) : (d.size % 2 === 0) ? (edgeLength / 2 - 4) : (edgeLength / 2);
				const nodewight = (d.nodeWeight > 10) ? 10 : d.nodeWeight < 0 ? 0 : d.nodeWeight;
				const weight = 18 + parseInt(nodewight);//节点的半径
				const relationWeight = d.relationWeight > 5 ? 5 : d.relationWeight < 0 ? 1 : d.relationWeight;
				const linkSize = relationWeight + strokeWidth;//线的粗细
				const textlength = d3.select(this).selectAll('.outword').node().getBBox().width;
				let dy = drawdraglinknode.arcPath(d,linkSize,weight,textlength)[1];
				let linkPath = drawdraglinknode.arcPath(d,linkSize,weight,textlength)[0];
				let overline = drawdraglinknode.arcPath(d,linkSize,weight,textlength)[2];
				d3.select(this).selectAll("path.link")
					.transition()
					.duration(durations)
					.attr("d",linkPath)
					.style("fill",lineColors);
				d3.select(this).selectAll('text')
					.attr("transform", function(){
						return naturalAngle < 90 || naturalAngle > 270 ? "rotate(180 " + dx + " " + (dy - 3) + ")" : null;
					})
					.style("fill",lineColors);
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
			topoNode.transition().duration(durations).attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		},
		//拖动的时候匹配关系一起联动
		this.dragNodeandLink = function (d) {
			var source = magicGraph.pathUpdate.filter(function(l) {
					return l.source.id === d.id;
				})
				.each(function(l) {
					l.source.x = d.x;
					l.source.y = d.y;
				});
			this.drawLinks(source, 0, magicGraph.strokeWidth);
			var targrt = magicGraph.pathUpdate.filter(function(l) {
					return l.target.id === d.id;
				})
				.each(function(l) {
					l.target.x = d.x;
					l.target.y = d.y;
				});
			this.drawLinks(targrt, 0, magicGraph.strokeWidth);
		}
	}
 
	 
	//请求接口函数
	function ajaxApp(urls, types, datas, completed, succeed, errored,dataType) {
		let appDataType = dataType || 'json';
		let thisError = function () {
			$("#page_alert").show();
			$("#page_alert_content").html("没有数据");
		};
		let defaultError = errored || thisError;
		$.ajax({
			url: urls,
			traditional: true, //自动解析数组
			type: types,
			data: datas,
			dataType: appDataType,
			complete: function () {
				completed();
			},
			success: function (data) {
				succeed(data);
			},
			error: function (error) {
				defaultError();
			}
		})
	}
	 
	//检测是否是IE、Edge浏览器
	function isIE() {
		if (window.ActiveXObject || "ActiveXObject" in window || navigator.userAgent.includes("Edge")) return true;
		else return false;
	}
	//跳转到工作台页面判断显示工作台或者地图
	(function () {
		//查找数据
		magicFunctions.findLocalStorage();
		 
		timeAxis.resetAxis();

	})();
	//对画布进行拖动和缩放
	d3.selectAll(".topo-console").call(zoomListener)
		.on("dblclick.zoom", null) //防止双击事件
		.on("mouseup", function(){
			d3.selectAll("path.overlay,path.link,text.outword").style("display", "block");
		});
	//工具条左边部分
	d3.selectAll(".tool-parent-left")
		.on("click", function (d, i) {
			if (i === 7) {
				magicFunctions.screenshot();
			}
			//清屏
			if (i === 8) {
				if (localStorage.getItem("saveState") === 'true') {
					globalFuction.clearScapan();
				} else {
					$("#dataset_save_tip").show();
					$("#dataset_save_tip .dstf_ok").on('click', function () {
						$("#dataset_save_tip").hide();
						$("#tool_save").click();
					});
					$("#dataset_save_tip .dstf_cancel").on('click', function () {
						$("#dataset_save_tip").hide();
						globalFuction.clearScapan();
					});
				}
			}
		})
		.on("mouseover", function (d, tools) {
			d3.select(this).append("p")
				.attr("class", "totips")
				.style("width", function (d, i) {
					var tooBar_tips_width = ["30", "60", "30", "", "30", "30", "", "30", "30", "50", "30", "30", "50", "", "50", "30", "", "50", "30", "50"];
					return tooBar_tips_width[tools] + "px";
				})
				.text(function (d, i) {
					var tooBar_tips = ["固定", "隐藏/显示", "查找", "", "保存", "导入", "", "快照", "清屏", "备忘录", "翻转", "排布", "连接线", "", "另存为", "推送", "", "上一步", "删除", "数据集"];
					return tooBar_tips[tools];
				})
		})
		.on("mouseout", function (d) {
			d3.selectAll(".totips").remove();
		});
	//工具栏右边部分
	d3.selectAll(".tool-parent-right")
		.on("click", function (d, i) {
			//上一步
			if (i === 7) {
				backfun.goBack();
			}
			//选中节点进行批量删除
			if (i === 8) {
				globalFuction.deleteNodesLinks('deleteNode',null,'isGropu');
			}
		})
		.on("mouseover", function (d, i) {
			d3.select(this).append("p")
				.attr("class", "totips")
				.style("width", function (d) {
					const tooBar_tips_width = ["30", "60", "30", "", "30", "30", "", "30", "30", "50", "30", "30", "50", "", "50", "30", "", "50", "30", "50"];
					return tooBar_tips_width[i + 10] + "px";
				})
				.text(function (d) {
					const tooBar_tips = ["固定", "隐藏/显示", "查找", "", "保存", "导入", "", "快照", "清屏", "备忘录", "翻转", "排布", "连接线", "", "另存为", "推送", "", "上一步", "删除", "数据集"];
					return tooBar_tips[i + 10];
				})
		})
		.on("mouseout", function (d, i) {
			$(".totips").remove();
			$(".tipBoxs").hide();
		});


	//查找节点键盘enter事件
	$(".nodes_find").keydown(function (event) {
		if (event.keyCode === 13) {
			var $val = $(this).val();
			magicFunctions.searchNodes($val);
			$(this).parent("div").toggle();
			$(this).val("");
		};
	})
	
	//顶部导航栏点击事件
	$("#selectBar").click(function (e) {
		if (e.target.className.slice(0, 13) === 'selectBar_div') {
			localStorage.removeItem("colleNodes"); //移除集合缓存数据
			globalFuction.saveLocalStorage();
		}
	})

	//个人信息按钮点击事件
	$("#user").on("click", 'div', function () {
		localStorage.removeItem("colleNodes"); //移除集合缓存数据
		globalFuction.saveLocalStorage();
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
			.attr('width', $("#topology_main").width() - $("#topology_message").width());
		d3.select(".topo-console")
			.attr('height', $(document).height() - $("#header").height() - $("#topology_timeline").height());
		//时间轴的该变
		magicGraph.topoTimeLineSvg.attr('width', $("#topology_timeline_axis").width());
		magicGraph.topoTimeLineSvg.attr('height', $("#topology_timeline_axis").height());
	})
});