$(function(){

  function getBaseData(clientname,clientid){
    //发送ajax请求
    $.ajax({
        type:"POST",
        url:"/audit_nj/riskview/searchCustomerViolator",
        data:{
            name: clientname,		
            id: clientid
        },
        dataType: "json",
        success: function(returndata){
            if(returndata.code === 200){
                setBaseMsg(clientname,clientid,returndata.data.baseInfoArray);
                outRuleMsg(returndata.data.violationInfo);
                setGraph(returndata.data.relationIssue.node, returndata.data.relationIssue.graphData); //关系问题群
                //
                for(var i=0;i<returndata.data.besinessInfo.length;i++){
                    switch (i){
                        case 0 : setstaffOverviewPie("result-block-credit",returndata.data.besinessInfo[0]);break;
                        case 1 : setstaffOverviewPie("result-block-personal",returndata.data.besinessInfo[1]);break;
                        case 2 : setstaffOverviewPie("result-block-client",returndata.data.besinessInfo[2]);break;
                        case 3 : setstaffOverviewPie("result-block-other",returndata.data.besinessInfo[3]);break;
                    }
                } 

            } 
        }
        
    })
    //模拟json
    let jsondata = {
        name:"王五",
        customerId:"123523",
        baseMsg:[
            {
                displayName:"客户类型",
                systemName:"customType",
                value:"个人客户"
            },
            {
                displayName:"客户开户机构",
                systemName:"customAddress",
                value:"南京分行城西支行"
            },
            {
                displayName:"联系电话",
                systemName:"customTel",
                value:"12345476"
            }
        ],
        outRuleMsg:[
            {
                displayName:"员工涉及问题数量",
                systemName:"customType",
                value:"13"
            },
            {
                displayName:"涉及问题金额",
                systemName:"customAddress",
                value:"12356"
            },
            {
                displayName:"问题归属业务条线",
                systemName:"customTel",
                value:"公司金融部、零售金融部、小企业金融部、法律合规部"
            },
            {
                displayName:"问题涉及机构",
                systemName:"customTel",
                value:"零售金融部、小企业金融部、法律合规部"
            }
        ],
        graphData:[
            {
            name: '王经理'
        }, {
            name: '张行长'
        }, {
            name: '李部长'
        }, {
            name: '王五'
        }, {
            name: '李嫣'
        }, {
            name: '赵部长'
        } ],
        graphRelation:[
            {
                source: '王经理', 
                target: '张行长'
            }, {
                source: '张行长', 
                target: '李部长'
            }, {
                source: '王经理', 
                target: '王五'
            }, {
                source: '王经理', 
                target: '赵部长'
            }, {
                source: '王经理', 
                target: '李嫣'
            } ],
        yewu:[
            {
                name:"授信",
                value:[
                    {
                        value:335, 
                        name:'客户经理',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'分行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'支行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'柜员',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'会计',
                        label:{show:false},
                        labelLine:{show:false} 
                    }
                  ]
            },
            {
                name:"存款",
                value:[
                    {
                        value:335, 
                        name:'客户经理',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'分行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'支行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'柜员',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'会计',
                        label:{show:false},
                        labelLine:{show:false} 
                    }
                  ]
            },
            {
                name:"其他",
                value:[
                    {
                        value:335, 
                        name:'客户经理',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'分行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'支行行长',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'柜员',
                        label:{show:false},
                        labelLine:{show:false} 
                    },
                    {
                        value:335, 
                        name:'会计',
                        label:{show:false},
                        labelLine:{show:false} 
                    }
                  ]
            }
        ]
    }

    //setBaseMsg(jsondata.name, jsondata.customerId, jsondata.baseMsg);
     
    //setGraph(jsondata.graphData,jsondata.graphRelation); //关系图

     

  }

  var dsearch = view.dealSearch(window.location.search);
	
  if(dsearch && "name" in dsearch && "id" in dsearch){
    getBaseData(dsearch.name, dsearch.id);  
  }else{
    getBaseData("详小妹","123456789");// 获得要显示的数据 todo 默认的数据待添加
  } 

  // 事件
  //搜索按钮
  $("#client-search").bind('click',function(){
    getBaseData($("#staffName").val(), $("#staffNumber").val());
  })
  // 跳转到客户视角
  $("#toViewClient").bind('click',function(){
    window.location.href = "../views/view-client.html";//?name=南京银行&time=2019-02-03
  })
  // -------- 下 为要显示的各个模块 ------ 

  //客户基本信息
  function setBaseMsg(clientname,clientid, baseData){
    let baseHtml = `
                <div class="result-block-details-content-top">
                    <div class="result-block-details-content-name">姓名：<span>${clientname}</span>&nbsp&nbsp 客户号：<span>${clientid}</span></div>
                    
                </div>`;
                //<div class="result-block-details-content-id">客户号：<span>${clientid}</span></div>
       /*  baseHtml+= `<div class="result-block-details-content-bottom">
            <div class="result-block-details-content-type">客户类型：<span>${baseData.recode}</span></div>
            <div class="result-block-details-content-type">证件号码：<span>${baseData.id}</span></div>
            <div class="result-block-details-content-type">客户开户机构：<span>${baseData.branchname}</span></div>
            <div class="result-block-details-content-type">联系电话：<span>${baseData.mobilephone}</span></div>
            <div class="result-block-details-content-type">开户日期：<span>${baseData.entrydate}</span></div>
        </div>`; */
    baseHtml+= `<div class="result-block-details-content-bottom">`;

    for(var i=0;i<baseData.length;i++){
        if(baseData[i].systemName!= "customername" && baseData[i].systemName!= "id"){
            baseHtml+= `<div class="result-block-details-content-type">${baseData[i].displayName}：<span>${baseData[i].value}</span></div>`;
        }
    }
    baseHtml+= `</div>`;

    document.getElementById('result-block-details-content').innerHTML = baseHtml;

  }

  //客户违规信息
  function outRuleMsg (violationInfo){
    let dealRuleArr = new Array(4);
    for(var i=0;i<violationInfo.length;i++){
        
        if(violationInfo[i].systemName === "issuesum"){
            dealRuleArr[0] = violationInfo[i];
        }else if(violationInfo[i].systemName === "riskamount"){
            dealRuleArr[1] = violationInfo[i];
        }else if(violationInfo[i].systemName === "linename"){
            dealRuleArr[2] = violationInfo[i];
        }else if(violationInfo[i].systemName === "institutionname"){
            dealRuleArr[3] = violationInfo[i];
        }
    }
    let ruleHtml = `
        <div class="h-50">
            <div class="w-50 h-100 left">
                <p class="result-block-subtitle bg-image-1">${ dealRuleArr[0].displayName }</p>
                <p class="result-block-subcontent fs-36">${ dealRuleArr[0].value }</p>  
            </div>
            <div class="w-50 h-100 right">
                <p class="result-block-subtitle bg-image-2">${ dealRuleArr[1].displayName }</p>
                <p class="result-block-subcontent fs-36">${ dealRuleArr[1].value }</p>
            </div>
        </div>
        <div class="h-50">
            <div class="w-50 h-100 left">
                <p class="result-block-subtitle bg-image-3">${ dealRuleArr[2].displayName }</p>
                <p class="result-block-subcontent fs-16">${ dealRuleArr[2].value }</p>
            </div>
            <div class="w-50 h-100 right">
                <p class="result-block-subtitle bg-image-4">${ dealRuleArr[3].displayName }</p>
                <p class="result-block-subcontent fs-16">${ dealRuleArr[3].value }</p>
            </div>
        </div>`;

    document.getElementById('rule-details').innerHTML = ruleHtml;

  }

  //饼图
  function setstaffOverviewPie (ids,jsons){
    var dom = document.getElementById(ids);
    var myChart = echarts.init(dom);

    //todo here 需要对数据进行处理，添加颜色和透明度
    function dealData(){
        
        let newarr = [];
        for(var i=0;i<jsons.date.length;i++){
            newarr.push( {
                value:jsons.date[i].value, 
                name:jsons.date[i].displayName,
                label:{show:false},
                labelLine:{show:false} 
            })
        }

        let newJson = {
            name:jsons.name,
            value:newarr
        };
        return newJson
    }
    let jsondata = dealData();
    let piedata1 = jsondata.value;


    function getLegend(){
        let newLegend = [];
        for(var i=0;i<jsondata.value.length;i++){
            newLegend.push(jsondata.value[i].name);
        }
        return newLegend;
    }
    
    option = {
      title: [{
        text: jsondata.name,
        x: 'center', 
        top:'15%', 
        itemGap: 20,
        textStyle : {
            color : 'rgba(255,255,255,0.8)',
            fontFamily : '微软雅黑',
            fontSize : 17,
            fontWeight : 'bolder'
        }
      },{
        text: '情况统计',
        x: 'center',
        top:'22%',
        itemGap: 10,
        textStyle : {
            color : '#CEE3FE',
            fontFamily : '微软雅黑',
            fontSize : 12,
            fontWeight : 'bolder'
        }
      }],
      color:['#29A7F2','#6CC144', '#E7A70A', '#6D75BA', '#4B5664','#275187',  '#2518C0', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      legend: {  
        bottom: '10%',
        left: 'center',
        data: getLegend(),
        textStyle: { color: '#CEE3FE' }
      },
      series: [
          {
              name:'营销广告',
              type:'pie',
              center: ['50%', '20%'],
              radius: ['40%', '57%'],
              animation:false,
              silent:true,
              avoidLabelOverlap: false,
              label: {    //内部字符标签的属性
                show: true,
                color: '#294D99',
                insideColor: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
        
                align: 'center',
                baseline: 'middle',
                position: 'inside',
                normal:{ 
                  formatter:  '{b}\n{c}',   //{a}表示系列名，{b}为键名，{c}为值
                  textStyle:{
                      fontSize:10,
                      
                  }
                } 
              },
              labelLine: {
                  normal: { show: false }
              },
              data:piedata1
          } 
      ]
    };

    myChart.setOption(option);
  };

  //停用 setTestPie("result-block-other");
  function setTestPie(ids){
    var myChart = echarts.init(document.getElementById(ids));
    var placeHolderStyle = {
        normal: {
            label: {
                show: false,
                position: "center"
            },
            labelLine: {
                show: false
            },
            color: "#dedede",
            borderColor: "#dedede",
            borderWidth: 0
        },
        emphasis: {
            color: "#dedede",
            borderColor: "#dedede",
            borderWidth: 0
        }
    };
    var options = {
        backgroundColor: '#000',
        color: ['#fc7a26', 'green', '#ffa127', '#fff', "#ffcd26"],
        series: [{
            name: '值',
            type: 'pie',
            clockWise: true, //顺时加载
            hoverAnimation: false, //鼠标移入变大
            radius: [199, 200],
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        position: 'outside'
                    },
                    labelLine: {
                        show: true,
                        length: 100,
                        smooth: 0.5
                    },
                    borderWidth: 5,
                    shadowBlur: 40,
                    borderColor: "#fc7a26",
                    shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                }
            },
            data: [{
                value: 7,
                name: '70%'
            }, {
                value: 3,
                name: '',
                itemStyle: placeHolderStyle
            }]
        }, {
            name: '白',
            type: 'pie',
            clockWise: false,
            radius: [180, 180],
            hoverAnimation: false,
            data: [{
                value: 1
            }]
        }, {
            name: '值',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [159, 160],
            itemStyle: {
                normal: {
                    label: {
                        show: true
                    },
                    labelLine: {
                        show: true,
                        length: 100,
                        smooth: 0.5
                    },
                    borderWidth: 5,
                    shadowBlur: 40,
                    borderColor: "#ffa127",
                    shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                }
            },
            data: [{
                value: 6,
                name: '60%'
            }, {
                value: 4,
                name: '',
                itemStyle: placeHolderStyle
            }]
        }, {
            name: '白',
            type: 'pie',
            clockWise: false,
            hoverAnimation: false,
            radius: [140, 140],
            data: [{
                value: 1
            }]
        }, {
            name: '值',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [119, 120],
            itemStyle: {
                normal: {
                    label: {
                        show: true
                    },
                    labelLine: {
                        show: true,
                        length: 100,
                        smooth: 0.5
                    },
                    borderWidth: 5,
                    shadowBlur: 40,
                    borderColor: "#ffcd26",
                    shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                }
            },
            data: [{
                value: 4,
                name: '40%'
            }, {
                value: 6,
                name: '',
                itemStyle: placeHolderStyle
            }]
        }, {
            type: 'pie',
            color: ['#fc7a26', '#ffa127', "#ffcd26"],
            data: [{
                value: '',
                name: '不喜欢'
            }, {
                value: '',
                name: '喜欢'
            }, {
                value: '',
                name: '跳过'
            }]
        }, {
            name: '白',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [100, 100],
            label: {
                normal: {
                    position: 'center'
                }
            },
            data: [{
                value: 1,
                label: {
                    normal: {
                        formatter: '投票人数',
                        textStyle: {
                            color: '#666666',
                            fontSize: 26
                        }
                    }
                }
            }, {
                tooltip: {
                    show: false
                },
                label: {
                    normal: {
                        formatter: '\n1200',
                        textStyle: {
                            color: '#666666',
                            fontSize: 26
                        }
                    }
                }
            }]
        }]
    };
    myChart.setOption(options); 
  }

  //关系图
  function setGraph(baseData,graphData){
    var myChart = echarts.init(document.getElementById('result-block-details'));

    function dealGraphData(dd){
        for (var i = 0; i < dd.length; i++) {
            dd[i].x = i;
            dd[i].y = (i + 1) % dd.length;
        }
        return dd;
    }

    var options = {
        title: {
            text: ' '
        },
        tooltip: {},
        animationDurationUpdate: 100,
        animationEasingUpdate: 'quinticInOut',
        series : {
            type: 'graph',
            layout: 'force', //circular
            symbol:'image://../image/people.png',
            symbolSize: 40,
            roam: true,
            label: {
                normal: {
                    show: true
                }
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 20 
                    } 
                },
               
            },
            force: { 
                repulsion: 500,
                edgeLength: 5
            },
            data: baseData,
            // links: [],
            links: graphData.map( (item,index) => {
                return {
                    source: item.source,
                    target: item.target,
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    lineStyle: {
                        normal: { curveness: 0.2 }
                    }
                }
            }),
            itemStyle:{
                //color:"#fff",
                //borderColor:"#000",
                borderWidth:1
            },
            lineStyle: {
                normal: {
                    opacity: 0.9,
                    width: 2,
                    curveness: 0
                }
            }
        }
    };
    myChart.setOption(options); 
  }

})