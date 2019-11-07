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
				searchType:'Customer',
				branchName:org
			},
			dataType: "json",
			success: function(returndata){
				if(returndata.code === 200){
					let {code,msg,data,data:{lineEcharts,issuesCounts} } = returndata;
					
					setclientOverviewBaseMsg(data.baseInfoArray);                 //右上角基本信息
					setclientOverviewChart(lineEcharts);            //右侧折线图
					setclientTable(issuesCounts);         //右下角表格 
					
				} 
			}
		}); 
	}

	loadDate();
					
	var dsearch = view.dealSearch(window.location.search);
	if(dsearch && "startDate" in dsearch && "endDate" in dsearch && "branchName" in dsearch){
		getBaseData(dsearch.startDate, dsearch.endDate, dsearch.branchName);
		view.initMap('client-map', '南京银行');//加载地图
		//view.initMap('client-map', dsearch.branchName);//加载地图 
		$('#js-date-start').val(dsearch.startDate);
		$('#js-date-end').val(dsearch.endDate);
		$('#js-search').val(dsearch.branchName);
	}else{
		loadDateByBtn("-6");
		//getBaseData($('#js-date-start').val(), $('#js-date-end').val(), '南京银行'); 
		view.initMap('client-map', '南京银行');//加载地图 
		$('#js-search').val('南京银行');
	}

	// ----------- 上面是发送请求 获取数据的操作 ----------
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
		//view.initMap('client-map', bankName);//加载地图 
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
	function setclientOverviewBaseMsg(baseData) { 
		if(!baseData){return ''};
		let baseHtml = ``; //<header>机构风险概览-${baseData.institutionname}</header>
 
		for(var i=0;i<baseData.length;i=i+2){
			if((i+1)<baseData.length){
				baseHtml += `<div class="client-risk-overview-list">
					<div class="client-risk-overview-listname">
						<p><span>${baseData[i].displayName}：</span></p>
					</div>
					<div class="client-risk-overview-listvalue">
						<p class="client-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${ baseData[i].value}</span></p>
					</div>
					<div class="client-risk-overview-listname">
						<p><span>${baseData[i+1].displayName}：</span></p>
					</div>
					<div class="client-risk-overview-listvalue">
						<p class="client-risk-detail" headname="${baseData[i+1].headname}" headtype="${baseData[i+1].headtype}" displayname="${baseData[i+1].displayName}" modelid="${baseData[i+1].id}" id="${baseData[i+1].systemName}"><span>${ baseData[i+1].value}</span></p>
					</div>
				</div>`;
			}else{
				baseHtml += `<div class="client-risk-overview-list">
					<div class="client-risk-overview-listname">
						<p><span>${baseData[i].displayName}：</span></p>
					</div>
					<div class="client-risk-overview-listvalue">
						<p class="client-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${ baseData[i].value}</span></p>
					</div> 
				</div>`;
			}
			
		}
		 

		$(".client-risk-overview-baseMsg").html(baseHtml);
 
		//绑定事件-弹框
		$(".client-risk-detail").unbind('click').bind('click', function () {
			if($(this).attr("modelid") && $(this).attr("modelid") != null && $(this).attr("modelid") != 'null'){
			
				$(".client-risk-overview-model").show();	//显示弹框
				$(".client-risk-overview-model").css("right", parseInt($(".client-aside").css("width"))).css("width", "260px").css("height", "375px");
				
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
			$(".client-risk-overview-model").css("width", "0px");
			setTimeout(function () {
				$(".client-risk-overview-model").hide();	//显示弹框
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
					<td style="width: 80px">${ detailDatas[i].name}</td>
					<td style="width: 80px">${ detailDatas[i].issuesum}</td>
				</tr>`;
			} 
		} 

		$(".client-risk-overview-model-base header").html( displayName+"清单" );
		$(".client-risk-overview-model-base tbody").html(modelHtml);

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
	function setclientOverviewChart(echartsDatas) { 
		clearInterval(runsizeInterval);
		var dom = document.getElementById("client-risk-overview-chart");
		var myChart = echarts.init(dom);


		var data = echartsDatas[0].value;

		let runsize = 0;

		option = {
			title: {
				text: ''
			},
			tooltip: {
        trigger: 'axis'
      },
			/* tooltip: {
					trigger: 'axis',
					formatter: function (params) {
							params = params[0];
							var date = new Date(params.name);
							return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
					},
					axisPointer: {
							animation: false
					}
			}, */
			color: ['rgb(89,202,250)'],
			legend: {
				top: 40,
				data: [
					{ name: echartsDatas[0].name , icon: 'circle', textStyle: { color: 'rgb(89,202,250)' } }
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
					} */
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
					show: false,
				},
				axisLabel: {
					textStyle: {
						color: '#fff',//坐标值得具体的颜色
						align: 'right',
						margin: 1
					}
				}
			},
			series: [{
				name: echartsDatas[0].name ,
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
				data: data.slice(runsize, runsize + 15)
			}]
		};

		function setChartAnimal(){
			runsizeInterval = setInterval(function () {
				myChart.setOption({
					series: [{
						data: data.slice(runsize, runsize + 15)
					}]
				});
				runsize++;
				if (runsize > data.length - 14) {
					clearInterval(runsizeInterval);
				}
			}, 1000); 
		}

		clearInterval(runsizeInterval);
		setChartAnimal();

		myChart.setOption(option);
	};

	//右下角表格
	function setclientTable(iCounts) {

		$(".client-problem-statistics-table tbody").html();
		var staticHtml = '';
		for (var i in iCounts.issueByModel) {
			staticHtml += `<tr>
			<td class="client-table-10"><div>${iCounts.issueByModel[i].id}</div></td>
			<td class="client-table-20 toclientDetail" id="${iCounts.issueByModel[i].id}" name="${iCounts.issueByModel[i].name}">${iCounts.issueByModel[i].name}</td>
			<td class="client-table-50"><div class="client-table-number-line-base"></div> <div class="client-table-number-line" style="width:${(iCounts.issueByModel[i].issuesum/iCounts.issueByModel[i].issueall)*128}px;"></div></td>
			<td class="client-table-10">${iCounts.issueByModel[i].issuesum}</td>
			<td class="client-table-10">${iCounts.issueByModel[i].ranking}</td>
		</tr>`;
		}

		$(".client-problem-statistics-table tbody").html(staticHtml);

		//点击跳转到对应页面
		$(".toclientDetail").unbind('click').bind('click', function () {
			window.location.href = "../views/portrayal-client.html?id="+$(this).attr('id')+"&name="+$(this).attr('name');
		})

		let dom = $('.client-problem-statistics-table tbody'); 
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

})
