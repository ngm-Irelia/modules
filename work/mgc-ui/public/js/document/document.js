$(function(){

  var contentData = [],
      propertyData = [],
      propertyTypeData = [],
      propertyList = [],
      oldContent = "",
      rangeObj,
      insertObj,
      objectId,
      objectPageType,
      objectType,
      relateSource,
      relateTarget,
      lastEntryId,
      currentEntryId,
      setTime,
      DOCUMENT = '文档',
      DOCUMENT_NAME = '文档名称',
      DOCUMENT_AUTHOR = '作者',
      DOCUMENT_TIME = '发表时间',
      DOCUMENT_CONTENT = '文档内容',
      FUNC_ABSTRACT = '文档摘要',
      FUNC_KEYWORD = '关键词',
      FUNC_SENSITIVE = '敏感词条',
      FUNC_CLASSFY = '文档分类',
      FUNC_ENTITY = '命名实体';

  initDocument();

  //编辑器的选项
  var toolbarOptions = [
    ['bold', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
  ];

  //初始化编辑器
  new Quill('#document_origintext_content', {
    modules: {
      toolbar: toolbarOptions
    },
    theme: 'snow'
  });

  //document的初始化
  function initDocument(){

    getDocumentData();  //获取文档数据
    getPropertyType();  //获取属性类型

  }

  //获取文章信息
  function getDocumentData(){
    $.get( EPMUI.context.url + '/object/detailInformation/' + Magicube.id + '/' + Magicube.type, function(data){
      if( !data ) {
        return false;
      }
      var datas = JSON.parse(data);
      if(datas.magicube_interface_data.property.all.length > 0){
        contentData = datas.magicube_interface_data.property.all[0].value;//放文档原文中的显示内容，是一个数组，
        // setContentHead();
        // setContentOrigintext();
        setContentDigest();
      }else{
        contentData = [];
      }

      //当获取数据成功显示富文本编辑器，显示文章内容，显示盒子，隐藏loading
      $(".ql-toolbar").show();
      $("#document_content").show();
      $("#document_tab_box").show();
      $("#makeEntity").show();
      $("#document_loading").hide();
     
    } );
  }

  //获取属性类型
  function getPropertyType() {
    $.get(EPMUI.context.url +  '/document/objecttypeproperty', function( data ) {
      propertyData = JSON.parse( data );
      getPropertyDta();
    } )
  }

  //获取标题
  // function setContentHead(){
  //   var date = contentData[2].value ? contentData[2].value : "未知";
  //   var name = contentData[1].value ? contentData[1].value : "未知";
  //
  //   $("#document_title").html( contentData[0].value );
  //   $("#document_tiau").html( '<span class="document_time">' + contentData[2].display + '：' + date + '</span><span class="document_name">' + contentData[1].display + '：' + name + '</span>' )
  // }

  //动态创建原文
  // function setContentOrigintext(){
  //   var str = contentData[3].value;
  //   oldContent = str;
  //   $(".ql-editor:eq(0)").html( str );
  //   dragTextToEntity( $(".makeEntityActive"), "property" );
  //   getEntryDetail();
  //   checkDetail();
  // }

  //动态创建摘要
  function setContentDigest(){
    var content = '';

    contentData.forEach(function (item, i) {

      var values = item.value || '',
        keywordStr = '', vateShow;

      // 文档名称
      if ( item.display && item.display === DOCUMENT_NAME || item.display === DOCUMENT ) {
        // $("#document_title").html( values );
        $("#document_title").html( values[0].value );
      }

      // 作者
      if ( item.display && item.display === DOCUMENT_TIME ) {
        // $(".document_time").text( item.display + ': ' + values );
        if( values[0].value){
          $(".document_time").text( item.display + ': ' + values[0].value );
        }
        
      }

      // 发表时间
      if ( item.display && item.display === DOCUMENT_AUTHOR ) {
        // $(".document_name").text( item.display + ': ' + values );
        if( values[0].value){
          $(".document_name").text( item.display + ': ' + values[0].value );
        }
        
      }

      // 文档内容
      if ( item.display && item.display === DOCUMENT_CONTENT ) {
        // oldContent = values;
        oldContent = values[0].value;
        var values1 = "<p>"+values[0].value+"</p>";//这么处理可不是办法，要让后端把每个段落都用p包着
        /*for(let i=0; i<3; i++){
          values1 += values1;
        }*/
        $(".ql-editor:eq(0)").html( values1 );//后端返回的数据直接就带了<em>标签
        // 原文增加滚动条插件
        $("#document_origintext_content").mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });
        dragTextToEntity( $(".makeEntityActive"), "property" );//把文字拖拽到实体上
        getEntryDetail();
        checkDetail();//切换到实体详情页面
      }

      // 摘要
      if ( item.display && item.display === FUNC_ABSTRACT ) {
        // content += '<div class="content_digest_list">'
        //   +   '<h4>' + item.display + ':' + '</h4>'
        //   +   '<span class="digestInline">' + values + '</span>'
        //   +'</div>';
        if(values[0].value){
          content += '<div class="content_digest_list">'
          +   '<h4>' + item.display + ':' + '</h4>'
          +   '<span class="digestInline">' + values[0].value + '</span>'
          +'</div>';
        }        
      }

      // 文档分类
      if( item.display && item.display === FUNC_CLASSFY ) {
        //if ( values && typeof values !== 'object') values = JSON.parse(values);

        // for (var j = 0; j < values.length; j++) {
        //   vateShow = ( Math.round( values[j].vate * 10000 ) ) / 100;
        //   keywordStr += '<span class="digestInline"><span class="dot">● </span>'
        //     + values[j].name +': 置信度'+ vateShow +'%</span>';
        // }
        // content += '<div class="content_digest_list">'
        //   + '<h4>'+ item.display +'</h4>'
        //   + keywordStr
        //   +'</div>';
      }

      // 关键词|敏感词条
      if ( item.display && item.display === FUNC_KEYWORD ||
        item.display === FUNC_SENSITIVE ) {
        // var keywords = values.split(';');
        // for (var j = 0; j < keywords.length; j++) {
        //   keywordStr += '<span class="digestInline">'+ keywords[j] +'</span>';
        // }
        // content += '<div class="content_digest_list">'
        //   +   '<h4>' + item.display + ':' + '</h4>'
        //   +   keywordStr
        //   +'</div>';
      }

      //  命名实体
      if ( item.display && item.display === FUNC_ENTITY ) {
        content += '<div class="content_digest_list">'
          +   '<h4>' + item.display + ':' + '</h4>'
          +   setNameEntity(i)
          + '</div>';
      }

    });

    $("#document_digest").html( content );  
    // 摘要增加滚动条插件
    $("#document_digest").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
    
    tabNameEntity();

  }

  //获取命名实体相关信息
  function setNameEntity( index ) {
    var nameTitle = "",
      nameContent = "",
      data = contentData[index].value[0].value || '';

    if ( data && typeof data !== 'object') data = JSON.parse(data);

    var attrArr = Object.keys( data );
    for( var i = 0; i < attrArr.length; i ++ ) {
      var listStr = "";
      //让第一个高亮
      var classTitle = i === 0 ? "name_entity_title_active" : "";
      var classContent = i === 0 ? "name_entity_content_active" : "";

      nameTitle += '<span class="name_entity_title ' + classTitle + '">'+ attrArr[i] +'</span>';

      for( var j = 0; j < data[attrArr[i]].length; j ++ ) {
        listStr += '<span class="name_entity_content_list">' + data[attrArr[i]][j] + '</span>';
      }
      nameContent += '<div class="name_entity_content_box ' + classContent + '">'
        +   listStr
        + '</div>'
    }
    return nameTitle + nameContent;
  }

  //切换实体命名展示
  function tabNameEntity() {
    $(".name_entity_title").click( function() {
      $(this).addClass("name_entity_title_active").siblings().removeClass("name_entity_title_active");
      var index = $(this).index();
      $(".name_entity_content_box").removeClass("name_entity_content_active").eq(index - 1).addClass("name_entity_content_active");
    } )
  }

  //切换到原文
  $("#document_tab_origintext").on( 'click', function(){
    $(this).addClass("document_tab_active");
    $("#document_tab_digest").removeClass("document_tab_active");
    $("#document_origintext_content").show();
    $("#makeEntity").show();
    $("#document_digest").hide();
    $("#toolbar_shade").hide();
  } );

  //切换到摘要
  $("#document_tab_digest").on( 'click', function(){
    $(this).addClass("document_tab_active");  
    $("#document_tab_origintext").removeClass("document_tab_active");
    $("#document_digest").show();
    $("#document_origintext_content").hide();
    $("#toolbar_shade").show();
    $("#makeEntity").hide();
  } );

  //实体和事件的切换
  $(".document_makeEntity_tab").on( 'click', function () {
    $(this).addClass("make_active").siblings().removeClass("make_active");
  } );

  //选中文字
  $("#document_origintext").on( 'mouseup', function() {
    var select;
    if(window.getSelection){ //现代浏览器
      select = window.getSelection();
    }else if(document.getSelection){//IE浏览器 考虑到opera 
      select = document.selection.createRange();
    }
    if ( select == null || select.rangeCount <= 0 ) return false;
    if(select.getRangeAt){
      rangeObj = select.getRangeAt(0);
    }else if(rangeObj == null){
      return false;
    }
  } );


  //把文字拖放到创建盒子中
  dragTextToEntity( $("#makeEntity"), "object" );

  //给已有的实体绑定拖放事件
  function dragTextToEntity( target, flag ) {
    //遍历所有的反显的实体绑定拖放事件
    target.each( function( index, item ) {
      $( item ).get(0).addEventListener( 'dragstart', function(ev) {//获取第0个元素，绑定监听事件——拖拽开始
        var dragObject = {
          id: this.dataset.id,
          nodeId: this.dataset.nodeid,
          type: this.dataset.type,
          name: this.innerHTML
        };

        // 把数据存放在拖拽的dataTransfer内，DataTransfer 对象用来保存被拖动的数据
        ev.dataTransfer.setData( "dragObject",JSON.stringify( dragObject ) );
        ev.dataTransfer.setData( 'text', this.innerText );
      }, false );//事件句柄在冒泡阶段执行
      $( item ).get(0).addEventListener('dragenter', function (e) {
        
      });
      $( item ).get(0).addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        return false;
      }, false);
      // 鼠标放开触发拖放事件
      $( item ).get(0).addEventListener('drop', function(e) {
        e = e || window.event;//这句话是做浏览器兼容处理的，有的是event，有的是Window.event
        e.preventDefault();
        e.stopPropagation();

        //如果是object则需要创建实体
        if( flag === "object" ) {
          $("#make_label").prop( "readonly", false ).addClass('document_make_type_color').val( e.dataTransfer.getData( 'text' ) );
          $("#make_type").val( 0 ).prop( "disabled", false );
          $("#make_parameterNumber").prop( "readonly", false ).val("");
          if(typeof e.target == 'object'){
            //var txt = window.getSelection().toString();
            var txt = e.dataTransfer.getData( 'text'); //e.dataTransfer.DataTransferItemList;
            //调取后台接口查询是否存在实体
            $.get( EPMUI.context.url + '/object/contains', { name: txt }, function(data){
              var data = JSON.parse(data);
              if(data.magicube_interface_data.length == 0){
                //若不存在该实体，则重新创建
                  $("#make_label").val(txt);
                  $("#document_shade").show();
                  $("#document_modal").show();
              }else{
                //若已经存在该实体，则展示已有实体数据
                $("#document_shade").show();
                $("#document_is_exist").show();
                $("#entity_model_button_relate").addClass('document_btn_relate_disabled');
                var htmlData = data.magicube_interface_data;
                var html = '';
                for(let i=0; i<htmlData.length; i++){
                  var information = '';             
                  for(let j=0; j<htmlData[i].basic.length; j++ ){
                    if(htmlData[i].basic[j].value){
                      information += `<p><span>${ htmlData[i].basic[j].displayName }： </span><span>${ htmlData[i].basic[j].value }</span></p>`;     
                    }
                  }

                  html += `<div index=${ i } class="entity_model" data-type=${ htmlData[i].type } data-id=${ htmlData[i].id } data-nodeId=${ htmlData[i].nodeId }>
                    <div class="entity_same">
                      <p> ${ i+1 } </p>
                      <span>相似度：90%</span>
                    </div>
                    <div class="entity_basic">
                      <div class="entity_basicContent">                                         
                        ${ information }                                
                      </div>
                      <p class="more"><span class="icon-angle-double-right"></span>more</p>
                    </div>
                  </div>`;
                }

                $("#entity_content").html(html);
                $("#entity_content").mCustomScrollbar({
                  theme: Magicube.scrollbarTheme,
                  autoHideScrollbar: true
                });

                //选择已有实体进行关联
                $(".entity_model").click(               
                  function () {
                    $(".entity_model").addClass('document_btn_relate_default');
                    $("#entity_model_button_relate").addClass('document_btn_relate_active')
                      .removeClass('document_btn_relate_disabled')
                      .removeClass('document_btn_relate_default');
                    $("#entity_model_button_relate").hover(function(){
                      $(this).addClass('document_btn_relate_hover').removeClass('document_btn_relate_disabled');
                    },function(){
                      $(this).addClass('document_btn_relate_disabled').removeClass('document_btn_relate_hover');
                    });                 
                    $(this).addClass('document_btn_relate_active');
                    //if($(this).css('border') == '1px solid rgb(51, 208, 255)'){
                    if($(this).hasClass('document_btn_relate_active')){
                    
                    var entityType = $(this).attr("data-type"),
                        entityId = $(this).attr("data-id");
                      //确定关联实体            
                      $("#entity_model_button_relate").click(function(){              
                          addNode($(".entity_model").attr('data-id'), $(".entity_model").attr('data-type'), $(".entity_model").attr('data-nodeId'));               
                          $(this).unbind('mouseenter').unbind('mouseleave').unbind("click");
                          $(this).removeClass('document_btn_relate_active').removeClass('document_btn_relate_hover').addClass('document_btn_relate_default')
                          $("#document_shade").hide();
                          $("#document_is_exist").hide();                       
                          $.get(EPMUI.context.url + '/document/bindentity', { 
                            docId:  Magicube.id, 
                            docType: Magicube.type, 
                            wordId: '',
                            entityType: entityType,
                            entityId: entityId,
                            entityStr: txt
                          }, function(data){
                            data = JSON.parse(data);
                            if(data.status == 'success'){
                              return;
                            }
                          });

                      });
                    }
                  });
                }           
            } );
          }
        //  创建属性
        } else if( !e.dataTransfer.getData( 'dragObject' ) ) {
          objectId = e.target.dataset.id;
          objectPageType = e.target.dataset.pagetype.toLowerCase();
          objectType = e.target.dataset.type;
          $("#document_add_property").show();
          $("#document_object_name").html( $(e.target).html() );
          $("#add_property_value").val( e.dataTransfer.getData( 'text' ) );
        //  创建关系
        } else {
          relateSource = JSON.parse( e.dataTransfer.getData( 'dragObject' ) );
          relateTarget = e.target.dataset;
          if( relateSource.id === relateTarget.id ) {
            return false;
          }
          relateTarget.name = e.target.innerHTML;
          $("#relate_name_one").html( relateSource.name );
          $("#relate_name_two").html( relateTarget.name );
          $("#document_makelink").show();
          $("#document_shade").show();
        }
      }, false );
    } );
  }
  
  //关闭判断实体是否已存在弹框
  function closeJudgeAlert(){
    $("#document_shade").hide();
    $("#document_is_exist").hide();
    $("#entity_model_button_relate").addClass('document_btn_relate_default').removeClass('document_btn_relate_active')
      .unbind('mouseenter').unbind('mouseleave').unbind("click");
    $(".entity_model").addClass('document_btn_relate_default');
  }
  //取消创建实体
  $("#entity_model_button_cancel").on('click', closeJudgeAlert);

  $("#make_cancel").on('click', function(){
    $("#document_modal").hide();
    $("#document_shade").hide();
  });

  //确定创建实体
  $("#entity_model_button_create").on('click', function(){
    closeJudgeAlert();
    $("#document_shade").show();
    $("#document_modal").show();
  });
  $("#make_ensure").on('click', function(){
    var name = $("#make_label").val(),
      pageType = $(".make_active").attr("data-type"),
      objType = $("#makeEntity_type").attr("data-type");
    //创建一个对象存放相关的实体参数
    var makeObj = {
          name: name,
          docId: Magicube.id,
          inDocument: true,
          documentType: Magicube.type,
          property: ""
        },
        propertyObj = {};

    //如果选择类型，把类型放到参数对象内
    if( $("#makeEntity_type").attr("data-type") !== "null" ) {
      $("#makeEntity_type").parent().next().hide();
      makeObj.objectType = $("#makeEntity_type").attr("data-type");
    } else {
      $("#makeEntity_type").parent().next().show();
      return false;
    }
    //判断对象名是否填写
    if( !$("#make_label").val() ) {
      $("#make_label").next().show();
      return false;
    } else {
      $("#make_label").next().hide();
    }

    //把所有填写的属性进行保存
    $(".make_detail_list").each( function( index, item ) {
      if( !!$(item).html().trim() ) {
        propertyObj[ $( item ).attr("data-type") ] = $(item).html();
      }
    } );
    //按后台要求将对象转成字符串
    makeObj.property = JSON.stringify( propertyObj );
    $.post( EPMUI.context.url + '/document/createobject', makeObj, function( data ) {
      var datas = JSON.parse( data );
      if( datas.status !== "success" ) {
        showAlert( "提示!", datas.message, "document_pagealert_notice_color_license" );
        return false;
      }
      
      //如果点击同步到控制台，将数据放到本地缓存，在控制台取
      if( $("#add_topo_checkbox").prop( "checked" ) === true ) {
        var searchAddNode = localStorage.searchAddNode ? JSON.parse( localStorage.searchAddNode ) : [];
        var object = {
          id: datas.data.objectId,
          nodeId: datas.data.nodeId,
          name: name,
          objectType: datas.data.objectType,
          type: pageType,
          page_type:pageType,
          quantity:0,
          nodeType:0,
          relationTypeName:'default',
          markIcons:[],//小手铐
          nodeWeight:datas.data.nodeWeight ? parseInt(datas.data.nodeWeight) : 0,
          fill: datas.data.mark ? "#fc311a" : "#0088b1",
          stroke: datas.data.mark ? "#ffbcaf" : "#33d0ff",
          display:"block"
        };
        searchAddNode.push( object );
        localStorage.setItem( "searchAddNode", JSON.stringify( searchAddNode ) );
      }
      addNode( datas.data.objectId, datas.data.objectType, datas.data.nodeId );
      showAlert( "提示！", datas.message, "document_pagealert_notice_color_default" );
    } );
    $("#document_shade").hide();
    $("#document_modal").hide();
    $("#topo_shade").hide();
    $("#make_label").val("");

  });

  //实体创建成功添加标签到页面
  function addNode(id, type, nodeId) {
    var selectContent = rangeObj.toString();
    rangeObj.extractContents();//选中的文字
    insertObj = document.createElement("em");
    insertObj.classList.add("makeEntityActive");//返回元素类名，只读
    insertObj.innerText = selectContent;
    $( insertObj ).attr( { "data-id": id, "data-pagetype": $(".make_active").attr("data-type"), "data-type": type, "draggable": true, "data-nodeId": nodeId } );
    rangeObj.insertNode( insertObj );//开头插入节点
    dragTextToEntity( $(insertObj), "property" );//绑定拖拽事件
    $("#document_modal").css("display", "none");
    checkDetail();//绑定点击进入详情页事件
  }

  //选择添加属性的属性名称
  function getPropertyDta(){
    $("#add_property_type").click( function() {
      propertyData.forEach( function(item, index) {
        if( objectPageType === item.type ) {
          propertyTypeData = item.node;
        }
      } );
      propertyTypeData.forEach( function( item, index ) {
        if( objectType === item.systemName ) {
          propertyList = item.property;
        }
      } );

      setPropertyList();
    } );
  }

  //选中文字拖拽到实体上，弹出创建属性弹框，并进行属性创建
  function setPropertyList() {
    var content = "";
    for( var i = 0, length = propertyList.length; i< length; i ++ ) {
      if(propertyList[i].dataType !== "geo_point") {
        content += '<p class="select_type_list" data-type="' + propertyList[i].systemName + '">' + propertyList[i].displayName + '</p>'
      }
    }
    $("#add_property_lists").html( content );
    var $property_lists = $("#add_property_lists");   
    try{
      !!$property_lists.data("mCS") && $property_lists.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $property_lists.data("mCS",''); //手动销毁             
    };
    $property_lists.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis:"y"
    }); 
    $("#add_property_lists").show().find( "p" ).click( function() {
      $("#add_property_type").html($(this).html()).attr("data-type", $(this).attr("data-type")).addClass('document_add_property_type_color').removeClass('add_property_type_color');
      $("#add_property_lists").hide();
    } );
    //事件委托进行创建属性的隐藏
    $(document).click( function(ev) {
      if( !$(ev.target).hasClass("select_type_list") && $(ev.target).attr("id") !== "add_property_type" ) {
        $("#add_property_lists").hide();
      }
    } );

  }

  //确定添加属性
  $("#add_property_ensure").click( function()  {
    if( $("#add_property_type").attr( "data-type" ) === "null" ){
      showAlert( "警告!", "请选择对应的属性类型", "document_pagealert_notice_color_license" );
      return false;
    }

    var addProperty = {
      id: objectId,
      objectType: objectType
    };
    addProperty[ $("#add_property_type").attr( "data-type" ) ] = $("#add_property_value").val();

    $.post(EPMUI.context.url +  '/document/createproperty', addProperty, function( data ) {
      var datas = JSON.parse( data );
      if( datas.status !== "success" ) {
        showAlert( "提示!", datas.message, "document_pagealert_notice_color_license" );
        return null;
      }
      showAlert("提示!", datas.message, "document_pagealert_notice_color_default");
      $("#add_property_type").attr( "data-type", "null" ).html("请选择...").addClass('add_property_type_color').removeClass('document_add_property_type_color');
      $("#document_add_property").hide();
    } );
  } );

  //取消添加属性
  $("#add_property_cancel").on( 'click', function() {
    $("#document_add_property").hide();
  });

  //确定添加关系
  $("#makelink_ensure").off().click( function () {
    //关系类型必须填一个，第一个关系名称必填
    if ($("#make_relate_type").attr("data-type") === "null") {
      $("#div_make_relate_type").addClass('selectParent_elemnt_box_selset');
      return;
    }
    if ($("#make_relate_name").attr("data-type") === "null") {
      $("#div_make_relate_name").addClass('selectParent_elemnt_box_selset');
      return;
    }
    //根据$("#relate_name_one").attr( "data-falg" ) === "true" 判断两个对象的前后顺序
    if( $("#relate_name_one").attr( "data-falg" ) === "true" ) {
      var postData = {
        idOne: relateTarget.nodeid,
        idTwo: relateSource.nodeId,
      };
    } else {
      var postData = {
        idOne: relateSource.nodeId,
        idTwo: relateTarget.nodeid
      };
    }
    //按照后台接口需求将sysName作为key，输入框内容作为value
    var postProData = {};
    postProData[ $("#relate_time").attr("data-type") ] = $("#relate_time").val();
    postProData[ $("#relate_medium").attr("data-type") ] = $("#relate_medium").val();
    postData.relationType = $("#make_relate_name").attr( "data-type" );
    postData.property = JSON.stringify( postProData );

    $.post( EPMUI.context.url + '/relation', postData, function( data ) {
      var datas = JSON.parse(data);
      if( parseInt(datas.code) === 200 ) {
        // 创建成功初始化数据
        $("#document_makelink").hide();
        $("#document_shade").hide();
        $("#relate_time").val("");
        $("#relate_medium").val("");
        showAlert( "提示!", "关系创建成功", "document_pagealert_notice_color_success" );
      } else {
        showAlert( "提示!", "关系创建失败", "document_pagealert_notice_color_license" );
      }
    } );
    return;
  });

  //交换创建关系中两个对象的位置
  $("#relate_direction").on( 'click', function() {
    if( $(this).attr( "data-flag" ) === "true" ) {
      $(this).attr( "data-flag", "false" );
      $("#relate_name_one").html( relateTarget.name );
      $("#relate_name_two").html( relateSource.name );
    } else {
      $(this).attr( "data-flag", "true" );
      $("#relate_name_one").html( relateSource.name );
      $("#relate_name_two").html( relateTarget.name );
    }
  } );

  //取消创建关系
  $("#makelink_cancel").click( function() {
    $("#document_makelink").hide();
    $("#document_shade").hide();
  } );

  //鼠标移动到词条的时候显示词条详细
  function getEntryDetail() {
    $("#document_origintext_content").on( 'mouseenter', ".makeEntity", function ( e ) {
      clearTimeout( setTime );
      $(".document_entry_box").remove();
      var _this = this;
      var target = e.target;
      lastEntryId = $(_this).attr("data-id");

      setTime = setTimeout( function() {
        currentEntryId = $(_this).attr("data-id");
        if( lastEntryId === currentEntryId ) {
          $.get( EPMUI.context.url + '/document/summary?objectId=' + currentEntryId, function (data) {
            var str = '<s class="document_entry_box">' + data + '</s>';
            $(target).append(str);
            //判断是否内容框超出大盒子宽高，并进行相应的调整
            if(document.body.offsetWidth < e.pageX + 320) {
              $(target).children(".document_entry_box").css( { "top": 20, "left": -300 } );
            } else {
              $(target).children(".document_entry_box").css( { "top": 20, "left": 20 } );
            }
          } );
        }
      }, 400 );

    } );

    $(".makeEntity").on( 'mouseleave', function () {
      lastEntryId = "";
      $(".document_entry_box").remove();
    } );
  }

  //查看实体详细
  function checkDetail() {
    $(".makeEntityActive").on( 'click', function() {
      location.href = '/' + $(this).attr( "data-pagetype" ) + '?id=' + $(this).attr( "data-id" ) + '&type=' + $(this).attr( "data-type" );
    } );
  }

  //关闭警告框
  $("#page_alert_button").on( 'click', function (){
    $("#page_alert").hide();
    $("#page_alert_content").html("");
  } );

  //警告框的显示
  function showAlert( title, content, color ) {
    $("#page_alert_title").html(title).addClass(color);
    $("#page_alert_content").html(content);
    $("#page_alert").show();
  }

} );