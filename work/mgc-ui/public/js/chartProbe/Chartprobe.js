$(function(){
    var m,
        t,
        w,//svg宽
        h,
        w1,
        padding,
        rectWidth,
        dataa,//画图数据进入函数深拷贝
        top, 
        left, 
        data = {},
        mation = [], 
        ww = $("#dv4").width()*0.85,
        hh = $("#dv4").height()*0.80,
        //cbjtype = "entity", //维度分类
        cbjtype = "",
        cbjtypeDis = '',
        flag = 0, 
        objs = {},//全部维度        
        offsetDivInd = 0,//记录轮播图可视区的第一个盒子在整个list中的索引
        isFinished = true,
        tiptext = ["小图","柱状图","圆饼图","折线图","表格","过滤","回退","导入","导出","快照"];//大图button提示
        //因为用的ES6啥的，window的对象声明必须赋值个初值
        window.chartSizeS = true;
        window.large = 0;  
        window.kinds = "";
        window.ooj = new Object();//后台请求的传参
        //英文
        window.dataScope = null;//2代表全部数据
        window.classify = null;//数字表示分类 
        window.type_system = "";//分类英文
        window.cont = null;//维度
        window.statistics = "*";
        window.way = "count";
        window.filter = [];
        window.refer_class = "";//下钻的参考体系，有的有，有的无  
        window.level = null;//数字类型
        //中文
        window.ScopeDisplay = "全部数据";
        window.classifyDisplay = "";
        window.type_display = "";
        window.contDisplay = "";
        window.statisticsDisplay = "*";
        window.wayDisplay = "计数";
        window.filterDisplay = [];//array是引用类型，会改变后会影响
        window.largeObj = {};
        window.scIndex = 0;
        window.chartMainHtml = "";
    
    //页面回退加载缓存数据
    // if (sessionStorage.getItem("chartMainHtmlData")) {
    //     largeObj = JSON.parse(sessionStorage.getItem("chartLargeObj"));
    //     flag = Number(sessionStorage.getItem("chartFlag"));
    //     scIndex = Number(sessionStorage.getItem("scIndexData"));
    //     chartMainHtml = sessionStorage.getItem("chartMainHtmlData");
    //     $(".chart_main").html(chartMainHtml);
    //     // mouseWheel:true,
    //     // scrollButtons:{
    //     //     enable:true
    //     // },
    //     // advanced:{ 
    //     //     updateOnContentResize:true
    //     // }
    //     if($(".topo_smallchart")){
    //         let $chartBoxSList = $('.topo_smallchart');
    //         for(var i=1;i <= $chartBoxSList.length; i++){          
    //             try{
    //               !!$('#schart'+i).data("mCS") &&  $('#schart'+i).mCustomScrollbar("destroy"); //Destroy
    //             }catch (e){
    //               $('#schart'+i).data("mCS",''); //手动销毁             
    //             };
    //             $('#schart'+i).mCustomScrollbar({
    //                 theme: Magicube.scrollbarTheme,
    //                 autoHideScrollbar: true, 
    //                 axis: 'x'
    //             });
    //         }
    //         // $chartBoxS.mCustomScrollbar("update");
    //     }    
    //     if($("#draw_box").find('svg')){
    //         let $chartBoxB = $("#draw_box");                   
    //         $chartBoxB.mCustomScrollbar({
    //             theme: Magicube.scrollbarTheme,
    //             autoHideScrollbar: true,
    //             axis: 'x'
    //         });
    //         // $chartBoxB.mCustomScrollbar("update");
    //     }          
    //     chartprobeF();
    //     sessionStorage.getItem("chartSizeSData") === "false" ? chartSizeS = false : chartSizeS = true;
    //     if (!chartSizeS) {
    //         if (largeObj["chart"+scIndex].kinds == "yb") {
    //            $(".yname").remove();
    //            $(".xname").remove();
    //         }
    //         else {
    //             changeXY(largeObj["chart"+scIndex].information[0]);
    //         }
    //     }
    //     smallChartBtnCut();  
    // }
    
    //页面跳转时的数据缓存
    // window.sessionStorageDataSave = function(){
    //     if( $('.topo_smallchart').length>0 ){
    //         for(var i=1;i <= $('.topo_smallchart').length; i++){          
    //             try{
    //               !!$('#schart'+i).data("mCS") &&  $('#schart'+i).mCustomScrollbar("destroy"); //Destroy
    //             }catch (e){
    //               $('#schart'+i).data("mCS",''); //手动销毁             
    //             };
    //             // $chartBoxS.removeClass('mCS_destroyed');
    //             // $chartBoxS.css({'overflow-x':'auto', 'overflow-y':'hidden'});
    //         }         
    //     }
    //     if($("#draw_box").find('svg')){
    //         let $chartBoxB = $("#draw_box");       
    //         try{
    //           !!$chartBoxB.data("mCS") && $chartBoxB.mCustomScrollbar("destroy"); //Destroy
    //         }catch (e){
    //           $chartBoxB.data("mCS",''); //手动销毁             
    //         };
    //     }
    //     chartMainHtml = $(".chart_main").html();
    //     sessionStorage.setItem("chartMainHtmlData", chartMainHtml);
    //     sessionStorage.setItem("chartLargeObj", JSON.stringify(largeObj));
    //     sessionStorage.removeItem("scIndexData");
    //     sessionStorage.setItem("scIndexData", scIndex.toString());  
    //     sessionStorage.setItem("chartSizeSData", chartSizeS.toString());
    // }
    
    //页面跳转，缓存数据，点击#user下的div触发事件
    // $("#user").on("click", 'div', function() {
    //     sessionStorage.removeItem("chartMainHtmlData"); //移除集合缓存数据
    //     sessionStorage.removeItem("chartLargeObj"); 
    //     sessionStorageDataSave();
    // })
    
    //顶部导航栏点击事件
    // $("#selectBar").click(function(e) {
    //     if (e.target.className.slice(0, 13) === 'selectBar_div') {
    //         sessionStorage.removeItem("chartMainHtmlData"); //移除集合缓存数据
    //         sessionStorage.removeItem("chartLargeObj"); 
    //         sessionStorageDataSave();
    //     }
    // })
    
    //点击改变header栏图标颜色
    if(localStorage.getItem("topologyType") === 'chart') {
        $("#go_topo").removeClass("selectBar_selected");
        $("#go_map").removeClass("selectBar_selected");
        $("#go_chart").addClass("selectBar_selected");
        $("#toolsBar").hide();
    }
    
    dimensionEveryClick();
    
    //魔方初始化动画
    (function moveInit() {
        $(".chart_magic").css({"transition": "top 1.3s ease", "top": "0px"});
        $(".chart_magic_out").css({"transition": "opacity 1.3s ease", "opacity": 1});
        setTimeout(function(){
            $(".threed_circle_one span").css({"opacity": "0", "transition":"opacity 1s ease", "opacity":"0.5"});
            $(".threed_circle_two span").css({"opacity":"0", "transition":"opacity 1s ease", "opacity":"0.5"});
            $(".threed_circle_three span").css({"opacity":"0", "transition":"opacity 1s ease", "opacity":"0.5"});
            $(".threed_circle_one").css({"top":"41%","transition":"top 1s ease","top":"21%"});
            $(".threed_circle_two").css({"top":"51%","transition":"top 1s ease","top":"31%"});
            $(".threed_circle_three").css({"top":"60%","transition":"top 1s ease","top":"40%"});
            $(".magic_shadow_middle").css({"top":"38px","transition":"top 1.1s ease","top":"1px"});
        }, 200)
        setTimeout(function(){
            $(".magic_shadow_bottom").css({"top":"62px", "transition":"top 1.1s ease", "top":"25px"});
        }, 400);          
    }());
    
    //魔方鼠标进入动画
    function move() {
        var xx = 0, yy = 0, xArr = [], yArr = [], yyy, xxx;
        //这句话得到的是一个数组。即使只有一个dom用了这个类，也要说明，要这个数组的第几个
        var domm = document.getElementsByClassName("chart_magic_out")[0];
        domm.onmouseover = function(e) {
            xArr[0] = e.clientX/2;
            yArr[0] = e.clientY/2;
            //document是当前页面，window就会是全局，哪里都执行
            document.onmousemove = function(e) {
                xArr[1] = e.clientX/2;
                yArr[1] = e.clientY/2;
                yy += xArr[1] - xArr[0];
                xx += yArr[1] - yArr[0];
                yyy = (-yy)/10;
                xxx = (-xx)/10;
                $(".chart_magic_out").css("transform",("translatex("+yyy+"px) translatey("+xxx+"px)"));
                $(".threed_circle_one").css("transform",("translatex("+yyy+"px) translatey("+xxx+"px)"));
                $(".threed_circle_two").css("transform",("translatex("+yyy+"px) translatey("+xxx+"px)"));
                $(".threed_circle_three").css("transform",("translatex("+yyy+"px) translatey("+xxx+"px)"));
                xArr[0] = e.clientX/2;
                yArr[0] = e.clientY/2;
            }
            document.onmouseout = function() {
                document.onmousemove = null;
            }
        }
    }
    move();
    
    //跳转到gis和topo的button
    (function redirectButton(){
        $("#goTopo").on("click", function(){
            // sessionStorage.removeItem("chartMainHtmlData"); //移除集合缓存数据
            // sessionStorage.removeItem("chartLargeObj"); 
            // sessionStorageDataSave();    
            localStorage.setItem("topologyType", "topo")
            location.href = '/topology';
        })
        $("#goGis").on("click", function(){
            // sessionStorage.removeItem("chartMainHtmlData"); //移除集合缓存数据
            // sessionStorage.removeItem("chartLargeObj"); 
            // sessionStorageDataSave();
            fetch(EPMUI.context.url + '/object/gis/passport')
              .then((res) => res.json())
              .then((data) => {
                // 验证授权
                if (data.code && data.code === 407) {
                  // showAlert( "提示", data.message, "#ffc000" );
                  $("#page_alert_title").html('提示').css("color", '#ffc000');
                  $("#page_alert_content").html(data.message);
                  $("#page_alert").show();
                  return;
                }
                localStorage.setItem("topologyType", "gis");
                location.href = '/gisPlatform';
              });   
        })
    })();
    //redirectButton();
        
    //页面加载，请求数据 人员库(0)物品库(9)案件库(0)地址库(0)组织库(0)文档(0)事件(0),body:fromData
    (function getRoot () {
        var rootObj, 
            rootClassify = [],
            str = '',
            iconSet = ['icon-chart-person','icon-entity-white','icon-chart-case','icon-chart-place','icon-chart-org','icon-document-white','icon-event'];           
        fetch(EPMUI.context.url+'/chart/allDimensions', {method:'POST'})//ByNewClass
        .then(response => response.json())
        .then( (data) =>{
            for(var k in data){
                rootObj = {'classfiySystem': k, 'classfiyDisplay': data[k].display_name || ''};
                rootClassify.push(rootObj);
            }            
            for(var i = 0; i < rootClassify.length; i++) {
                //str += `<button class='${iconSet[i]}' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}></button>`;
                //26.64定制
                // if(rootClassify[i].classfiySystem=='ENTITY'){
                //     str += `<button class='icon-chart-Entity' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}>                               
                //             </button>`;
                // }else if(rootClassify[i].classfiySystem=='CASE'){
                //     str += `<button class='icon-chart-Case' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}>                               
                //             </button>`;
                // }else if(rootClassify[i].classfiySystem=='ORG'){
                //     str += `<button class='icon-chart-Org' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}>                               
                //             </button>`;
                // }else if(rootClassify[i].classfiySystem=='THING'){
                //     str += `<button class='icon-chart-Thing' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}>                               
                //             </button>`;
                // }

                if(rootClassify[i].classfiySystem=='Entity'){
                    str += `<button class='icon-chart-Entity' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}>                               
                            </button>`;
                }else{               
                    str += `<button class='icon-chart-${rootClassify[i].classfiySystem}' systemname=${ rootClassify[i].classfiySystem} displayname=${rootClassify[i].classfiyDisplay}></button>`;
                }
            }

            $('.classfiybtnBox').html(str);
            $(".classfiybtnBox button").eq(0).addClass('acti');
            $(".classfiybtnBox button").not('.acti').addClass('bgc_def');
            cbjtype = $(".classfiybtnBox button").eq(0).attr('systemname');
            cbjtypeDis = $(".classfiybtnBox button").eq(0).attr('displayname');
            //把icon的class放到一个数组里
            $(".classfiybtnBox button").click(function() {
                cbjtype = $(this).attr('systemname');
                cbjtypeDis = $(this).attr('displayname');                              
                $(this).removeClass('bgc_def').addClass('acti');
                $(this).siblings('button').removeClass('acti').addClass('bgc_def');
                if ($(this).index() == 0) {
                    $(".classify_in").addClass('conrnerStyleDown').removeClass('conrnerStyleMiddle conrnerStyleUp');
                }
                else if ($(this).index() == 6) {
                    $(".classify_in").addClass('conrnerStyleUp').removeClass('conrnerStyleMiddle conrnerStyleDown');           
                }
                else {
                    $(".classify_in").addClass('conrnerStyleMiddle').removeClass('conrnerStyleUp conrnerStyleDown'); 
                }
                $('.dimension_detial').html('');  
                $('.classify_in').html('');
                magic();
            })
            magic();
        })
        .catch(e => console.log(e))       
    })();
    
    //点击魔方
    $("#chartMagic").on("click", function() {
        $(".chart_magic").animate({"transform": "rotateZ(360deg)"});
        $(".left_line_mask").animate({"left": "-500px"}, "slow");
        $(".classify").slideDown("slow");    
    })
    
    // 授权判断
    window.authJudgment = function( result ) {
      if ( result.code && result.code === 407 ) {
        $("#searchList_main_box").html('');
        $("#searchlist_pagination_box").hide();
        showAlert( "提示", result.message, "#ffc000" );
        return false;
      }
      return true;
    }
    
    //获取全部维度
    window.magic = function() {
        $.ajax({
            url: EPMUI.context.url + '/chart/dimensionsByObjectType',
            type: 'POST',
            data: {
                "objectType": cbjtype
            },
            dataType: 'json',
            error: function(err) {
            },
            success: function (data) {
                objs = data;
                dimensionClass(objs);
            }
        });
    }
    //magic();
    
    //维度切换展示  （根据分类展示出该分类下的全部，维度类别,点击维度类别获得该类别下的全部维度，点击维度）
    function dimensionClass(data) {
        var strDC = "";
        for (var k in data) {
            data[k].display_name;
            strDC += "<span class='dimen_class' system_name='"+k+"'>"+data[k].display_name+"</span>"; 
        }
        strDC = `<h4>${cbjtypeDis}</h4>` +strDC;
        $(".classify_in").html(strDC);
        let $chartClassifyBox = $(".classify_in");
        compatible($chartClassifyBox, 'y');
        $(".dimen_class").on("click", function(){
            $(this).addClass('dimen_class_acti');
            $(this).siblings('span').removeClass('dimen_class_acti');
            var name_ = $(this).attr("system_name");
            $(".right_line_mask").animate({"left": "500px"}, "slow");
            $(".dimension_box").slideDown("slow");
            $(".dimension_detial").html('');
            for (var a in objs) {
                if (a == name_) {
                    var strDimen = "";
                    for (var i = 0; i < objs[a].dimensions.length; i++) {
                        strDimen += "<span class='dimensions_every' type_display='"+objs[a].display_name+"' type_system='"+a+"' refer_class='"+objs[a].dimensions[i].refer_class+"'"+" system_name='"+objs[a].dimensions[i].system_name+"'>"+objs[a].dimensions[i].display_name+"</span>"
                    }
                }
            }
            $(".dimension_detial").html(strDimen);
            let $chartDimensionBox = $(".dimension_detial");
            compatible($chartDimensionBox, 'y');
            dimensionEveryClick();
        });
       
    }
    
    //点击维度
    function dimensionEveryClick() {
        $(".dimensions_every").on("click", function() {    
            if (isFinished) {
                isFinished = false;
                var isExist = false;
                //在此加一个判断，如果这个维度在小图中有，不再重新生成，而是直接滑动到该小图的位置
                for(var i=1; i<=flag; i++){
                    if( largeObj["chart"+i].fil.cont == $(this).attr("system_name") ){
                        isExist = i;
                    }
                }
                if(isExist){
                    if ( ($(".chart_slideshow_list>div").length - isExist) < 3) {
                        var maxLeft = ($(".chart_slideshow_list>div").length - 3) * $(".chart_slideshow_window").width() * 0.34;
                        maxLeft = 0 - maxLeft;
                        $(".chart_slideshow_list").animate({"left":maxLeft+"px"}, "slow");
                        offsetDivInd = $(".chart_slideshow_list>div").length - 3;
                    }else if( isExist<=3 ){
                        $(".chart_slideshow_list").animate({"left":"0px"}, "slow");
                        offsetDivInd = 0;
                    }else{
                        var maxLeft = ( isExist - 1) * $(".chart_slideshow_window").width() * 0.34;
                        maxLeft = 0 - maxLeft;
                        $(".chart_slideshow_list").animate({"left":maxLeft+"px"}, "slow");
                        offsetDivInd = isExist - 1;
                    }
                }else{
                    $(this).addClass('dimen_every_acti');
                    $(this).siblings('span').removeClass('dimen_every_acti');
                    //之前的classfiy是0123，代表全部，实体事件文档，后来没有0了
                    //cbjtype=="entity" ? classify=1 : (cbjtype=="event" ? classify=2 :classify=3);//大分类
                    classify = cbjtype;
                    classifyDisplay = cbjtypeDis;
                    type_system = $(this).attr("type_system"); //对象类型
                    type_display = $(this).attr("type_display"); //对象类型(用来显示的汉字)
                    cont = $(this).attr("system_name"); //维度
                    contDisplay = $(this).text(); //维度的汉字
                    refer_class = $(this).attr("refer_class");
                    getSmallChart();
                    if ($(".chart_slideshow_list>div").length > 3) {
                        var maxLeft = ($(".chart_slideshow_list>div").length - 3) * $(".chart_slideshow_window").width() * 0.34;
                        maxLeft = 0 - maxLeft;
                        $(".chart_slideshow_list").animate({"left":maxLeft+"px"}, "slow");
                        offsetDivInd = $(".chart_slideshow_list>div").length - 3;
                    }
                    
                }
                setTimeout(function() { isFinished=true;}, 500);
                                
            }        
        });
    };
    
    //根据维度获取画图数据
    function getDataA(divv){
        $.ajax({
            type: 'POST',
            url:EPMUI.context.url+'/chart/chartData',
            data: {
            operationDataString: JSON.stringify(ooj)
            },
            dataType: 'json',
            success: function (data) {//每次一拿来数据就把字符串转成数字类型
                if(data){
                    $("#"+divv+" p") ? $("#"+divv+" p").remove() : $("#"+divv+"  p");
                    //性能 for(var i=0;i<data.statisticalItems.length;i++){
                    //     data.statisticalItems[i].yValue = Number(data.statisticalItems[i].yValue);
                    // }
                    largeObj["chart"+flag].information.push(data);
                    bar(largeObj["chart"+flag].information,divv);
                    largeObj["chart"+flag].informationPastAll.push(Object.assign([],largeObj["chart"+flag].information));
                    
                }else{
                    $("#"+divv).append("<p class='chartNoDataTip'>该维度暂时无数据</p>");                 
                }
                
            },
            error:function(){
            }
            });
    };
    
    //创建数据对象
    function creatRequestObj(f) {
        largeObj["chart"+f]={"fil":{//保存当前图表生成所用的请求参数信息
                                    "dataScope":[],
                                    "classify":null,
                                    "typee":null,
                                    "cont":null,
                                    "statistics":[],
                                    "way":null,
                                    "filter":[],//数组——数组——对象——键值//存放过滤信息英文
                                    "referClass":null,//参考体系
                                    "level":null,
                                    "levelParent":null
                                },
                                "filDis":{
                                    "dataScope":[],
                                    "classify":null,
                                    "typee":null,
                                    "cont":null,
                                    "statistics":[],
                                    "way":[],
                                    "filter":[]//数组——数组——对象——键值
                                },
                                "drawData":{//存放过往接口请求的英文
                                        "dataScope":[],//数据范围
                                        "classify":[],//分类
                                        "typee":[],//对象
                                        "cont":[],//维度
                                        "statistics":[],//统计项
                                        "way":[],
                                        "filter":[],//数组——数组——对象——键值
                                        "down":[],//记录这一次有没有下钻
                                        "up":[],//记录这次又没有汇聚
                                        "level":[],
                                        "referClass":[],
                                        "levelParent":[]
                                    },
                                "drawDataDis":{
                                        "dataScope":[],
                                        "classify":[],
                                        "typee":[],
                                        "cont":[],
                                        "statistics":[],
                                        "way":[],
                                        "filter":[]//存放过滤信息中文 //存放过往接口请求的中文
                                    },
                                "information":[],//存放当前请求回来的画图数据
                                "informationPastAll":[],//存放过往请求的画图数据的全部
                                "kinds":"yz",
                                "chartFCNow":[],//图表过滤条件当前
                                "chartFCPastAll":[],//图表过滤条件过往所有
                                "chartRequestPara":[],//当前图表请求参数的对象形式英文
                                "index":f,
                                "xVPoint":null,
                                "idhash":null
                            };
        return largeObj;
    }
    
    //生成小图
    function getSmallChart(){
        flag=flag+1;
        statistics="*";
        statisticsDisplay="*";
        way="count";
        wayDisplay="计数";
        level = 1;
        var sChartStr = `<div class="small_chart_out schart_out${flag}" id="sChartOut${flag}">
                            <span class="side_one"></span>
                            <span class="side_two"></span>
                            <span class="side_three"></span>
                            <span class="side_four"></span>
                            <div class="topo_smallchart_middle">
                                    <div class="btn_out" id="btn_out_two">
                                        <div class="btn_two bone icon-bar-chart-blue" ></div>
                                        <div class="btn_two btwo icon-pie-chart" ></div>
                                        <div class="btn_two bthree icon-line-chart" ></div>
                                        <div class="btn_two bfull icon-fullscreen" ></div>
                                    </div>
                                <div class="schart_${flag} topo_smallchart" id="schart${flag}">                  
                                </div>
                            </div>
                        </div>`;
        creatRequestObj(flag); 
        scIndex = flag;     
        ooj={
            "objectName":type_system,//人，植物,字符串
            //"objectIds": ids,//所有的id，邓茂那里拿
            "dimensionProperty": cont, //维度var
            "dimensionReferClass":refer_class,
            "level":1,
            "operation":way
        };
        $("#slideShowList").append(sChartStr);
        //$(".chart_slideshow_list").css("width",($("#sChartOut"+flag).width()*$(".chart_slideshow_list>div").length+$("#sChartOut"+flag).width()*($(".chart_slideshow_list>div").length-1)/16));
        $("#sChartOut"+flag).css("left",$(".chart_slideshow_window").width()*0.34*(flag-1)+"px");
        $("#schart"+flag).fadeIn("slow");
        //按钮不随滚动条而改变位置；用fixed不好，用滚动条事件scrollLeft，一直改变元素的left值；
        // $(".topo_smallchart").scroll(function(){
        //     var le_shift = $(this).scrollLeft()+$(this).width()-61-14;
        //     $(this).children('div').children('div').find(".btn_out").css("left",(le_shift)+"px");//+278
        // });    
        getDataA("schart"+flag);
        filterData(largeObj["chart"+flag]);//传参，先中文，后英文
        retreatDataSave(largeObj["chart"+flag]);
        largeObj["chart"+flag].chartFCNow.push(Object.assign({},ooj));
        largeObj["chart"+flag].chartFCPastAll.push(Object.assign([],largeObj["chart"+flag].chartFCNow));

        smallChartBtnCut();
        sessionStorage.removeItem("chartFlag");
        sessionStorage.setItem("chartFlag",flag.toString());
    
    }
    
    //浏览器窗口大小改变时触发的函数
    $(window).resize(function() {
        var tmpLe = 0-$(".chart_slideshow_window").width()*0.34*offsetDivInd;
        $(".chart_slideshow_list").css("left",tmpLe+"px");
        $(".chart_slideshow_list>div").each(function(i){
            $(this).css("left",$(".chart_slideshow_window").width()*0.34*i+"px");   
        })
        $(".topo_smallchart").scrollLeft(0);
        $(".btn_out").css("right","14px");
        $(".btn_out").css("left","");
    })
    
    //点击轮播图的左右按键
    var cFinished = true;
    $("#prev").on("click", function() {
        if(cFinished){
            cFinished=false;
            var offset = $(".chart_slideshow_window").width()*0.34;
            var box  = document.getElementById("slideShowList");
            var leftP = box.style.left;
            if(leftP!=0)
                leftP = leftP.replace("px","");
            leftP = Number(leftP);
            if((offset+leftP) <= 2 ){
               $(".chart_slideshow_list").animate({"left":(offset+leftP)+"px"},"slow");
                offsetDivInd = offsetDivInd-1;
            }
            if((offset+leftP+offset)>2){
                $("#prev span").css("opacity",0.1);
            }
            $("#next span").css("opacity",1);
            setTimeout(function(){ cFinished=true; },600);
            
        }   
    })
    $("#next").on("click", function() {
        if(cFinished){//防止按钮被多次点击
            cFinished=false;
            var offset = $(".chart_slideshow_window").width()*0.34;
            var box  = document.getElementById("slideShowList");
            //var leftP = parseInt(box.style.left+0);//此处为了字符串变数字
            var leftP = box.style.left;
            if(leftP!=0){
                leftP = leftP.replace("px","");
            }
            Number(leftP);
            var maxLeft = ($(".chart_slideshow_list>div").length-3)*$(".chart_slideshow_window").width()*0.34;
            if(Math.abs(leftP-offset) <= maxLeft){
                //$(".chart_slideshow_list").css("left",(leftP-offset)+"px");
                $(".chart_slideshow_list").animate({"left":(leftP-offset)+"px"},"slow");
                offsetDivInd=offsetDivInd+1;
            }
            if(Math.abs(leftP-offset-offset)>maxLeft){
               $("#next span").css("opacity",0.1); 
            }
            $("#prev span").css("opacity",1);
            setTimeout(function(){ cFinished=true; },600);
        }
       //要加一个防止被多次点击     
    })
    
    //对象数组深拷贝
    window.objDeepCopy = function (source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
            sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
        }
        return sourceCopy;
    }
    
    //小图x轴数据大于三显示省略号！
    var shengluehao = [];
    function shenglue (a) {//传参改为data.statisticalItems
        //不改变原数据，深拷贝
        for(var j=0;j<a.length;j++){
            shengluehao = a;
            var str = a[j].xValue;
            var slen = a[j].xValue.replace(/[^\x00-\xff]/g,"01").length;
            if(slen>6){
                var er = a[j].xValue.substring(0,2)+"..";
                shengluehao[j].xValue = er;
            }
        };
    };
    
    var ws;
    function variaDeal(a, divv) {
        mation=[];  
        $.extend(true,mation,a);
        dataa = mation[0].statisticalItems;
        if(chartSizeS){
            ws = $("#schart1").width();
            h = $("#schart1").height();
            //h = 170;
            padding={left:40,right:60,top:70,bottom:30};
            rectWidth = 15;
            w =  50*dataa.length+15*dataa.length*(mation.length-1);
            ws>w ? w=ws :w=w;
            // if(dataa.length>7){
            //     w = 50*dataa.length+15*dataa.length*(mation.length-1);
            // }else{
            //     w =340+15*dataa.length*(mation.length-1);
            // }
        }else{
            h = hh;
            padding = {left:70,right:90,top:90,bottom:80};
            rectWidth = 20;
            var temp=0;
            var ytemp=0;
            for(var j=0;j<dataa.length;j++){
                var ylen = dataa[j].yValue.toString().length;
                ylen>ytemp ? ytemp=ylen : ytemp;
            }
            padding.left=  70 < 8*ytemp ? 8*ytemp : 70 ;    
            // var tempWidth = ww;
            // w = tempWidth > dataa.length*80 ? tempWidth : dataa.length*80;
            if(dataa.length>15){
                w = 70*dataa.length;
                for(var j=0;j<dataa.length;j++){
                    var slen = dataa[j].xValue.replace(/[^\x00-\xff]/g,"01").length;
                    if(slen>temp){
                        temp = slen;
                    }
                }
                if(temp>10){
                    w = temp*7*dataa.length+20*dataa.length*(mation.length-1);
                }
            }else{
                w=ww;
                for(var j=0;j<dataa.length;j++){
                    var slen = dataa[j].xValue.replace(/[^\x00-\xff]/g,"01").length;
                    if(slen>temp){
                        temp = slen;
                    }
                }
                if(temp>10){
                    (temp*7*dataa.length)>ww?(w=temp*7*dataa.length):(w=ww);
                }
                w = w+20*dataa.length*(mation.length-1)
            }
        }
        var w_ = w+130;
        // $("#draw_in").css("width",w_);
        // $("#draw_in").css("height",h);
        $("#draw").attr("width",w_);
        $("#draw").attr("height",h);
        for(var i=0;i<dataa.length;i++){
            dataa[i].yValue = Number(dataa[i].yValue);
        }    
        return h,padding,rectWidth,w,dataa,mation;
    }
    
    //圆饼图****************可加的动态效果：鼠标进入，出现提示框.拖拽事件屏幕闪动,事件绑定在svg上就不会抖了，改变坐标是让图形改变.饼状图默认是一个2π的圆，也可以是扇形，只要定义布局时给出开始角度和结束角度
    window.pie = function(a, divv) {
        if(chartSizeS){
            var $chartBox = $("#"+divv);
        }else{
            var $chartBox = $("#draw_box");
        }
        try{
          !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
        }catch (e){
          $chartBox.data("mCS",''); //手动销毁             
        };

        $('.nMask').remove();
        $('.xMask').remove();
        $('.yMask').remove();
        $('.tableName').remove();
        var mation=[];
        $.extend(true,mation,a);
        dataa = mation[0].statisticalItems;
        if(chartSizeS){
            w = $("#schart1").width();
            w1 = $("#schart1").width();
            h = $("#schart1").height();
            padding={left:50,right:50,top:50,bottom:100};
            var norm = 50;
            var qs = h/2+15;
        }else{
            w = ww;
            w1 = ww+dataa.length*18;
            h = hh;
            padding = {left:40,right:40,top:90,bottom:40};
            // if(dataa.length>9){
            //     h=hh+(dataa.length-9)*25;
            // }
            var norm = 100; 
            var qs =  6*h/12;
        };
    
        for(var i=0;i<dataa.length;i++){
            dataa[i].yValue = Number(dataa[i].yValue);
        }
        var svg = d3.select("#"+divv).append("svg").attr("height",h).attr("width",w1).attr("class","ctrl svgsvg");
        var pie = d3.layout.pie().value(function(d){return d.yValue;});
        var colora = ["#b2db4e","#ea901e","#ffff29","#4cb3d2","#d94d4c","#a981e4","#eaff56","#2ddfa3","#70f2ff","#f57983",
                      "#85f1e2","#ff780c","#e0efe8","#10a8ab","#b2db4e","#a1f480","#ff9798","#591ece","#f99070","#3dbcc2",
                      "#b2db4e","#ea901e","#ffff29","#4cb3d2","#d94d4c","#a981e4","#eaff56","#2ddfa3","#70f2ff","#f57983",
                      "#85f1e2","#ff780c","#e0efe8","#10a8ab","#b2db4e","#a1f480","#ff9798","#591ece","#f99070","#3dbcc2"];
        var colorb = ["#0eb83b","#cb99cc","#70f2ff","#f99070","#fffc31","#cccc9a","#7463FF","#ff823f","#48c0a4","#eafdc5",
                      "#bef7e4","#f23a3a","#4ea1d3","#dfdce3","#e77776","#ff5965","#ffffff","#35a7ff","#ffe74d","#94dbf1",
                      "#0eb83b","#cb99cc","#70f2ff","#f99070","#fffc31","#cccc9a","#7463FF","#ff823f","#48c0a4","#eafdc5",
                      "#bef7e4","#f23a3a","#4ea1d3","#dfdce3","#e77776","#ff5965","#ffffff","#35a7ff","#ffe74d","#94dbf1"];
        var colora_=[];
        //var r_out_c=[];
        for(var k=0;k<mation.length;k++){
            var change = mation[k].statisticalItems;
            var piedata_ = pie(change);
            //第二个圆环,圆环的数据是0的应该去掉
            for(var i=0;i<mation[k].length;i++){
                if(mation[k][i].yValue==0){
                    mation[k].splice(i,1);
                }
            }
            var r_in = norm*(2*k+1)/(mation.length*2);
            var r_out = norm*(2*k+2)/(mation.length*2);   // .startAngle(0)    
            var r_out_b = r_out+10;
            //r_out_c.push(r_out_b);
            var arc_ = d3.svg.arc().innerRadius(r_in).outerRadius(r_out);//生成一个线性弧度,弧生成器
            var arcs_ = svg.selectAll(".sty_").data(piedata_).enter().append("g").attr("transform","translate("+w/3+","+qs+")"); //分组      
            var arc = d3.svg.arc().innerRadius(r_in).outerRadius(r_out_b);//交互效果的弧生成器
            var pa = arcs_.append("path")//往分组里添加路径
                 .attr("d",function(d){
                    return arc_(d);
                 })
                 .attr("fill",function(d,i){
                    var tmpColor;
                    colora[i] ? tmpColor=colora[i] : tmpColor="#f1bcc3";
                    colora_.push(tmpColor);
                    return tmpColor ; 
                 })
                 .attr("class",function(d,i){ return "pa"+divv+k+i+"" ;});
            var tooltip = d3.select("#draw_out").append("div").attr("class","tooltip").style("opacity",0.0);        
            //var tooltip = svg.append("rect").attr("height",50).attr("width",100)
            //                 .attr("rx",2).attr("ry",2).style("opacity",0);
            arcs_.on("mouseover",function(d,i){
                  var percent = d.data.yValue/d3.sum(change,function(d){return d.yValue;})*100;//这个数算的好像有问题
                  var txt = d.data.xValue + " "+ ":" +" " +percent.toFixed(1)+"%";
                   tooltip.html(txt)
                        .style("left",(d3.event.pageX-30)+"px")
                        .style("top",(d3.event.pageY-110)+"px")
                        .style("opacity",0.7);
                     // tooltip.attr("transform","translate("+(d3.event.pageX-30)+","+(d3.event.pageY-110)+")")
                     //        .style("opacity",1);
                    //d3.select(".hint"+i).style("stroke","#33d0ff").style("stroke-width",3);
                  })
                  .on("mousemove",function(d,i){
                    tooltip.transition().duration(100).ease("in-out").style("left",(d3.event.pageX-30)+"px").style("top",(d3.event.pageY-110)+"px")
                    // tooltip.transition().duration(100).ease("in-out")
                    //        .attr("transform","translate("+(d3.event.pageX-30)+","+(d3.event.pageY-110)+")");
                    d3.select(".hint"+i).style("stroke","#33d0ff").style("stroke-width",3);
                    //.attr("height",14).attr("width",21);
                  })
                  .on("mouseout",function(d,i){
                    tooltip.style("opacity",0);
                    tooltip.html("");
                    d3.select(".hint"+i).style("stroke-width",0);
                    //.attr("height",10).attr("width",15);
                    
                   });
            //画圆弧的时候并不是顺时针顺序i=0~10...,但是每个扇形和矩形的颜色是对应的
            //ease()缓动函数 参数有 bounce  cubic linear cubic-in-out sin sin-out exp circle back
            //if(mation.length==1&&(!chartSizeS)){
            if(k==mation.length-1){
                arcs_.on("mouseenter",function(d,i){
                    //var arc = d3.svg.arc().innerRadius(r_in).outerRadius(r_out_c[k]);
                    d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc_(d)).transition()
                    .duration(300).ease("bounce").attr("d",arc(d)).attr("class","pa"+divv+k+i+"");
                    //d3.select("hint"+i).attr("width",18).attr("height",12);
                  })
                 .on("mouseleave",function(d,i){
                    d3.selectAll(".pa"+divv+k+i+"").style("opacity",0);
                    d3.select(this).append("path").attr("fill",colora_[i]).attr("d",arc(d)).transition()
                    .duration(300).ease("bounce").attr("d",arc_(d)).attr("class","pa"+divv+k+i+"");
                    //d3.select("hint"+i).attr("width",15).attr("height",10);
                 })
            //}
            }
        }
        var xw = w*0.6;
        var xh = h/6;
        //var xw_ = w*0.7;
        if(chartSizeS){
            shenglue (dataa);
            var text = svg.selectAll(".tt").data(shengluehao).enter().append("text")
                                        .attr("transform",function(d,i){ return "translate("+(xw+25+20)+","+(xh+i*22+10+15)+")";})
                                        .attr("class","tt").text(function(d,i){return d.xValue;});
            var rects = svg.selectAll("rect").data(dataa).enter().append("rect")
                                         .attr("transform",function(d,i){ return "translate("+(xw+20)+","+(xh+i*22+15)+")";})
                                         .attr("width",15).attr("height",10).style("fill",function(d,i){return colora_[i];});
            //表名
            svg.append("text")
                    .text(mation[0].tableName)
                    .attr("class","textdSmall")
                    .attr("transform","translate(100,25)");
            $chartBox.mCustomScrollbar({
              theme: Magicube.scrollbarTheme,
              autoHideScrollbar: true,
              axis:"x"
            });
        }
        if(!chartSizeS){
            
            // var nump = parseInt(dataa.length/10)+1;
            // for(var p=0;p<nump;p++){
            //     var part = dataa.slice(10*p,10*p+10);
            //         xw=w*(0.6+p*0.2);
            //         var text = svg.selectAll(".tt"+p).data(part).enter().append("text")
            //               .attr("transform",function(d,i){ return "translate("+(xw+25)+","+(30+i*22+10+50)+")";})
            //               .attr("class","tt").text(function(d){return d.xValue;});
            //         var rects = svg.selectAll(".rect"+p).data(part).enter().append("rect")
            //                     .attr("transform",function(d,i){ return "translate("+xw+","+(30+i*22+50)+")";})
            //                     .attr("width",15).attr("height",10).style("fill",function(d,i){return colora_[i];})
            //                     .attr("class",function(d,i){ return "hint"+i;});
            // } 
    
    
            var text = svg.selectAll(".pieText").data(dataa).enter().append("text")
                          .attr("transform",function(d,i){
                            var i_tmp = Math.floor(i/10);
                            var i_tp = i%10;
                            var i_x = 7*ww/12+i_tmp*190;
                           return "translate("+(i_x+25)+","+(hh/4+i_tp*22+10)+")";
                          })
                          .attr("class",function(d,i){
                            return "pieText"+i
                          })
                          .text(function(d){return d.xValue;});
            var rects = svg.selectAll(".pieRect").data(dataa).enter().append("rect")
                        .attr("transform",function(d,i){ 
                            var i_tmp = Math.floor(i/10);
                            var i_tp = i%10;
                            var i_x = 7*ww/12+i_tmp*190;
                            return "translate("+i_x+","+(hh/4+i_tp*22)+")";
                        })
                        .attr("width",15).attr("height",10).style("fill",function(d,i){return colora_[i];})
                        .attr("class",function(d,i){ return "hint"+i;});
    
            // var rects = svg.selectAll("rect").data(dataa).enter().append("rect")
            //             .attr("transform",function(d,i){ return "translate("+xw+","+(30+i*22+50)+")";})
            //             .attr("width",15).attr("height",10).style("fill",function(d,i){return colora[i];})
            //             .attr("class",function(d,i){ return "hint"+i;});
            svg.append("text")
               .text(mation[0].tableName)
               .attr("class","textd")
               .attr("transform","translate("+(14*w/33)+","+(padding.top-50)+")");
            var len = mation[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
            var loca = len*17/2+60+ww/2-70 //提示信息的位置
            //svg.append("circle").attr("transform","translate("+loca+","+(padding.top-55)+")").attr("r",7).attr("class","pie_circle_one");
            //svg.append("text").text("初始数据").attr("class","texted").attr("transform","translate("+(loca+10)+","+(padding.top-50)+")");
            //svg.append("circle").attr("transform","translate("+(loca+100)+","+(padding.top-55)+")").attr("r",6).attr("class","pie_circle_two");
            //svg.append("text").text("过滤结果").attr("class","texted").attr("transform","translate("+(loca+110)+","+(padding.top-50)+")");
        }
        shengluehao=[];
        //兼容的滚动条样式    
        $chartBox.mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true,
          axis:"x"
        }); 
        svgScroll(mation[0]);
    }
    
    //柱状图
    window.bar = function(a, divv) {    
        var ret = [],
            set = [];//装纵坐标
        variaDeal(a,divv);
        for(var i=0;i<a.length;i++){
          for(var j=0;j<a[i].statisticalItems.length;j++){
            a[i].statisticalItems[j].yValue = Number(a[i].statisticalItems[j].yValue);
            set.push(a[i].statisticalItems[j].yValue);   
          }
        }
        var svg = d3.select("#"+divv)
                   .append("svg")
                   .attr("width",w)
                   .attr("height",h)
                   .attr("class","ctrl svgsvg");
                   
        for(var j=0;j<dataa.length;j++){
          ret.push(dataa[j].xValue);
        }
        if(chartSizeS){
            for(var i=0;i<mation.length;i++){
                shenglue(mation[i].statisticalItems);
                removeRepetition(mation[i].statisticalItems);
            }
            //shenglue (dataa);//小图时x轴刻度最多三个汉字位置
            var art = [];
            //此处理是因为经过省略。有些xValue会变得一样，d3.jsdom绑定数据会自动去重
            function removeRepetition(arr){
                for(var i=0;i<arr.length;i++){
                    for(var k=i+1;k<arr.length;k++){
                        if(arr[i].xValue==arr[k].xValue){   
                            arr[k].xValue=arr[k].xValue+" ";
                        }
                    }
                }
            }
            //在此之前要确保，每组数据的x轴的坐标都是一样的，之前处理过了
            //shenglue (dataa);//小图时x轴刻度最多三个汉字位置
            var art = [];
            //此处理是因为经过省略。有些xValue会变得一样，d3.jsdom绑定数据会自动去重
            for(var i=0;i<shengluehao.length;i++){
                for(var k=i+1;k<shengluehao.length;k++){
                    if(shengluehao[i].xValue==shengluehao[k].xValue){
                        shengluehao[k].xValue=shengluehao[k].xValue+" ";
                    }
                }
            }
            // 把每组数据的x轴都变成省略的，mation是我拷贝出来的数据，
            for(var j=0;j<shengluehao.length;j++){
              art.push(shengluehao[j].xValue)
            }
            for(var i=0;i<mation.length;i++){
              for(var k;k<mation[i].statisticalItems.length;k++){
                mation[k].statisticalItems.xValue=shengluehao[k].xValue;
              }
            }
            var xScaled = d3.scale.ordinal().domain(art).rangeBands([0,w - padding.left - padding.right],0.3);
        }else{
            //d3.range - 产生一系列的数值。
            var xScaled = d3.scale.ordinal().domain(ret).rangeBands([0,w - padding.left - padding.right],0.3);
        }
      //d3.range - 产生一系列的数值。
      var yScaled = d3.scale.linear().domain([0,d3.max(set)*1.2]).range([h-padding.top - padding.bottom,0]);
      //坐标轴上显示什么字，写在定义域里，为一个数组，想出数字就后面这么写d3.range(datad_.length)。d3.map构建一个新的映射
      var xAxisd = d3.svg.axis().scale(xScaled).orient("bottom").innerTickSize(0).outerTickSize(0.1);
      var yAxisd = d3.svg.axis().scale(yScaled).orient("left").ticks(5).innerTickSize(0).outerTickSize(0.1);
      var a = d3.rgb(99,219,255);
      var b = d3.rgb(4,171,226);
      var defs = svg.append("defs");
      //颜色渐变
      var linearGradient_ = defs.append("linearGradient")
                    .attr("id","linearColor")
                    .attr("x1","0%")
                    .attr("y1","0%")
                    .attr("x2","0%")
                    .attr("y2","100%");
      var stop1 = linearGradient_.append("stop").attr("offset","0%").style("stop-color",a.toString());
      var stop2 = linearGradient_.append("stop").attr("offset","100%").style("stop-color",b.toString());
      var color =  ["#f57983","#a1f480","#591ece","#10a8ab"];  
      svg.append("g")//g是分组
         .attr("class","axis")
         .attr("id","axisX")
         .attr("transform","translate("+padding.left+","+(h -padding.bottom)+")")
         .call(xAxisd)
         .selectAll("text")
         // .attr("y",5)
         // .attr("x",-8)
         .attr("dy","1em");
         // .attr("dx","0em")
         // .attr("transform","rotate(20)")
         // .style("text-anchor","start");
      svg.append("g")
         .attr("class","axis axisY")
         .attr("transform","translate("+padding.left+","+padding.top+")")
         .call(yAxisd)
         .selectAll("text")
         .attr("dx","-0.5em");;
       d3.selectAll("#"+divv+" svg g.axisY g.tick").append("line").classed("grid-line",true).attr("x1",0)
         .attr("y1",0)
         .attr("x2",w-padding.left-padding.right)
         .attr("y2",0)
         .style("stroke-dasharray","3")
         .attr("fill","#FFF");
      //d3.selectAll("g.axisY g.tick").append("rect").attr("transform","translate(0.0)")
       
      for(var k=0;k<mation.length;k++){
        //背景矩形
        
        var rectBg = svg.selectAll(".rectBg"+k+"").data(mation[k].statisticalItems).enter().append("rect")
                .attr("class","rectBg"+k+" rectBgDefault").attr("transform","translate("+padding.left+","+padding.top+")")
                .attr("y",0)
                .attr("x",function(d,i){
                   return xScaled(d.xValue)+(xScaled.rangeBand()-rectWidth*mation.length)/2+rectWidth*k;
    
                })
                .attr("width",rectWidth)//取得离散块的宽度
                .attr("height",function(d){
                   return h- padding.top - padding.bottom ;
                }) 
                .attr("fill","#2D3138")
                .on("click",function(d,i){
                    event.stopPropagation();   
                    largeObj["chart"+scIndex].xVPoint = d.xValue;
                    largeObj["chart"+scIndex].idhash=d.dataSetId;
                    var top_ = (d3.event.pageY-50)+"px"; 
                    var left_ = (d3.event.pageX)+"px"; 
                    $("#up_down").show().css("top",top_).css("left",left_);
                })
                .attr("opacity",0)
                .on("mouseover",function(d,i){return d3.select(this).attr("opacity",0.9)})
                .on("mouseout",function(d,i){return d3.select(this).attr("opacity",0)});
                // .on("mouseenter",function(d,i){
                //     large==1 ? xv_one=d.xValue : (large==2 ? xv_two=d.xValue : (large==3 ? xv_three=d.xValue:xv_four=d.xValue));
                //     large==1 ? idhash_one=d.dataSetId : (large==2 ? idhash_two=d.dataSetId : (large==3 ? idhash_three=d.dataSetId : idhash_four=d.dataSetId));
                //     var top_ = (d3.event.pageY-50)+"px";
                //     var left_ = (d3.event.pageX)+"px";
                //     $("#up_down").show().css("top",top_).css("left",left_);
                // })
                // .on("mousemove",function(d,i){
                //     $("#up_down").css("top",(d3.event.pageY-50)+"px");
                // });
    
        var rects = svg.selectAll(".rect"+k+"").data(mation[k].statisticalItems).enter().append("rect")
                    .attr("class","rect"+k).attr("transform","translate("+padding.left+","+padding.top+")")
                    // .on("dblclick",function(d,i){
                    //     //d3.select(this).attr("fill","yellow");
                    //     //godown.push(data[i].xValue);
                    //     large==1 ? xv_one=d.xValue : (large==2 ? xv_two=d.xValue : (large==3 ? xv_three=d.xValue:xv_four=d.xValue));
                    //     large==1 ? idhash_one=d.dataSetId : (large==2 ? idhash_two=d.dataSetId : (large==3 ? idhash_three=d.dataSetId : idhash_four=d.dataSetId));
                    //     goDown(1);  
                    // })
                    .on("click",function(d,i){
                        event.stopPropagation();
                        largeObj["chart"+scIndex].xVPoint = d.xValue;
                        largeObj["chart"+scIndex].idhash=d.dataSetId;
                        //large==1 ? xv_one=d.xValue : (large==2 ? xv_two=d.xValue : (large==3 ? xv_three=d.xValue:xv_four=d.xValue));
                        //large==1 ? idhash_one=d.dataSetId : (large==2 ? idhash_two=d.dataSetId : (large==3 ? idhash_three=d.dataSetId : idhash_four=d.dataSetId));
                        var top_ = (d3.event.pageY-50)+"px";
                        var left_ = (d3.event.pageX)+"px";
                        $("#up_down").show().css("top",top_).css("left",left_);
                    })
                    
                    // .on("click",function(d,i){
                    //     $(".barActive").removeClass('barActive');
                    //     d3.select(this).attr("class","barActive");
                    //     large==1? pick_one=true:(large==2 ? pick_two=true: (large==3?pick_three=true:pick_four=true));
                    //     large==1 ? xv_one=d.xValue : (large==2 ? xv_two=d.xValue : (large==3 ? xv_three=d.xValue:xv_four=d.xValue));
                    //     large==1 ? idhash_one=d.dataSetId : (large==2 ? idhash_two=d.dataSetId : (large==3 ? idhash_three=d.dataSetId : idhash_four=d.dataSetId));
                    // })
                    // .on("mouseenter",function(d,i){
                    //     large==1 ? xv_one=d.xValue : (large==2 ? xv_two=d.xValue : (large==3 ? xv_three=d.xValue:xv_four=d.xValue));
                    //     large==1 ? idhash_one=d.dataSetId : (large==2 ? idhash_two=d.dataSetId : (large==3 ? idhash_three=d.dataSetId : idhash_four=d.dataSetId));
                    //     var top_ = (d3.event.pageY-50)+"px";
                    //     var left_ = (d3.event.pageX)+"px";
                    //     $("#up_down").show().css("top",top_).css("left",left_);
                    // })
                      // .on("mousemove",function(){
                      //    $("#up_down").css("top",(d3.event.pageY-50)+"px");//.css("left",(d3.event.pageX)+"px")
                      //  })
                      .attr("x",function(d,i){
                         return xScaled(d.xValue)+(xScaled.rangeBand()-rectWidth*mation.length)/2+rectWidth*k;
                         
                      })
                      .attr("y",yScaled(0))
                      //ordinal.rangeBand - 取得离散块的宽度。
                      .attr("width",rectWidth)//取得离散块的宽度
                      .attr("height",0)
                      .attr("ry",3)
                      .attr("rx",3)
                      .transition()
                      .duration(400)
                      .ease("ease-out")
                       .attr("y",function(d){
                        return yScaled(d.yValue);
                       })
                      .attr("height",function(d){
                         return h- padding.top - padding.bottom -yScaled(d.yValue);
                      })
                      .attr("fill",color[k]);
    
    
    
        //矩形上的文字
        var text = svg.selectAll(".text"+k+"").data(mation[k].statisticalItems).enter()
                      .append("text").attr("fill",color[k])
                      .attr("transform","translate("+padding.left+","+padding.top+")")
                      .attr("x",function(d,i){
                          return xScaled(d.xValue)+(xScaled.rangeBand()-rectWidth*mation.length)/2+rectWidth*k;
                      })
                      .attr("y",function(d){
                       return yScaled(d.yValue)-2;
                      })
                      .attr("class","textAll")
                      .attr("dx",function(){ return rectWidth/2; })
                      .attr("text-anchor","middle")
                      .text(function(d){ return d.yValue; });
        if(chartSizeS){
            text.remove();//把某个选择集删除，实现小图柱子上不带文字
        }
        
      }
      
        
    
      
      if(chartSizeS){
        svg.append("text")
         .text(mation[0].yName) 
         .attr("class","text")
         .attr("transform","translate("+(padding.left-20)+","+(padding.top-18)+")");
    
        svg.append("text")
            .text(mation[0].tableName)
            .attr("class","textdSmall")
            .attr("transform","translate(80,30)");
        svg.append("text").text(mation[0].xName)
                          .attr("class","texted")
                          .attr("transform","translate("+(w-padding.left-15)+","+(h+15-padding.bottom)+")");
        var len = mation[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
        var loc = len*15/2+20+80;
        //var kuai = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+loc+",20)").style("fill","url(#"+linearGradient_.attr("id")+")");
        }else{
            svg.append("text")
                     .text(mation[0].tableName)
                     .attr("class","textd")
                     .attr("transform","translate("+(ww/2-70)+","+(padding.top-50)+")");
            $("#draw").append("<div class='nMask'></div>");
            $(".nMask").css({"top":(padding.top-70)+"px","left":(ww/2-90)+"px"});
            svg.append("text").text(mation[0].yName).attr("transform","translate(20,60)");//16.65
            svg.append("text").text(mation[0].xName).attr("transform","translate("+(w-15-mation[0].xName.length*13)+","+(h-padding.bottom+5)+")");
            //d3.select("#draw").append("div").attr("class","xMask").attr("transform","translate("+(w-15-mation[0].xName.length*13)+","+(h-padding.bottom+5)+")");
            $("#draw").append("<div class='xMask'></div>");
            $(".xMask").css({"top":(h-padding.bottom-5)+"px","left":(w-15-mation[0].xName.length*13.5)});
            $("#draw").append("<div class='yMask'></div>");
            $(".yMask").css({"top":"50px","left":"10px"});
            //var loca = len*17/2+40+ww/2-70 //提示信息的位置
            //var kuai = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+loca+","+(padding.top-60)+")").style("fill","url(#"+linearGradient_.attr("id")+")");
            
            changeXY(mation[0]);    
            //var len = mation[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
            //var loca = len*17/2+60+ww/2-70 //提示信息的位置
            //var kuai = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+loca+","+(padding.top-60)+")").style("fill","url(#"+linearGradient_.attr("id")+")");
            //svg.append("text").text("初始数据").attr("class","texted").attr("transform","translate("+(loca+20)+","+(padding.top-50)+")");
            ////小块表示哪个是过滤后的数据
            //var kuai_ = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+(loca+100)+","+(padding.top-60)+")").style("fill","yellow");
            //svg.append("text").text("过滤结果").attr("class","texted").attr("transform","translate("+(loca+120)+","+(padding.top-50)+")");
        }
        //兼容的滚动条样式        
        if(chartSizeS){
            var $chartBox = $("#"+divv);
        }else{
            var $chartBox = $("#draw_box");
        }
        try{
          !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
        }catch (e){
          $chartBox.data("mCS",''); //手动销毁             
        };
        $chartBox.mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true,
          axis:"x"
        });   
        svgScroll(mation[0]);  
    } 
    
    //折线图
    window.line = function(a, divv) {
        if(chartSizeS){
            var $chartBox = $("#"+divv);
        }else{
            var $chartBox = $("#draw_box");
        }
        try{
          !!$chartBox.data("mCS") && $chartBox.mCustomScrollbar("destroy"); //Destroy
        }catch (e){
          $chartBox.data("mCS",''); //手动销毁             
        };
        variaDeal(a,divv);
        var svg = d3.select("#"+divv)
                    .append("svg")
                    .attr("width",w)
                    .attr("height",h)
                    .attr("class","ctrl svgsvg");
        var ret=[],//装横坐标
            set=[],//装纵坐标
            temp;
        for(var i=0;i<a.length;i++){
            for(var j=0;j<a[i].statisticalItems.length;j++){
                set.push(a[i].statisticalItems[j].yValue);   
            }
        }
        for(var i=0;i<dataa.length;i++){
            ret.push(dataa[i].xValue);
        };
        //找出纵坐标数组中的最大值
        var data_max = Math.max.apply(null,set);
        if(chartSizeS){
            for(var i=0;i<mation.length;i++){
                shenglue(mation[i].statisticalItems);
                removeRepetition(mation[i].statisticalItems);
            }
            //shenglue (dataa);//小图时x轴刻度最多三个汉字位置
            var art = [];
            //此处理是因为经过省略。有些xValue会变得一样，d3.jsdom绑定数据会自动去重
            function removeRepetition(arr){
                for(var i=0;i<arr.length;i++){
                    for(var k=i+1;k<arr.length;k++){
                        if(arr[i].xValue==arr[k].xValue){
                            arr[k].xValue=arr[k].xValue+" ";
                        }
                    }        
                }
            }
            for(var i=0;i<shengluehao.length;i++){
                for(var k=i+1;k<shengluehao.length;k++){
                    if(shengluehao[i].xValue==shengluehao[k].xValue){
                        shengluehao[k].xValue=shengluehao[k].xValue+" ";
                    }
                }
            }
            // 把每组数据的x轴都变成省略的，mation是我拷贝出来的数据，
            for(var j=0;j<shengluehao.length;j++){
                art.push(shengluehao[j].xValue)
            }
            for(var i=0;i<mation.length;i++){
                for(var k;k<mation[i].statisticalItems.length;k++){
                    mation[k].statisticalItems.xValue=shengluehao[k].xValue;
                }
            }
            var xscale = d3.scale.ordinal().domain(art).rangeBands([0,w - padding.left - padding.right]);
        }else{
            //d3.range - 产生一系列的数值。rangeRoundPoints(
            var xscale = d3.scale.ordinal().domain(ret).rangeBands([0,w - padding.left - padding.right]);
        }       
        var yscale = d3.scale.linear().domain([0,data_max*1.2]).range([h - padding.top - padding.bottom,0]);
        var xAxise = d3.svg.axis().scale(xscale).orient("bottom").innerTickSize(4);
        var yAxise = d3.svg.axis().scale(yscale).orient("left").ticks(5).innerTickSize(4);
        var py = (w - padding.right - padding.left)/(2*dataa.length);
        var color =  ["#f57983","#a1f480","#591ece","#10a8ab"];
        var svgG = svg.append('g').attr('transform', "translate("+(padding.left+py)+","+padding.top+")");
        var linePath = d3.svg.line().x(function(d){return xscale(d.xValue); }).y(function(d){ return yscale(d.yValue);}).interpolate("monotone");  
        var linePathNone = d3.svg.line().x(function(d){return xscale(d.xValue); }).y(function(d){ return yscale(0)}).interpolate("monotone"); 
        var area = d3.svg.area().x(function(d){ return xscale(d.xValue);}).y0(h - padding.top - padding.bottom).y1(function(d){return yscale(d.yValue);}).interpolate("monotone");   
        var areaNone = d3.svg.area().x(function(d){ return xscale(d.xValue);}).y0(h - padding.top - padding.bottom).y1(function(d){return yscale(0);}).interpolate("monotone");  
        //添加提示线
        if(!chartSizeS){
            var change0 = mation[0].statisticalItems;
            svg.selectAll(".hintLine").data(change0).enter().append("line")
               .attr("x1",function(d){return xscale(d.xValue);})
               .attr("x2",function(d){return xscale(d.xValue);})
               .attr("y1",h-padding.bottom)
               .attr("y2",padding.top)
               .attr("transform","translate("+(padding.left+py)+",0)")  
               .attr("class","hintLine")
               .attr("id",function(d,i){ return "hintLine"+i;})
               // .style("display","none");
               .attr("opacity",0);
        }
        for(var k=0;k<mation.length;k++){
            var change = mation[k].statisticalItems;
            svg.append("path")
               .attr("d",linePathNone(change))
               .attr("transform","translate("+(padding.left+py)+","+padding.top+")")
               .attr("fill","none")
               .attr('stroke',color[k])
               .attr("stroke-width",2)
               .transition()
               .duration(500)
               .ease("ease-out")
               .attr("d",linePath(change))//d是路径，这里的数据应该是有横纵坐标的一个数组
               ;
               // .style("opacity",0.4)
               // .on("mouseover",function(){
               //   d3.select(this).style("opacity",1);
               // })
               // .on("mouseout",function(){
               //   d3.select(this).style("opacity",0.4)
               // });    
             svgG.append('g')
                 .attr('class', 'area')
                 .append("path")
                 .datum(change)
                 .attr("class", "line_path")
                 .attr('opacity',0.2)
                 .attr("d", areaNone)
                 .transition()
                 .duration(500)
                 .ease("ease-out")
                 //.attr("transform","translate("+(padding.left+py)+","+padding.top+")")
                 .style('fill',color[k])
                 .attr("d", area);
            svg.selectAll(".circle"+k).data(change).enter().append("circle").attr("transform","translate("+(padding.left+py)+","+padding.top+")").attr("cx",function(d){return xscale(d.xValue); })
                .attr("cy",function(d){ return yscale(0);})
                .attr("r",0)
                .attr("fill","#33d0ff")
                .attr("stroke",color[k])
                .attr("stroke-width",0)
                .transition()
                .duration(500)
                .ease("ease-out")
                .attr("cy",function(d){ return yscale(d.yValue);})
                .attr("r",4)
                .attr("stroke-width",2)
                .attr("class","dataDot")
                .style("z-index",20);
        }   
    
        
    
        svg.append("g").attr("class","axis").attr("transform","translate("+padding.left+","+(h - padding.bottom)+")").call(xAxise);
        svg.append("g").attr("class","axis").attr("transform","translate("+padding.left+","+padding.top+")").call(yAxise);
        //每次生成矩形时，让坐标轴有个过渡
        svg.select(".axis")
           .transition()
           .duration(500)
           .ease("circle")
           .call(xAxise);
        // time_svg.select("#ytime_axis")
        //    .transition()
        //    .duration(500)
        //    .ease("circle")
        //    .call(yAxis);
        if(chartSizeS){
            svg.append("text").text(mation[0].yName).attr("class","text").attr("transform","translate("+(padding.left-20)+","+(padding.top-18)+")");
            var xx = w/4;
            svg.append("text").text(mation[0].tableName).attr("class","textdSmall").attr("transform","translate(80,30)");
            svg.append("text").text(mation[0].xName).attr("class","texted").attr("transform","translate("+(w-padding.left-15)+","+(h+15-padding.bottom)+")");
            var len = mation[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
            var loc = len*15/2+20+80;
            //var kuai = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate(220,20)").style("fill","url(#"+linearGradient.attr("id")+")");
            
        }else{      
            svg.append("text").text(mation[0].tableName).attr("class","textd").attr("transform","translate("+(ww/2-70)+","+(padding.top-50)+")"); 
            svg.append("text").text(mation[0].yName).attr("transform","translate(20,60)");//16.65
            svg.append("text").text(mation[0].xName).attr("transform","translate("+(w-5-15-mation[0].xName.length*13)+","+(h-padding.bottom+5)+")");
            //d3.select("#draw").append("div").attr("class","xMask").attr("transform","translate("+(w-5-15-mation[0].xName.length*13)+","+(h-padding.bottom+5)+")");
            $("#draw").append("<div class='xMask'></div>");
            $(".xMask").css({"top":(h-padding.bottom-5)+"px","left":(w-5-15-mation[0].xName.length*13.5)});
            $("#draw").append("<div class='nMask'></div>");
            $(".nMask").css({"top":(padding.top-70)+"px","left":(ww/2-90)+"px"});
            $("#draw").append("<div class='yMask'></div>");
            $(".yMask").css({"top":"50px","left":"10px"});
            changeXY(mation[0]);
    
            var statisticsTimes = ["一次统计","二次统计","三次统计","四次统计"];
            
            
            //添加一个矩形，进入显示线
            svg.selectAll(".hintLineBg").data(change).enter().append("rect")
               .attr("x",function(d,i){return xscale(d.xValue);})
               .attr("y",0)
               .attr("width",2*py)
               .attr("height",h-padding.top-padding.bottom)
               .attr("transform","translate("+padding.left+","+padding.top+")") 
               .attr("class","hintLineBg")
               // .attr("fill","#FFF200")
               .style("opacity",0)
               .on("mouseover",function(d,i){
                   d3.select("#hintLine"+i).attr("opacity",1);
                   var posiX = d3.select("#hintLine"+i).attr("x1");
                   d3.selectAll(".dataDot").filter(function(d,i){ return xscale(d.xValue)==posiX  }).attr("stroke-width",5);
                   d3.select("#draw").append("div").attr("class","messageTip")
                   var strMess = "<p>"+d.xValue+"</p>";
                   d3.selectAll("#draw svg .dataDot").filter(function(d,i){ return xscale(d.xValue)==posiX  })
                   .each(function(d,i){ return strMess +="<p>"+statisticsTimes[i]+"："+d.yValue+"</p>" ;})
                   $(".messageTip").html(strMess);
                   d3.select(".messageTip")
                     .transition()
                     .duration(200)
                     .delay(200)
                     .ease("ease-out")
                     .style("left",(Number(posiX)+1.2*py+70)+"px")
                     .style("top",(d3.event.pageY-110)+"px");
               })
               .on("mousemove",function(d,i){
                  var posiX = d3.select("#hintLine"+i).attr("x1");
                  d3.select(".messageTip")
                     .style("left",(Number(posiX)+1.2*py+70)+"px")
                     .style("top",(d3.event.pageY-110)+"px");
               })
               .on("mouseout",function(d,i){
                   d3.select("#hintLine"+i).attr("opacity",0);
                   var posiX = d3.select("#hintLine"+i).attr("x1");
                   d3.selectAll(".dataDot").filter(function(d,i){ return xscale(d.xValue)==posiX  }).attr("stroke-width",2);
                   $(".messageTip").remove();
               });
                
    
    
            // var focusLine = svg.append("g").attr("class",focusLine).style("display","none");
            // var vLine = focusLine.append("line");
            // var linePosi = [];
            //     d3.selectAll(".hintLine").each(function(d){
            //         linePosi.push(d3.select(this).attr("x1"));
            //     })
            // svg.append("rect").attr("class","overlay").attr("x",padding.left)
            //    .attr("y",padding.top).attr("width",w-padding.left-padding.right)
            //    .attr("height",h-padding.top-padding.bottom)
            //    // .attr("transform","translate("+(padding.left+py)+","+padding.top+")")
            //    .on("mouseover",function(d,i){
            //         for(var i=0;i<linePosi.length;i++){
            //              if(Math.abs(d3.mouse(this)[0] -70-py -linePosi[i])<py){
            //                 //d3.selectAll(".hintLine").select("#hintLine"+i).style("display","null"); 
            //                 d3.select("#hintLine"+i).style("display","null"); 
                         
            //              }
            //         }   
            //       console.log(d3.mouse(this)[0]) 
            //    })
                // .on("mouseout",function(d,i){
                //   d3.selectAll(".hintLine").style("display","none");
                // })
                // .on("mousemove",function(d,i){
                //     for(var i=0;i<linePosi.length;i++){
                //         if(Math.abs(d3.mouse(this)[0]-70-py-linePosi[i])<py){
                //            // d3.selectAll(".hintLine").style("display","none"); 
                //            d3.select("#hintLine"+i).style("display","null"); 
                           
                //         }
                //    } 
                // });
           
            //同一个位置放2条线，一条线特别粗，给他加个mouseo事件。
                
            // function mousemove(){
            //  //获取鼠标对应透明矩形的坐标
            //  var mouseY = d3.mouse(this)[1] - padding.top;
            //  var mouseX = d3.mouse(this)[0] - padding.left;
            //  //通过比例尺的反函数计算原数据中的值
            //  var y1 = yscale.invert(mouseY);
            //  // console.log(y0);
            //  // var bisect = d3.bisector(function(d){
            //  //  return d[0];
            //  // }).left;
            //  // var index = bisect(set,y0);
            //  // //var ssss = d3.event.pageX;
            //  // var y1 = set[index][1];
            //  var focusY = yscale(y1)+padding.top;
            //     vLine.attr("x1",mouseX)
            //          .attr("y1",h-padding.bottom)
            //          .attr("x2",mouseX)
            //          .attr("y2",padding.top);
            //}
    
    
            //var len = mation[0].tableName.replace(/[^\x00-\xff]/g,"01").length;//计算表名的长度
            //var loca = len*17/2+60+ww/2-70 //提示信息的位置
            //var kuai = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+loca+","+(padding.top-60)+")").style("fill","url(#"+linearGradient.attr("id")+")");
            //svg.append("text").text("初始数据").attr("class","texted").attr("transform","translate("+(loca+20)+","+(padding.top-50)+")");
            //小块表示哪个是过滤后的数据
            //var kuai_ = svg.append("rect").attr("width",15).attr("height",10).attr("transform","translate("+(loca+100)+","+(padding.top-60)+")").style("fill","yellow");
            //svg.append("text").text("过滤结果").attr("class","texted").attr("transform","translate("+(loca+120)+","+(padding.top-50)+")");    
        } 
        $chartBox.mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true,
          axis:"x"
        });  
        svgScroll(mation[0]);
    }
    
    //把数据绘制成表格,a是数据，b是在哪个盒子上显示表格
    var arg_x, arg_y;
    window.tableShow = function(a) {
        var mation = [];
        $.extend(true,mation,a);
        $(".table_cut").html("");
        var name = ["一次统计","二次统计","三次统计","四次统计","五次统计","六次统计"];
        var str_cut="",
            str="",
            content = [];
        //遍历装有多次统计的数据的数组
        for(var k=0;k<mation.length;k++){
            str_cut += "<div class='cut"+k+"'>"+name[k]+"</div>";   
            //遍历每一次的数据
            str="";
            var dataSum; 
            for( var key in mation[k].otherValues ){
                dataSum = mation[k].otherValues[key];
            }
            for(var i=0;i<mation[k].statisticalItems.length;i++){
                mation[k].statisticalItems[i].yValue = Number(mation[k].statisticalItems[i].yValue);
                str +='<tr>'
                    +      '<td>'
                    +           '<span>'+i+'</span>'
                    +       '</td>'
                    +       '<td>'
                    +            '<span>'+mation[k].statisticalItems[i].xValue+'</span>'
                    +       '</td>'
                    +       '<td>'
                    +            '<span>'+mation[k].statisticalItems[i].yValue+'</span>'
                    +       '</td>'
                    +       '<td>'
                    +            '<span>'+(mation[k].statisticalItems[i].yValue*100/dataSum).toFixed(2)+'</span>'
                    +       '</td>'
                    +       '<td class="chartTableDetial">'
                    +            '<span id="detail'+i+'">查看</span>'
                    +       '</td>' 
                    +  '</tr>';
            }
            arg_x=mation[k].xName;
            arg_y=mation[k].yName;
            var sr ='<tr class="table_tr_first">'
                +      '<td>'
                +           '<span>序号</span>'
                +       '</td>'
                +       '<td>'
                +            '<span>'+arg_x+'</span>'
                +       '</td>'
                +       '<td>'
                +            '<span>'+arg_y+'</span>'
                +       '</td>'
                +       '<td>'
                +            '<span>占比%</span>'
                +       '</td>'
                +       '<td>'
                +            '<span id="detail'+i+'">详细</span>'
                +       '</td>'
                +  '</tr>';
            str=sr+str;
            content.push(str);       
        }
        $(".table_cut").html(str_cut);//把动态创建的tab切换按钮添s加到cut的盒子中
        $("#topology_table").html(content[0]);//默认把第一个数据的内容添加到内容的盒子中
        //$(".table_cut div:eq(0)")
        $(".table_cut").children().first().addClass('chart_table_header_active');
        $(".table_cut div").on("click",function(){
            $("#topology_table").html("");
            $(this).addClass('chart_table_header_active').removeClass('chart_table_header_default');
            $(this).siblings().addClass('chart_table_header_default').removeClass('chart_table_header_active');
            var index = $(this).index();
            $("#topology_table").html(content[index]);
        })
        let $chartTableBox = $(".table_content");
        compatible($chartTableBox, 'y');
    }
    
    //画图各项参数保存每个小图对应的变量中，叠加和全新统计都为push，只不过全新统计时，要先清空，再push,而且叠加统计的长度都是1
    window.filterData = function(obj) {
        filtermark==1? dataScope=1 : dataScope=2;
        filtermark==1 ? ScopeDisplay="操作台数据" : ScopeDisplay="全部数据";
        
        // classify==0 ? classifyDisplay="全部（实体、事件、文档）":(classify==1 ? 
        // classifyDisplay="实体":(classify==2 ? classifyDisplay="事件" :classifyDisplay ="文档"));
        
        //中文
        obj.filDis.dataScope.push(ScopeDisplay);
        obj.filDis.classify=classifyDisplay;
        obj.filDis.typee=type_display;
        obj.filDis.cont=contDisplay;
        obj.filDis.statistics.push(statisticsDisplay);//这里走的是默认
        obj.filDis.way=wayDisplay;//一开始进入图形，所以为默认
        obj.filDis.filter.push(filterDisplay);//默认空数组
        
        //英文
        obj.fil.dataScope.push(2);//2是全部数据，1是操作台数据
        obj.fil.classify=classify;
        obj.fil.typee=type_system;
        obj.fil.cont=cont;
        obj.fil.statistics.push(statistics);
        obj.fil.way=way;
        obj.fil.filter.push(filter);//默认空数组
        obj.fil.referClass=refer_class;//下钻汇聚的参考体系
        obj.fil.level=level;
        obj.fil.levelParent="";//目前还没写
    }
    
    //每个小图里面的柱饼折切换按钮，全屏按钮
    function smallChartBtnCut() {
        $(".bone").on("click",function (){
            $(this).parent().siblings('div').children('div').children('div').find("svg").remove();
            $(this).addClass('icon-bar-chart-blue').removeClass('icon-bar-chart');    
            $(this).next().addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
            $(this).next().next().addClass('icon-line-chart').removeClass('icon-linechart-blue');
            var prop = $(this).parent().siblings('div').attr("id");
            scIndex = $(this).parent().parent().parent().index()+1;
            bar(largeObj["chart"+scIndex].information,prop);
            largeObj["chart"+scIndex].kinds = "yz";
         });    
        $(".btwo").on("click",function (){
            $(this).parent().siblings('div').children('div').children('div').find("svg").remove();
            $(this).prev().addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
            $(this).addClass('icon-pie-chart-blue').removeClass('icon-pie-chart');
            $(this).next().addClass('icon-line-chart').removeClass('icon-linechart-blue');    
            var prop = $(this).parent().siblings('div').attr("id");
            scIndex = $(this).parent().parent().parent().index()+1;
            pie(largeObj["chart"+scIndex].information,prop);
            largeObj["chart"+scIndex].kinds = "yb";
         });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        $(".bthree").on("click",function (){
            $(this).parent().siblings('div').children('div').children('div').find("svg").remove();
            $(this).prev().prev().addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
            $(this).prev().addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');   
            $(this).addClass('icon-linechart-blue').removeClass('icon-line-chart');
            var prop = $(this).parent().siblings('div').attr("id");
            scIndex = $(this).parent().parent().parent().index()+1;
            line(largeObj["chart"+scIndex].information,prop);
            largeObj["chart"+scIndex].kinds = "zx";
          });
        $(".bfull").on("click",function(){
            event.stopPropagation();
            scIndex = $(this).parent().parent().parent().index()+1;
            chartToFull(scIndex);
        })
        $(".topo_smallchart").on("dblclick",function(){
            scIndex = $(this).parent().parent().index()+1;
            chartToFull(scIndex);//小图变大图以后scIndex就表示是序号为那个的图放大了
        })
    }
    
    // let $chartBigBox = $("#dv4 #draw_out");
    // compatible($chartBigBox, 'x');
    
    //小图变大图
    function chartToFull(scIndex) {
        //一级页面隐藏，二级页面显示，打开侧边栏，变量提示为大图，移除原有svg
        $(".chart_main_page").css("height",0);
        $("#dv4").show();
        stateCutShow()
        $(".chart_save").css("height","150px");
        $(".chart_message").css("width","256px");
        chartSizeS = false;
        $("#dv4 svg").remove();
        //var scIndex = $(this).parent().parent().parent().index()+1;
        if(largeObj["chart"+scIndex].kinds == "yz"){
            $("#bigone").addClass('icon-bar-chart-blue');
            bar(largeObj["chart"+scIndex].information,"draw");
        }
        if(largeObj["chart"+scIndex].kinds == "yb"){
            $("#bigtwo").addClass('icon-pie-chart-blue');
            pie(largeObj["chart"+scIndex].information,"draw");
        }
        if(largeObj["chart"+scIndex].kinds == "zx"){
            $("#bigthree").addClass('icon-linechart-blue');
            line(largeObj["chart"+scIndex].information,"draw");
        }
        showMessage ();
        setDefault(largeObj["chart"+scIndex].fil,largeObj["chart"+scIndex].filDis);
        $("#up_down").hide();
        //$(".go_topo").css("right","258px");
        //$(".go_gis").css("right","258px");
        chartMainHtml =  $(".chart_main").html();
    }
    
    //控制右侧和下侧栏的显示和隐藏
    window.stateCutHide = function() {
        m=true;
        $("#topology_relative").css("right", 0);
        $("#topology_message_taggle").css({"right": 0,"transform": "rotate(180deg)"});
        $("#topology_message").css("transform", "translate(" + $("#topology_message").css('width') + ", 0)");
        t=true;
        $("#topology_relative_network").css("bottom", 0);
        $("#topology_timeline_taggle").css("transform","rotate(180deg)");
        $("#topology_relative_timeline").css("height", 0);
    }
    
    window.stateCutShow = function(){
        m=false;
        $("#topology_relative").css("right", $("#topology_message").css('width'));
        $("#topology_message_taggle").css({"right": $("#topology_message").css('width'),"transform": "rotate(0deg)"});
        $("#topology_message").css("transform", "translate(0, 0)");
        t=false;
        $("#topology_relative_network").css("bottom", "150px");
        $("#topology_timeline_taggle").css("transform","rotate(0deg)");
        $("#topology_relative_timeline").css("height", "150px");
    }
    
    //小图变大图时获取最后一次统计的，图表的各项参数
    function setDefault(a,b){
        dataScope=a.dataScope[a.dataScope.length-1];
        classify=a.classify;
        type_system=a.typee;
        cont = a.cont;
        statistics=a.statistics[a.statistics.length-1];
        way=a.way;
        filter=a.filter[a.filter.length-1];
        //refer_class=a.refer_class;
        //中文
        ScopeDisplay=b.dataScope[b.dataScope.length-1];
        classifyDisplay=b.classify;
        type_display=b.typee;
        contDisplay=b.cont;
        statisticsDisplay=b.statistics[a.statistics.length-1];
        wayDisplay=b.way;
        filterDisplay=b.filter[a.filter.length-1];
    }
    
    var tooltips = d3.select(".btn_out_big").append("div").attr("class", "big_btn_tips");
    //大图下工具栏的提示文字
    $(".big").mouseover(function() {
        var s = $(this).index();
        $(".big_btn_tips").html(tiptext[s]).css("top","22px").css("left","+"+(30+s*32)+"px");
        $(".big_btn_tips").show();
    })
    $(".big").mouseout(function() {
        
        $(".big_btn_tips").hide();
    });
    
    //大图工具栏按钮
    $("#bigfull").on("click", function() {
        if($(".chart_filter").css("display")=="none"){
            stateCutHide()
            $('.tooltip').remove();
            $("#draw div").remove();
            $("#topology_table").html("");
            $("#topology_table_two").html("");
            $(".table_content_two").hide();
            $(".table_content").show();
            $("#dv4 svg").remove();
            $("#draw").show();
            $(".chart_save").css("height","0px");
            $(".chart_message").css("width","0px");
            chartSizeS = true;
            $("#dv4").hide();
            $(".chart_main_page").css("height","100%");
            $(".table").hide();
            $(".chart_filter").hide();
            //$(".go_topo").css("right","0px");
            //$(".go_gis").css("right","0px");
            //每个大的图标都恢复到默认状态
            $("#bigone").addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
            $("#bigtwo").addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
            $("#bigthree").addClass('icon-line-chart').removeClass('icon-linechart-blue');
            $("#bigtable").addClass('icon-table').removeClass('icon-table-chart-blue');
            $("#bigguolu").addClass('icon-filter-blue').removeClass('icon-filter-blue');
            $("#retreat").addClass('icon-replay2').removeClass('icon-replay-blue');
            $("#chart_import").addClass('icon-import2').removeClass('icon-import-blue');
            $("#chart_export").addClass('icon-export2').removeClass('icon-export-blue');
            $("#chart_camera").addClass('icon-camera2').removeClass('icon-camera-blue');        
            $("#schart"+scIndex+" svg").remove();
           
            if(largeObj["chart"+scIndex].kinds=="yz"){
               $("#schartOne svg").remove();
               $("#schart"+scIndex).parent().find($(".bone")).addClass('icon-bar-chart-blue').removeClass('icon-bar-chart');
               $("#schart"+scIndex).parent().find($(".btwo")).addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
               $("#schart"+scIndex).parent().find($(".bthree")).addClass('icon-line-chart').removeClass('icon-linechart-blue');
               bar(largeObj["chart"+scIndex].information,"schart"+scIndex);
            }else if(largeObj["chart"+scIndex].kinds=="yb"){
               $("#schartOne svg").remove();
               $("#schart"+scIndex).parent().find($(".bone")).addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
               $("#schart"+scIndex).parent().find($(".btwo")).addClass('icon-pie-chart-blue').removeClass('icon-pie-chart');
               $("#schart"+scIndex).parent().find($(".bthree")).addClass('icon-line-chart').removeClass('icon-linechart-blue');
               pie(largeObj["chart"+scIndex].information,"schart"+scIndex);
            }else{
               $("#schartOne svg").remove();
               $("#schart"+scIndex).parent().find($(".bone")).addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
               $("#schart"+scIndex).parent().find($(".btwo")).addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
               $("#schart"+scIndex).parent().find($(".bthree")).addClass('icon-linechart-blue').removeClass('icon-line-chart');
               line(largeObj["chart"+scIndex].information,"schart"+scIndex);
            }
               
            $(".xname").remove();
            $(".yname").remove();
            $(".xname1").remove();
            $(".tableName").remove();
            //$(".draw_in div").remove();
            $("#topology_message_chart").hide();
            $("#topology_message_box").show();
            chartMainHtml =  $(".chart_main").html();
            
         }else{
            $(".chart_filter").addClass("shake");
         }
    })
    
    $("#bigone").on("click", function() {
        $('.tooltip').remove();
        $(".table").hide();
        $("chart_filter").hide();
        $("#draw").show();
        $("#bigone").addClass('icon-bar-chart-blue').removeClass('icon-bar-chart');
        $("#bigtwo").addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
        $("#bigthree").addClass('icon-line-chart').removeClass('icon-linechart-blue');
        $("#bigtable").addClass('icon-table').removeClass('icon-table-chart-blue');
        $("#dv4 svg").remove();
        //$(".draw_in div").remove();
        largeObj["chart"+scIndex].kinds = "yz";
        bar(largeObj["chart"+scIndex].information,"draw"); 
    })
    
    $("#bigtwo").on("click", function() {
        $(".yname").remove();
        $(".xname").remove();
        $(".table").hide();
        $(".chart_filter").hide();
        $("#draw").show();
        $("#bigone").addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
        $("#bigtwo").addClass('icon-pie-chart-blue').removeClass('icon-pie-chart');
        $("#bigthree").addClass('icon-line-chart').removeClass('icon-linechart-blue');
        $("#bigtable").addClass('icon-table').removeClass('icon-table-chart-blue'); 
        $("#dv4 svg").remove();
        //$("#draw_in div").remove();
        largeObj["chart"+scIndex].kinds = "yb";
        pie(largeObj["chart"+scIndex].information,"draw");
    })
    
    $("#bigthree").on("click", function() {
        $('.tooltip').remove();
        $(".table").hide();
        $("chart_filter").hide();
        $("#draw").show();
        $("#bigone").addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
        $("#bigtwo").addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
        $("#bigthree").addClass('icon-linechart-blue').removeClass('icon-line-chart');
        $("#bigtable").addClass('icon-table').removeClass('icon-table-chart-blue');
        $("#dv4 svg").remove();
        //$(".draw_in div").remove();
        largeObj["chart"+scIndex].kinds = "zx";
        line(largeObj["chart"+scIndex].information,"draw");
    })
    
    $("#bigtable").on("click", function() {
        $('.tooltip').remove();
        $(".xname").remove();
        $(".yname").remove();
        $(".tableName").remove();
        $(".table").show();
        $("chart_filter").hide();
        $("#bigone").addClass('icon-bar-chart').removeClass('icon-bar-chart-blue');
        $("#bigtwo").addClass('icon-pie-chart').removeClass('icon-pie-chart-blue');
        $("#bigthree").addClass('icon-line-chart').removeClass('icon-linechart-blue');
        $("#bigtable").addClass('icon-table-chart-blue').removeClass('icon-table');
        $("#draw").hide();
        $("#dv4 svg").remove();
        tableShow(largeObj["chart"+scIndex].information);    
    })
    
    $(".big").on("click", function() {
        $("#up_down").hide();
    })
    
    $("#bigguolu").on("click", function() {
        $(".addFilterTip").remove();
        $("#bigguolu").addClass('icon-filter-blue').removeClass('icon-filter'); 
        $(".chart_filter").show();
        type_system = largeObj["chart"+scIndex].fil.typee;
        type_display = largeObj["chart"+scIndex].filDis.typee;
        $("#filterfenlei").attr("placeholder", largeObj["chart"+scIndex].filDis.classify).attr("readonly","true");
        filtermark=1;
        ScopeDisplay="操作台数据";//传输的变量
        dataScope=1;
    })
    
    //大图时，单机空白处所有div隐藏
    $("#draw").on("click", function() {
        event.stopPropagation();
        $("#up_down").hide();
        $(".yname1").remove();
        $(".yname2").remove();
        $(".xname1").remove();
    })
    //双击下钻所需参数
    var down = "";
    //这个东西是后台传来的数据中，和xvale，yvalue一级的东西，可能表示这个数字吧
        
    var paraDown = {};
    //下钻函数，这个level和referClass也是要跟随的
    function goDown(num){
        refer_class = largeObj["chart"+scIndex].fil.referClass;
        if(refer_class){
            kinds = largeObj["chart"+scIndex].kinds;
            level=largeObj["chart"+scIndex].fil.level+num;
            paraDown = {
             "objectIds":[],//过滤后的柱子在进行下钻，要
             "objectName":largeObj["chart"+scIndex].fil.typee,
             "dimensionProperty": largeObj["chart"+scIndex].fil.cont,
             "dimensionReferClass":largeObj["chart"+scIndex].fil.referClass,
             "levelParent":largeObj["chart"+scIndex].xVPoint,
             "level":level,
             "dataSetHash":largeObj["chart"+scIndex].idhash,
             // "operationProperty":fila.statistics[0],
              "operationProperty":largeObj["chart"+scIndex].fil.statistics[0],
             "operation":largeObj["chart"+scIndex].fil.way
            }
                
            $.ajax({
                type:"POST",
                url:EPMUI.context.url+'/chart/chartData',
                dataType:"json",
                data:{
                    operationDataString: JSON.stringify(paraDown)
                },
                success:function(data){
                    if(data){
                        if(way=="percent"){
                            for(var i=0;i<data.statisticalItems.length;i++){
                                if(data.statisticalItems[i].yValue!=0){
                                    data.statisticalItems[i].yValue=data.statisticalItems[i].yValue.replace("%","");
                                }
                            }
                            data.yName=data.yName+"%";
                        }
               
                        largeObj["chart"+scIndex].information=[];
                        largeObj["chart"+scIndex].information.push(data);
                        largeObj["chart"+scIndex].fil.level=level;
                        largeObj["chart"+scIndex].informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].information));
                        information = largeObj["chart"+scIndex].information;
                                                                                                           
                        $("#dv4 svg").remove();
                        largeObj["chart"+scIndex].kinds=="yz" ? bar(information,"draw") : (largeObj["chart"+scIndex].kinds=="zx" ? line(information,"draw") : pie(information,"draw"));
                        retreatDataSave(largeObj["chart"+scIndex]);
                    }
                        
                }
            })
        }
    }
    
    //汇聚,现在这个汇聚有可能有两个x轴的值，所以不传x轴的刻度，返回的是全部的上一级
    function goUp(num){
        refer_class = largeObj["chart"+scIndex].fil.referClass;
        if(refer_class){        
            kinds = largeObj["chart"+scIndex].kinds;
            largeObj["chart"+scIndex].fil.level-num > 0 ? level=largeObj["chart"+scIndex].fil.level-num : level=largeObj["chart"+scIndex].fil.level ;
            paraDown = {
             "objectName":largeObj["chart"+scIndex].fil.typee,
             "dimensionProperty": largeObj["chart"+scIndex].fil.cont,
             "dimensionReferClass":largeObj["chart"+scIndex].fil.referClass,
             "level":level,
             "operationProperty":largeObj["chart"+scIndex].fil.statistics[0],
             "operation":largeObj["chart"+scIndex].fil.way
            }
                
        }
        $.ajax({
            type:"POST",
            url:EPMUI.context.url+'/chart/chartData',
            dataType:"json",
            data:{
                operationDataString: JSON.stringify(paraDown)
            },
            success:function(data){
                if(data){
                    if(way=="percent"){
                        for(var i=0;i<data.statisticalItems.length;i++){
                            if(data.statisticalItems[i].yValue!=0){
                                data.statisticalItems[i].yValue=data.statisticalItems[i].yValue.replace("%","");
                            }
                        }
                        data.yName=data.yName+"%";
                    }
    
                    largeObj["chart"+scIndex].fil.information=[];
                    largeObj["chart"+scIndex].fil.information.push(data);
                    largeObj["chart"+scIndex].fil.level=level;
                    largeObj["chart"+scIndex].fil.informationPastAll.push(Object.assign([],largeObj["chart"+scIndex].fil.information));
                    information = largeObj["chart"+scIndex].fil.information;
    
                                                       
                    $("#dv4 svg").remove();
                    largeObj["chart"+scIndex].kinds=="yz" ? bar(information,"draw") : (largeObj["chart"+scIndex].kinds=="zx" ? line(information,"draw") : pie(information,"draw"));
                    retreatDataSave(largeObj["chart"+scIndex]);
                }      
            }
        })
    }
    //隐藏下钻汇聚的弹框
    $("#up_down").mouseleave(function(){
        $(this).hide();
      });
    //？？？？？？？？？？？？？？？？？待开发功能，不能下钻或汇聚了要告知用户，记录有没有执行GoDown函数，和GoUp函数
    var downMark;
    var upMark;
    
    //回退的深拷贝函数，数组是复杂数据类型传址
    // window.deepCopy = function (daa,drawDaa){
    //  var deepData;
    //  $.extend(true,deepData,daa);
    //  drawDaa.push(deepData);
        
    // }
    // 待开发页面下方保存每次过滤的图表，每执行一次画图函数，就要执行一遍这个函数（往大div里添加一个小div）
    function chartRecord (){
        var n=1;
        $("#topology_chart_record").append("div");
    }
    
    //把每一次统计向后台传输的数据保存下来，用于后退
    window.retreatDataSave = function(obj) {
        obj.drawData.dataScope.push(obj.fil.dataScope);//英文
        obj.drawData.classify.push(obj.fil.classify);
        obj.drawData.typee.push(obj.fil.typee);
        obj.drawData.cont.push(obj.fil.cont);
        obj.drawData.statistics.push(obj.fil.statistics);
        obj.drawData.way.push(obj.fil.way);
        obj.drawData.filter.push(obj.fil.filter);
        obj.drawData.referClass.push(obj.fil.referClass);
        obj.drawData.level.push(obj.fil.level);
    
        obj.drawDataDis.dataScope.push(obj.filDis.dataScope);//中文
        obj.drawDataDis.classify.push(obj.filDis.classify);
        obj.drawDataDis.typee.push(obj.filDis.typee);
        obj.drawDataDis.cont.push(obj.filDis.cont);
        obj.drawDataDis.statistics.push(obj.filDis.statistics);
        obj.drawDataDis.way.push(obj.filDis.way);
        obj.drawDataDis.filter.push(obj.filDis.filter);
    }
    
    //后退时，保存数据付给当前数据，在给后端发请求时使用，删除后退之前的数据保存
    window.retreatDataSaveDel = function(obj) {
        obj.fil.dataScope = obj.drawData.dataScope[obj.drawData.dataScope.length-2];
        obj.fil.classify = obj.drawData.classify[obj.drawData.classify.length-2];
        obj.fil.typee = obj.drawData.typee[obj.drawData.typee.length-2];
        obj.fil.cont = obj.drawData.cont[obj.drawData.cont.length-2];
        obj.fil.statistics = obj.drawData.statistics[obj.drawData.statistics.length-2];
        obj.fil.way = obj.drawData.way[obj.drawData.way.length-2];
        obj.fil.filter = obj.drawData.filter[obj.drawData.filter.length-2];
        obj.fil.level = obj.drawData.level[obj.drawData.level.length-2]
        obj.fil.referClass = obj.drawData.referClass[obj.drawData.referClass.length-2]
    
        obj.filDis.dataScope = obj.drawDataDis.dataScope[obj.drawDataDis.dataScope.length-2];
        obj.filDis.classify = obj.drawDataDis.classify[obj.drawDataDis.classify.length-2];
        obj.filDis.typee = obj.drawDataDis.typee[obj.drawDataDis.typee.length-2];
        obj.filDis.cont = obj.drawDataDis.cont[obj.drawDataDis.cont.length-2];
        obj.filDis.statistics = obj.drawDataDis.statistics[obj.drawDataDis.statistics.length-2];
        obj.filDis.way = obj.drawDataDis.way[obj.drawDataDis.way.length-2];
        obj.filDis.filter = obj.drawDataDis.filter[obj.drawDataDis.filter.length-2];
    
        obj.drawData.dataScope.pop();
        obj.drawData.classify.pop();
        obj.drawData.typee.pop();
        obj.drawData.cont.pop();
        obj.drawData.statistics.pop();
        obj.drawData.way.pop();
        obj.drawData.filter.pop();
        obj.drawData.level.pop();
        obj.drawData.referClass.pop();
    
        obj.drawDataDis.dataScope.pop();
        obj.drawDataDis.classify.pop();
        obj.drawDataDis.typee.pop();
        obj.drawDataDis.cont.pop();
        obj.drawDataDis.statistics.pop();
        obj.drawDataDis.way.pop();
        obj.drawDataDis.filter.pop();
    }
    
    //回退功能
    $("#retreat").on("click", function() {
        if(largeObj["chart"+scIndex].informationPastAll.length>1){  
            $("#draw svg").remove();
            $(".xname").remove();
            $(".yname").remove();
            $(".tableName").remove();
            largeObj["chart"+scIndex].information=[];
            largeObj["chart"+scIndex].information=largeObj["chart"+scIndex].informationPastAll[largeObj["chart"+scIndex].informationPastAll.length-2];
            if(largeObj["chart"+scIndex].kinds=="yz"){
                bar(largeObj["chart"+scIndex].information,"draw");
            }else if(largeObj["chart"+scIndex].kinds=="zx"){
                line(largeObj["chart"+scIndex].information,"draw");
            }else if(largeObj["chart"+scIndex].kinds=="yb"){
                pie(largeObj["chart"+scIndex].information,"draw");
            }
            largeObj["chart"+scIndex].informationPastAll.pop();
            retreatDataSaveDel (largeObj["chart"+scIndex]);
            largeObj["chart"+scIndex].chartFCNow=[];
            largeObj["chart"+scIndex].chartFCNow=[];
            largeObj["chart"+scIndex].chartFCNow=largeObj["chart"+scIndex].chartFCPastAll[largeObj["chart"+scIndex].chartFCPastAll.length-2];
            largeObj["chart"+scIndex].chartFCPastAll.pop();
            showMessage();
        }else{
            return false;
        }                 
    })
    
    //图表的导出，如果图表被叠加统计过，导出的各项，将是有多项的数组
    var name_;//导出文件的名字
    var export_data =[];//导出图表的画图数据
    var export_type;//导出图表的文件类型
    var parameter;//这张图表请求的时候，向后台发的参数 ，此处为了保证图表导入时还能进行操作
    var parameterDis;//向后台发的参数对应的中文，用于信息展示
    var reauestData = [];
    function dataChange () {
        for(var i=0;i<export_data.length;i++){
            var reauestDataObj = {
                "systemRequestParameters":{
                    "dataScope":null,
                    "classify":null,
                    "object":null,
                    "dimension":null,
                    "operationProperty":null,
                    "operation":null,
                    "filters":[],
                    "level":null,
                    "levelParent":null
                },
                "displayRequestParameters":{
                    "dataScope":null,
                    "classify":null,
                    "object":null,
                    "dimension":null,
                    "operationProperty":null,
                    "operation":null,
                    "filters":[]
                },
                "chartData":null
            }
            reauestDataObj.systemRequestParameters.dataScope=parameter.dataScope[i];//此处其实应该变成数组
            reauestDataObj.systemRequestParameters.classify=parameter.classify;
            reauestDataObj.systemRequestParameters.object=parameter.typee;
            reauestDataObj.systemRequestParameters.dimension=parameter.cont;
            reauestDataObj.systemRequestParameters.operationProperty=parameter.statistics[i];
            reauestDataObj.systemRequestParameters.operation=parameter.way;
            reauestDataObj.systemRequestParameters.filters=parameter.filter[i];
            reauestDataObj.systemRequestParameters.level=parameter.level;
            reauestDataObj.systemRequestParameters.levelParent=parameter.levelParent;
    
            reauestDataObj.displayRequestParameters.dataScope=parameterDis.dataScope[i];
            reauestDataObj.displayRequestParameters.classify=parameterDis.classify;
            reauestDataObj.displayRequestParameters.dimension=parameterDis.cont;
            reauestDataObj.displayRequestParameters.object=parameterDis.typee;
            reauestDataObj.displayRequestParameters.operationProperty=parameterDis.statistics[i];
            reauestDataObj.displayRequestParameters.operation=parameterDis.way;
            reauestDataObj.displayRequestParameters.filters=parameterDis.filter[i];
    
            reauestDataObj.chartData = export_data[i];
            reauestData.push(reauestDataObj);
        }
    }
    
    $("#chart_export").on("click",function() {
        $("#chart_export").addClass('icon-export-blue').removeClass('icon-export2');
        export_type ="excel";
        name_ = largeObj["chart"+scIndex].information[0].tableName;
        name_ = '图表';
        export_data = largeObj["chart"+scIndex].information;
        
        $(".export_menu").show();
        $("#chartexport_filename").val("");
        $("#chartexport_filename").attr("placeholder",name_);
    })
    $(".export_type").on("click",function() {
        $(".export_type").addClass('icon-hollow-circle typeNoCheck').removeClass('icon-dot-circle typeCheck');
        $(this).addClass('icon-dot-circle').removeClass('icon-hollow-circle').addClass('typeCheck').removeClass('typeNoCheck');
        export_type = $(this).text();
    })
    $(".export_menu_sure").on("click",function() {
        $("#chart_export").addClass('icon-export2').removeClass('icon-export-blue');
        $("#chart_export_form").remove(); 
                
        parameter = largeObj["chart"+scIndex].fil;//其实过滤参数我只要保留最后一次的就行了。因为在进行过滤也是在，最有一个柱子的基础上，不会涉及前两个柱子
        parameterDis = largeObj["chart"+scIndex].filDis;
        
        $("#chartexport_filename").val() ? name_=$("#chartexport_filename").val() : name_ ;
    
        dataChange ();
    
        chartExport({"fileName":'图表',
                     "type":export_type,
                     "data":JSON.stringify(reauestData)
                    });
    
        //JSON.stringify()
        function chartExport(obj){
            var url = EPMUI.context.url+'/export/chartfile';
            var form = $("<form>");//快速定义一个form表单
            form.attr({
                "id":"chart_export_form",
                "style":"display:none",
                "target":"",
                "method":"POST",
                "action":url,
                "enctype":"multipart/form-data",//指定传送的编码格式，数据量太大，ajax传送不过去
                //"onsubmit":"return false"
            })
            for(var key in obj){
                var input = $("<input>");
                input.attr({
                    "type":"hidden",
                    "name":key,//input的name可以让后台获取数据时，知道我传的这个数据是什么
                    "value":obj[key]
                });
                form.append(input);
            }
            $("body").append(form);//将表单放置在web中  
            form.submit();//表单提交
        }
    
        $(".export_menu").hide();
        $(".export_type").addClass('typeNoCheck icon-hollow-circle').removeClass('typeCheck icon-dot-circle');
        $(".export_type").eq(0).addClass('icon-dot-circle').removeClass('icon-hollow-circle');
        $("#chartexport_filename").removeAttr("palceholder");   
        reauestData = [];
    })  
    $(".export_menu_cancel").on("click",function() {
        $("#chart_export").addClass('icon-export2').removeClass('icon-export-blue');
        $(".export_menu").hide();
        $(".export_type").addClass('typeNoCheck icon-hollow-circle').removeClass('typeCheck icon-dot-circle');
        $(".export_type").eq(0).addClass('icon-dot-circle').removeClass('icon-hollow-circle');
        $("#chartexport_filename").removeAttr("palceholder");
    })
    //图表的导入，导入时要注意的问题是，这个请求参数一旦少了某项，将不能对图表进行操作，需给用户提示
    //type=file,的input样式不能改变，我们能做的是，做一个我们要的样式块，盖在他的上面，点击上面触发了点击input的事件
    //表单提交有三种方式1.用ajax 2.在html里写form表单 3.html中没有form表单，用就是写一个隐藏的form，和一些input用来传送信息
    // $("#chart_import").click(function(){
    //  $(".import_menu").show();
    // })
    $("#chart_import_file_").on("click",function(){
        $("#chart_import_file").click();
    })
    $(".import_menu_sure").on("click",function(){
        $("#chart_import_form").remove();
        function chartImport(){
            //var url = ;
            var form = $("<form>");//快速定义一个form表单
            form.attr({
                "id":"chart_import_form",
                "style":"display:none",
                "target":"",
                "method":"POST",
                //"action"url,
                "enctype":"multipart/form-data"//指定传送的编码格式，数据量太大，ajax传送不过去
            })       
            form.append($("#chart_import"));       
            $("body").append(form);//将表单放置在web中  
            form.submit();//表单提交
        }
    })
    $(".import_menu_cancel").on("click",function(){
        $(".import_menu").hide();
        //清除input里的东西
    })
    
    $("#up").on("click",function(){
        goUp(1);
    });
    $("#down").on("click",function(){
        goDown(1);
    });
    
    //快照功能
    $("#chart_camera").on("click",function(){
        if($("#draw").find("svg").length!==0){
            $("#chart_camera").addClass('icon-camera-blue').removeClass('icon-camera2');
            camera();
        }
       
    
        // $(".chart_phone button").click(function(){
        //     $("#chart_camera").addClass('icon-camera2').removeClass('icon-camera-blue');
        //     $(".chart_phone").hide();
        // })
        // $("#chart_phone_sure").click(function(){
        //     $("#chart_camera").addClass('icon-camera2').removeClass('icon-camera-blue');
        //     $(".chart_phone").hide();
        // })  
    })
    $(".chart_phone button").click(function(){
        $("#chart_camera").addClass('icon-camera2').removeClass('icon-camera-blue');
        $(".chart_phone").hide();
    })
    $("#chart_phone_sure").click(function(){
        $("#chart_camera").addClass('icon-camera2').removeClass('icon-camera-blue');
        $(".chart_phone").hide();
    })  
    function camera(){
        if(isIE()){
            alert('IE浏览器不支持截图');
            return null;
            $(".chart_phone").show();
            const target = document.getElementById("draw").childNodes[0];
            const pngName = $('.tableName').text() + '.png';
            html2canvas(target).then(function (canvas) {
                canvas.id = "mycanvas";
                var dataUrl = canvas.toDataURL();
                var newImg = document.getElementById("save_img_chart");//图片对象
                var newAdown = document.getElementById("chart_phone_sure");
                newImg.src = dataUrl;
                newAdown.href = dataUrl;
                newAdown.download = pngName;
            }); 
        }
        const listLength = document.getElementsByClassName('svgsvg').length;
        const target = document.getElementsByClassName('svgsvg')[listLength-1];//document.getElementById("draw").childNodes[0];
        const pngName = $('.tableName').text()  + '.png';
        const theme = document.cookie;
        const backgroundColor = theme.includes("black") ? "#131b21" : theme.includes("white") ? "#fff" : "#f9f9fb";
        saveSvgAsPng(target,pngName,{"backgroundColor":backgroundColor});
    }
    
	function isIE() {
		if (window.ActiveXObject || "ActiveXObject" in window || navigator.userAgent.includes("Edge")) return true;
		else return false;
	}
    //发布图表到dashboard 
    //获取dashboard信息,模板类型，dashboard的id，空位
    function getDashboardInfo(){
        $.ajax({
            url: EPMUI.context.url+'/dashboard/get/currentuser', 
            type: 'GET',
            dataType: 'json',
            error: function(err) {
            },
            success: function (data) {
                if(data.code == 200){
                    var datas = data.magicube_interface_data;
                    //此处如果有style应该返回style啊
                    
                    localStorage.setItem('dashboardTemplate',datas.template)
                    localStorage.setItem('noFill', datas.nofill);
                    localStorage.setItem('dashboardId', datas.id);
                    localStorage.setItem('allPosition', datas.allPos);
                }
                
            }
        })  
    } 
    getDashboardInfo();
    
    //发布到dashboard
    $('#chartPublish').click(function(){
        $('.chart_pubilsh').show();    
    })
    
    var template = [
        {
            'template': 'A',
            'allPosition': [0, 1, 2, 3, 4, 5, 6],
            'nofill': [0, 1, 2, 3, 4, 5, 6],
            'style': [],
            'enable': 1
        },
        {
            'template': 'B',
            'allPosition': [0, 1, 2, 3, 4, 5, 6],
            'nofill': [0, 1, 2, 3, 4, 5, 6],
            'style': [],
            'enable': 0
        },
        {
            'template': 'C',
            'allPosition': [0, 1, 2, 3, 4, 5],
            'nofill': [0, 1, 2, 3, 4, 5],
            'style': [],
            'enable': 0
        }
    ]

    $('.chart_publish_ensure').click(function(){    
        var templateType, noFill, sPos, ePos;
        //localStorage.getItem('dashboardTemplate') ? templateType = localStorage.getItem('dashboardTemplate') :
        //templateType = 'A';
        //根据模板，安排模板情况
        // if(templateType == 'A'){
        //     sPos = 0;
        //     ePos = 6;
        //     noFill = [0, 1, 2, 3, 4, 5, 6];
        // }
        // if(localStorage.getItem('noFill')){
        //     noFill = JSON.parse(localStorage.getItem('noFill'));
        // }
        

        //非第一次发布图表函数
        function secondTimePublish() { 
            noFill = JSON.parse(localStorage.getItem('noFill'));
            if(noFill.length > 0){
                var noFill_ = [], position;
                $.extend(true, noFill_, noFill);
                //是否指定了图表位置
                if(localStorage.getItem('posi')){
                    position = parseInt(localStorage.getItem('posi'));
                    for(var i=0; i<noFill_.length;i++){
                        if(noFill_[i]==position){
                            noFill_.splice(i,1);
                        }
                    }
                    localStorage.removeItem('posi')
                }else{
                    noFill_.splice(0,1);
                    position = noFill[0];
                }
                $.ajax({
                    url: EPMUI.context.url+'/dashboard/publish', 
                    type: 'POST',
                    data: {
                        "dashboardId": localStorage.getItem('dashboardId'),
                        "type": largeObj["chart"+scIndex].kinds,
                        "param": JSON.stringify(largeObj["chart"+scIndex].chartFCNow),
                        "position": position,
                        "nofill": JSON.stringify(noFill_),
                        "dataTip":JSON.stringify(largeObj["chart"+scIndex].filDis.filter)
                    },
                    dataType: 'json',
                    error: function(err) {
                    },
                    success: function (data) {
                        if(data){
                            $('.chart_pubilsh').hide();
                            location.href = '/dashboard';
                        }
                    }
                })
                
            }else{
                $('.chart_pubilsh').hide();
                $("#dv4").append('<div class="dashbNoPlaceTip"></div>');
        
                $('.dashbNoPlaceTip').html('<p>dashboard已占满，无位置！</p><button class="no_place_ensure">确定</button>');
                
                $('.no_place_ensure').click(function(){
                    $('.dashbNoPlaceTip').remove();
                })
            }
        }

    
        //非第一次发布图表到dashboard
        if(localStorage.getItem('dashboardId')){
            secondTimePublish();

        //第一次发布图表初始化模板
        }else{
            let sign = false;
            template.forEach(function(item, i){
                $.ajax({
                    url: EPMUI.context.url+'/dashboard/create', 
                    type: 'POST',
                    data: {'template': item.template,
                           'allPosition': JSON.stringify(item.allPosition),
                           'nofill': JSON.stringify(item.nofill),
                           'style': item.style,
                           'enable': item.enable
                    },
                    dataType: 'json',//异步请求返回结果是ajax请求dataType值为json，jquery就会把后端返回的字符串尝试通过JSON.parse()尝试解析为js对象
                    // contentType:
                    success: function (data) {
                        if(data.code == 200 && i==0){
                            //执行发布图表函数          
                            econdTimePublish()            
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                    }
                }) 
            })
            
                 
        }
                              
    })
    
    $('.chart_publish_cancel').click(function(){
        $('.chart_pubilsh').hide();
    })
    
    
    
    
    
    
    
    




















})

