$(function(){
window.chartprobeF = function() {
var ids,  
    statistics = "*",
    data_one = [],//叠加统计处理
    data_two = [],
    
    obj_ids = [],//数据集
    obj_obj = "",//对象
    obj_statistics = "",//统计项
    obj_way = "",//统计方法
    filter_group = {//过滤参数，过滤值
      "propertyName": "",
      "dataType": "",
      "leftValue": "",
      "rightValue": ""
    },
    mark = 0;
    window.filtermark = 2;
    window.information = [];
    window.way = "count";//传输过程中用到的统计方法，统计项
    window.deepCopyNow = [];  

function isEmptyObject(e) {  
  var t;  
  for (t in e)  
      return !1;  
  return !0  
}

function setXYBtnPosi(data) {
    var yBtnText = '';
    $(".xname").remove(); 
    $(".yname").remove();
    $(".tableName").remove();

    if (data.yName.length == 2) {
      yBtnText = data.yName.substring(0,1) +" &nbsp;&nbsp;" + data.yName.substring(1);
    }
    else {
      yBtnText = data.yName;
    }

    d3.select("#draw_out").append("div").attr("class","xname").html("<span>" + data.xName + "</span><span class='icon-chevron-down'></span>");
    d3.select("#draw_out").append("div").attr("class","yname").html("<span>" + yBtnText + "</span><span class='icon-chevron-down'></span>");
    d3.select("#draw_out").append("div").attr("class","tableName").text(data.tableName);
    svgScroll(data);   
}

window.svgScroll = function (data) {
    var boxWidth = $("#draw_out").width();
    var titleLen = data.tableName.length;
    var xNameLen = $(".xname").text().length + 1;
    // var yNameLen = $(".yname").text().length + 1;
    $(".tableName").css("left", ( (boxWidth - titleLen * 14) / 2) + "px");
    $(".xname").css("left", (boxWidth - 230) + "px");
    $("#draw_out").scroll(function () {
        var svgScrollLeft = $(this).scrollLeft();
        var scrollTitlePosi = svgScrollLeft + boxWidth / 2 - titleLen * 7;
        var scrollXnamePosi = svgScrollLeft + boxWidth - 230;
        var scrollXname1Posi = svgScrollLeft + boxWidth - 230 + xNameLen * 13.5 + 18;
        $(".tableName").css("left", scrollTitlePosi);
        $(".xname").css("left", scrollXnamePosi); 
        $(".xname1").css("left", scrollXname1Posi);
    })    
}

function processDataPercent(data){
    for(var j=0;j<data.length;j++){
        for(var i=0;i<data[j].statisticalItems.length;i++){
            if(data[j].statisticalItems[i].yValue!=0){
                data[j].statisticalItems[i].yValue=data[j].statisticalItems[i].yValue.replace("%","");
            }
        }
        data[j].yName=data[j].yName+"%";
    }    
}

//大图的兼容滚动条
window.compatible = function(dom, axisStr){
    try{
    !!dom.data("mCS") && dom.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
        dom.data("mCS",''); //手动销毁             
    }            
    dom.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true, 
      axis: axisStr
    });
}
let $chartFilterAddBox = $(".filter_add_frame_out");
compatible($chartFilterAddBox, 'y');

//坐标轴可点击改变函数
window.changeXY = function(data) {//information_one
    //填上坐标
    setXYBtnPosi(data);

	var type_ = [];//获取对象类型（具体的分类）
    var dataProperty;
    var showname = [];
    var yLiIndex;
	type_system = largeObj["chart"+scIndex].fil.typee;
    //dimension
    cont = largeObj["chart"+scIndex].fil.cont;
    type_.push(type_system);
	
	//点击x坐标出现该对象下的所有维度，
	$(".xname").click(function(){
        //阻止事件冒泡，点自己别点到父元素上
        event.stopPropagation();
		$(".xname>span:eq(1)").toggleClass("add_transform");
        //目前不用全部的维度，而是用与第一次点击的维度拥有同一个小类型的维度，若全部维度直接用arrs
        d3.select("#draw_out").append("div").attr("class","xname1");
   	    var xSubmenuStr = "";
   	    var xSubmenuArr = [];
        $.ajax({
	 	    url:EPMUI.context.url+'/chart/allDimensions',
	 	    type:'POST',
            dataType:'json',
	 	    error:function(){
	 	    },
	 	    success: function(dataAllD) {
	 	     		for (var k in dataAllD) {
                          var datas = dataAllD[k].dimensions;
	 	     			for(var t in datas) {
                            if( t == type_){                                                            
                                var dataDimensions = datas[t].dimensions;
	 	     			        for(var i = 0; i<dataDimensions.length; i++) {
	        			            if(dataDimensions[i].system_name == cont) {
                                        //同一个对象分类下的
                                        xSubmenuArr = dataDimensions;
	        			            }
                                }
                            }
	 	     			}
                      }; 	 	      
	 	            for (var i = 0; i < xSubmenuArr.length; i++) {     
   	                    xSubmenuStr += "<li system_name='" + xSubmenuArr[i].system_name + "'" + "refer_class='" + xSubmenuArr[i].refer_class + "'>" + xSubmenuArr[i].display_name + "</li>";
                    }
                    xSubmenuStr = "<ul>" + xSubmenuStr + "</ul>";
   	                var xNameLen_ = $(".xname").text().length + 1;
	  	            $(".xname1").html(xSubmenuStr).css("left", ($("#draw_out").scrollLeft() + $("#draw_out").width() - 230 + xNameLen_ * 13.5 + 18) + "px");
                    svgScroll(data);
                    $(".xname1 li").click(function() {
	                    $(".xname").html($(this).text());
                        largeObj["chart"+scIndex].fil.cont = $(this).attr("system_name");
	                    largeObj["chart"+scIndex].filDis.cont = $(this).text();
                        cont = largeObj["chart"+scIndex].fil.cont;
                        way = largeObj["chart"+scIndex].fil.way;
                        kinds = largeObj["chart"+scIndex].kinds;
                        largeObj["chart"+scIndex].fil.referClass = $(this).attr("refer_class");
                        refer_class = largeObj["chart"+scIndex].fil.referClass;
                        largeObj["chart"+scIndex].fil.level = 1;
                                
	                    $("#draw svg").remove();

                        function changeXDraw(arrData) {
                            deepCopyNow=[];
                            $.extend(true, deepCopyNow, arrData);
                            for(var i=0; i<deepCopyNow.length; i++){
                                deepCopyNow[i].dimensionProperty = cont;
                                deepCopyNow[i].dimensionReferClass  = refer_class;
                                deepCopyNow[i].level = 1;
                            }
                            $.ajax({
                                type:"POST",
                                url:EPMUI.context.url+'/chart/chartDatas',
                                dataType:"json",
                                data:{
                                    operationDataStrings: JSON.stringify(deepCopyNow)
                                },
                                success:function(data){
                                    //这里有个坑，下钻后changeX是不行的，level不是1，不能下钻的维度会得到{}
                                    for(var p=0;p<data.length;p++){
                                        dealWithData(data,data[p]);
                                    }
                                    if(way=="percent"){
                                        processDataPercent(data);
                                    }
                                    kinds=="yz" ? bar(data, "draw") : line(data, "draw");
                                    largeObj["chart"+scIndex].information = [];
                                    largeObj["chart"+scIndex].information = data;
                                    largeObj["chart"+scIndex].informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].information));
                                    information=largeObj["chart"+scIndex].information;
                                    retreatDataSave(largeObj["chart"+scIndex]);
                                    
                                    largeObj["chart"+scIndex].chartFCNow=[];
                                    largeObj["chart"+scIndex].chartFCNow=deepCopyNow;
                                    largeObj["chart"+scIndex].chartFCPastAll.push(Object.assign([],deepCopyNow));
                                    largeObj["chart"+scIndex].fil.level=1;
                                    
                                }
                            })
                        }
                        changeXDraw(largeObj["chart"+scIndex].chartFCNow);
  
                        $(".xname>span:eq(1)").toggleClass("add_transform");
    	                    $(".xname1").remove();
                            showMessage();
                    }) 
                    $(".xname1").mouseleave(function() {
                        $(".xname>span:eq(1)").toggleClass("add_transform");
                        $(this).remove();
                    });            
            }
		});   
    })
    var yOperation=[{"display_name":"平均值","system_name":"avg"},
                    {"display_name":"最大值","system_name":"max"},
                    {"display_name":"最小值","system_name":"min"},
                    {"display_name":"百分比","system_name":"percent"},
                    {"display_name":"求 &nbsp;&nbsp;和","system_name":"sum"},
                    {"display_name":"计 &nbsp;&nbsp;数","system_name":"count"}];
  
    $(".yname").click(function(){
        event.stopPropagation();
        //jq中的animate不支持transform属性，想让这种有动画只能加class
        $(".yname>span:eq(1)").toggleClass("add_transform");
        //一级子菜单字符串
        var yFirstSubmenuStr = "";
        d3.select("#draw_out").append("div").attr("class", "yname1");
        for(var i=0; i<yOperation.length; i++){
            yFirstSubmenuStr += "<li system_name='" + yOperation[i].system_name + "'><span>" + yOperation[i].display_name + "</span></li>";     
        }
        $(".yname1").html("<ul>" + yFirstSubmenuStr + "</ul>");

        $.ajax({
            url: EPMUI.context.url+'/chart/propertiesByObjectNames',//请求所有属性
            type: 'POST',
            dataType: 'json',
            data: {"objectTypeNames":type_},//"LOAN,BANK_ACCOUNT"
            success:function(data){
              dataProperty = data;
            }
        });

        $(".yname1 li").click(function(){
            event.stopPropagation();
      
            if ($(this).attr("system_name") == "count" || $(this).attr("system_name") == "percent") {
                $(".yname>span:eq(1)").toggleClass("add_transform");
                largeObj["chart"+scIndex].filDis.way = $(this).text();
                refer_class = largeObj["chart"+scIndex].fil.referClass;
                cont = largeObj["chart"+scIndex].fil.cont;
                level = largeObj["chart"+scIndex].fil.level;
                way = $(this).attr("system_name");
                wayDisplay = $(this).text();
                statistics = "*"; 
                request(); 
            }         
        })

        //不用on绑定事件会发生事件捕获，用on就好了
        $(".yname1 li").on("mouseenter", function() {
          $(".yname2").remove();
          event.stopPropagation();
          yLiIndex = $(this).index();//$(this)是不能传给变量的，到别的地方就不认识了
          switch ($(this).attr("system_name")) {
            case "min": requestProp("float", "long", "int", "date");
            break;
            case "max": requestProp("float", "long", "int", "date");
            break;
            case "avg": requestProp("float", "long", "int");
            break;
            case "sum": requestProp("float", "long", "int");
            break;
          }    
        })

        $(".yname1").on("mouseleave",function(){
          $(".yname>span:eq(1)").toggleClass("add_transform");
          $(this).remove();
        })
    })

    function request (){
        refer_class = largeObj["chart"+scIndex].fil.referClass;
        cont = largeObj["chart"+scIndex].fil.cont;
        level = 1;
        kinds = largeObj["chart"+scIndex].kinds;
      
        function changeYDraw (arrData){
            deepCopyNow = [];
            //deepCopyNow=arrData好像没有深拷贝也没毛病，可能是先等于空数组的原因
            $.extend(true, deepCopyNow, arrData);
            for(var i=0;i<deepCopyNow.length;i++){
              deepCopyNow[i].operationProperty = statistics;
              deepCopyNow[i].operation  = way;
              deepCopyNow[i].level  = 1;
            }
            $.ajax({
                type:"POST",
                url:EPMUI.context.url+'/chart/chartDatas',
                dataType:"json",
                data:{
                  operationDataStrings: JSON.stringify(deepCopyNow)
                },
                success:function(data){
                    if (JSON.stringify(data[0]) == "{}") {
                        var tmpStr = "<div class='draw_warn'><p>没有符合统计条件的数据！</p><button>确定</button></div>"
                        $("#draw_out").append(tmpStr);
                        $(".draw_warn button").click(function() {
                            $(".draw_warn").remove();
                        })
                        $(".yname1").remove();  
                    }
                    else {
                        $("#draw svg").remove();
                        for(var p=0; p<data.length; p++){
                            dealWithData(data, data[p]);
                        }
                        if(way == "percent") {
                            processDataPercent(data);
                        }
          
                        kinds=="yz" ? bar(data, "draw") : line(data, "draw");
                        largeObj["chart"+scIndex].information = [];
                        largeObj["chart"+scIndex].information = data;
                        largeObj["chart"+scIndex].informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].information))
                        information = largeObj["chart"+scIndex].information;
                        largeObj["chart"+scIndex].chartFCNow = [];
                        largeObj["chart"+scIndex].chartFCNow = deepCopyNow;
                        largeObj["chart"+scIndex].chartFCPastAll.push(Object.assign([],deepCopyNow));
                        largeObj["chart"+scIndex].fil.level = 1;
                        largeObj["chart"+scIndex].fil.way = way;
                        largeObj["chart"+scIndex].filDis.way = wayDisplay;
                        retreatDataSave(largeObj["chart"+scIndex]);
            
                        $(".yname1").remove();
                        showMessage();    
                    }                  
                }
            })
        }

        changeYDraw(largeObj["chart"+scIndex].chartFCNow);                
        //每次发完请求，用于发请求的公共变量应该清回到初始状态，不然影响下次请求
    }

    function requestProp(str1,str2,str3,str4) {
        var len = 0; 
        var ySecondSubmenuStr = "";
        //这块枚举就不报错，对象点属性就报错
        
        for(var key in dataProperty){
            showname = dataProperty[key];//此数组里有每条属性
        }        
        for (var i=0; i<showname.length; i++) {
          if (showname[i].dataType==str1||showname[i].dataType==str2||showname[i].dataType==str3||showname[i].dataType==str4) {
            ySecondSubmenuStr += "<li system_name='"+showname[i].systemName+"'>"+showname[i].displayName+"</li>";
            showname[i].displayName.length > len ? len = showname[i].displayName.length : len;
          }
        }             
        if (ySecondSubmenuStr) {
            $(".yname1 li").eq(yLiIndex).append("<div class='yname2'></div>");
            $(".yname2").html("<ul>"+ySecondSubmenuStr+"</ul>");
            $(".yname2").css("width", (13 * len + 26)+"px");
            //离开
            $(".yname2").on("mouseleave", function(){
              event.stopImmediatePropagation();    
              $(this).remove();
              $(".yname1").remove();
              $(".yname>span:eq(1)").toggleClass("add_transform");
            })
            //进入
            $(".yname2  ul li").mouseenter(function(){
              event.stopPropagation();
              $(this).parent().parent().parent().find("span").addClass('activeColor');
            })
            //点击
            $(".yname2  ul li").click(function(){
              $(".yname>span:eq(1)").toggleClass("add_transform");
              largeObj["chart"+scIndex].fil.statistics = []; 
              largeObj["chart"+scIndex].fil.statistics.push($(this).attr("system_name"));
              largeObj["chart"+scIndex].filDis.statistics = [];
              largeObj["chart"+scIndex].filDis.statistics.push($(this).text());
              statistics = largeObj["chart"+scIndex].fil.statistics[0];
              kinds = largeObj["chart"+scIndex].kinds;      
              way = yOperation[yLiIndex].system_name;
              wayDisplay = $(this).text();
              request();
              d3.selectAll(".yname2").remove();
            })

            $(".yname2  ul li").mouseleave(function(){
              event.stopPropagation();      
            });
        }     
    }
}

//叠加统计对原图数据和过滤后的数据处理，遍历现有图表的数据，第二次请求来的数据中如果没有哪项，就填进来，y值为0
function dealWithData(information, data) {//之前的数据，新请求的数据	
  function search(arr,dst){
    var i = arr.length;
    while(i-=1){
        if (arr[i] == dst){
           return i;
        }
    }
    return false;
  }
  var fg=0;
  var arrInformation=[];
  var arrData = [];
  data_one=information[0].statisticalItems;
	data_two = data.statisticalItems;
  $.extend(true,arrData,data_two);
  //遍历第一个数组，如果和第二个相同的，就把第二个完全拷贝的那份删除，得到一个数组，是第二个数组刨除和第一个重复的
	for(var i=0;i<data_one.length;i++){
		for(var j=0;j<data_two.length;j++){
			if(data_one[i].xValue==data_two[j].xValue){
        for(var v=0;v<arrData.length;v++){
          if(arrData[v].xValue==data_two[j].xValue){
            arrData.splice(v,1);
          }
        }
        
			}
		}
	}
  //把第一个数组push一下，变成包含着第二个的数组，这时，第一个是全的，第二个是不全的，
  for(var k=0;k<arrData.length;k++){
    arrData[k].yValue = 0;
    data_one.push(arrData[k]);
  }
  //把第一个全的拷贝一份
  $.extend(true,arrInformation,data_one);
  //遍历拷贝的这个，如果第二个有就删除，得到一个数组，包含着在第一个却不在第二个的元素
	for(var i=0;i<data_two.length;i++){
		for(var j=0;j<arrInformation.length;j++){
			if(data_two[i].xValue==arrInformation[j].xValue){
				arrInformation.splice(j,1);
			}
		}
  }
  //把第二个没有的元素，值变成0，加入到第二个数组中，至此，两个数组的XValue是一样的了
  for(var p=0;p<arrInformation.length;p++){
    arrInformation[p].yValue=0;
    data_two.push(arrInformation[p]);
  }
  //现在两个数组内容是完全一样的，只是顺序不一样，下面就让他们的顺序一致
  var arrNew=[];
	for(var s=0;s<data_one.length;s++){
    for(var g=0;g<data_two.length;g++){
      if(data_one[s].xValue==data_two[g].xValue){
        arrNew.push(data_two[g]);
      }
    }
  }
  data.statisticalItems=[];
  $.extend(true,data.statisticalItems,arrNew);     
}

//过滤器  **********************************************	

//点击当前input输入框，其他输入框的下拉菜单全部隐藏
function inputHide(a) {
    $(".fil_type").hide();
    $(".packout_").hide();
    $(".packout_two").hide();
    $(".packout_three").hide();
    $(".packout_four").hide();
    if (a) {
        $(a).show();
    }   
}

//点击过滤器的空白处，所有下拉框都关闭
$(".chart_filter").on("click", function() {
    inputHide();
})

//选择操作台的数据
$("#filterpresentdata").click(function() {
	filtermark = 1;
	$(this).addClass('icon-dot-circle').removeClass('icon-hollow-circle');
	$("#filteralldata").addClass('icon-hollow-circle').removeClass('icon-dot-circle');
    $(".filter_presentdata").addClass('chart_active_color').removeClass('chart_color_default');
	$(".filter_alldata").addClass('chart_color_default').removeClass('chart_active_color');
	$(".chart_filter input").val("");
    //此处需要在前一个js对象中添加这个属性的值
	$("#filterfenlei").attr("placeholder", largeObj["chart"+scIndex].filDis.classify).attr("readonly","true"); 
	//judge(largeObj["chart"+scIndex].fil.classify);
	ScopeDisplay = "操作台数据";//传输的变量
	dataScope = 1;
    document.getElementById('filterfenlei').disabled = true;
});

//选择全部数据
$("#filteralldata").click(function(){
	filtermark=2;
	$(this).addClass('icon-dot-circle').removeClass('icon-hollow-circle');
	$("#filterpresentdata").addClass('icon-hollow-circle').removeClass('icon-dot-circle');
    $(".filter_alldata").addClass('chart_active_color').removeClass('chart_color_default');
	$(".filter_presentdata").addClass('chart_color_default').removeClass('chart_active_color');
	$(".chart_filter input").val("");
    $("#filterfenlei").attr("placeholder", largeObj["chart"+scIndex].filDis.classify).attr("readonly","true"); 
	// judge(largeObj["chart"+scIndex].fil.classify);
	ScopeDisplay = "全部数据";//传输的变量
	dataScope = 2;
    $(".filter_notice_objname").hide();
    document.getElementById('filterfenlei').disabled = true;
});


var bjtype = [];//存放对象名称
var objectType;//存放对象名称，字符串形式

$("#filtertype").attr("placeholder","请选择...");
$("#filtervidoo").attr("placeholder","请选择...");
$("#filterway").attr("placeholder","请选择...");
$("#filter_contentone").attr("placeholder","请选择...");

//目前认为对象类型是不会变的，变的话需要同一个维度上有两个对象类型，只要是具体的维度就没有那样的
//点击对象类型，出现下拉菜单,选择后，显示在输入框，并带有唯一的system_name 属性
$("#filtertype").on("click", function(){
	event.stopPropagation();
	//选择分类的不同，应该判断是哪个分类下的对象类型，是再显示；现在是因为还没有同意维度夸两个分类（实体事件文档）
	inputHide(".fil_type");
	$(".fil_type").html("");
    $(".filter_notice_objname").hide();
	bjtype = [];
	var arr_type = [];
    var arr_types = [];

	//选择本地数据
	if (filtermark == 1) {
        //存放操作台上所有数据所包括的对象名称
        var obj_name = [];
        obj_ids = [];
        var getTopoNodes = JSON.parse(localStorage.getItem("topoNodes"));
        //type是小分类，id是这个点的唯一标识
        if (getTopoNodes) {
            for (var i=0; i<getTopoNodes.nodes.length; i++) {
                obj_ids.push(getTopoNodes.nodes[i].id);
                obj_name.push(getTopoNodes.nodes[i].objectType);
            }
        }
        //数组去重，去除重复的小分类
		Array.prototype.unique3 = function() {
            var res = [];
            var json = {};
            for(var i = 0; i < this.length; i++){   
                if (!json[this[i]]) {
                    res.push(this[i]);
                    json[this[i]] = 1;
              }
             }
             return res;
            }
        obj_name = obj_name.unique3();
        //下面是判断操作台上对象类型和维度相符合，如果不符合不显示
        //现在的情况：同一维度，只对应一个小分类
        cont = largeObj["chart"+scIndex].fil.cont;
        if (obj_name.length != 0) {
            $.ajax({//根据对象小分类获取维度
		        url:EPMUI.context.url+'/chart/dimensionsByObjectNames',
		        type: 'POST',
		        data:{
		    	   	"objectTypeNames":obj_name
		        },
		        dataType: 'json',
		        error:function(err){
		    	    },
		        success: function (data) {
		    	    for (var k in data) {
		    	    	for (var i=0; i<data[k].dimensions.length; i++) {
		    	    		if (data[k].dimensions[i].system_name == cont) {
		    	    			arr_type.push(data[k].display_name)//汉字，，，这个操作是为了拿到person对应的汉字“人”,push是加到尾部
		    	                arr_types.push(k);
		    	    		}
		    	    	}
                    }
                    var fil_type_dom = $(".fil_type");
                    try{
                    !!fil_type_dom.data("mCS") && fil_type_dom.mCustomScrollbar("destroy"); //Destroy
                    }catch (e){
                        fil_type_dom.data("mCS",''); //手动销毁             
                    }            
                    
		    	    $(".fil_type").show();
	                for (var i=0; i<arr_type.length; i++) {
	                	d3.select(".fil_type")
                          .append("div")
                          .attr("class","packone_")
	                	  .attr("index_type",arr_types[i])
                          .text(function(){ return arr_type[i]; })
                    }

                    fil_type_dom.mCustomScrollbar({
                        theme: Magicube.scrollbarTheme,
                        autoHideScrollbar: true, 
                        axis: 'y'
                    });
                    plmenu ();
		        }
		    });
        }
        else {
        	$(".filter_notice_objname").show().text("工作台无节点");
        }
	}else{
        arr_types.push(type_system);//key是对象类型的英文“PERSON”，用来传递的
        arr_type.push(type_display);//此数组的每一项是字符串,,对象名称的汉字	        
	    //如果选操作台的数据，再发一次请求，拿到操作台的数据，维度可选，遍历操作台对象所带有的维度，若不含有
	    //暂且没有维度的话，就让其报错；
	    $(".fil_type").show();
	    for (var i=0; i<arr_type.length; i++) {
	    	d3.select(".fil_type")
              .append("div")
              .attr("class","packone_")
              .attr("index_type",arr_types[i])
              .text(function(){ return arr_type[i];});
	    }
	}
    let $chartFilterSelect1 = $('.chart_filter .fil_type');
    compatible($chartFilterSelect1, 'y');
	plmenu ();
})

function plmenu (){
	$(".packone_").click(function() {
		//var ft = $(this).text();
		$("#filtertype").val($(this).text());
		var pr = $(this).attr("index_type");
		obj_obj = pr;//拿到了对象类型
        objectType=pr;
		bjtype.push(pr);
		 // $("#filtertype").placeholder = $(this).system_name;这个功能是让它联动的框有默认提示，或选项
		$(".fil_type").hide();
		$(".packone_").remove();
	});
}

//点击统计项,,多个数据用逗号隔开,根据对象获得属性与全部数据还是操作台的数据无关
$("#filtervidoo").on("click", function() {
	inputHide (".packout_two");
	//根据对象名称获取属性，与操不操作台没关系
	$.ajax({
   		url: EPMUI.context.url+'/chart/operationItemsByObjectNames',
   		type: 'POST',
   		dataType: 'json',
   		data: {"objectTypeNames":bjtype},//cbjtype是一个"LOAN,BANK_ACCOUNT"
   		success:function(data){
   			for (var key in data) {
   			 //此处如果传了2个就会需要处理一下
   			 var datas = data[key];
   			}
   			pullMenu(datas);
   			selectMenu();
   		},
   		error:function(){
   		}
   	});
})

//统计项的下拉菜单
function pullMenu(a) {
	$(".packout_two").html("");
	$(".packout_two").show();
	for(var i=0;i<a.length;i++){
		d3.select(".packout_two").append("div").attr("class","packone_")
		.attr("system_name",function(){ return a[i].systemName;}).text(function(){ return a[i].displayName;})
		.attr("dataType",function(){ return a[i].dataType;});
	}
    let $chartFilterSelect4 = $('.chart_filter .packout_two');
    compatible($chartFilterSelect4, 'y');
}

var obj_statistics_display;//统计项的中文，因为统计项叠加统计是直接push，全新统计是清空再push，所以需要这个变量，先存储
function selectMenu() {
	$(".packone_").click(function() {
		var ft = $(this).text();
		var tt = $(this).attr("dataType");
		var ro = $(this).attr("system_name");
		obj_statistics = ro;
		obj_statistics_display = ft;
		$("#filtervidoo").val(ft);
		$("#filtervidoo").attr("dataType",tt);
		$("#filtervidoo").attr("system_name",ro);
		//$("#filter_contenttwo").placeholder = $(this).system_name;
		$(".packout_two").hide();
		$(".packone_").remove();
       
	});
}

//统计方法，根据属性的数据类型，确定能用那种统计方法
var arr_data=[];
$("#filterway").click(function(){
	//jquery提供的方法阻止事件冒泡，点透，点父盒子却点到了子盒子上，给子盒子添加阻止事件
	event.stopPropagation();
	inputHide (".packout_three");
	arr_data=[];
	$(".packout_three").html("");
	$(".packout_three").show();
  if($("#filtervidoo").val()=="未指定"){
    arr_data = [{"display_name":"计数","system_name":"count"},
    {"display_name":"百分比","system_name":"percent"}];//占比是percent
    statisticsWay(arr_data);
  }else{
	  switch($("#filtervidoo").attr("dataType"))
          {
            case "string":arr_data = [{"display_name":"计数","system_name":"count"},
                                      {"display_name":"百分比","system_name":"percent"}];//占比是percent
                          statisticsWay(arr_data);
            break;
            case "date":arr_data = [{"display_name":"计数","system_name":"count"},{"display_name":"最小值","system_name":"min"}
                                    ,{"display_name":"最大值","system_name":"max"},{"display_name":"百分比","system_name":"percent"}];
                        statisticsWay(arr_data);
            break;
            case "boolean":arr_data = [{"display_name":"计数","system_name":"count"},{"display_name":"百分比","system_name":"percent"}];
                           statisticsWay(arr_data);
            break;
            default:arr_data = [{"display_name":"计数","system_name":"count"},{"display_name":"平均值","system_name":"avg"}
                                ,{"display_name":"求和","system_name":"sum"},{"display_name":"最大值","system_name":"max"}
                                ,{"display_name":"最小值","system_name":"min"},{"display_name":"百分比","system_name":"percent"}];
                    statisticsWay(arr_data);

          }
    }
});

//统计方法的下拉菜单
function statisticsWay(arr_data) {
    for(var i=0;i<arr_data.length;i++){
    	d3.select(".packout_three").append("div").attr("class","packone_")
    	  .attr("system_name",function(){ return arr_data[i].system_name;})
    	  .text(function(){ return arr_data[i].display_name;});
    }
    let $chartFilterSelect3 = $('.chart_filter .packout_three');
    compatible($chartFilterSelect3, 'y');
	$(".packone_").click(function() {
		var ft = $(this).text();
		$("#filterway").val(ft);
		obj_way = $(this).attr("system_name");
		// $("#filtervidoo").attr("dataType",tt);这里需要加一个属性传给后台，说明我要的计算方法；
		$(".packout_three").hide();
		wayDisplay=ft;
		way=obj_way;
        if ($('.addFilterTip')) {
            $('.addFilterTip').remove();
        }
        if (largeObj["chart"+scIndex].fil.way != obj_way) {
            $(".chart_filter").append("<p class='addFilterTip'>*不一致</p>");
        }
	})
}

//点击过滤参数
$("#filter_contentone").click(function(){
	inputHide (".packout_");
   $.ajax({
     url: EPMUI.context.url+'/chart/filterPropertiesByObjectNames',
     type: 'POST',
     dataType: 'json',
     data: {"objectTypeNames":bjtype},//
     success:function(data){
        for (var key in data) {
          //此处如果传了2个就会需要处理一下
          var datas = data[key];
          pullMenuLast(datas);
          selectMenuLast();
        }
     },
     error:function(){
     }
   });
})

//过滤参数的下拉菜单
function pullMenuLast(a){
  $(".packout_").html("");
  $(".packout_").show();
  for(var i=0;i<a.length;i++){
    d3.select(".packout_").append("div").attr("class","packone_").attr("system_name",function(){ return a[i].systemName})
    .text(function(){ return a[i].displayName;}).attr("format",function(){ return a[i].format;})
    .attr("dataType",function(){ return a[i].dataType;});
  }
  let $chartFilterSelect2 = $('.chart_filter .packout_');
  compatible($chartFilterSelect2, 'y');
}

function selectMenuLast(){
  $(".packone_").click(function() {
    var ft = $(this).text();
    var tt = $(this).attr("dataType");
    var sp = $(this).attr("format");
    var go = $(this).attr("system_name");
    $("#filter_contentone").val(ft);
    $("#filter_contentone").attr("dataType",tt);
    $("#filter_contentone").attr("format",sp);
    $("#filter_contentone").attr("system_name",go);
    // guolvcanshu = $(this).attr("system_name");
    // $("#filter_contenttwo").placeholder = $(this).system_name;
    $(".packout_").hide();
    $(".packone_").remove();
    switch($("#filter_contentone").attr("dataType"))
        {
          case "string":$("#filter_contenttwo").attr("placeholder",'');
                        $("#filter_contenttwo").show();
                        $('.filter_numdate_one').hide();
                        $('.filter_numdate_two').hide();
                        $('.filter_numdate_middle').hide();
                        $("#filter_contenttwo").click(function(){
 	                    	$(".filter_notice").hide();   
 	                    })
                        $.ajax({
                          type:"POST",
                          url:EPMUI.context.url+'/chart/hints',
                          dataType:"json",
                          data:{"objectType":objectType,"property":go,"maxAmount":2},//JSON.stringify({"objectType":objectType,"property":prop,"maxAmount":2}),
                          success:function(data){
                            hintsText = data.join(","); 
                            hintsText="例如:"+ hintsText;
                            $("#filter_contenttwo").attr("placeholder",hintsText);  
                          }
                        })                        
          break;
          case "date":$("#filter_contenttwo").hide();
                      $('.filter_numdate_one').css('display', 'inline-block');
                      $('.filter_numdate_two').css('display', 'inline-block');
                      $('.filter_numdate_middle').css('display', 'inline-block');
                      $(".filter_numdate_one").click(function(){ $(".filter_notice").hide()});
                      $(".filter_numdate_two").click(function(){ $(".filter_notice").hide()});
                      $.ajax({
                          type:"POST",
                          url:EPMUI.context.url+'/chart/hints',
                          dataType:"json",
                          data:{"objectType":objectType,"property":go,"maxAmount":2},//JSON.stringify({"objectType":objectType,"property":prop,"maxAmount":2}),
                          success:function(data){
                            hintsText = data.join(","); 
                            hintsText="例如:"+ hintsText;
                            $(".filter_numdate_one").attr("placeholder",hintsText);  
                            $(".filter_numdate_two").attr("placeholder",hintsText);  
                          }
                        })

                      // if(sp=="yyyy-MM-dd"){
                      // 	d3.select(".chart_filter").append("input").attr("class","filter_numdate_one").attr("placeholder","2017-01-01");
                      //     d3.select(".chart_filter").append("input").attr("class","filter_numdate_two").attr("placeholder","2017-01-01");
                      //     $(".filter_numdate_one").click(function(){ $(".filter_notice").hide()});
                      //     $(".filter_numdate_two").click(function(){ $(".filter_notice").hide()});
                      // }
                      // if(sp=="yyyy-MM-dd HH:mm:ss"){  
                      // 	d3.select(".chart_filter").append("input").attr("class","filter_numdate_one").attr("placeholder","yyyy-MM-dd HH:mm:ss");
                      //     d3.select(".chart_filter").append("input").attr("class","filter_numdate_two").attr("placeholder","yyyy-MM-dd HH:mm:ss");
                      // }
                      // if(sp=="HH:mm:ss"){
                      // 	d3.select(".chart_filter").append("input").attr("class","filter_numdate_one").attr("placeholder","HH:mm:ss");
                      //     d3.select(".chart_filter").append("input").attr("class","filter_numdate_two").attr("placeholder","HH:mm:ss");
                      // }


                     
          break;
          case "boolean":$("#filter_contenttwo").show();
                        $('.filter_numdate_one').hide();
                        $('.filter_numdate_two').hide();
                        $('.filter_numdate_middle').hide();
                  $("#filter_contenttwo").click(function(){

          	        arr_data=[{display_name:"是",
          	                   system_name:"true"},
          	                  {display_name:"否",
          	                   system_name:"false"}];
               	    for(var i=0;i<arr_data.length;i++){
           	            d3.select(".packout_three").append("div").attr("class","packone_").attr("system_name",function(){ return arr_data[i].system_name;})
           	              .text(function(){ return arr_data[i].display_name;});
                      }
                    let $chartFilterSelect3 = $('.chart_filter .packout_three');
                    compatible($chartFilterSelect3, 'y'); 
	                $(".packone_").click(function() {
	                	var ft = $(this).text();
	                	var cr = $(this).system_name;
	                	$("#filter_contenttwo").val(ft);
	                	$("#filter_contenttwo").attr("system_name",cr);
	                	// $("#filtervidoo").attr("dataType",tt);这里需要加一个属性传给后台，说明我要的计算方法；
	            	    $(".packout_three").hide();
	            });
	   })

          break;
          default:$("#filter_contenttwo").hide();
                  $('.filter_numdate_one').css('display', 'inline-block');
                  $('.filter_numdate_two').css('display', 'inline-block');
                  $('.filter_numdate_middle').css('display', 'inline-block');
                  $(".filter_numdate_one").click(function(){ $(".filter_notice").hide()});
                  $(".filter_numdate_two").click(function(){ $(".filter_notice").hide()});

        }

  });
}

//选好过滤参数时，给对应过滤值的填写提供例子
var hintsText="";
function hints (prop){
}

//过滤值，用户手输，不同的dataType类型，显示不同的输入框
//点击添加按钮，会创建一个div放到frame中，内容就是过滤参数和过滤值得字符串拼接
var filter_index;
$(".filter_addbtn").click(function(){
  //过滤值,正则判断,错了，就提示红字
  // filter_index = index+1;
  var filter_parameter_type = $("#filter_contentone").attr("dataType");
  var str = $("#filter_contenttwo").val();
  var str1 = $(".filter_numdate_one").val();
  var str2 = $(".filter_numdate_two").val();
  switch($("#filter_contentone").attr("dataType")){
  	case "string":
  	              IsChinese(str);
  	break;
  	case "date"://IsDate(str1,str2);
  	           var mp = $("#filter_contentone").attr("format");
  	           if(mp=="yyyy-MM-dd"){
                  reg = /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
  	           }
  	           if(mp=="yyyy-MM-dd HH:mm:ss"){
                  reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
               }
  	           if(mp=="HH:mm:ss"){
                  reg=/^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/;
               }
               if(mp=="HH:mm"){
                  reg=/^((20|21|22|23|[0-1]\d)\:[0-5][0-9])?$/;
               }
               IsDate(str1,str2);
  	break;
  	case "boolean":IsBoolean();

  	break;

  	case "long"||"short"||"int":IsInt(str1,str2);
  	break;

  	case "byte":IsByte(str1,str2);
  	break;

  	case "float"||"double":IsFloat(str1,str2);
  	break;
  	default:IsInt(str1,str2);
  }
  
})

var filter_pass=[];//参数，要传给后台的
function IsChinese(str){
  // reg=/^[\u0391-\uFFE5a-zA-Z]+$/;
  if(str.length==0){
      $(".filter_notice").text("*输入参数不能为空").show();
  }else{
  	filter_group.propertyName=$("#filter_contentone").attr("system_name");
	   filter_group.dataType=$("#filter_contentone").attr("dataType");
	   filter_group.leftValue=$("#filter_contenttwo").val();
	   var add_text = $("#filter_contentone").val()+"_"+$("#filter_contenttwo").val();
  	d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	     .attr("pass", JSON.stringify( filter_group ))
	     .attr("dataType",$("#filter_contentone").attr("system_name"));
      //删除小框框的div
	   d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	   $(".bit_delete").click(function(){
	   	$(this).parent().remove();
	   })
    //let $chartFilterAddBox = $(".filter_add_frame");
    //compatible($chartFilterAddBox, 'y');
  }
};
//给每个小快快都添加一个属性，属性值是要传的参，最后遍历所有留下来div，把属性付给传参数组
function IsBoolean(){
	filter_group:propertyName=$("#filter_contentone").attr("system_name");
	filter_group:dataType=$("#filter_contentone").attr("dataType");
	filter_group:leftValue=$("#filter_contenttwo").attr("system_name");
	var add_text = $("#filter_contentone").val()+"_"+$("#filter_contenttwo").val();
	d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	  .attr("pass",JSON.stringify( filter_group )).attr("filter_index",function(){ return filter_index})
	  .attr("dataType",function(){ return $("#filter_contentone").attr("system_name");});
    //删除小框框的div
	d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	$(".bit_delete").click(function(){
		$(this).parent().remove();
	})
    //let $chartFilterAddBox = $(".filter_add_frame");
    //compatible($chartFilterAddBox, 'y');
}
function IsByte(str1,str2){
  if(str1.length!=0&&str1.length!=0){
      var reg=/^[0-9]*$/;
      if(!reg.test(str1)||!reg.test(str2)){
          $(".filter_notice").text("*输入参数格式不正确").show();
      }else{
      	var num1 = Number(str1);
      	var num2 = Number(str2);
      	if((-128<num1<127)&&(-128<num2<127)){
      		filter_group.propertyName=$("#filter_contentone").attr("system_name");
	          filter_group.dataType=$("#filter_contentone").attr("dataType");
	          filter_group.leftValue=$(".filter_numdate_one").val();
	          filter_group.rightValue=$(".filter_numdate_two").val();
	          var add_text = $("#filter_contentone").val()+"_"+$(".filter_numdate_one").val()+"~"+$(".filter_numdate_two").val();
	          d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	            .attr("pass",JSON.stringify( filter_group ));

              //删除小框框的div
	          d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	          $(".bit_delete").click(function(){
	          	$(this).parent().remove();
	          })
              //let $chartFilterAddBox = $(".filter_add_frame");
              //compatible($chartFilterAddBox, 'y');

      	}else{
      		$(".filter_notice").text("*输入参数格式不正确").show();
      	}


      }
  }
};
function IsInt(str1,str2){
  if(str1.length!=0&&str1.length!=0){
      var reg=/^[0-9]*$/;
      if(!reg.test(str1)||!reg.test(str2)){
          $(".filter_notice").text("*输入参数格式不正确").show();
      }else{
      		filter_group.propertyName=$("#filter_contentone").attr("system_name");
	          filter_group.dataType=$("#filter_contentone").attr("dataType");
	          filter_group.leftValue=$(".filter_numdate_one").val();
	          filter_group.rightValue=$(".filter_numdate_two").val();
	          var add_text = $("#filter_contentone").val()+"_"+$(".filter_numdate_one").val()+"~"+$(".filter_numdate_two").val();
	          d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	            .attr("pass",JSON.stringify( filter_group ));
	            // .attr("dataType",function(){ return $("#filter_contentone").attr("system_name");})
              //删除小框框的div
	          d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	          $(".bit_delete").click(function(){
	          	$(this).parent().remove();
	          })
              //let $chartFilterAddBox = $(".filter_add_frame");
              //compatible($chartFilterAddBox, 'y');
      	}
      }
};
function IsFloat(str1,str2){
  if(str1.length!=0&&str1.length!=0){
      // reg=/^(-?\\d+)(\.\d+)?$/;
      var reg = /^[0-9]+(.[0-9]{1,3})?$/;
      if(!reg.test(str1)||!reg.test(str2)){
          $(".filter_notice").text("*输入参数格式不正确").show();
      }else{
      		filter_group.propertyName=$("#filter_contentone").attr("system_name");
	          filter_group.dataType=$("#filter_contentone").attr("dataType");
	          filter_group.leftValue=$(".filter_numdate_one").val();
	          filter_group.rightValue=$(".filter_numdate_two").val();
	          var add_text = $("#filter_contentone").val()+"_"+$(".filter_numdate_one").val()+"~"+$(".filter_numdate_two").val();
	          d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	            .attr("pass",JSON.stringify( filter_group ));
              //删除小框框的div
	          d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	          $(".bit_delete").click(function(){
	          	$(this).parent().remove();
	          })
              //let $chartFilterAddBox = $(".filter_add_frame");
              //compatible($chartFilterAddBox, 'y');
      	}
      }
};
var reg
function IsDate(str1,str2){
  if(str1.length!=0&&str2.length!=0){
      //reg = /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
      if(reg.test(str1)&&reg.test(str2)){
      	filter_group.propertyName=$("#filter_contentone").attr("system_name");
	      filter_group.dataType=$("#filter_contentone").attr("dataType");
	      filter_group.leftValue=$(".filter_numdate_one").val();
	      filter_group.rightValue=$(".filter_numdate_two").val();
	      var add_text = $("#filter_contentone").val()+"_"+$(".filter_numdate_one").val()+"~"+$(".filter_numdate_two").val();
	      d3.select(".filter_add_frame").append("div").attr("class","filter_add_bit").text(add_text)
	        .attr("pass",JSON.stringify( filter_group ))
	        .attr("dataType",function(){ return $("#filter_contentone").attr("system_name");});
	      //删除小框框的div
	      d3.selectAll(".filter_add_bit").append("div").attr("class","bit_delete icon-close-circle-blue");
	      $(".bit_delete").click(function(){
	      	$(this).parent().remove();
	      })
          //let $chartFilterAddBox = $(".filter_add_frame");
          //compatible($chartFilterAddBox, 'y');
      }else{
      	$(".filter_notice").text("*输入参数格式不正确").show();
      }
  }
}
// function IsDateTime(str){
//     if(str.length!=0){
////         var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
//         var r = str.match(reg);
//         if(r==null)
//         alert('对不起，您输入的日期格式不正确!');

//     }else{
//         	guolvzhi.push(str);
//         }
// }
// function IsTime(str){
//     if(str.length!=0){
//     reg=/^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/
//         if(!reg.test(str)){
//             alert("对不起，您输入的日期格式不正确!");
//         }else{
//         	guolvzhi.push(str);
//         }
//     }
// }
//"PERSONAL_BRITHDAY": ["", "1990-03-02"]
var deal_ids=[];
//处理data_two变量，获得过滤得到的全部ids,我要的ids是数组
function getids (a){
	deal_ids=[];
	for(var i=0;i<a.length;i++){
		if(a[i].yValue!=0){
		Array.prototype.push.apply(deal_ids, a[i].objectIds);
	    }
    }
}

//全新统计.全新统计可以改变information_one,但是可以通过过滤条件再变回到原来的数据
$("#filter_start_new").click(function(){
	//之前过滤过，ids就要变成过滤后的结果，以实现在现在图的基础上进行过滤
	//选择的若不是当前数据，数据集范围就是空，到后台没有限制就是全部数据
	$("#bigguolu").addClass('icon-filter').removeClass('icon-filter-blue');
  if(filtermark!==1){
		obj_ids=[];
	}
	var ft="";
  filter_pass = [];
	$('.filter_add_frame>div').each(function(i){
	 	var dp = JSON.parse($(this).attr("pass"));
		filter_pass.push(dp);
		ft = $(this).text()+" " +ft;
	});
    function setFil (obj){
    	obj.fil.dataScope=[];
    	obj.fil.dataScope.push(dataScope);
    	obj.filDis.dataScope=[];
    	obj.filDis.dataScope.push(ScopeDisplay);
      obj.fil.filter=[];
		  obj.fil.filter.push(filter_pass);
		  obj.filDis.filter=[];
      var dft=[];
      dft.push(ft)
		  obj.filDis.filter.push(dft);
		  obj.fil.statistics=[];
		  obj.fil.statistics.push(obj_statistics);
		  obj.filDis.statistics=[];
		  obj.filDis.statistics.push(obj_statistics_display)
    }
	  setFil(largeObj["chart"+scIndex]);
	ft="";
	mark=0;
	requestDraw();
	retreatDataSave(largeObj["chart"+scIndex]);
	showMessage();	 
});
//叠加统计
$("#filter_start_old").click(function(){

	//叠加统计只能做与上一次同样的操作，这样可以保证，只有一个y轴
	$("#bigguolu").addClass('icon-filter').removeClass('icon-filter-blue');
  
	  if(largeObj["chart"+scIndex].fil.way!=obj_way){
     $(".chart_filter").append("<p class='addFilterTip'>*不一致</p>");
     }else{
     	go();
     }
	   
	    
    function go(){
    	mark=1;
      if(filtermark!==1){
	    	obj_ids=[];
	    }
	    var fp="";
      var pp = [];
      filter_pass = [];
        $('.filter_add_frame>div').each(function(i){
	       	var dp = JSON.parse($(this).attr("pass"));
	      	filter_pass.push(dp);
	      	fp = $(this).text()+" " +fp;
	      });
        pp.push(fp);
        function setFil2 (obj){
        	obj.fil.dataScope.push(dataScope);
          obj.filDis.dataScope.push(ScopeDisplay);
	    	  obj.fil.filter.push(filter_pass);
	    	  obj.filDis.filter.push(pp);
	    	  obj.fil.statistics.push(obj_statistics);
          obj.filDis.statistics.push(obj_statistics_display);
        }
	    setFil2(largeObj["chart"+scIndex]);
	    fp="";
        
    requestDraw();
    retreatDataSave(largeObj["chart"+scIndex]);
    showMessage();
    }//go函数的结尾
});
//取消
$("#filter_cancel").on("click",function(){
  $("#bigguolu").addClass('icon-filter').removeClass('icon-filter-blue');
	setEmpty();
});
//全新统计调用时，函数传一个参数作为标志，存储画图数据用赋值，
//叠加统计存储数据用push
function requestDraw (){   
	kinds = largeObj["chart"+scIndex].kinds;
    level = largeObj["chart"+scIndex].fil.level;
    refer_class = largeObj["chart"+scIndex].fil.referClass;
    cont = largeObj["chart"+scIndex].fil.cont
	var ppj = {
	  "objectIds":obj_ids,
	  "dimensionProperty":cont,
	  "level":level,
	  "dimensionReferClass":refer_class,
	  "objectName":obj_obj,
	  "operationProperty":obj_statistics,
	  "operation":obj_way,
    "filters":filter_pass
	}
    ooj = ppj;
  $.ajax({
  	type:"POST",
  	url:EPMUI.context.url+'/chart/chartData',
  	dataType:"json",
  	data:{
  		operationDataString: JSON.stringify(ppj)
  	},
  	success:function(data){
          debugger
  		if(!data || data==false || data==null || JSON.stringify(data[0])=="{}"){
  			var tmpStr = "<div class='draw_warn'><p>没有符合统计条件的数据！</p><button>确定</button></div>"
  			$("#draw_out").append(tmpStr);
            $(".draw_warn button").click(function(){
              $(".draw_warn").remove();
            })
  		}else{
            $("#dv4 svg").remove();
  			if(way=="percent"){
	    	    for(var i=0;i<data.statisticalItems.length;i++){
	    	    	if(data.statisticalItems[i].yValue!=0){
	    	    		data.statisticalItems[i].yValue=data.statisticalItems[i].yValue.replace("%","");
	        		}
	        	}
	        	data.yName=data.yName+"%";
	        }
            if(mark==0){//全新统计
              largeObj["chart"+scIndex].information=[];
              largeObj["chart"+scIndex].information.push(data);
              largeObj["chart"+scIndex].informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].information));
              
              information = largeObj["chart"+scIndex].information;
              largeObj["chart"+scIndex].chartFCNow=[];
              largeObj["chart"+scIndex].chartFCNow.push(Object.assign({},ppj));
              largeObj["chart"+scIndex].chartFCPastAll.push(Object.assign([],largeObj["chart"+scIndex].chartFCNow));
                
            }else{
              dealWithData(largeObj["chart"+scIndex].information,data);//处理数据是为了让其长度相等,拿之前的某一个和最后一个比较就行
              largeObj["chart"+scIndex].information.push(data);
              largeObj["chart"+scIndex].informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].information))
              information = largeObj["chart"+scIndex].information;
              largeObj["chart"+scIndex].chartFCNow.push(Object.assign({},ppj));
              largeObj["chart"+scIndex].chartFCPastAll.push(Object.assign([],largeObj["chart"+scIndex].chartFCNow));
                	
            }
            largeObj["chart"+scIndex].kinds=="yz" ? bar(information,"draw") : (largeObj["chart"+scIndex].kinds=="zx" ? line(information,"draw") : pie(information,"draw"));
            tableShow(information);
            if($('.table').css('display') == 'block'){
                $('.xname').remove();
                $('.yname').remove();
            }
            showMessage (); 
            setEmpty(); 
  	        
  		}
  	},
    error:function(err){
        var tmpStr = "<div class='draw_warn'><p>没有符合统计条件的数据！</p><button>确定</button></div>"
  		$("#draw_out").append(tmpStr);
        $(".draw_warn button").click(function(){
            $(".draw_warn").remove();
        })
    }
  }) 
}
function setEmpty(){
	$(".chart_filter").hide();
	$("#filterfenlei").attr("placeholder","");
	$("#filtertype").val("");
	$("#filtervidoo").val("");
	$("#filterway").val("");
	$(".filter_numdate_one").val("");
	$(".filter_numdate_two").val("");
  $(".filter_add_bit").remove();
	$("#filter_contentone").val("");
	$("#filter_contenttwo").val("");
	$(".packone_").remove();

  $("#filteralldata").addClass('icon-hollow-circle').removeClass('icon-dot-circle');
  $("#filterpresentdata").addClass('icon-dot-circle').removeClass('icon-hollow-circle');

	filter_pass=[];
	obj_ids=[];
	bjtype=[];
	mark=0;
	$(".filter_presentdata").addClass('chart_active_color').removeClass('chart_color_default');
	$(".filter_alldata").addClass('chart_color_default').removeClass('chart_active_color');
}

//过滤参数，过滤值的汉字，可能是多个；
// 展示图表参数大图的时候执行这个函数
window.showMessage=function (){
	$("#topology_message_box").hide();
	$("#topology_message_chart").show();
	$("#message_chart_content").html("");
	var tabName = ["一级统计","二级统计","三级统计","四级统计","五级统计","六级统计","七级统计","八级统计"];
	var color =  ["#f57983","#a1f480","#591ece","#10a8ab"];
	var str="";
	for(var i=0;i<largeObj["chart"+scIndex].information.length;i++){
		var str =str + "<div class='content"+i+"'><div class='titleSmall'><span>"+tabName[i]+"</span><span style='display:inline-block;background-color:"+color[i]+"'></span></div><p>数据范围：<span></span></p><p>统计范畴：<span></span></p><p>对象类型：<span></span></p><p>维度：<span></span></p><p>统计项：<span></span></p><p>统计方法：<span></span></p><p>过滤条件：<span></span></p></div>" ;         
	}
    $("#message_chart_content").html(str);
    let $chartMesBox = $("#message_chart_content");
    compatible($chartMesBox, 'y');
	for(var i=0;i<largeObj["chart"+scIndex].information.length;i++){
		$(".content"+i+" p span:eq(0)").text(largeObj["chart"+scIndex].filDis.dataScope[i])
		$(".content"+i+" p span:eq(1)").text(largeObj["chart"+scIndex].filDis.classify)
		$(".content"+i+" p span:eq(2)").text(largeObj["chart"+scIndex].filDis.typee)
		$(".content"+i+" p span:eq(3)").text(largeObj["chart"+scIndex].filDis.cont)
		$(".content"+i+" p span:eq(4)").text(largeObj["chart"+scIndex].filDis.statistics[i])
		$(".content"+i+" p span:eq(5)").text(largeObj["chart"+scIndex].filDis.way)
		$(".content"+i+" p span:eq(6)").text(largeObj["chart"+scIndex].filDis.filter[i])
	}	
}

};

chartprobeF();




})