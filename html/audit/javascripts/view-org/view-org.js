$(function () {
	let bankName = '南京银行';
	let runsizeInterval;
	window.getBaseData = function(sd,ed,org){
		if(!sd){
			sd = 	$('#js-date-start').val();
		}
		if(!ed){
			ed = $('#js-date-end').val();
		}

		$.ajax({
			type: "POST",
			url: view.auditUrl+"/audit_nj/riskview/search",
			data: {
				startDate:sd,
				endDate:ed,
				searchType:'Institution',
				branchName:org
			},
			dataType: "json",
			success: function(returndata){
				if(returndata.code === 200){
					let {code,msg,data,data:{lineEcharts,issuesCounts} } = returndata;
					setOrgOverviewBaseMsg(data.baseInfoArray);   //右上角基本信息
					setOrgOverviewChart(lineEcharts[0]);            //右侧折线图
					changeOrgProblemTable(issuesCounts);         //右下角表格	
					bindCLick(lineEcharts);
				} 
			}
		}); 
	} 

	loadDate();
	var dsearch = view.dealSearch(window.location.search);
	
	if(dsearch && "startDate" in dsearch && "endDate" in dsearch && "branchName" in dsearch){
		getBaseData(dsearch.startDate, dsearch.endDate, dsearch.branchName);
		view.initMap('org-map', '南京银行');//加载地图
		//view.initMap('org-map', dsearch.branchName);//加载地图
		$('#js-date-start').val(dsearch.startDate);
		$('#js-date-end').val(dsearch.endDate);
		$('#js-search').val(dsearch.branchName);
	}else{
		loadDateByBtn("-6");
		//getBaseData($('#js-date-start').val(), $('#js-date-end').val(), '南京银行'); 
		view.initMap('org-map', '南京银行');//加载地图
		$('#js-search').val('南京银行');
	}


	// --------  测试用部分 ------
	/* function getBaseDataTest(){
		 
					//let {code,msg,data,data:{lineEcharts,issuesCounts} } = {xxx};
					loadDate();
					view.initMap('org-map', bankName);//加载地图，第二个参数放数据 ； 地图部分数据应该做好处理，分三级，还是发三次请求  
					//setOrgOverviewBaseMsg(data.baseInfoArray);   //右上角基本信息
					//setOrgOverviewChart(lineEcharts);            //右侧折线图
					//changeOrgProblemTable(issuesCounts);         //右下角表格		 
		 
			 
		 
	} 

	getBaseDataTest(); */

	//--------测试用部分 end -------

	// ----------- 上面是发送请求 获取数据的操作 ----------
	function bindCLick(lEcharts){
		//右下角表格
		$("#org-lineEchart-money").bind('click', function () {
			$(this).addClass('org-lineEchart-btn-checked');
			$("#org-lineEchart-num").removeClass('org-lineEchart-btn-checked');
			setOrgOverviewChart(lEcharts[0]);
		})
		$("#org-lineEchart-num").bind('click', function () {
			$(this).addClass('org-lineEchart-btn-checked');
			$("#org-lineEchart-money").removeClass('org-lineEchart-btn-checked');
			setOrgOverviewChart(lEcharts[1]);
		})
	}

	//加载时间框
	function loadDateByBtn(interval) {
		jeDate("#js-date-start", {
			isinitVal: true,
			initDate: [{ MM: interval }, true],
			format: "YYYY-MM-DD",
			theme: { bgcolor: "#202b33", color: "#C7FEFF", pnColor: "#d2d2d2" }
		});
		jeDate("#js-date-end", {
			isinitVal:true,
			initDate:[{ DD: '-0' }, true],
			format: "YYYY-MM-DD",
			theme:{ bgcolor:"#202b33",color:"#C7FEFF", pnColor:"#d2d2d2"}
		});

		loadInitData();
	};

	//根据时间加载数据
	function loadInitData() {
		bankName = $('#js-search').val();
		bankName = bankName ? bankName : "南京银行"; 
		getBaseData($('#js-date-start').val(), $('#js-date-end').val(), bankName);
		//view.initMap('org-map', bankName);//加载地图
	};

	//时间选择器
	function loadDate() {
		jeDate("#js-date-start", {
			isinitVal:true,
			format: "YYYY-MM-DD",
			theme:{ bgcolor:"#202b33",color:"#C7FEFF", pnColor:"#d2d2d2"}
		});
		jeDate("#js-date-end", {
			isinitVal:true,
			format: "YYYY-MM-DD",
			theme:{ bgcolor:"#202b33",color:"#C7FEFF", pnColor:"#d2d2d2"}
		});

		$('#js-month').on('click', function() {
      loadDateByBtn("-1");
    });
		$('#js-half-year').on('click', function() {
      loadDateByBtn("-6");
    });
		$('#js-year').on('click', function() {
      loadDateByBtn("-12");
		});
		$('#js-search').on('keyup', function(event) {
      if (event.keyCode == "13") {
        var searchValue = event.target.value;
        if(searchValue) {
          bankName = searchValue;
          loadInitData();
        }
      }
		});
		
		$('#searchBtn').unbind('click').bind('click',function(){
			loadInitData();
		})

	}

	//获得右上角基本信息
	function setOrgOverviewBaseMsg(baseData) {
		if(!baseData){return ''};
		let baseHtml = ``; //<header>机构风险概览-${baseData.institutionname}</header>
		
		for(var i=0;i<baseData.length;i=i+2){
			if((i+1)<baseData.length){
				baseHtml += `<div class="org-risk-overview-list">
				<div class="org-risk-overview-listname">
					<p><span>${baseData[i].displayName}：</span></p>
				</div>
				<div class="org-risk-overview-listvalue">
					<p class="org-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${ baseData[i].value }</span></p>
				</div>
				<div class="org-risk-overview-listname">
					<p><span>${baseData[i+1].displayName}：</span></p>
				</div>
				<div class="org-risk-overview-listvalue">
					<p class="org-risk-detail" headname="${baseData[i+1].headname}" headtype="${baseData[i+1].headtype}" displayname="${baseData[i+1].displayName}" modelid="${baseData[i+1].id}" id="${baseData[i+1].systemName}"><span>${baseData[i+1].value}</span></p>
				</div>
			</div>`;
			}else{
				baseHtml += `<div class="org-risk-overview-list">
				<div class="org-risk-overview-listname">
					<p><span>${baseData[i].displayName}：</span></p>
				</div>
				<div class="org-risk-overview-listvalue">
					<p class="org-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${ baseData[i].value }</span></p>
				</div> 
			</div>`;
			}
			
		}

		$(".org-risk-overview-baseMsg").html(baseHtml);

		//绑定事件-弹框
		$(".org-risk-detail").unbind('click').bind('click', function () {
			if($(this).attr("modelid") && $(this).attr("modelid") != null && $(this).attr("modelid") != 'null'){
				$(".org-risk-overview-model").show();	//显示弹框
				$(".org-risk-overview-model").css("right", parseInt($(".org-aside").css("width"))).css("width", "260px").css("height", "375px");
				
				let headname = $(this).attr("headname");
				let headtype = $(this).attr("headtype");
				if(headname && headname!=="null" && headname!=="undefined" ){
					$("#model-head-name").html(headname);
				}
				if(headtype && headtype!=="null" && headtype!=="undefined" ){
					$("#model-head-type").html(headtype);
				}
				
				//更改弹框的数据
				let _this = this;
				 
				let params = {
					startDate: $('#js-date-start').val(),
					endDate:$('#js-date-end').val(),
					branchName:bankName
				};
				$.ajax({
					type: "POST",
					url: view.auditUrl+"/audit_nj/riskview/getButtonData/"+$(_this).attr("modelid"),
					data: {
						jsonParameter:JSON.stringify(params)
					},
					//contentType: 'application/json; charset=utf-8',
					dataType: "json",
					success: function(returndata){
						if(returndata.code === 200){
							changeModel(returndata.data, $(_this).attr('displayname'));
						} 
					}
				}); 

				
			}
			
		})

		//model 关闭按钮
		$(".model-close").unbind('click').bind('click', function () {
			$(".org-risk-overview-model").css("width", "0px");
			setTimeout(function () {
				$(".org-risk-overview-model").hide();	//显示弹框
			}, 600);
		});

	}

	//修改model弹框数据
	function changeModel(detailDatas,displayName){
		let modelHtml = ` `;
		if(detailDatas && detailDatas.length > 0){
			for(var i=0 ; i<detailDatas.length ; i++){
				modelHtml += `<tr>
					<td style="width: 40px">${ detailDatas[i].id }</td>
					<td style="width: 80px" class="toPortrayalOrg">${ detailDatas[i].name}</td>
					<td style="width: 80px">${ detailDatas[i].issuesum}</td>
				</tr>`;
			} 
		} 

		$(".org-risk-overview-model-base header").html( displayName+"清单" );
		$(".org-risk-overview-model-base tbody").html(modelHtml);

		//弹框中 机构跳转
		$(".toPortrayalOrg").unbind('click').bind('click', function () {
			window.location.href = "../views/portrayal-org.html?date="+$('#js-date-end').val()+"&orgname="+$(this).context.innerHTML;//?name=南京银行&time=2019-02-03
		})

		let dom = $('#bodyBox'); 
    try{
			!!dom.data("mCS") && dom.mCustomScrollbar("destroy"); //Destroy
		}catch (e){
				dom.data("mCS",''); //手动销毁             
		}        
		dom.mCustomScrollbar({
			theme: "minimal", 
			axis: 'y',
			autoHideScrollbar: true,
			//mouseWheel:{ preventDefault:true }
		});
		
	}
	//右侧折线图
	function setOrgOverviewChart(chartDatas) {
		clearInterval(runsizeInterval);
		var dom = document.getElementById("org-risk-overview-chart");
		var myChart = echarts.init(dom);


		var onedata = chartDatas.value;

		let runsize = 0;

		option = {
			title: {
				text: ''
			},
			tooltip: {
        trigger: 'axis'
      },
			color: ['rgb(89,202,250)', 'rgb(242,156,56)'],
			legend: {
				top: 40,
				data: [
					{ name: chartDatas.name , icon: 'circle', textStyle: { color: 'rgb(89,202,250)' } }
				]
			},
			xAxis: {
				type: 'category', //category
				//nameLocation: 'end',
				boundaryGap: false,
				nameTextStyle: {
					color: '#fff'
				},
				splitLine: {
					show: false
				},
				axisLine: {
					lineStyle: {
						type: 'solid',
						color: '#333333',//左边线的颜色
						width: '2'//坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						color: '#CEE3FE',//坐标值得具体的颜色
					},
					/* formatter: function (value, index) {
						// 格式化成月/日，只在第一个刻度显示年份
						var date = new Date(value);
						var texts = (date.getMonth() + 1) + "月";
						return texts;
					}  */
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
						width: '2'//坐标线的宽度
					}
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					show: true,
					margin: 0,
					align: 'right',
					fontSize:10,
					textStyle: {
						color: '#fff',//坐标值得具体的颜色
						align: 'right',
						margin: 0
					}
				}
			},
			series: [{
				name: chartDatas.name ,
				type: 'line',
				smooth: 0.3,
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					color: 'rgb(89,202,250)'
				},
				areaStyle: {
					color: 'rgb(89,202,250)',
					opacity: 0.3
				},
				data: onedata.slice(runsize, runsize + 12)
			}]
		};

		function setChartAnimal(){
			runsizeInterval = setInterval(function () {
				myChart.setOption({
					series: [{
						data: onedata.slice(runsize, runsize + 12)
					}]
				});
				runsize++;
				if (runsize > onedata.length - 11) {
					clearInterval(runsizeInterval);
				}
			}, 1000);
		}

		clearInterval(runsizeInterval);
		setChartAnimal();
		

		myChart.setOption(option);
	};
	//右侧折线图 停用！！需求修改的
	function setOrgOverviewChartOLD(chartDatas) {
		clearInterval(runsizeInterval);
		var dom = document.getElementById("org-risk-overview-chart");
		var myChart = echarts.init(dom);


		var onedata = chartDatas[0].value;
		var twodata = chartDatas[1].value;

		let runsize = 0;

		option = {
			title: {
				text: ''
			},
			tooltip: {
        trigger: 'axis'
      },
			color: ['rgb(89,202,250)', 'rgb(242,156,56)'],
			legend: {
				top: 40,
				data: [
					{ name: chartDatas[0].name , icon: 'circle', textStyle: { color: 'rgb(89,202,250)' } },
					{ name: chartDatas[1].name , icon: 'circle', textStyle: { color: 'rgb(242,156,56)' } }
				]
			},
			xAxis: {
				type: 'category', //category
				//nameLocation: 'end',
				boundaryGap: false,
				nameTextStyle: {
					color: '#fff'
				},
				splitLine: {
					show: false
				},
				axisLine: {
					lineStyle: {
						type: 'solid',
						color: '#333333',//左边线的颜色
						width: '2'//坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						color: '#CEE3FE',//坐标值得具体的颜色
					},
					/* formatter: function (value, index) {
						// 格式化成月/日，只在第一个刻度显示年份
						var date = new Date(value);
						var texts = (date.getMonth() + 1) + "月";
						return texts;
					}  */
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
						width: '2'//坐标线的宽度
					}
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					show: true,
					margin: 0,
					align: 'right',
					fontSize:10,
					textStyle: {
						color: '#fff',//坐标值得具体的颜色
						align: 'right',
						margin: 0
					}
				}
			},
			series: [{
				name: chartDatas[0].name ,
				type: 'line',
				smooth: 0.3,
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					color: 'rgb(89,202,250)'
				},
				areaStyle: {
					color: 'rgb(89,202,250)',
					opacity: 0.3
				},
				data: onedata.slice(runsize, runsize + 15)
			}, {
				name: chartDatas[1].name ,
				type: 'line',
				smooth: 0.3,
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					color: 'rgb(242,156,56)'
				},
				areaStyle: {
					color: 'rgb(242,156,56)', // 89,202,250
					opacity: 0.3
				},
				data: twodata.slice(runsize, runsize + 15)
			}]
		};

		function setChartAnimal(){
			runsizeInterval = setInterval(function () {
				myChart.setOption({
					series: [{
						data: onedata.slice(runsize, runsize + 15)
					}, {
						data: twodata.slice(runsize, runsize + 15)
					}]
				});
				runsize++;
				if (runsize > onedata.length - 14) {
					clearInterval(runsizeInterval);
				}
			}, 1000);
		}

		clearInterval(runsizeInterval);
		setChartAnimal();
		

		myChart.setOption(option);
	};
	//修改右下角表格数据
	function changeOrgProblem(problemDatas, size) {
		$(".org-problem-statistics-table tbody").html();
		var staticHtml = '';
		if(size === "first"){
			for (var i in problemDatas) {
				staticHtml += `<tr>
				<td class="org-table-10"><div>${problemDatas[i].id}</div></td>
				<td class="org-table-20 toclientDetail" name="${problemDatas[i].name}">${problemDatas[i].name}</td>
				<td class="org-table-50"><div class="org-table-number-line-base"></div> <div class="org-table-number-line" style="width:${(problemDatas[i].issuesum/problemDatas[i].issueall)*128}px;"></div></td>
				<td class="org-table-10">${problemDatas[i].issuesum}</td>
				<td class="org-table-10">${problemDatas[i].ranking}</td>
			</tr>`;
			}
		}else{
			for (var i in problemDatas) {
				staticHtml += `<tr>
				<td class="org-table-10"><div>${problemDatas[i].id}</div></td>
				<td class="org-table-20 toclientDetail" name="${problemDatas[i].name}">${problemDatas[i].name}</td>
				<td class="org-table-50"><div class="org-table-number-line-base"></div> <div class="org-table-number-line" style="width:${(problemDatas[i].modelbatchexecutedtimes/problemDatas[i].issueall)*128}px;"></div></td>
				<td class="org-table-10">${problemDatas[i].modelbatchexecutedtimes}</td>
				<td class="org-table-10">${problemDatas[i].ranking}</td>
			</tr>`;
			}
		}
		
		$(".org-problem-statistics-table tbody").html(staticHtml);
		//点击跳转到对应页面
		$(".toclientDetail").unbind('click').bind('click', function () {
			window.location.href = "../views/portrayal-org.html?date="+$('#js-date-end').val()+"&orgname="+$(this).attr('name');//?name=南京银行&time=2019-02-03
		})
		let dom = $('.org-problem-statistics-table tbody'); 
    try{
			!!dom.data("mCS") && dom.mCustomScrollbar("destroy"); //Destroy
		}catch (e){
				dom.data("mCS",''); //手动销毁             
		}        
		dom.mCustomScrollbar({
			theme: "minimal", 
			axis: 'y',
			autoHideScrollbar: true,
			//mouseWheel:{ preventDefault:true }
		});

	}
	//调用接口，右下角表格
	function changeOrgProblemTable(iCounts){

		changeOrgProblem(iCounts.issueByModel, "first");

		//右下角表格
		$("#org-problem-num").bind('click', function () {
			$(this).addClass('org-problem-number-btn-checked');
			$("#org-runp-num").removeClass('org-problem-runp-btn-checked');
			changeOrgProblem(iCounts.issueByModel,"first");
		})
		$("#org-runp-num").bind('click', function () {
			$(this).addClass('org-problem-runp-btn-checked');
			$("#org-problem-num").removeClass('org-problem-number-btn-checked');
			changeOrgProblem(iCounts.modelBatchExecutedTimes, "second");
		})
	}
	
})
