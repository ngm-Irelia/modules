$(function(){
 
  function getBaseData(staffname, staffid){

    //发送请求
    $.ajax({
        type:"POST",
        url:"/audit_nj/riskview/searchEmployeeViolator",
        data:{
            name: staffname,		
            id: staffid
        },
        dataType: "json",
        success: function(returndata){
            if(returndata.code === 200){
                setBaseMsg(returndata.data.baseInfo);
                outRuleMsg(returndata.data.violationInfo);
                setGraph("relational-map", returndata.data.relationMap.node, returndata.data.relationMap.graphData); //关系图谱
                setGraph("relevant-problems", returndata.data.relationIssue.node, returndata.data.relationIssue.graphData); //关系问题群
            } 
        }
        
    })
    
  }

  var dsearch = view.dealSearch(window.location.search);
	
  if(dsearch && "name" in dsearch && "id" in dsearch){
    getBaseData(dsearch.name, dsearch.id);  
  }else{
    getBaseData("王依依","wangyiyi111");// 获得要显示的数据 
  }
  

  // 事件
  //搜索按钮
  $("#staff-search").bind('click',function(){
    getBaseData($("#staffName").val(), $("#staffNumber").val());
  })
  // 跳转到员工视角
  $("#toViewStaff").bind('click',function(){
    window.location.href = "../views/view-staff.html";//?name=南京银行&time=2019-02-03
  })

  // -------- 下 为要显示的各个模块 ------ 


  //员工基本信息
  function setBaseMsg(baseData){
    let baseHtml = `
                <div class="result-block-details-content-top">
                    <div class="result-block-details-content-name">${ baseData.employeename }<span> &nbsp ${baseData.sex}</span><span>${baseData.mobilephone}</span></div>
                </div>`;
                //<div class="result-block-details-content-id"><span>${baseData.mobilephone}</span></div>

    baseHtml+= `<div class="result-block-details-content-bottom">
    <div class="result-block-details-content-type">岗位：<span>${baseData.position}</span></div>
                    <div class="result-block-details-content-type">机构：<span>${baseData.branchname}</span></div>
                    <div class="result-block-details-content-type">工作履历：<span>${baseData.record}</span></div>
                    <div class="result-block-details-content-type">入行时间：<span>${baseData.entrydate}</span></div>
                    <div class="result-block-details-content-type">是否离职：<span>${baseData.isleave}</span></div>
                </div>`;
    /* baseHtml+= `<div class="result-block-details-content-bottom">`;

    for(var i=0;i<baseData.length;i++){
        baseHtml+= `<div class="result-block-details-content-type">${baseData[i].displayName}<span>${baseData[i].value}</span></div>`;
    }
    baseHtml+= `</div>`; */

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

  //关系图谱
  function setGraph(ids, baseData,graphData){
    var myChart = echarts.init(document.getElementById(ids));

     
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
                //console.log(item)
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