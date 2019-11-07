$(function () {
  var portrayalOrg = {
    init: function() {
      this.TrendAnalysisChartType = 'line';  // 趋势分析表格类型 line bar
      this.TrendAnalysisChartName = '问题数量'; // 涉及金额 涉及员工数 涉及客户数
      this.render();
      this.bind();
      this.loadDate();
      this.setInitValue();
      this.loadInitData();
      //this.setTrendAnalysisChartLine();
    },
    render: function() {
      this.baseInfo = $('#js-baseinfo');

      this.searchInput = $('#js-search');
      this.searchBtn = $('#js-search-btn');

      this.riskDim = $('#js-risk-dim');
      this.riskTitle = $('#js-risk-title');

      this.trendLeftBtn = $(".change-chart-btn-left");
      this.trendRightBtn = $(".change-chart-btn-right");

      this.violationDiv = $('#js-violation');

    },
    bind: function() {
      this.searchInput.on('keyup', $.proxy(this.handleSearchEnter, this));
      this.searchBtn.on('click', $.proxy(this.handleSearchClick, this));

      this.trendLeftBtn.on('click', $.proxy(this.handleTrendLeftBtnClick, this));
      this.trendRightBtn.on('click', $.proxy(this.handleTrendRightBtnClick, this));
    },
    setInitValue: function() {
      var json = window.view.dealSearch(window.location.search) || {};
      // json = {
      //   date: '2019-01-01',
      //   orgname: '南京分行'
      // }
      
      this.date = json.date || '';
      this.orgname = json.orgname || '';
      //更新问题画像title
      this.riskTitle.html(this.date + ' ' + this.orgname);
    },
    loadInitData: function() {
      var params = {
        date: this.date,
        orgname: this.orgname
      };

      this.getAllData(params, this.loadFuncs);

      //测试
      // let dd = {"code":200,"data":{"risk":[{"total":790,"dim":"模型数量","count":156},{"total":156,"dim":"问题数量","count":27},{"total":221,"dim":"问题金额","count":69},{"total":236,"dim":"涉及员工数","count":77},{"total":160,"dim":"涉及客户数","count":40}],"trend":{"lineEcharts":[{"name":"问题数量","value":[{"value":["2018/02/01",36]},{"value":["2018/03/01",38]},{"value":["2018/04/01",27]},{"value":["2018/05/01",25]},{"value":["2018/06/01",44]},{"value":["2018/07/01",28]},{"value":["2018/08/01",27]}]},{"name":"涉及金额","value":[{"value":["2018/02/01",40]},{"value":["2018/03/01",32]},{"value":["2018/04/01",78]},{"value":["2018/05/01",84]},{"value":["2018/06/01",29]},{"value":["2018/07/01",30]},{"value":["2018/08/01",69]}]},{"name":"涉及客户数","value":[{"value":["2018/02/01",53]},{"value":["2018/03/01",128]},{"value":["2018/04/01",37]},{"value":["2018/05/01",95]},{"value":["2018/06/01",86]},{"value":["2018/07/01",89]},{"value":["2018/08/01",77]}]},{"name":"涉及员工数","value":[{"value":["2018/02/01",35]},{"value":["2018/03/01",100]},{"value":["2018/04/01",132]},{"value":["2018/05/01",69]},{"value":["2018/06/01",43]},{"value":["2018/07/01",148]},{"value":["2018/08/01",40]}]}],"barEcharts":[{"name":"问题数量","value":[{"value":["南京分行城北支行",257]},{"value":["江宁科学园支行",274]},{"value":["东山支行",269]},{"value":["南京百家湖支行",242]},{"value":["南京分行城南支行",251]},{"value":["南京分行洪武支行",295]},{"value":["城南支行",238]},{"value":["江宁支行",250]},{"value":["南京分行南京金融城支行",232]}]},{"name":"涉及金额","value":[{"value":["南京分行城北支行",650]},{"value":["江宁科学园支行",514]},{"value":["东山支行",672]},{"value":["南京百家湖支行",528]},{"value":["南京分行城南支行",534]},{"value":["南京分行洪武支行",660]},{"value":["城南支行",601]},{"value":["江宁支行",506]},{"value":["南京分行南京金融城支行",347]}]},{"name":"涉及客户数","value":[{"value":["南京分行城北支行",553]},{"value":["江宁科学园支行",811]},{"value":["东山支行",724]},{"value":["南京百家湖支行",660]},{"value":["南京分行城南支行",757]},{"value":["南京分行洪武支行",421]},{"value":["城南支行",506]},{"value":["江宁支行",575]},{"value":["南京分行南京金融城支行",526]}]},{"name":"涉及员工数","value":[{"value":["南京分行城北支行",631]},{"value":["江宁科学园支行",558]},{"value":["东山支行",501]},{"value":["南京百家湖支行",483]},{"value":["南京分行城南支行",343]},{"value":["南京分行洪武支行",662]},{"value":["城南支行",565]},{"value":["江宁支行",753]},{"value":["南京分行南京金融城支行",521]}]}]},"violation":[{"yearOnYearGrowth":0.59,"name":"问题数量统计","value":6266,"monthToMonthGrowth":0.41},{"yearOnYearGrowth":0.23,"name":"问题归属条线统计","value":2103,"monthToMonthGrowth":0.15},{"yearOnYearGrowth":0.42,"name":"下属机构涉及客户数量","value":160,"monthToMonthGrowth":0.54},{"yearOnYearGrowth":0.18,"name":"下属机构涉及员工数量","value":236,"monthToMonthGrowth":0.12}],"base":{"balls":[{"name":"问题客户数量占比","value":0.71},{"name":"问题员工数量占比","value":0.87}],"baseInfo":[{"systemname":"id","value":"0100","displayname":"机构编号"},{"systemname":"institutionname","value":"南京分行","displayname":"机构名称"},{"systemname":"employeesumbyorg","value":9124,"displayname":"机构人数"},{"systemname":"fulltimeemployee","value":1135,"displayname":"机构专职合规人员"},{"systemname":"fulltimeratebyory","value":0.17,"displayname":"占机构总人数比例"},{"systemname":"fulltimeratebyfulltime","value":0.4,"displayname":"占合规岗总人数比例"},{"systemname":"parttimeemployee","value":549,"displayname":"机构兼职合规人员"},{"systemname":"parttimeratebyory","value":0.38,"displayname":"占机构总人数比例"},{"systemname":"parttimeratebyparttime","value":0.72,"displayname":"占合规岗总人数比例"}]}},"msg":"获取成功"};
      // this.loadFuncs(dd);
    },
    loadFuncs: function(result) {
      var data = result.data || {},
        base = data.base || {},
        baseInfo = base.baseInfo || [],
        balls = base.balls || [],
        risks = data.risk || [],
        trend = data.trend || {},
        violation = data.violation || [];
      
      var ballInit = {
        name: '',
        value: ''
      };
      this.loadBaseInfo(baseInfo);
      this.setProblemCustomersPie(balls[0] || ballInit);
      this.setProblemStaffPie(balls[1] || ballInit);
      this.setTrendAnalysisChartLine(trend.lineEcharts); // 加载下面折线图柱状图
      this.trend = trend;                    // 给click使用
      this.loadRisk(risks);
      this.setRiskPortraitChart(risks);
      // this.loadTrend(trend);
      
      this.loadViolation(violation);
      // this.bind();
      this.bindTrendEvent();
    },
    getAllData: function(params, callback) {
      var me = this;
      // http://172.16.87.124:8081/audit_nj/riskview/searchInstitutionViolation  真实地址
      // http://localhost:8080/audit/ds/view-business/po.json 测试地址
      window.view.fetch('http://172.16.87.124:8081/audit_nj/riskview/searchInstitutionViolation', {
        method: 'POST',
        mode: 'cors',
        body: new URLSearchParams({
          date: params.date,
          orgname: params.orgname
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }).then(function (data) {
        if (typeof callback === 'function') {
          var func = $.proxy(callback, me);
          func(data);
        }
      });
    },
    loadBaseInfo: function(baseInfo) {
      var _html = '';

      for(var info of baseInfo) {
        _html += `<p class="baseinfo-item">
        <span class="baseinfo-item-name">${info.displayname}：</span>
        <span class="right-btn baseinfo-item-value">${info.value}</span>
      </p>`;
      }
      this.baseInfo.html(_html);
    },
    loadBusinessTable: function(businesses) {
      var _html = '';
      for(var business of businesses) {
        _html += `<tr><td class="nowrap">${business.business}</td>
          <td class="text-rigth">${business.issuesum}</td>
          <td class="text-rigth">${business.amount}</td></tr>`;
      }
      this.businessTable.html(_html);
    },
    loadModelTable: function(models) {
      var _html = '';
      for(var model of models) {
        _html += `<tr><td class="nowrap">${model.department}</td>
          <td class="text-rigth">${model.issuesum}</td>
          <td class="text-rigth">${model.amount}</td></tr>`;
      }
      this.lineTable.html(_html);
    },
    loadIssueTable: function(issues) {
      var _html = '';
      for(var issue of issues) {
        _html += `<tr><td class="nowrap">${issue.business}</td>
          <td class="text-rigth">${issue.issuesum}</td></tr>`;
      }
      this.issueTable.html(_html);
    },
    loadRisk: function(risks) {
      var _html = '';
      var colors = ['red', 'orange', 'yellow', 'green', 'blue'];
      for(var [index, risk] of risks.entries()) {
        _html += `<div class="risk-dim-block">
          <div class="clearfix">
          <p class="w-50 left">${risk.dim}</p>
          <p class="w-50 right text-rigth"><span class="fc-${colors[index]}">${risk.count}</span>/${risk.total}</p>
          </div>
          <div class="circlebar" data-percent="${ Math.round(risk.count/risk.total * 100) }%">
            <div class="circlebar-bar ${colors[index]}"></div>
          </div>
        </div>`;
      }
      this.riskDim.html(_html);
      this.loadBar('circlebar', 'circlebar-bar');
    },
    loadViolation: function (violation) {
      var _html = '';
      var numbers = [];
      for (var [index, vio] of violation.entries()) {
        numbers.push(vio.value);
        _html += `<div class="outline-target-block">
          <p class="fs-16">${vio.name}</p>
          <p id="js-vio-${index}" class="outline-target-block-number">${vio.value}</p>
          <div>
            <p class="w-50 left"><span class="outline-target-block-tong">${vio.yearOnYearGrowth}</span>同比</p>
            <p class="w-50 right"><span class="outline-target-block-chain">${vio.monthToMonthGrowth}</span>环比</p>
          </div>
        </div>`;
      }
      this.violationDiv.html(_html);

      // 动态加载数据
      for (var j = numbers.length; j--;) {
        this.loadCountUp('js-vio-' + j, numbers[j]);
      }
    },
    loadDate: function() {
      var me = this;
      jeDate("#js-date", {
        isinitVal: true,
        format: "YYYY-MM-DD",
        theme: { bgcolor: "#202b33", color: "#C7FEFF", pnColor: "#d2d2d2" },
        donefun: function (obj) {
          me.date = obj.val;
          me.loadInitData();
        }
      });
    },
    /**
     * 加载滚动条
     * @param {$()} ele 
     */
    loadScrollBar: function(ele) {
      try{
        !!ele.data("mCS") && ele.mCustomScrollbar("destroy"); //Destroy
      }catch (e){
          ele.data("mCS",''); //手动销毁             
      }        
      ele.mCustomScrollbar({
        theme: "minimal", 
        axis: 'y',
        autoHideScrollbar: true
      });
    },
    /**
     * 根据条线的data-percent动态设置宽度
     * @param {string} pele 父元素
     * @param {string} cele 子元素
     */
    loadBar: function(pele, cele) {
      $('.'+pele).each(function(){
        $(this).find('.'+cele).css('width', $(this).attr('data-percent'));
      });
    },
    /**
     * 数字自动增加的动态变化效果
     * @param {string} targetElement 目标数字所在位置的id
     * @param {number} count 要变化的数字
     */
    loadCountUp: function (targetElement, count) {
      var options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
      };
      var demo = new CountUp(targetElement, 0, count, 0, 2, options);
      if (!demo.error) {
        demo.start();
      } else {
        console.error(demo.error);
      }
    },
    /**
     * 加载 风险画像 雷达图
     */
    setRiskPortraitChart: function(risks) {
      // 处理数据
      var indicator = [],
        values = [];
      for(var risk of risks) {
        indicator.push({
          name: risk.dim,
          max: risk.total
        });
        values.push(risk.count);
      }
      
      // 渲染图表
      var dom = document.getElementById("risk-portrait-content");
      var myChart = echarts.init(dom);
  
      option = {
        title: {
          text: ''
        },
        tooltip: {},
        radar: {
          name: {
            textStyle: {
              color: '#CEE3FE',
              // backgroundColor: '#999',
              borderRadius: 3,
              // padding: [1, 1]
            }
          },
          center: ['45%', '50%'],
          radius: '50%',
          indicator: indicator,
          splitArea: {
            areaStyle: {
              color: ['rgba(0,0,0,0)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0,0,0,0)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(22, 255, 255, 0.4)'
            }
          }
        },
        series: [{
          name: '预算',
          type: 'radar',
          lineStyle: {
            color: 'rgba(22, 255, 255)'
          },
          itemStyle: {
            color: 'rgba(22, 255, 255, 0.8)'
          },
          areaStyle: {
            color: 'rgba(22, 255, 255, 0.8)',
          },
          data: [
            {
              value: values,
              name: ''
            }
          ]
        }]
      };
  
      myChart.setOption(option);
    },
    /**
     * 趋势分析-加载折线图
     */
    setTrendAnalysisChartLine: function(trendChartData, elemval) {
      $(".trend-analysis-name-explain").html("（按时间纬度）");
      var dom = document.getElementById("trend-analysis-chart");
      var myChart = echarts.init(dom);
      myChart.clear();//清除原来的图形
  
      if(elemval){ this.TrendAnalysisChartName = elemval; }
      if(trendChartData.length<=0){ return '';}

      function getChartData(useName){
        for(var i=0;i<trendChartData.length;i++){
          if(trendChartData[i].name === useName){
            return [trendChartData[i]];
          }
        }
      }
      
      var chartdata = getChartData(this.TrendAnalysisChartName);

      option = {
        title: {
          text: ''
        },
        color: ['rgb(89,202,250)'],
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
          }
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
            // formatter: function (value, index) {
            // 	// 格式化成月/日，只在第一个刻度显示年份
            // 	var date = new Date(value);
            // 	var texts = (date.getMonth() + 1)+"月";
            // 	return texts;
            // }
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
          name: chartdata[0].name,
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
          data: chartdata[0].value
        }]
      };
  
      myChart.setOption(option);

      myChart.on('click', function (params) {//弹框
        console.log(params);
        $(".org-risk-overview-model").show();	//显示弹框
				$(".org-risk-overview-model").css("right", parseInt($(".org-aside").css("width"))).css("width", "260px").css("height", "375px");
				//更改弹框的数据
				let _this = this;
				 
				
			  /* 	$.ajax({
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
				});  */

        //model 关闭按钮
        $(".model-close").unbind('click').bind('click', function () {
          $(".org-risk-overview-model").css("width", "0px");
          setTimeout(function () {
            $(".org-risk-overview-model").hide();	//显示弹框
          }, 600);
        });

      });
    },
    /**
     * 趋势分析-加载柱状图
     */
    setTrendAnalysisChartBar: function(trendChartData, elemval) {
      $(".trend-analysis-name-explain").html("（按所属分支）");

      var dom = document.getElementById("trend-analysis-chart");
      var myChart = echarts.init(dom);
  
      myChart.clear();//清除原来的图形
  
      if(elemval){ this.TrendAnalysisChartName = elemval; }

      if(trendChartData.length<=0){ return '';}

      function getChartData(useName){

        for(var i=0;i<trendChartData.length;i++){
          if(trendChartData[i].name === useName){
            let dealvalues = trendChartData[i].value;
            let nameList =[];
            let valueList = [];
            for(var v=0;v<dealvalues.length;v++){
              nameList.push(dealvalues[0].value[0]);
              valueList.push(dealvalues[0].value[1]);
            }
            return [{
              name:useName,
              data: nameList,
              value: valueList
            }];
          }
        }
      }
      
      var chartdata = getChartData(this.TrendAnalysisChartName);

     /*  var chartdata = [{
        name: "风险金额",
        data: ['鼓楼支行', '城北支行', '城南支行', '北新支行', '街口支行', '新润支行', '中信支行'],
        value: [320, 332, 301, 334, 390, 330, 320]
      }]; */
  
      var maxN = Math.max.apply(null, chartdata[0].value);
      var dataShadow = [];
  
      for (var i = 0; i < chartdata[0].data.length; i++) {
        dataShadow.push(maxN);
      }
      option = {
        title: {
          text: ''
        },
        color: ['rgb(89,202,250)'],
        tooltip : {
          trigger: 'axis',
          axisPointer: {
              type: '',
              label: {
                  show: true
              }
          }
        },
        xAxis: {
          type: 'category',
          data: chartdata[0].data,
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
            // formatter: function (value, index) {
            // 	// 格式化成月/日，只在第一个刻度显示年份
            // 	var date = new Date(value);
            // 	var texts = (date.getMonth() + 1)+"月";
            // 	return texts;
            // }
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
        series: [
          { // For shadow
            type: 'bar',
            barWidth: 8,
            itemStyle: {
              normal: { color: 'rgba(0,0,0,0.45)' }
            },
            barGap: '-100%',
            barCategoryGap: '40%',
            data: dataShadow,
            animation: false
          },
          {
            name: chartdata[0].name,
            type: 'bar',
            barWidth: 8,
            smooth: 0.3,
            itemStyle: {
              normal: { color: 'rgba(22,255,255)' }
            },
            showSymbol: false,
            hoverAnimation: false,
            data: chartdata[0].value
          }
        ]
      };
  
      myChart.setOption(option);
    },
    /**
     * 左下角 问题客户数量占比
     */
    setProblemCustomersPie: function (ball) {
      var options = {
        series: [{
          type: 'liquidFill',
          waveAnimation: false,
          animation: false,
          data: [ball],
          color: ['rgb(76,163,255)'],    //默认波浪颜色
          center: ['50%', '50%'],    //在画布中的位置
          radius: '70%',             //大小  可以为50% 也可以用50px表示
          amplitude: '8%',		   //波浪幅度
          waveLength: '80%',         //波长
          phase: 'auto',             //相位
          period: 'auto',            //周期
          direction: 'right',        //波动方向
          shape: 'circle',           //形状 

          // waveAnimation: true,
          // animationEasing: 'linear',
          // animationEasingUpdate: 'linear',
          // animationDuration: 2000,
          // animationDurationUpdate: 1000,

          outline: {
            show: true,    //是否显示外圈线
            borderDistance: 2,   //与外圈距离
            itemStyle: {
              color: 'none',
              borderColor: '#294D99',  //线的颜色，粗细，模糊程度，模糊颜色
              borderWidth: 2,
              shadowBlur: 2,
              shadowColor: 'rgba(0, 0, 0, 0.75)'
            }
          },

          backgroundStyle: {
            color: 'rgb(1,16,23,0.8)'    //背景 
          },

          itemStyle: {
            opacity: 0.95,   //透明度
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 0.4)'
          },

          label: {    //内部字符标签的属性
            show: true,
            color: '#294D99',
            insideColor: '#fff',
            fontSize: 16,
            fontWeight: 'bold',

            align: 'center',
            baseline: 'middle',
            position: 'inside',
            normal: {
              formatter: '{b}\n{c}',   //{a}表示系列名，{b}为键名，{c}为值
              textStyle: {
                fontSize: 16,

              }
            }
          },

          emphasis: {
            itemStyle: {
              opacity: 0.8
            }
          },

        }]
      }

      var chart = echarts.init(document.getElementById('problem-customers-pie'));
      chart.setOption(options);
    },
    /**
     * 左下角 问题员工数量占比
     */
    setProblemStaffPie: function (ball) {
      var options = {

        series: [{
          type: 'liquidFill',
          waveAnimation: false,
          animation: false,
          data: [ball],
          color: ['rgb(76,163,255)'],    //默认波浪颜色
          center: ['50%', '50%'],    //在画布中的位置
          radius: '70%',             //大小  可以为50% 也可以用50px表示
          amplitude: '8%',		   //波浪幅度
          waveLength: '80%',         //波长
          phase: 'auto',             //相位
          period: 'auto',            //周期
          direction: 'right',        //波动方向
          shape: 'circle',           //形状 

          // waveAnimation: true,
          // animationEasing: 'linear',
          // animationEasingUpdate: 'linear',
          // animationDuration: 2000,
          // animationDurationUpdate: 1000,

          outline: {
            show: true,    //是否显示外圈线
            borderDistance: 2,   //与外圈距离
            itemStyle: {
              color: 'none',
              borderColor: '#294D99',  //线的颜色，粗细，模糊程度，模糊颜色
              borderWidth: 2,
              shadowBlur: 2,
              shadowColor: 'rgba(0, 0, 0, 0.75)'
            }
          },

          backgroundStyle: {
            color: 'rgb(1,16,23,0.8)'    //背景 
          },

          itemStyle: {
            opacity: 0.95,   //透明度
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 0.4)'
          },

          label: {    //内部字符标签的属性
            show: true,
            color: '#294D99',
            insideColor: '#fff',
            fontSize: 16,
            fontWeight: 'bold',

            align: 'center',
            baseline: 'middle',
            position: 'inside',
            normal: {
              formatter: '{b}\n{c}',   //{a}表示系列名，{b}为键名，{c}为值
              textStyle: {
                fontSize: 16,

              }
            }
          },

          emphasis: {
            itemStyle: {
              opacity: 0.8
            }
          },



        }]
      }

      var chart = echarts.init(document.getElementById('problem-staff-pie'));
      chart.setOption(options);
    },
    /**
     * 搜索框回车
     * @param {*} event 
     */
    handleSearchEnter: function(event) {
      if (event.keyCode == "13") {
        var searchValue = event.target.value;
        if(searchValue) {
          this.orgname = searchValue;
          this.loadInitData();
        }
      }
    },
    /**
     * 点击搜索按钮
     */
    handleSearchClick: function() {
      var searchValue = this.searchInput.val();
      if(searchValue) {
        this.orgname = searchValue;
        this.loadInitData();
      }
    },
    handleTrendLeftBtnClick: function() {
      $(".change-chart-btn-left").addClass('change-chart-btn-selected');
      $(".change-chart-btn-right").removeClass('change-chart-btn-selected');
  
      if (this.TrendAnalysisChartType === "line") { // 根据this.TrendAnalysisChartType显示对应的图表
        this.setTrendAnalysisChartBar(this.trend.barEcharts);
        this.TrendAnalysisChartType = "bar";
      } else if (this.TrendAnalysisChartType === "bar") {
        this.setTrendAnalysisChartLine(this.trend.lineEcharts);
        this.TrendAnalysisChartType = "line";
      }
    },
    handleTrendRightBtnClick: function() {
      $(".change-chart-btn-right").addClass('change-chart-btn-selected');
      $(".change-chart-btn-left").removeClass('change-chart-btn-selected');
  
      if (this.TrendAnalysisChartType === "line") { // 根据this.TrendAnalysisChartType显示对应的图表
        this.setTrendAnalysisChartBar(this.trend.barEcharts);
        this.TrendAnalysisChartType = "bar";
      } else if (this.TrendAnalysisChartType === "bar") {
        this.setTrendAnalysisChartLine(this.trend.lineEcharts);
        this.TrendAnalysisChartType = "line";
      }
    },
    /**
     * 点击四个type 事件
     * @param elem 点击的元素
     */
    bindTrendEvent:function(){
      let _this = this;
      $(".trend-analysis-name").unbind('click').bind('click', function(){
        $(".trend-analysis-name").removeClass("trend-analysis-type-selected");
        $(this).addClass("trend-analysis-type-selected");
        if (_this.TrendAnalysisChartType === "line") {
          _this.setTrendAnalysisChartLine(_this.trend.lineEcharts, $(this)[0].innerHTML);
        } else if (_this.TrendAnalysisChartType === "bar") {
          _this.setTrendAnalysisChartBar(_this.trend.barEcharts, $(this)[0].innerHTML);
        }
      });
    }
  }

  portrayalOrg.init();

})