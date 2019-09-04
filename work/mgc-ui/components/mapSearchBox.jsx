import React, { Component } from 'react';

class MapSearchBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title : ["实体","事件","文档"],
            mapAdvanceSearchFlag : "false",
            mapSelectValue : ''
        };
    }

    componentDidmount (){
        let mapStyle = this.getCookie("theme");
        if(mapStyle === "white"){
            $(".map_select_btn").removeClass("map_select_btn_background").css("background","#fff").css("border","1px soloid #23b9e7");
        }
    }

    handleMouseOverResult(){//鼠标悬停事件
        $(".map_select_resultDiv").css("height","610px");
        $(".map_select_resultDivSmall").css("height","0px");
    }

    handleClickInput(e){//点击输入框事件
        e.preventDefault();
        e.stopPropagation();
        $(".map_select_btn_div").css("width","210px");
        $(".map_select_btn").css("width","82px");
    }

    handleKeyDownInput(event){//输入框回车事件
        if (event.keyCode == 13) {
            this.searchValue();
        };
    }

    handleClickSearch(){// 点击 搜索按钮
        this.searchValue();
    }

    handleClickAdvanceSearch(){//点击 高级搜索 按钮
        let _that = this;
        $("#map_search_shade").animate( { 'top': 0, 'right': 0, 'bottom': 0, 'left': 0 }, 100, 'linear', function() {
            $("#map_advance_search_content").show();
            window.mapAreaValue = [];
        } );

        //关闭高级搜索
        $("#map_advance_search_cancel").on( 'click', function() {
            $("#map_advance_search_content").hide();
            $("#map_search_shade").animate( { 'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%' }, 100, 'linear' );
        } );
        //高级搜索
        $("#map_advance_search_ensure").on( 'click', function() {
            $("#map_advance_search_content").hide();
            $("#map_search_shade").animate( { 'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%' }, 100, 'linear' );
            // 检索内容
            var keywAdvance = $.trim( $("#map_advance_search_value").val() ) ? $.trim( $("#map_advance_search_value").val() ): "";
            // 时间设定
            var startTime = $.trim($("#map_advance_search_time").val()) ? $.trim($("#map_advance_search_time").val().split("~")[0]) : "";
            var endTime = $.trim($("#map_advance_search_time").val()) ?$.trim($("#map_advance_search_time").val().split("~")[1]) : "";
            // 搜索框搜索关键字填入检索内容
            $("#map_select_input").val( keywAdvance );

            _that.setState({
                mapAdvanceSearchFlag:"true",
                mapSelectValue:keywAdvance
            });

            var propertyArr = [];
            // 对象筛选
            $(".property_value").each( function( index, item ) {
                var value = $.trim( $( item ).text() ).split( "_" );
                if( !!value[3] ) {
                    var propertyObj = {
                        "rootType": $(item).attr("data-root"),//获取属性值
                        "objectType": $(item).attr("data-object"),
                        "property": $(item).attr("data-type"),
                        "dataType": $(item).attr("data-flag"),
                        "value": value[3]
                    };
                    propertyArr.push( propertyObj );
                }
            } );

            //默认高级搜索从全部内容检索
            var advanceData = {
                objectType: "Entity",
                pageSize: 5,
                keyWord: keywAdvance,
                startTime: startTime,
                endTime: endTime,
                property: JSON.stringify( propertyArr )
            };

            localStorage.setItem("mapAdvanceBody", JSON.stringify( advanceData ));
            //搜索完成关闭弹框
            $("#map_advance_search_content").hide();
            $("#map_search_shade").animate( { 'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%' }, 100, 'linear' );

            localStorage.setItem("mapAdvanceSearchFlag", _that.state.mapAdvanceSearchFlag);
            _that.mapSelectPagination("noUse","Entity");

        } );
    }

    handleClickType(type){//点击搜索的类型，实体时间文档
        this.mapEntityTypeSearch(type);
    }

    handleMouseOverContent(){//鼠标进入左侧搜索框，地图禁止滚轮事件，
        setmapProperty("drag-false","zoom-false","null");
    }

    handleMouseOutContent(){//鼠标离开搜索框，允许鼠标滚轮事件
        setmapProperty("drag-true","zoom-true","null");
    }

    getCookie(cname){
        var name = "theme" + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++)
        {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) return c.substring(name.length,c.length);
        }
        return "";
    }

    mapTrim(v){//去空格
        return v.replace(/(^\s*)|(\s*$)/g, "");
    }

    searchValue(){ //搜索结果
        let sv = $("#map_select_input").val();

        this.setState({
            mapAdvanceSearchFlag:"false",
            mapSelectValue:sv
        });

        if(this.mapTrim(sv)){
            $("#mapSelectResultPage").css("display","block");
            this.mapSelectPagination(this.mapTrim(sv),"Entity");
            //下方div显示
            $(".map_select_resultDiv").css("height","610px");
            $(".map_select_resultDivSmall").css("height","0px");
        }else {
            $("#mapSelectResultPage").css("display","none");
            $("#mapSelectResult").html(" ");
            $(".map_select_resultDivSmall").html("没有搜索结果!").css("height","40px");
            $(".map_select_resultDiv").css("height","0px");
        }

    }

    mapEntityTypeSearch(type) {//点击类型进行 搜索
        switch (type){
            case "Entity":
                $("#mapEntityType").css("color", "#33C7F5");
                $("#mapEventType").css("color", "#fff");
                $("#mapDocumentType").css("color", "#fff");
                break;
            case "Event":
                $("#mapEntityType").css("color", "#fff");
                $("#mapEventType").css("color", "#33C7F5");
                $("#mapDocumentType").css("color", "#fff");
                break;
            case "Document":
                $("#mapEntityType").css("color", "#fff");
                $("#mapEventType").css("color", "#fff");
                $("#mapDocumentType").css("color", "#33C7F5");
                break;
        }

        var sv = this.state.mapSelectValue;

        if(this.mapTrim(sv)){
            $("#mapSelectResultPage").css("display","block");
            this.mapSelectPagination(this.mapTrim(sv),type);
            //下方div显示
            $(".map_select_resultDiv").css("height","610px");
            $(".map_select_resultDivSmall").css("height","0px");
        }else {
            $("#mapSelectResultPage").css("display","none");
            $("#mapSelectResult").html(" ");
            $(".map_select_resultDivSmall").html("没有搜索结果!");
        }
    }


    //生成分页
    mapSelectPagination(keyword,searchType){
        let _that = this;
        let mapSelectPageCur = 0;//左侧搜索当前页
        let searchFlag = this.state.mapAdvanceSearchFlag;

        if(searchFlag === "false"){//普通搜索
            let urls = EPMUI.context.url + '/object/page';
            let datas = { "keyword": keyword, "type": searchType };
            let completed = function (){ return false; };
            let succeed = function(data) { setmapSelectPagination( data, searchType ); };
            let judgment = function() { return false; };
            mapCommonPart.ajaxAppMap(urls, 'POST', datas, completed, succeed, judgment);
        }else {//高级搜索
            var keywordAdvance = localStorage.mapAdvanceBody ? JSON.parse( localStorage.mapAdvanceBody ) : "";
            keywordAdvance.objectType = searchType;
            let urls = EPMUI.context.url + '/search/advancedsearch/page';
            let datas = keywordAdvance;
            let completed = function (){ return false; };
            let succeed = function(data) { setmapSelectPagination( data, searchType ); };
            let judgment = function() {
                $("#map_advance_search_content").hide();
                $("#map_search_shade").animate( { 'top': '50%', 'right': '50%', 'bottom': '50%', 'left': '50%' }, 100, 'linear' );
                showAlert( '提示', result.message, '#ffc000' );
                return '';
            };
            mapCommonPart.ajaxAppMap(urls, 'POST', datas, completed, succeed, judgment);
        }

        //设置分页
        function setmapSelectPagination( data, type ) {
            let smallMsg = "";
            if (data > 0) {
                $("#mapSelectResultPage").css("display","block");
                smallMsg = "显示详细" + data + "条信息!";
                $(".map_select_resultDiv").css("height","610px");
                $(".map_select_resultDivSmall").css("height","0px");

                $("#mapSelectResultPage").mappagination(data, {
                    callback : mapPageselectCallback,
                    prev_text : '< 上一页',
                    next_text: '下一页 >',
                    num_display_entries : 5,
                    current_page: mapSelectPageCur,
                    num_edge_entries : 1
                });

            } else {
                $("#mapSelectResultPage").css("display","none");
                if(type === "Entity"){
                    $("#mapSelectResult").html(" ");
                    $(".map_select_resultDiv").css("height","0px");
                    $(".map_select_resultDivSmall").css("height","40px");
                    smallMsg = "没有搜索结果!";
                }else{
                    $("#mapSelectResult").html(" ");
                    smallMsg = "没有搜索结果!";
                }

            }
            $(".map_select_resultDivSmall").html(smallMsg);
        }

        //分页回掉
        function mapPageselectCallback(index){
            //判断是不是高级搜索
            if(searchFlag === "false"){
                _that.mapSearch(keyword,searchType,index);
                $(".current").css("background","#299ABD").css("color","#fff");
            }else{
                let keywordAdvance = localStorage.mapAdvanceBody ? JSON.parse( localStorage.mapAdvanceBody ) : {};
                keywordAdvance.pageNo = index;
                keywordAdvance.objectType = searchType;
                _that.mapSearch(keywordAdvance,searchType,index);
                $(".current").css("background","#299ABD").css("color","#fff");
            }
        }
    }
    //后台搜索请求
    mapSearch(value,searchType,index) {
        let mapSearchKeyWord;
        let mapSearchUrl;
        if(this.state.mapAdvanceSearchFlag === "false"){
            mapSearchKeyWord = {"keyword": value, "type": searchType, "pageNo":index, "pageSize": 5};
            mapSearchUrl = EPMUI.context.url + '/search';
        }else{
            mapSearchKeyWord = value;
            mapSearchUrl = EPMUI.context.url + '/search/advancedsearch';
        }
        $.post( mapSearchUrl, mapSearchKeyWord, function (data) {
            let nullHtml = ' ';
            let img = "";
            let datas = JSON.parse(data);
            let innerHTML = '';
            let otherHTML = '';
            let msgNum = 0;
            let obj;
            let selectObjs = [];
            /* { //未使用
             this.state.userList.map((item, i) => {
             return (<label key={ i }  onClick={ this.handleClickInsertUser.bind(this, i) }>{ item.userName }</label>);
             })
             } */

            if (searchType === "Entity" &&(data !== "null")&& datas.hasOwnProperty("entity")) {

                $("#mapEntityType").css("color", "#33C7F5");
                $("#mapEventType").css("color", "#fff");
                $("#mapDocumentType").css("color", "#fff");

                for (let i = 0; i < datas.entity.length; i++) {
                    //搜索显示
                    msgNum += 1;
                    let propty = datas.entity[i].properties;

                    otherHTML += '<div class="mapResultPanel" draggable="true" data-name="'+propty[0].value+'" data-objectType="entity" data-id="'+ datas.entity[i].id+'" data-nodeId="'+datas.entity[i].nodeId+'" data-type="'+datas.entity[i].type+'"><div class="mapResultPanelIn">' +
                        '<div class="mapSelectResultImg">' +
                        '<img src="'+ EPMUI.context.url + '/image/'+ datas.entity[i].icon + '/entity" alt="头像"/>' +
                        '</div>' +
                        '<div class="mapSelectResultOne">' +
                        '<div class="mapSelectMsgDivTwo">';

                    for (let j = 0; j < propty.length; j++) {
                        let proptyValue = propty[j].value ? propty[j].value : nullHtml;
                        otherHTML += '<div class="mapSelectMsgTwo"  title="' + proptyValue +
                            '"><span>'+propty[j].displayName+':</span>' + proptyValue + '</div>';
                    }

                    otherHTML += '</div></div></div></div>';
                    obj = {
                        id: datas.entity[i].id,
                        type: datas.entity[i].type,
                        objectType: "entity",
                        name: propty[0].value,
                        nodeId: datas.entity[i].nodeId,
                        addnode: true
                    };

                    selectObjs.push(obj);
                }
            }
            if (searchType === "Event"  &&(data !== "null")) {
                $("#mapEntityType").css("color", "#fff");
                $("#mapEventType").css("color", "#33C7F5");
                $("#mapDocumentType").css("color", "#fff");
                for (let i = 0; i < datas.event.length; i++) {
                    //搜索显示
                    msgNum += 1;
                    let propty = datas.event[i].properties;
                    otherHTML += '<div class="mapResultPanel"  draggable="true" data-name="'+propty[0].value+'" data-objectType="event" data-id="'+ datas.event[i].id+'" data-nodeId="'+datas.event[i].nodeId+'" data-type="'+datas.event[i].type+'"><div class="mapResultPanelIn">' +
                        '<div class="mapSelectResultImg icon-document-white iconSpecial">' +
                        '</div>' +
                        '<div class="mapSelectResultOne">' +
                        '<div class="mapSelectMsgDivTwoEvent">';
                    for (let j = 0; j < propty.length; j++) {
                        let proptyValue = propty[j].value ? propty[j].value : nullHtml;
                        otherHTML += '<div class="mapSelectMsgTwo" title="' + proptyValue + '"><span>'+propty[j].displayName+':</span>' + proptyValue + '</div>';
                    }
                    otherHTML +='</div></div></div></div>';
                    obj = {
                        id: datas.event[i].id,
                        type: datas.event[i].type,
                        objectType: "event",
                        name: propty[0].value,
                        nodeId: datas.event[i].nodeId,
                        addnode: true
                    };
                    selectObjs.push(obj);
                }
            }
            if (searchType === "Document"  &&(data !== "null")) {
                $("#mapEntityType").css("color", "#fff");
                $("#mapEventType").css("color", "#fff");
                $("#mapDocumentType").css("color", "#33C7F5");
                for (let i = 0; i < datas.document.length; i++) {
                    //搜索显示
                    msgNum += 1;
                    let propty = datas.document[i].properties;
                    otherHTML += '<div class="mapResultPanel"  draggable="true" data-name="'+propty[0].value+'" data-objectType="document" data-id="'+ datas.document[i].id+'" data-nodeId="'+datas.document[i].nodeId+'" data-type="'+datas.document[i].type+'"><div class="mapResultPanelIn">' +
                        '<div class="mapSelectResultImg icon-related-file-white iconSpecial">' +
                        '</div>' +
                        '<div class="mapSelectResultOne">';
                    otherHTML += '<div class="mapSelectMsgDiv">' +
                        '<div class="mapSelectMsgDivDocument" title="' + propty[0].value + '"><span>'+propty[0].displayName+':</span>' + propty[0].value + '</div>' +
                        '</div>' +
                        '<div class="mapSelectMsgDivDocument">';
                    for (let j = 1; j < propty.length && j < 3; j++) {
                        let pvalue = propty[j].value;
                        if(typeof(pvalue) == "undefined"){
                            pvalue = " ";
                        }
                        otherHTML += '<div class="mapSelectMsgTwo"><span>'+propty[j].displayName+':</span>' + pvalue + '</div>';
                    }
                    otherHTML += '</div>';
                    for (let j = 3; j < propty.length && j < 5; j++) {
                        let pvalue = propty[j].value ? propty[j].value : nullHtml;
                        otherHTML += '<div class="mapSelectMsgDiv">' +
                            '<div class="mapSelectMsgDivDocument" title="' + pvalue +
                            '"><span>'+propty[j].displayName+':</span>' + pvalue
                            + '</div>' +
                            '</div>' ;
                    }
                    otherHTML +='</div></div></div>';
                    obj = {
                        id: datas.document[i].id,
                        type: datas.document[i].type,
                        objectType: "document",
                        name: propty[0].value,
                        nodeId: datas.document[i].nodeId,
                        addnode: true
                    };
                    selectObjs.push(obj);
                }
            }
            $("#mapSelectResult").html(innerHTML + otherHTML);
            // 获取这些点 在地图上显示 循环，加点
            let selectGisById = [];
            let selectGisByType = [];
            for (let i = 0; i < selectObjs.length; i++) {
                selectGisById.push(selectObjs[i].id);
                selectGisByType.push(selectObjs[i].type);
            }

            //每一条点击 样式变化，地图对应点选中  只有这里涉及到了连接 外部的方法
            $(".mapResultPanel").unbind("click").bind("click",function () {
                $(this).siblings().css("backgroundColor","rgba(0, 0, 0, 0)");
                $(this).css("backgroundColor","#41525e");
                getBaseMessage(true,this.dataset.id, this.dataset.type, true);//基础信息展示
                mapSearchResult(this.dataset.id);//每一条点击 样式变化，地图对应点选中
            });
            mapCommonPart.removeMapDragEvent(".mapResultPanel");//移除绑定事件
            mapCommonPart.dragDomToMap(".mapResultPanel");//左侧搜索拖拽功能
        });
    }




  render() {
    const { title } = this.state;
    return (
      <div id="map_select" className= "map_select">
        <div className= "map_select_panel">
          <div className="map_selectDiv">
            <div className="map_select_input_div">
              <input type="text" id="map_select_input" placeholder="  输入进行搜索..."
                     onClick={this.handleClickInput.bind(this) } onKeyDown={this.handleKeyDownInput.bind(this)}/>
            </div>
            <div className="map_select_btn_div">
              <div>
                <button id="selectObject" className="map_select_btn map_select_btn_background" onClick={this.handleClickSearch.bind(this)}>搜对象</button>
                <button id="selectSuper" className="map_select_btn map_select_btn_background" onClick={this.handleClickAdvanceSearch.bind(this)}>高级检索</button>
              </div>
            </div>
          </div>
          <div className="map_select_resultDiv" onMouseOver={this.handleMouseOverContent.bind(this)} onMouseOut={this.handleMouseOutContent.bind(this)}>
            <div className="mapselectTypeDiv">
              <div id="mapEntityType" className="mapselectType" onClick={this.handleClickType.bind(this,"Entity")}>实体</div>
              <div className="mapEntityTypeJX">|</div>
              <div id="mapEventType" className="mapselectType" onClick={this.handleClickType.bind(this,"Event")}>事件</div>
              <div className="mapEntityTypeJX">|</div>
              <div id="mapDocumentType" className="mapselectType" onClick={this.handleClickType.bind(this,"Document")}>文档</div>
            </div>
            <div id="mapSelectResult">

            </div>
            <div id="mapSelectResultPage"> </div>
          </div>
          <div className="map_select_resultDivSmall" onMouseOver={this.handleMouseOverResult.bind(this)}>显示详细0条信息! </div>
        </div>
      </div>
    );
  }

}

export default MapSearchBox;
export {MapSearchBox};