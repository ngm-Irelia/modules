$(function () {
	let bankName = '南京银行';
	let runsizeInterval;
	const rightChartTypes = ['problemEmployeePie','mechanismRank','moneyRank','seriousEmployeeRank'];//问题员工，机构排名
	let issuesCountsData;
	let rightChartSize = 0;
	  
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
				searchType:'Employee',
				branchName:org
			},
			dataType: "json",
			success: function(returndata){
				if(returndata.code === 200){
					let {code,msg,data,data:{lineEcharts,issuesCounts} } = returndata;
					issuesCountsData = issuesCounts;
					setstaffOverviewBaseMsg(data.baseInfoArray);  //右上角基本信息
					setstaffOverviewChart(lineEcharts);           //右侧折线图
					problemEmployeePie(issuesCounts.employeeSorting);             //饼图
					
				} 
			}
		}); 
	}

	loadDate();

	var dsearch = view.dealSearch(window.location.search);
	if(dsearch && "startDate" in dsearch && "endDate" in dsearch && "branchName" in dsearch){
		getBaseData(dsearch.startDate, dsearch.endDate, dsearch.branchName);
		view.initMap('staff-map', '南京银行');//加载地图
		//view.initMap('staff-map',dsearch.branchName); //加载地图
		$('#js-date-start').val(dsearch.startDate);
		$('#js-date-end').val(dsearch.endDate);
		$('#js-search').val(dsearch.branchName);
	}else{
		loadDateByBtn("-6");
		//getBaseData('2018-06-15', '2018-08-15', '南京银行'); 
		view.initMap('staff-map','南京银行');                //加载地图
		$('#js-search').val('南京银行');
	}

	// ---- 各模块 数据展示 ----
	function changeChartBtnRight(getRightChartSize){ 
		switch( rightChartTypes[getRightChartSize%4] ){
			case "problemEmployeePie" :   //问题员工
				problemEmployeePie();
				break ;
		
			case "mechanismRank" :    //机构排行
				mechanismRank(issuesCountsData.institutionRanking);
				break ;
			
			case "moneyRank" :    //金额排行
				moneyRank(issuesCountsData.amountRanking);
				break ;
		
			case "seriousEmployeeRank" :    //屡查屡犯员工排行
				seriousEmployeeRank(issuesCountsData.employeeRanking);
				break ;
			
		}
	}

	// 右下角两个切换按钮
	$(".change-chart-btn-right").bind('click',function(){
		$(".change-chart-btn-right").addClass('change-chart-btn-selected');
		$(".change-chart-btn-left").removeClass('change-chart-btn-selected');
		rightChartSize++; 
		changeChartBtnRight(rightChartSize);
	})

	$(".change-chart-btn-left").bind('click',function(){
		$(".change-chart-btn-left").addClass('change-chart-btn-selected');
		$(".change-chart-btn-right").removeClass('change-chart-btn-selected');

		if(rightChartSize>0){
			rightChartSize--;
			changeChartBtnRight(rightChartSize);
		} 
	})

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
		//view.initMap('staff-map',bankName);                //加载地图
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
			console.log("keyup ");
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
	function setstaffOverviewBaseMsg(baseData) {
		if(!baseData){return ''};
		let baseHtml = ``; //<header>人员风险概览</header> 

		for(var i=0;i<baseData.length;i=i+2){
			if((i+1)<baseData.length){
				baseHtml += `<div class="staff-risk-overview-list">
					<div class="staff-risk-overview-listname">
						<p><span>${baseData[i].displayName}：</span></p>
					</div>
					<div class="staff-risk-overview-listvalue">
						<p class="staff-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${ baseData[i].value}</span></p>
					</div>
					<div class="staff-risk-overview-listname">
						<p><span>${baseData[i+1].displayName}：</span></p>
					</div>
					<div class="staff-risk-overview-listvalue">
						<p class="staff-risk-detail" headname="${baseData[i+1].headname}" headtype="${baseData[i+1].headtype}" displayname="${baseData[i+1].displayName}" modelid="${baseData[i+1].id}" id="${baseData[i+1].systemName}"><span>${ baseData[i+1].value}</span></p>
					</div>
				</div>`;
			}else{
				baseHtml += `<div class="staff-risk-overview-list">
					<div class="staff-risk-overview-listname">
						<p><span>${baseData[i].displayName}：</span></p>
					</div>
					<div class="staff-risk-overview-listvalue">
						<p class="staff-risk-detail" headname="${baseData[i].headname}" headtype="${baseData[i].headtype}" displayname="${baseData[i].displayName}" modelid="${baseData[i].id}" id="${baseData[i].systemName}"><span>${baseData[i].value}</span></p>
					</div>
				</div>`;
			}
			
		} 
		$(".staff-risk-overview-baseMsg").html(baseHtml);

		//绑定事件-弹框
		$(".staff-risk-detail").unbind('click').bind('click', function () {
			if($(this).attr("modelid") && $(this).attr("modelid") != null && $(this).attr("modelid") != 'null'){
				$(".staff-risk-overview-model").show();	//显示弹框
				$(".staff-risk-overview-model").css("right", parseInt($(".staff-aside").css("width"))).css("width", "260px").css("height", "375px");
				
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
			

			//model 关闭按钮
			$(".model-close").unbind('click').bind('click', function () {
				$(".staff-risk-overview-model").css("width", "0px");
				setTimeout(function () {
					$(".staff-risk-overview-model").hide();	//显示弹框
				}, 600);
			});
		})

	}

	//修改model弹框数据
	function changeModel(detailDatas, displayName) {
		let modelHtml = ` `;
		if (detailDatas && detailDatas.length > 0) {
			for (var i = 0; i < detailDatas.length; i++) {
				modelHtml += `<tr>
					<td style="width: 40px">${ detailDatas[i].id}</td>
					<td style="width: 80px">${ detailDatas[i].name}</td>
					<td style="width: 80px">${ detailDatas[i].issuesum}</td>
				</tr>`;
			}
		}

		$(".staff-risk-overview-model-base header").html( displayName+"清单" );
		$(".staff-risk-overview-model-base tbody").html(modelHtml);

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
	//折线图
	function setstaffOverviewChart(chartDatas) {
		clearInterval(runsizeInterval);
		var dom = document.getElementById("staff-risk-overview-chart");
		var myChart = echarts.init(dom);


		var data = chartDatas[0].value;

		let runsize = 0;

		option = {
			title: {
				text: ''
			}, 
			tooltip: {
        trigger: 'axis'
      },
			color: ['rgb(89,202,250)'],
			legend: {
				top: 40,
				data: [
					{ name: chartDatas[0].name , icon: 'circle', textStyle: { color: 'rgb(89,202,250)' } }
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
					show: true,
					margin: 0,
					align: 'right',
					textStyle: {
						color: '#fff',//坐标值得具体的颜色
						align: 'right',
						margin: 1
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


	//饼图 model弹框数据
	function changeModelPie(detailDatas, displayName) {
		let modelHtml = ` `;
		if (detailDatas && detailDatas.length > 0) {
			for (var i = 0; i < detailDatas.length; i++) {
				modelHtml += `<tr>
					<td style="width: 40px">${ detailDatas[i].id}</td>
					<td style="width: 80px" class="modelToStaff" id="${ detailDatas[i].employeeid}" name="${ detailDatas[i].employeename}" >${ detailDatas[i].employeename}</td>
					<td style="width: 80px">${ detailDatas[i].employeeid}</td>
				</tr>`;
			}
		}

		$(".staff-risk-overview-model-base-pie header").html( displayName );
		$(".staff-risk-overview-model-base-pie tbody").html(modelHtml);


		//绑定跳转页面事件
		$(".modelToStaff").unbind('click').bind('click',function(){
			window.location.href = "../views/portrayal-staff.html?id="+$(this).attr('id')+"&name="+$(this).attr('name');
		})

		let dom = $('#bodyBox-pie'); 
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
	//饼图  问题员工
	function problemEmployeePie(iCounts) {
		$(".staff-problem-statistics-2").hide();
		$(".staff-problem-statistics-3").hide();
		$(".staff-problem-statistics-4").hide();
		$(".staff-problem-statistics-1").show();
		var dom = document.getElementById("staff-problem-statistics-pie");
		var myChart = echarts.init(dom);

		function dealCounts(cc){
			let newCounts = [];
			for(var i=0;i<cc.length;i++){
				newCounts.push({
					name: cc[i].position,
					value: cc[i].count
				})
			}
			return newCounts;
		}
		let moniCounts = dealCounts(iCounts);

		//处理数据为 series中可用
		function dealPieDatas(mCounts, opacity){
			let pieColors = ['233,90,112', '238,111,45','47,99,25','36,89,223', '249,250,88'];
			let newCount = [];
			mCounts.forEach( (mc , index) => {
				newCount.push({
					name: mc.name,
					value:mc.value,
					label:{ show: false },
					labelLine: { show: false },
					itemStyle: { color: 'rgba('+pieColors[index]+','+opacity+')' }
				})
			  
			});
			 
			return newCount;
		}

		//处理数据为 option中可用
		function dealToOption(mCounts){
			let newCount = [];
			mCounts.forEach( (mc , index) => {
				newCount.push( mc.name );
			});
			 
			return newCount;
		}

		let piedata1 = dealPieDatas(moniCounts, 1);
		let piedata2 = dealPieDatas(moniCounts, 0.7);
		let piedata3 = dealPieDatas(moniCounts, 0.4);

		option = {
			color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
			legend: {
				orient: 'vertical',
				x: 'right',
				top: '20%',
				left: '60%',
				data: dealToOption(moniCounts)
			},
			tooltip: {
				trigger: 'item',
				formatter: "{b}: {c}"
			},
			series: [
				{
					name: 'p1',
					type: 'pie',
					center: ['25%', '50%'],
					radius: ['40%', '47%'],
					animation: false,
					silent: false,
					avoidLabelOverlap: false,
					label: {
						normal: { show: false, },
						emphasis: { show: false }
					},
					labelLine: {
						normal: { show: false }
					},
					data: piedata3
				},
				{
					name: 'p2',
					type: 'pie',
					center: ['25%', '50%'],
					radius: ['47%', '54%'],
					animation: false,
					silent: false,
					label: {
						normal: { show: false, },
						emphasis: { show: false }
					},
					labelLine: {
						normal: { show: false }
					},
					data: piedata2
				},
				{
					name: 'p3',
					type: 'pie',
					center: ['25%', '50%'],
					radius: ['54%', '61%'],
					animation: false,
					silent: false,
					label: {
						normal: { show: false, },
						emphasis: { show: false }
					},
					labelLine: {
						normal: { show: false }
					},
					data: piedata1
				}
			]
		};

		myChart.setOption(option);

		//修改mychart的legend效果
		var triggerAction = function(action, selected) {
			legend = [];

			for (name in selected) {
				if (selected.hasOwnProperty(name)) {
					legend.push({
						name: name
					});
				}
			}

			myChart.dispatchAction({
				type: action,
				batch: legend
			});
		};

		// 获得自带的id，用来查询弹框里面的数据
		function getIdByLegendName(clickName){
			// 处理 iCounts ，获得对应的ID
			for (var i=0;i<iCounts.length;i++) {
				if (iCounts[i].name === clickName) {
					return iCounts[i].id;
				}
			}
			return 0;
		}

		myChart.on('legendselectchanged', function(obj) {
			var selected = obj.selected;
			var legend = obj.name;
			triggerAction('legendSelect', selected);

			console.log("在这写弹框事件！！obj.name === "+obj.name);
			$(".staff-risk-overview-model-pie").show();	//显示弹框
			$(".staff-risk-overview-model-pie").css("right", parseInt($(".staff-aside").css("width"))).css("width", "260px").css("height", "375px");
			//更改弹框的数据
			 
			let _this =this;
			console.log($(_this).attr('displayname'));

			$.ajax({
				type: "POST",
				url: view.auditUrl+"/audit_nj/riskview/searchEmployeeByPosition ",
				data: {
					startDate:$('#js-date-start').val(),
					endDate:$('#js-date-end').val(),
					position:obj.name,
					branchName:bankName
				},
				dataType: "json",
				success: function(returndata){
					if(returndata.code === 200){
						changeModelPie(returndata.data.employeeRanking, obj.name);
					} 
				}
			}); 

			//model 关闭按钮
			$(".model-close-pie").unbind('click').bind('click', function () {
				$(".staff-risk-overview-model-pie").css("width", "0px");
				setTimeout(function () {
					$(".staff-risk-overview-model-pie").hide();	//显示弹框
				}, 600);
			});
		});

	};

	//机构排行
	function mechanismRank( problemDatas){
		$(".staff-problem-statistics-1").hide();
		$(".staff-problem-statistics-3").hide();
		$(".staff-problem-statistics-4").hide();
		$(".staff-problem-statistics-2").show();

		//修改右下角表格数据
	
		$(".staff-problem-statistics-table tbody").html();
		var staticHtml = '';
		for (var i in problemDatas) {
			staticHtml += `<tr>
			<td class="staff-table-10"><div>${problemDatas[i].id}</div></td>
			<td class="staff-table-20 toclientDetail">${problemDatas[i].name}</td>
			<td class="staff-table-50"><div class="staff-table-number-line-base"></div> <div class="staff-table-number-line" style="width:${parseInt(problemDatas[i].issueRate)*1.28}px;"></div></td>
			<td class="staff-table-10">${problemDatas[i].issueSum}</td>
			<td class="staff-table-10"> ${problemDatas[i].ranking}</td>
		</tr>`;
		}
		$(".staff-problem-statistics-table tbody").html(staticHtml);
		//点击跳转到对应页面
		$(".toclientDetail").unbind('click').bind('click', function () {
			window.location.href = "../views/portrayal-staff.html";
		})

		let dom = $('.staff-problem-statistics-table tbody'); 
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
	//金额排行
	function moneyRank(problemDatas){

		$(".staff-problem-statistics-1").hide();
		$(".staff-problem-statistics-2").hide();
		$(".staff-problem-statistics-4").hide();
		$(".staff-problem-statistics-3").show();

		$(".staff-problem-money-table tbody").html();
		var staticHtml = '';
		for (var i in problemDatas) {
			staticHtml += `<tr>
			<td class="staff-table-10">${problemDatas[i].id}</td>
			<td class="staff-table-16">${problemDatas[i].name}</td>
			<td class="staff-table-16">${problemDatas[i].userID}</td>
			<td class="staff-table-16">${problemDatas[i].attribution}</td>
			<td class="staff-table-16">${problemDatas[i].riskamount}</td>
		</tr>`;
		}
		$(".staff-problem-money-table tbody").html(staticHtml);
	
		let dom = $('.staff-problem-money-table tbody'); 
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
	//屡查屡犯员工排行
	function seriousEmployeeRank(problemDatas){
		$(".staff-problem-statistics-2").hide();
		$(".staff-problem-statistics-3").hide();
		$(".staff-problem-statistics-1").hide();
		$(".staff-problem-statistics-4").show();

		$(".staff-problem-serious-table tbody").html();
		var staticHtml = '';
		for (var i in problemDatas) {
			staticHtml += `<tr>
			<td class="staff-table-10">${problemDatas[i].id}</td>
			<td class="staff-table-16 toclientDetail">${problemDatas[i].name}</td>
			<td class="staff-table-16">${problemDatas[i].userID}</td>
			<td class="staff-table-16">${problemDatas[i].attribution}</td>
			<td class="staff-table-16"> ${problemDatas[i].riskamount}</td>
		</tr>`;
		}
		$(".staff-problem-serious-table tbody").html(staticHtml);
		 
		//点击跳转到对应页面
		$(".toclientDetail").unbind('click').bind('click', function () {
			window.location.href = "../views/portrayal-staff.html";
		})

		let dom = $('.staff-problem-serious-table tbody'); 
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
