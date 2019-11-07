$(function () {
  var portrayalBusiness = {
    init: function() {
      this.TrendAnalysisChartType = 'line';  // 趋势分析表格类型 line bar
      this.TrendAnalysisChartName = '问题数量'; // 涉及金额 涉及员工数 涉及客户数

      this.render();
      this.bind();
      this.loadDate();
      this.setInitValue();
      this.loadInitData();
      
    },
    render: function() {
      this.baseInfoDiv = $('#js-baseinfo-box');
      this.baseInfo = $('#js-baseinfo');
      this.businessTable = $('#js-business-table tbody');
      this.lineTable = $('#js-line-table tbody');
      this.issueTable = $('#js-issue-table tbody');

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
      //   date: '2018-06-01',
      //   orgname: '南京分行',
      //   linename: '交易银行部'
      // }
      
      this.date = json.date || '';
      this.orgname = json.orgname || '';
      this.linename = json.linename || '';
      //更新风险画像title
      this.riskTitle.html(this.date + ' ' + this.orgname);
    },
    loadInitData: function() {
      var params = {
        date: this.date,
        orgname: this.orgname,
        linename: this.linename
      };

      this.getAllData(params, this.loadFuncs);
    },
    loadFuncs: function(result) {
      var data = result.data || {},
        base = data.base || {},
        baseInfo = base.baseInfo || [],
        businesses = base.businesses || [],
        issues = base.issues || [],
        models = base.models || [],
        risks = data.risk || [],
        trend = data.trend || {},
        violation = data.violation || [];
      
      this.loadBaseInfo(baseInfo);
      this.loadBusinessTable(businesses);
      this.loadModelTable(models);
      this.loadIssueTable(issues);
      this.loadScrollBar(this.baseInfoDiv);  //动态加载滚动条

      this.loadRisk(risks);
      this.setRiskPortraitChart(risks);
      
      this.setTrendAnalysisChartLine(trend.lineEcharts); // 加载下面折线图柱状图
      this.trend = trend;                    // 给click使用
      // this.loadTrend(trend);
      
      this.loadViolation(violation);
      // this.bind();
      this.bindTrendEvent();
    },
    getAllData: function(params, callback) {
      var me = this;
      // http://172.16.87.124:8081/audit_nj/riskview/searchBesinessViolation  真实地址
      // http://localhost:8080/audit/ds/view-business/pb.json 测试地址
      window.view.fetch('http://localhost:8080/audit/ds/view-business/pb.json', {
        method: 'POST',
        mode: 'cors',
        body: new URLSearchParams({
          date: params.date,
          orgname: params.orgname,
          linename: params.linename
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
              color: 'rgba(0,225,253, 0.55)'
            }
          }
        },
        series: [{
          name: '预算',
          type: 'radar',
          lineStyle: {
            color: 'rgba(0,225,253)'
          },
          itemStyle: {
            color: 'rgba(0,225,253, 0.8)'
          },
          areaStyle: {
            color: 'rgba(0,225,253, 0.55)',
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

      myChart.on('click', function (params) {
        //弹框 todo
        //console.log(params);
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
     * 搜索框回车
     * @param {*} event 
     */
    handleSearchEnter: function(event) {
      if (event.keyCode == "13") {
        var searchValue = event.target.value;
        if(searchValue) {
          this.linename = searchValue;
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
        this.linename = searchValue;
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

  portrayalBusiness.init();

})