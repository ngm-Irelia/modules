(function() {
	console.log("11111111")
	CommonView.showMap('org-map');
/* 
	var option;
  //模拟大json
  let {orgName, overviewBaseMsg, overviewChart,orgProblemData,orgRunData} = {
		orgName:"南京",
		overviewBaseMsg:[
			{
				name:"机构名称",
				value:"南京银行"
			},{
				name:"风险金额",
				value:"1893万"
			},{
				name:"未整改",
				value:"551"
			},{
				name:"已整改",
				value:"342"
			},{
				name:"涉及客户",
				value:"123人"
			},{
				name:"涉及违规",
				value:"43人"
			}
		],
		overviewChart:[
			{
				name:"风险金额",
				value:[{
					value:["2018/1/1",194]
				},{
					value:["2018/2/1",294]
				},{
					value:["2018/3/1",694]
				},{
					value:["2018/4/1",494]
				},{
					value:["2018/5/1",394]
				},{
					value:["2018/6/1",694]
				},{
					value:["2018/7/1",694]
				},{
					value:["2018/8/1",694]
				},{
					value:["2018/9/1",494]
				},{
					value:["2018/10/1",594]
				},{
					value:["2018/11/1",794]
				},{
					value:["2018/12/1",694]
				}]
			},{
				name:"问题发现个数",
				value:[{
					value:["2018/1/1",794]
				},{
					value:["2018/2/1",694]
				},{
					value:["2018/3/1",594]
				},{
					value:["2018/4/1",694]
				},{
					value:["2018/5/1",694]
				},{
					value:["2018/6/1",494]
				},{
					value:["2018/7/1",794]
				},{
					value:["2018/8/1",194]
				},{
					value:["2018/9/1",394]
				},{
					value:["2018/10/1",594]
				},{
					value:["2018/11/1",694]
				},{
					value:["2018/12/1",694]
				}]
			}
		],
		orgProblemData:[
			{
				name:'南京分行',
				number:118
			},{
				name:'天津分行',
				number:65
			},{
				name:'杭州分行',
				number:53
			},{
				name:'福州分行',
				number:43
			},{
				name:'北京分行',
				number:42
			},{
				name:'苏州分行',
				number:33
			}
		],
		orgRunData:[
			{
				name:'杭州分行',
				number:58
			},{
				name:'苏州分行',
				number:35
			},{
				name:'南京分行',
				number:23
			},{
				name:'福州分行',
				number:13
			},{
				name:'北京分行',
				number:12
			},{
				name:'天津分行',
				number:3
			}
		]
	}

	//地图
	$.get('/js/public/mapdata/china.json', function(chinaJson) {
		console.log(chinaJson);
		echarts.registerMap('china', chinaJson);
		var chart = echarts.init(document.getElementById('org-map'));

		var geoCoordMap = {
			"西安": [112.91, 27.87],
			"金坛": [119.64, 29.12],
			"岳阳": [113.09, 29.37],
			"长沙": [113, 28.21],
			"衢州": [118.88, 28.97],
			"廊坊": [116.7, 39.53],
			"合肥": [117.27, 31.86],
			"武汉": [114.31, 30.52],
			"大庆": [125.03, 46.58]
		};

		var convertData = function(data) {
			var res = [];
			for (var i = 0; i < data.length; i++) {
				var geoCoord = geoCoordMap[data[i].name];
				if (geoCoord) {
					res.push(geoCoord.concat(data[i]));
				}
			}
			return res;
		};


		option = {
			geo: {
				map: 'china',
				top:'15%',
				left:'right',
				roam:false,
				center: [115.97, 29.71],
				label: {
					normal: {
						show: true,
						color: '#CEE3FE'
					},
					emphasis: {
						show: false,
						color: '#CEE3FE'
					},
				},
				itemStyle: {
					normal: {
						areaColor: '#10182A',
						borderColor: '#155DA3',
						borderWidth: 1.5,
						shadowColor: 'rgba(20,64,111, 1)',
						shadowBlur: 5,
						shadowOffsetX: 1
					},
					emphasis: {
						areaColor: '#10182A', //2a333d
						color: '#CEE3FE'
					}
				}
			},
			series: [{
				name: 'yh',
				type: 'scatter',
				coordinateSystem: 'geo',
				
				label:{
					normal:{
						show: false, // 设为true，使用它
						formatter: function (params) {
							//console.log(params);
							var icon = 'up' ;
							return '{' + icon + '|}';
						}, 
						rich: {
								up: {
										height: 44,
										align: 'center',
										backgroundColor: {//chart.convertToPixel('geo',[116.0815,41.781])；
												image: '/image/echarts/blue.gif'
										}
								},
								down: {
										height: 24,
										align: 'center',
										backgroundColor: {
												image: '/image/echarts/red.gif'
										}
								}
						}
					}
				},
				data: convertData([{
						name: "西安",
						value: 61
					},
					{
						name: "金坛",
						value: 62
					},
					{
						name: "大庆",
						value: 279
					}
				]),
				symbolSize: 12
			}],

		};
		chart.setOption(option);
		 
		chart.on('dblclick', {seriesName: 'yh'}, function (params) {
		//数据操作
	  });
		chart.on("dblclick",function(params){
			if(params.componentType !== "geo"){ return ''; }

			console.log(params);
			//根据 params.region.name ，获得chinaJson中所有省
			var provience = chinaJson.features.filter( item => item.properties.name===params.region.name);

			if(!provience|| provience.length <=0 || parseInt(provience[0].properties.id) > 99 ){
				// 不是省了，暂时return， 可以改成退回原来状态
				chart.setOption({
					geo:{
						map: 'china',
						zoom: 1,
						top:'15%',
						left:'right',
						roam:false,
						center: [115.97, 29.71],
						label: {
							normal: {
								show: true,
								color: '#CEE3FE'
							},
							emphasis: {
								show: false,
								color: '#CEE3FE'
							},
						},
						itemStyle: {
							normal: {
								areaColor: '#10182A',
								borderColor: '#155DA3',
								borderWidth: 1.5,
								shadowColor: 'rgba(20,64,111, 1)',
								shadowBlur: 5,
								shadowOffsetX: 1
							},
							emphasis: {
								areaColor: '#10182A', //2a333d
								color: '#CEE3FE'
							}
						}
					}
				});

				return '';
			}

			//根据id读取对应文件
			$.get('/js/public/mapdata/geometryProvince/'+provience[0].properties.id+'.json', function(provienceJson){
		
				var newRegions =  provienceJson.features.map(item => {// 获得每个市的名字，用来处理地图的颜色
					return {
						name: item.properties.name, //params.data[2].name item.properties.name
						itemStyle: {
							normal: {
								areaColor: 'rgba(11,15,30, 1)',
								borderColor: 'rgba(57,91,168, 1)',
								borderWidth: 2,
								shadowColor: 'rgba(20,64,111, 1)',
								shadowBlur: 5,
								shadowOffsetX: 1
							},
							emphasis: {
								areaColor: 'rgba(11,15,30, 1)', //2a333d
								color: '#CEE3FE'
							}
						}
					};
				} );

				
				var newChinaJson = JSON.parse(JSON.stringify(chinaJson)); //深拷贝
				
				newChinaJson.features = newChinaJson.features.concat(provienceJson.features);

				echarts.registerMap('newChinaMap', newChinaJson);

				console.log("拿到provience里面的经纬度信息")
				console.log(provience[0].properties.cp);
				chart.setOption({
					geo:{
						map:'newChinaMap',
						zoom: 7,
						roam:true,
						center:provience[0].properties.cp, // 通过id获得其中心点 todo
						itemStyle: {
							normal: {
								areaColor: 'rgba(16,24,42,0.3)', //#10182A
								borderColor: 'rgba(21,93,163,0.3)',//#155DA3
								borderWidth: 0.5,
								shadowColor: 'rgba(20,64,111, 0.3)',
								shadowBlur: 1,
								shadowOffsetX: 1
							},
							emphasis: {
								areaColor: '#10182A', //2a333d
								color: '#CEE3FE'
							}
						},
						regions: newRegions
					}
				});

			});

			
		})
	});

	//获得右上角基本信息
	function setOrgOverviewBaseMsg(){
		let baseHtml = `<header>机构风险概览-${orgName}</header>`;

		for(var i in overviewBaseMsg){
			if(i%2 === 0 ){
				if((parseInt(i)+1) < overviewBaseMsg.length){ // 加两个
					baseHtml += `<div class="org-risk-overview-list">
						<div class="org-risk-overview-listname">
							<p><span>${ overviewBaseMsg[i].name }：</span></p>
						</div>
						<div class="org-risk-overview-listvalue">
							<p class="org-risk-detail"><span>${ overviewBaseMsg[i].value }</span></p>
						</div>
						<div class="org-risk-overview-listname">
							<p><span>${ overviewBaseMsg[parseInt(i)+1].name }：</span></p>
						</div>
						<div class="org-risk-overview-listvalue">
							<p class="org-risk-detail"><span>${ overviewBaseMsg[parseInt(i)+1].name }</span></p>
						</div>
					</div>`;
				}else{ // 加一个
					baseHtml += `<div class="org-risk-overview-list">
						<div class="org-risk-overview-listname">
							<p><span>${ overviewBaseMsg[i].name }：</span></p>
						</div>
						<div class="org-risk-overview-listvalue">
							<p class="org-risk-detail"><span>${ overviewBaseMsg[i].value }</span></p>
						</div>
					</div>`;
				}
			}
		}

		$(".org-risk-overview-baseMsg").html(baseHtml);

		//绑定事件-弹框
		$(".org-risk-detail").unbind('click').bind('click',function(){
			$(".org-risk-overview-model").show();	//显示弹框
			$(".org-risk-overview-model").css("right", parseInt($(".org-aside").css("width")) ).css("width","260px").css("height","375px");
		})

	}

	//右侧折线图
	function setOrgOverviewChart (){
		var dom = document.getElementById("org-risk-overview-chart");
    var myChart = echarts.init(dom);

	
		var onedata = overviewChart[0].value;
		var twodata = overviewChart[1].value;
		
		let runsize = 0;
		
		option = {
				title: {
						text: ''
				},
				color:['rgb(89,202,250)','rgb(242,156,56)'],
				legend: {
					top:40,
					data:[
						{name:'风险金额',icon:'circle',textStyle: { color: 'rgb(89,202,250)' }},
						{name:'问题发现个数',icon:'circle',textStyle: { color: 'rgb(242,156,56)' } }
						 ]
			  },
				xAxis: {
					type: 'time',
					nameLocation:'end',
					// boundaryGap: ['90%','90%'],
					nameTextStyle:{
						color:'#fff'
					},
					splitLine: {
							show: false
					},
					axisLine: {
						lineStyle: {
								type: 'solid',
								color: '#333333',//左边线的颜色
								width:'2'//坐标线的宽度
						}
					},
					axisLabel: {
						textStyle: {
								color: '#CEE3FE',//坐标值得具体的颜色
						},
						formatter: function (value, index) {
							// 格式化成月/日，只在第一个刻度显示年份
							var date = new Date(value);
							var texts = (date.getMonth() + 1)+"月";
							return texts;
						}
					}
				},
				yAxis: {
						type: 'value',
						boundaryGap: [0, '100%'],
						splitLine: {
								show: false
						},
						axisLine: {
							lineStyle: {
									type: 'solid',
									color: '#333333',//左边线的颜色
									width:'2'//坐标线的宽度
							}
						},
						axisTick:{
							show:false
						},
						axisLabel: {
							show:true,
							margin:0,
							align:'right',
							textStyle: {
								color: '#fff',//坐标值得具体的颜色
								align: 'right',
								margin:0
							}
						}
				},
				series: [{
					name: '风险金额',
					type: 'line',
					smooth:0.3,
					showSymbol: false,
					hoverAnimation: false,
					lineStyle:{
						color:'rgb(89,202,250)'
					},
					areaStyle: {
						color:  'rgb(89,202,250)',
						opacity:0.3
					},
					data: onedata.slice(runsize,runsize+6)
			},{
						name: '问题发现个数',
						type: 'line',
						smooth:0.3,
						showSymbol: false,
						hoverAnimation: false,
						lineStyle:{
							color:'rgb(242,156,56)'
						},
						areaStyle: {
							color:  'rgb(242,156,56)', // 89,202,250
							opacity:0.3
					  },
						data: twodata.slice(runsize,runsize+6)
				}]
		};
		
		var runsizeInterval = setInterval(function () { 
				myChart.setOption({
						series: [{
							data: onedata.slice(runsize,runsize+6)
						},{
							data: twodata.slice(runsize,runsize+6)
					}]
				});
				runsize++;
				if(runsize > onedata.length-5){
					clearInterval(runsizeInterval);
				}
		}, 1000);

		myChart.setOption(option);
	};


	
	setTimeout(function(){
		setOrgOverviewBaseMsg(); //右上角基本信息
		setOrgOverviewChart();   //右侧折线图

		//右下角表格
		$("#org-problem-num").bind('click',function(){
			$(this).addClass('org-problem-number-btn-checked');
			$("#org-runp-num").removeClass('org-problem-runp-btn-checked');

			$(".org-problem-statistics-table tbody").html();
			var staticHtml = '';
			for(var i in orgProblemData){
				staticHtml+= `<tr>
				<td class="org-table-10"><div>${parseInt(i)+1}</div></td>
				<td class="org-table-20 toclientDetail">${orgProblemData[i].name}</td>
				<td class="org-table-50"><div class="org-table-number-line-base"></div> <div class="org-table-number-line"></div></td>
				<td class="org-table-10">${orgProblemData[i].number}</td>
				<td class="org-table-10">top${parseInt(i)+1}</td>
			</tr>`;
			}

			$(".org-problem-statistics-table tbody").html(staticHtml);

			console.log("点击啊啊 啊啊啊")
			//点击跳转到对应页面
			$(".toclientDetail").unbind('click').bind('click',function(){
				window.location.href="http://www.baidu.com";
			})
			
		})

		$("#org-runp-num").bind('click',function(){
			$(this).addClass('org-problem-runp-btn-checked');
			$("#org-problem-num").removeClass('org-problem-number-btn-checked');

			$(".org-problem-statistics-table tbody").html();
			var staticHtml = '';
			for(var i in orgRunData){
				staticHtml+= `<tr>
				<td class="org-table-10"><div>${parseInt(i)+1}</div></td>
				<td class="org-table-20 toclientDetail">${orgRunData[i].name}</td>
				<td class="org-table-50"><div class="org-table-number-line-base"></div> <div class="org-table-number-line"></div></td>
				<td class="org-table-10">${orgRunData[i].number}</td>
				<td class="org-table-10">top${parseInt(i)+1}</td>
			</tr>`;
			}

			$(".org-problem-statistics-table tbody").html(staticHtml);

			//点击跳转到对应页面
			$(".toclientDetail").unbind('click').bind('click',function(){
				window.location.href="http://www.baidu.com";
			})
		})

		//model 关闭按钮
		$(".model-close").bind('click',function(){
			console.log("close")
			$(".org-risk-overview-model").css("width","0px");
			setTimeout(function(){
				$(".org-risk-overview-model").hide();	//显示弹框
			},600);
		});

		$("#org-problem-num").click(); //右下角表格
	},10);
 */
})()
