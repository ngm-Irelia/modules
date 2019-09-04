$(function(){
  var searchAddNode = [], nodeId = '';
  var recognitionInformation = [],
      idNumber,
      licensePlate,
      tableLastIndex = 0;
  var thisIn,
      pageSearchData,
      flag = false,
      objectId,
      totalp,
      //objectType,
      tableDataDetail,
      dataPageSize = 10;
  var personCommon = {
        displayType: 'common',
        display: '人脸识别',
        value: []
      },
      carCommon = {
        displayType: 'common',
        display: '车牌识别',
        value: []
      };
  let ENTITY_CREATE_OPERATION = 'create', //只创建属性和对应的属性值
    ENTITY_UPDATE_OPERATION = 'update', //只update属性值
    curEntityOperation = ENTITY_UPDATE_OPERATION; //记录动态修改实体属性的当前操作
  let commonsArr;
  //dev_police的人车类型标识： A_RY_CZRKXX_JBSJ car，银川标识为 RENXX CHE

  /**
   * 根据id、type获取实体详情页相关数据
   * @param id
   * @param type
   * @param callback
   */
  let getEneitiesById = function ( id, type, callback ) {
    $.get(EPMUI.context.url + '/object/detailInformation/' + id + '/' + type, function(data){
      if( typeof callback === 'function') {
        callback( data );
      }
    }, 'json');
  };

  /**
   * 修改属性值
   * @param params
   * @param callback
   */
  let updateEntityPropertyValue = function ( params, callback ) {
    $.post( EPMUI.context.url + '/object/detailInformation/edit', { editObjects: JSON.stringify( params ) }, function ( data ) {
      if( typeof callback === 'function') {
        callback( data );
      }
    }, 'json' );
  };

  /**
   * 添加 属性名/属性值 对
   * @param params
   * @param callback
   */
  let addEntityProperty = function ( params, callback ) {
    $.post( EPMUI.context.url + '/property/custom', { objectId: params.objectId, objectType: params.objectType,
      propertyGroupId: params.propertyGroupId,propertySize: params.propertySize,
      property: JSON.stringify( params.property ) }, function ( data ) {
        if( typeof callback === 'function') {
          callback( data );
        }
      }, 'json' )
  };

  /**
   * 处理实体详情页相关数据
   * @param data
   */
  let initEntitiesData = function ( data ) {
    if( Magicube.type === 'RENXX' ){
      data.magicube_interface_data.property.all.push(personCommon);
    } else if( Magicube.type === 'CHE' ){
      data.magicube_interface_data.property.all.push(carCommon);
    }
    var propertyData = data.magicube_interface_data.property.all || [];
    var detailName = data.magicube_interface_data.property.basic[0].value || '';
    var basicData = data.magicube_interface_data.property.basic || [];
    objectId = data.magicube_interface_data.objectId || '';//不要改这里，全局变量
    nodeId = data.magicube_interface_data.nodeId || '';//不要改这里，全局变量
    var objectType = data.magicube_interface_data.objectType || '';
    let type = data.magicube_interface_data.type || '';
    let pageType = data.magicube_interface_data.pageType || '';
    var icons = data.magicube_interface_data.icon,
      markIcons = data.magicube_interface_data.markIcons || [];
    //var objectIcon = '/image/' + icons ;
    const width = $(".topo").width();
    const height = $(".topo").height();
    let rootNode = {
      display:'block',
      id:objectId,
      fill:"#0088b1",
      icon : icons || null,
      nodeId:nodeId,
      name:detailName,
      nodeWeight:0,
      markIcons:[],//小手铐
      nodeType:0,
      fixed:true,
      quantity:0,
      type:type,
      objectType:objectType,
      relationTypeName:'default',
      page_type:pageType,
      stroke:'#33d0ff',
      px:width / 2,
      py:height / 2 - 20
    };
    //此处得到了具有id/place的数据
    getRecBasicMes( basicData );
    startFunction(rootNode,".topo");
    getMes( propertyData, icons, objectType, markIcons );  //动态创建基本信息
    entityGoTopology();   //跳转到topology页面

    // 右侧事件分类tab切换
    if(data.magicube_interface_data.relationclass){
      initTab(data.magicube_interface_data.relationclass);  //tab切换信息展示
    }

  };

  initEntityMes();
  // 初始化数据
  function initEntityMes(){
    let id = Magicube.id,
      type = Magicube.type;

    getEneitiesById( id, type, initEntitiesData );
  }

  // 跳转topology页面
  function entityGoTopology() {
    // 跳转到工作台
    $("#entity_topo").on( 'click', function(){
      localStorage.setItem("topologyType", "topo");
      goTopoAddNode(Magicube.id,Magicube.type);
    } );

    // 跳转到地图
    $("#entity_map").on( 'click', function(){
        localStorage.setItem("topologyType", "topo");
        goMapAddNode(Magicube.id,Magicube.type);
    });
  }

  // 详情页跳转向本地缓存加点
  window.goTopoAddNode = function(id,type){
      $.get( EPMUI.context.url + "/object/"+"partInformation/" + id + "/" + type, function(searchNodes){
        var parseSearchNodes = $.parseJSON(searchNodes);
        var node = jQuery.creatTopologyNode(parseSearchNodes);
        node.selected = true;//为true到工作台自动打开菜单
        //缓存一个当前跳转的节点的nodeid，供控制台打开菜单使用，如果没有则不生效
        localStorage.setItem( "open", JSON.stringify(node.nodeId) );
        localStorage.setItem( "searchAddNode", JSON.stringify(Array.of(node)));
        location.href = '/topology';
      } );
  }

  // 详情页跳转向本地缓存加点
  window.goMapAddNode = function(id,type){
      $.get( EPMUI.context.url + "/object/"+"partInformation/" + id + "/" + type, function(searchNodes){
          var parseSearchNodes = $.parseJSON(searchNodes);
          var node = jQuery.creatTopologyNode(parseSearchNodes);
          node.selected = true;//为true到工作台自动打开菜单
          //缓存一个当前跳转的节点的nodeid，供控制台打开菜单使用，如果没有则不生效
          localStorage.setItem( "open", JSON.stringify(node.nodeId) );
          localStorage.setItem( "searchAddNode", JSON.stringify(Array.of(node)) );
          location.href = '/gisPlatform';
      } );
  }

  /**
   * 初始化左边tab的title
   * @param data 数组，从property.all取得
   * @param icon 图标路径
   * @param objectType 对象类型
   * @param callback 回调函数
   */
  let initLeftTabTitle = function ( data, icon, objectType, markIcons, callback ) {
    let commonData = [],
      tableData = [],
      commonStr = '',
      tableStr = '';
    //任务打标签
    let tagHtml = '';
    // markIcons = [ '恐怖分子', '重点人员', '贩毒人员', '商业犯罪', '人身伤害', '走私文物' ];
    for (let i = 0, markIcon; markIcon = markIcons[ i++ ];) {
      tagHtml += `<div class="mark mark-${ i }"><span class="mark-body">${ markIcon }</span><span class="mark-decoration"/></div>`;
      if( i === 6 ) { break; } //设计最多显示6个标签
    }
    $( '#entity-info .entity-mark' ).append( tagHtml );
    //设置头像
    $("#entity-info .entity-title img").after('<img src="?" onerror="window.MGC.proxyImage(this, \''+ icon +'\', \''+ objectType.toLowerCase() +'\')" alt="头像"/>');
    // 显示信息tab标签
    for( let i = 0, item; item = data[ i++ ]; ) {
      // 判断tab内容是否是表格
      if(item.displayType === 'common'){
        commonData.push(item);
        commonStr += '<p data-display="' + item.displayType + '" >' + item.display + '</p>'
      }else if(item.displayType === 'table'){
        tableData.push(item);
        tableStr += '<p data-display="' + item.displayType + '" data-tableName="' + item.displayColumn.value + '" >' + item.display + '(' + item.size + ')' + '</p>'
      }
    }
    $("#entity-info>.entity-content>.title-tabs").html(commonStr);
    $("#entity-info>.entity-relateTable>.title-tabs").html(tableStr);

    //更新全局数据
    commonsArr = commonData;
    if( typeof callback === 'function') {
      callback( commonData, tableData );
    }
  };

  /**
   * 为左边tab的title绑定事件
   * @param commonData 个人相关信息对象数组
   * @param tableData 库相关信息对象数组
   */
  let bindClickLeftTabTitle = function ( commonData, tableData ) {
    if( commonData instanceof Array && commonData.length > 0 ) {
      $("#entity-info>.entity-content>.title-tabs>p").click(function(){
        // 更换tab样式
        $(this).addClass("tab-active").siblings().removeClass("tab-active");
        let index = $(this).index();

        // 调取tab内容展示
        if(commonData[index].display == '人脸识别'){
          $("#entity-info>.entity-content>.tab-content>div").html('');
          if(Magicube.type === 'RENXX' && idNumber){
            getFaceOrVehicleRecognitionInfo('/hbaseapi/rlxx?sfzh=', idNumber, '人脸识别');
          }
        }else if(commonData[index].display == '车牌识别'){
          $("#entity-info>.entity-content>.tab-content>div").html('');
          if( Magicube.type === 'CHE' && licensePlate){
            getFaceOrVehicleRecognitionInfo('/hbaseapi/cpxx?cphm=', licensePlate, '车牌识别');
          }
        }else{
          $("#entity-info>.entity-content>.tab-content>div").html('');
          // mesTab(commonData[index].value, $(this).attr("data-display"));
          updatePersonalTabInfo(commonData[index]);
        }
      });
    }

    if( tableData instanceof Array && tableData.length > 0 ) {
      $("#entity-info>.entity-relateTable>.title-tabs>p").click(function(){
        // 更换tab样式
        $(this).addClass("tab-active").siblings().removeClass("tab-active");
        let index = $(this).index();
        // 调取tab内容展示
        tableDataDetail = tableData[index];
        // mesTab(tableData[index].value, $(this).attr("data-display"), $(this).attr("data-tableName"));
        updateLibraryTabInfo(tableData[index].value, $(this).attr("data-tableName"));
      });
    }
  };

	// 获取对象信息 显示tab
  function getMes(data, icon, objectType, markIcons) {
    //初始化数据，并绑定事件
    initLeftTabTitle( data, icon, objectType, markIcons, bindClickLeftTabTitle );

    // 手动触发初始化对象信息tab展示
    $("#entity-info>.entity-content>.title-tabs>p:eq(0)").click();
    $("#entity-info>.entity-relateTable>.title-tabs>p:eq(0)").click();
  }

  $('.entity-content').on( 'dblclick', '.tab-edit-value, .tab-add-property', function () { //双击属性值 可编辑
    //显示为可修改状态 添加class modified
    this.classList.add( 'modified' );

    //加载日期插件（判断判断结果决定）
    loadDateComponent( this );

    this.contentEditable = true;
    this.focus();

    //弹出保存按钮
    $('.property-save-btn').show();
  } )
    .on( 'focusout', '.tab-edit-value', function () { //属性值失去焦点 不可编辑
      this.contentEditable = false;

      //若为修改属性值操作，若未修改，失去焦点时恢复原貌
      let oldValue = this.getAttribute( 'data-value' ),
        objectId = this.getAttribute( 'data-id' ), //用来区分修改属性值 和 添加属性
        newValue = this.innerText;
      if( objectId && !isModified( oldValue, newValue ) ) {
        this.classList.remove( 'modified' );
      }
  } )
    .on( 'focusout', '.tab-add-property', function () { //属性失去焦点
      this.contentEditable = false;

      //属性名进行校验 设置属性值的数据类型
      let propertyName = this.innerText,
        valueDom = this.nextSibling,
        dataType, result;

      result = isDateByPropertyName( propertyName );
      dataType = result ? 'date' : 'string';
      valueDom.setAttribute( 'data-datatype', dataType );

      if( 'date' === dataType ) {
        //如果为日期 不可编辑
        valueDom.classList.remove( 'tab-edit-value' );
        valueDom.contentEditable = false;

        laydate.render({
          elem: valueDom, //指定元素
          type: 'datetime'
        });
      }
    } )
    .on( 'keydown', '.tab-edit-value', function ( e ) {
      if( e.keyCode === 13 ) {
        // 禁止td标签内换行
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
      }
  } )
    .on( 'keyup', '.tab-edit-value', function ( e ) {
      if( e.keyCode === 13 ) {
        let cloneNode = this.cloneNode( false ); //第二个td,克隆前一个属性值对应DOM
        let tdDom = document.createElement( 'td' ), //第一个td，占位
          trDom = document.createElement( 'tr' );

        tdDom.placeholder = '在此编辑';
        cloneNode.placeholder = 'dsdjsdjsd';
        cloneNode.setAttribute( 'data-value', '' );
        cloneNode.removeAttribute( 'lay-key' ); //去除与日期相关的属性

        trDom.appendChild( tdDom );
        trDom.appendChild( cloneNode );
        $(this).parent().after( trDom );

        cloneNode.focus();

        //判断当前节点若为子属性，则设置对应的id(最外层id)、type(childObjectType)
        let objectType = this.getAttribute( 'data-type' ),
          childType = this.getAttribute( 'data-childtype' );
        if( !isPrimaryObject( Magicube.type, objectType ) ) {
          cloneNode.setAttribute( 'data-type', childType );
          cloneNode.setAttribute( 'data-id', Magicube.id );
          //标识是新加的属性值，还是被修改的属性值；只对子对象起作用 '0':false '1':true
          cloneNode.setAttribute( 'data-edited', 0 );
        }

        //清除当前选中dom的日期插件,防止影响cloneNode
        let layuiDomId = 'layui-laydate' + this.getAttribute( 'lay-key' );
        $( '#' + layuiDomId ).remove();

        //加载日期插件
        loadDateComponent( cloneNode );
      }
    } );

  //点击保存按钮
  $('.property-save-btn').on( 'click', function () {
    let params;
    if( curEntityOperation == ENTITY_UPDATE_OPERATION ) { //修改属性值
      params = getModifiedValue() || []; //获取数据
      if( params instanceof Array && params.length > 0 ) {
        updateEntityPropertyValue( params, updatePropertyFinished); //请求更新
      }else {
        saveWithoutData();
      }
      return;
    }
    if( curEntityOperation === ENTITY_CREATE_OPERATION ) { //添加属性和对应的属性值
      params = getCreatedProperty() || {};
      if( Object.keys( params ).length > 0 ) {
        addEntityProperty( params, updatePropertyFinished );
      }else {
        saveWithoutData();
      }
    }
  } );

  //点击添加属性
  $('.property-add-btn').on( 'click', function () {
    this.style.display = 'none';
    //弹出保存按钮
    $('.property-save-btn').show();
    curEntityOperation = ENTITY_CREATE_OPERATION; //当前操作改为添加属性
    //创建输入框
    addPropertyDom();
  } );

  /**
   * 根据数据类型判断是否加载日期插件
   * @param dom
   */
  let loadDateComponent = function ( dom ) {
    let dataType = dom.getAttribute( 'data-datatype' ) || '',
      dataValue = dom.getAttribute( 'data-value' ) || '';
    if( 'date' === dataType ) {
      laydate.render({
        elem: dom, //指定元素
        type: 'datetime',
        done: function ( value, date, endDate ) {
          if( isModified( dataValue, value ) ) {
            dom.classList.add( 'modified' );
          }else {
            dom.classList.remove( 'modified' );
          }
        }
      });
    }
  };

  /**
   * 判断属性值是否被修改过
   * @param oldValue
   * @param newValue
   * @returns {boolean}
   */
  let isModified = function ( oldValue, newValue ) {
    return !( oldValue === newValue.replace( / /g, '-' ) );
  };

  /**
   * 没有需要保存的数据的处理方式
   */
  let saveWithoutData = function () {
    window.MGC.alert( '没有需要保存的内容' );
    //刷新
    let index = getSelectedPersonalTabIndex();
    updatePersonalTabInfo( commonsArr[ index ] );
    //更新相关样式及变量
    recoverBtnGroup();
  };

  /**
   * 获得左侧 个人信息 当前被选中的tab索引
   * @returns {jQuery|number}
   */
  let getSelectedPersonalTabIndex = function () {
    let index = $('.entity-content .title-tabs p')
      .index( document.querySelector( '.entity-content .title-tabs .tab-active' ) ) || 0;
    return index;
  };

  /**
   * 根据属性名判断是否为日期
   * @param str 属性名
   * @returns {boolean}
   */
  let isDateByPropertyName = function ( str ) {
    const includeArr = [ '生日' ],
      matchModeArr = [ /.*\u65e5\u671f$/, /.*\u65f6\u95f4$/ ],// 日期Unicode：\u65e5\u671f  时间：\u65f6\u95f4
      excludeArr = [ '是否为日期' ];

    if( includeArr.includes( str ) ) {
      return true;
    }
    for (let i = 0, regExp; regExp = matchModeArr[ i++ ]; ) {
      if( str.match( regExp ) && !excludeArr.includes( str ) ) {
        return true;
      }
    }
    return false;
  };

  /**
   * 修改属性值时，判断是否为主对象
   * @param primaryType
   * @param objectType
   * @returns {boolean}
   */
  let isPrimaryObject = function ( primaryType, objectType ) {
    let result = false;
    if(  primaryType && objectType && objectType === primaryType ) {
      result = true;
    }
    return result;
  };

  /**
   * 获取添加的属性和对应的属性值
   */
  let getCreatedProperty = function () {
    let propertyDom = document.querySelector( '.entity-content .tab-add-property' );
    if( !propertyDom ) { return; }

    let groupId = propertyDom.getAttribute( 'data-groupid' ),
      propertySize = commonsArr[ getSelectedPersonalTabIndex() ].value.length || 0,
      valueDom = propertyDom.nextSibling,
      name = propertyDom.innerText,
      value = valueDom.innerText,
      type = valueDom.getAttribute( 'data-datatype' ); //date|string

    if( !name ) { return; }

    let params = {
      objectId: Magicube.id,
      objectType: Magicube.type,
      propertyGroupId: groupId,
      propertySize: propertySize, //属性个数
      property: {
        name: name,
        value: value,
        type: type
      }
    };

    return params;
  };

  /**
   * 获得被修改过的属性值
   */
  let getModifiedValue = function () {
    let tdArr = document.getElementsByClassName( 'modified' ),
      params = [],
      prevSystem = ''; //记录上次的objectSystem,防止主对象上value的多次更改

    for (let i = 0, td; td = tdArr[ i++ ]; ) {
      let objectId = td.getAttribute( 'data-id' ),
        objectType = td.getAttribute( 'data-type' ),
        objectSystem = td.getAttribute( 'data-system' ),
        isEdit = td.getAttribute( 'data-edited' ) || '1',
        value = [];
      // console.log( objectId, objectType, objectSystem, isEdit );

      //主对象与子对象获取参数的方式不一样
      if( isPrimaryObject( Magicube.type, objectType ) ) {
        if( prevSystem === objectSystem ) continue;
        //获取属性对应的所有value值
        let valueTdArr = document.querySelectorAll( 'td[data-system='+ objectSystem +']' );
        for (let j = 0, valueTd; valueTd = valueTdArr[ j++ ]; ) {
          value.push( valueTd.innerText );
        }
      }else {
        //只获取属性对应的 修改了的value值
        value.push( td.innerText );
      }
      params.push( {
        objectId: objectId,
        objectType: objectType,
        propertyName: objectSystem,
        value: value.join( ';' ),
        isEdit: Boolean( parseInt( isEdit ) )
      } );

      prevSystem = objectSystem;
    }

    return params;
  };

  /**
   * 创建 属性/属性值 添加 Dom
   */
  let addPropertyDom = function () {
    let attrDom = document.createElement( 'td' ),
      valueDom = document.createElement( 'td' ),
      trDom = document.createElement( 'tr' ),
      $tbodyDom = $('.entity-content .tab-content table tbody');

    attrDom.className = 'tab-add-property modified';
    attrDom.placeholder = '在此编辑属性名';
    attrDom.setAttribute( 'data-groupid', $tbodyDom.attr( 'data-groupid' ) );
    valueDom.className = 'tab-edit-value modified';

    trDom.appendChild( attrDom );
    trDom.appendChild( valueDom );
    $tbodyDom.prepend( trDom );

    attrDom.contentEditable = true;
    attrDom.focus();
    valueDom.contentEditable = true;
  };

  /**
   * 完成属性值更新后需要进行的操作
   * @param data
   */
  let updatePropertyFinished = function ( result ) {
    if( result.code === 200 ) { //更新数据
      getEneitiesById( Magicube.id, Magicube.type, function ( data ) {
        let properties = [],
          commons = [],
          index;

        try {
          properties = data.magicube_interface_data.property.all;
        }catch( err ) {
          properties = [];
        }
        for (let i = 0, property; property = properties[ i++ ]; ) {
          if( property.displayType === 'common' ) {
            commons.push( property );
          }
        }
        index = getSelectedPersonalTabIndex();
        updatePersonalTabInfo( commons[ index ] );
        //更新之前的tab数据
        bindClickLeftTabTitle( commons );
        //更新相关样式及变量
        recoverBtnGroup();
        //更新全局数据
        commonsArr = commons;
      } );
    }
    window.MGC.alert( result.message );
    //TODO 添加一个 1.即时刷新的功能 进而能够进行√ 2. 失去焦点时与DB中的值进行比较 一致，正常； 不一致，提示√ 3.边框换成背景√ 4.支持data|string 5.换个提示框
    //TODO 6.如果没有需要保存的内容，不显示保存btn 7.添加属性的时候可以多属性值 8.添加个取消按钮，可随时取消用户的所有修改，恢复原值
  };

  /**
   * 左侧按钮组置为初始状态
   */
  let recoverBtnGroup = function () {
    $( '.property-save-btn' ).hide();
    $( '.property-add-btn' ).show();
    curEntityOperation = ENTITY_UPDATE_OPERATION;
  };

  /**
   * 更新左上侧个人信息相关tab页
   * @param data 一个tab渲染所需要的数据
   */
  function updatePersonalTabInfo( commonData ) {
    let data = commonData.value || [],
      childObjectType = commonData.childObjectType || '',
      groupId = commonData.groupId || '',
      $tab = $("#entity-info>.entity-content>.tab-content>.table-max"),
      commonStr = '';

    if( data instanceof Array && data.length > 0 ){
      for(let i=0, max = data.length; i < max; i++){
        if(JSON.stringify( data[i]) !== '{}' ){
          let value = data[i].value || [];
          //有属性名 没有属性值
          if( value.length === 0 ) {
            commonStr += `<tr><td>${ data[i].display }</td><td/></tr>`
          }else if( value.length > 0 ){ //有一个或多个属性值
            let len = value.length;
            //自定义属性值不能有空格，所以将空格用 "-" 代替
            commonStr += `<tr><td rowspan=${ len }>${ data[i].display }</td>` +
              `<td class="tab-edit-value" data-dataType='${ data[i].dataType }' data-childType='${ childObjectType }' data-id='${ value[0].objectId }' data-type='${ value[0].objectType }' data-system='${ data[i].system }' data-value='${ value[0].value ? value[0].value.toString().replace( / /g, '-' ) : '' }'>${ value[0].value || '' }</td></tr>`;
            for ( let j = 1, attrValue; attrValue = value[j++]; ) {
              commonStr += `<tr><td/><td class="tab-edit-value" data-dataType='${ data[i].dataType }' data-childType='${ childObjectType }' data-id='${ attrValue.objectId }' data-type='${ attrValue.objectType }' data-system='${ data[i].system }' data-value='${ attrValue.value ? attrValue.value.toString().replace( / /g, '-' ) : '' }'>${ attrValue.value || '' }</td></tr>`;
            }
          }
        }
      }
    }else{
      commonStr = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
    }
    let _commonStr = '<table><tbody data-groupid='+ groupId +'>' + commonStr + '</tbody></table>';
    $tab.html(_commonStr);

    // 初始化滚动条 取消之前滚动条插件使用（再重新渲染页面之前取消）
    try{
      !!$tab.data("mCS") && $tab.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $tab.data("mCS",''); //手动销毁
    }
    $tab.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  /**
   * 更新左下侧库信息相关tab页
   * @param data 一个tab渲染所需要的数据
   * @param tableName
   */
  function updateLibraryTabInfo( data, tableName ) {
    let tableStr = '',
      $tab = $("#entity-info>.entity-relateTable>.tab-content>table>tbody");

    if( data instanceof Array && data.length > 0 ){
      for(let i=0, max = data.length; i < max; i++){
        if(JSON.stringify(data[i]) !== '{}'){
          tableStr += `<tr><td class="link">` + data[i][tableName] + '(' + data[i].size + ')' + `</td></tr>`;
        }
      }
    }else{
      tableStr = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
    }
    $tab.html(tableStr);

    //初始化滚动条
    try{
      !!$tab.data("mCS") && $reognitionTable.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $tab.data("mCS",''); //手动销毁
    }
    $tab.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });

    // 表头绑定点击事件
    $(".entity-relateTable>.tab-content>.table-max>tbody tr").click(data, function(){
      thisIn  = $(this).index();
      pageSearchData = data;
      var textReg = /\(([^()]+)\)/g;
      var total = textReg.exec($(this).text());
      totalp = parseInt(total[1]);
      TabMesPage(data, thisIn);
      // 遮罩弹框显示、弹框显示
      $("#entity-shade").show();
      $("#entity-alert").show().find(".cancel").click(function(){
        $("#entity-shade").hide();
        $("#entity-alert").hide();
      });
    });
  }

  // function mesTab(data, type, tableName){
  //   // 显示tab内容切换
  //   let commonStr = '', tableStr = '';
  //   // 判断tab内容是否为空
  //   if(data.length > 0){
  //     // 判断展示内容是否为表格
  //     if(type === 'common'){
  //       for(let i=0, max=data.length; i<max; i++){
  //         if(JSON.stringify(data[i]) !== '{}'){
  //           let value = '';
  //           if(data[i].value){
  //             // 判断value是否为数组
  //             if(typeof data[i].value === 'object'){
  //               if(data[i].value.length === 0){
  //                 value =  '';
  //               }else{
  //                 // 如果值为多个保留，并用“，”隔开
  //                 for(let j=0, max=data[i].value.length; j<max; j++){
  //                   data[i].value[j] = data[i].value[j]? data[i].value[j] : '';
  //                   value += data[i].value[j] + '，';
  //                 }
  //                 value = value.substring(0,value.length - 1);
  //               }
  //             }else if(typeof data[i].value === 'string'){
  //               value = data[i].value;
  //             }
  //           }else{
  //             value = '';
  //           }
  //           commonStr += `<tr><td>` + data[i].display + `</td><td>` + value + `</td></tr>`;
  //         }
  //       }
  //
  //       let commonStrS = '<table><tbody>' + commonStr + '</tbody></table>';
  //       $("#entity-info>.entity-content>.tab-content>div").html(commonStrS);
  //
  //       // 取消之前滚动条插件使用（再重新渲染页面之前取消）
  //       let $entityContentBody = $("#entity-info>.entity-content>.tab-content>.table-max");
  //       try{
  //         !!$entityContentBody.data("mCS") && $entityContentBody.mCustomScrollbar("destroy"); //Destroy
  //       }catch (e){
  //         $entityContentBody.data("mCS",''); //手动销毁
  //       }
  //       $entityContentBody.mCustomScrollbar({
  //         theme: Magicube.scrollbarTheme,
  //         autoHideScrollbar: true
  //       });
  //
  //     }else if(type === 'table'){
  //       for(let i=0, max=data.length; i<max; i++){
  //         if(JSON.stringify(data[i]) !== '{}'){
  //           tableStr += `<tr><td class="link">` + data[i][tableName] + '(' + data[i].size + ')' + `</td></tr>`;
  //         }
  //       }
  //       let $entityRelateBody = $("#entity-info>.entity-relateTable>.tab-content>table>tbody")
  //       try{
  //         !!$entityRelateBody.data("mCS") && $reognitionTable.mCustomScrollbar("destroy"); //Destroy
  //       }catch (e){
  //           $entityRelateBody.data("mCS",''); //手动销毁
  //       }
  //       $entityRelateBody.html(tableStr);
  //       $entityRelateBody.mCustomScrollbar({
  //         theme: Magicube.scrollbarTheme,
  //         autoHideScrollbar: true
  //       });
  //       // 表头绑定点击事件
  //       $(".entity-relateTable>.tab-content>.table-max>tbody tr").click(data, function(){
  //         thisIn  = $(this).index();
  //         pageSearchData = data;
  //         var textReg = /\(([^()]+)\)/g;
  //         var total = textReg.exec($(this).text());
  //         totalp = parseInt(total[1]);
  //         TabMesPage(data, thisIn);
  //         // 遮罩弹框显示、弹框显示
  //         $("#entity-shade").show();
  //         $("#entity-alert").show().find(".cancel").click(function(){
  //           $("#entity-shade").hide();
  //           $("#entity-alert").hide();
  //         });
  //       });
  //     }
  //   }else{
  //     let str = '<div class="no-data"><span class="icon-notfind"></span><p>对不起，暂无数据。</p></div>';
  //     let str_ = '<table><tbody>'+str+'</tbody></table>'
  //     $("#entity-info>.entity-content>.tab-content>div").html(str_);
  //     $("#entity-info>.entity-relateTable>.tab-content>table>tbody").html(str);
  //   }
  // }

  // 初始化右侧tab标签
  function initTab(data){
    //  渲染tab标签
    for(var i=0, max=data.length, tabs=''; i<max; i++){
      // 截取事件分类名称 去掉【】
      if(data[i].display.indexOf("【") > 0){
        data[i].display = data[i].display.slice(0,data[i].display.indexOf("【"));
      }
      tabs += `<p data-system="` + data[i].system + `">` + data[i].display + '(' + data[i].size + ')' + `</p>`;
    }
    $(".entity-relateInfo>.tabs").html(tabs);

    // 手动触发初始化tab内容显示
    changeTab(0, $(".entity-relateInfo>.tabs>p:eq(0)").attr("data-system"));

    // tab标签绑定点击事件
    $(".entity-relateInfo>.tabs>p").click(function(){
      changeTab($(this).index(), $(this).attr("data-system"));
    });
  }

  // 右侧tab切换信息内容
  function changeTab(index, system){
    var content='';
    $.get( EPMUI.context.url + "/nest/record?relationType=" + system + '&nodeId=' + nodeId, function(data){
      data = JSON.parse(data);
      // 渲染事件内容
      initEventTrend(data.magicube_interface_data);
      initEventTrendFilter(data.magicube_interface_data);
    } );

    // tab标签点击切换样式
    $(".entity-relateInfo>.tabs>p:eq("+ index +")").addClass("tab-choose").siblings().removeClass("tab-choose");

    // goRelatePage();
  }

   //渲染事件内容
  function initEventTrend(eventTrend = []) {
    let l = eventTrend.length,
      boxStr = '',
      $entityRelateInfo = $('#entity-relate>.entity-relateInfo>.tab-content>.container-scroller');
    if (l > 0) {
      for (var i = 0; i < l; i++) {
        // 初始化起始年份
        let content = '';
        let data = eventTrend[i].value;
        for(let j=0, max=data.length; j<max; j++){
          data[j].value = data[j].value? data[j].value : '';
          content += '<p>' + data[j].display + '： ' + data[j].value +'</p>';
        }

        // 初始化时间趋势数据
        boxStr += '<div class="trend_mes_box">'
          + '<div class="trend_mes_title">'
          +  '<p class="mes_time">' + eventTrend[i].time.substr(0, 10) + '</p>'
          + '<p class="bgline"></p>'
          + '<span class="icon-event_node"></span>'
          + '<span class="icon-hollow-circle"></span>'
          + '</div>'
          + '<div class="trend_mes_content">'
          + content
          + '</div>'
          + '</div>';
      }
    }else{
      boxStr = `<span class="icon-notfind"></span><p class="not-data">对不起，暂无数据。</p>`;
    }

    $entityRelateInfo.mCustomScrollbar('destroy');
    $entityRelateInfo.html(boxStr);
    $entityRelateInfo.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis: 'x'
    });

    var $trendBox = $(".trend_mes_content");   
    try{
      !!$trendBox.data("mCS") && $trendBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
      $trendBox.data("mCS",''); //手动销毁             
    };
    $trendBox.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true,
      axis:"y"
    });  
  }

  // 渲染筛选年份
  function initEventTrendFilter(data = []){
    $("#time-filter").css("display", "none");
    if(data.length > 1){
      let start = Number(data[0].time.substring(0, 4));
      let end = Number(data[data.length - 1].time.substring(0, 4));
      if(Number.isNaN(start)) {
        return;
      }
      $("#time-filter>.filter-content>.time-choose").html("全部");
      $("#time-filter>.filter-content>.time-list").hide();
      getTimeRange(start, end, ['全部', start], data);
      $("#time-filter").css("display", "flex");
    }
  }

  // 递归时间范围
  function getTimeRange(start, end, arr, dataSource){
    if(start !== end){
      start --;
      arr.push(start);
      getTimeRange(start, end, arr, dataSource);
    }else{
      drawTimeLine(arr, dataSource);
      return ;
    }
  }

  // 渲染时间线数据
  function drawTimeLine(timeRange, data){
    let str = '';
    timeRange.map(function(item){
      str += `<li>` + item + `</li>`;
    });
    $("#time-filter>.filter-content>.time-list").html(str);
    $("#time-filter>.filter-content>.time-choose").click(function(){
      $("#time-filter>.filter-content>.time-list").show();
      $("#time-filter>.filter-content>.time-list>li").click(function(){
        $("#time-filter>.filter-content>.time-choose").html($(this).html());
        $(this).parent().hide();
        // 手动过滤相应年份数据
        if($(this).html() === '全部'){
          initEventTrend(data);
          return ;
        }else{
          let time = Number($(this).html());
          filterData(data, time);
        }
      });
    });
  }

  // 手动过滤相应年份数据
  function filterData(data, time){
    let dataSource = [];
    for(let i=0, max=data.length; i<max; i++){
      let timeData = Number(data[i].time.substring(0, 4));
      if(timeData === time){
        dataSource.push(data[i]);
      }
    }
    initEventTrend(dataSource);
  }

  //// 授权判断
  //function authJudgment( result ) {
  //  if ( result.code && result.code === 407 ) {
  //    $("#searchList_main_box").html('');
  //    $("#searchlist_pagination_box").hide();
  //    showAlert( "提示", result.message, "entity_pagealert_notice_color_license" );
  //    return false;
  //  }
  //  return true;
  //}

  // 事件点击跳转详情
  // function goRelatePage() {
  //   $(".entity_go_detail").on( 'click', function() {
  //     location.href = '/' + $( this ).attr( "data-pagetype" ) + '?id=' + $( this ).attr( "data-id" ) + '&type=' + $( this ).attr( "data-type" );
  //   } )
  // }

  //图标tooltip
  !function BtnTip () {
    const tipText = ['保存', '添加属性', 'GIS', '关系拓扑'];
    let tipIndex;
    $('.property-save-btn, .property-add-btn, #entity_map, #entity_topo')
    .mouseover(function(){
      tipIndex = $(this).index();
      $(this).append(`<span class="tipStyle">${ tipText[tipIndex] }</span>`);
    })
    .mouseout(function(){
      $('.tipStyle').remove();
    });
  }();

  //***********   人脸识别   ************
  //获取人脸的id号或车辆place
  function getRecBasicMes(data) {
    var baseData = data;
    //遍历生成详细内容
    for( var i = 0; i < baseData.length; i ++ ) {
      //dev_police
      // if(Magicube.type === 'RENXX'){
      //   if(baseData[ i ].system === 'GMSFHM'){
      //     idNumber = baseData[i].value;
      //   }
      // }else if(Magicube.type === 'CHE'){
      //   if(baseData[ i ].system === 'CAR_NUMBER'){//'JDCHPHM'
      //     licensePlate = baseData[i].value;
      //   }
      // }  

      //银川
      if(Magicube.type === 'RENXX'){
        if(baseData[ i ].system === 'GMSFHM'){
          idNumber = baseData[i].value;
        }
      }else if(Magicube.type === 'CHE'){
        if(baseData[ i ].system === 'JDCHPHM'){
          licensePlate = baseData[i].value;
        }
      }
    }
  }

  // 获取人脸识别信息,获取车牌信息
  function getFaceOrVehicleRecognitionInfo(url, id, str){
    fetch( Magicube.hbaseUrl + url + encodeURIComponent(id),
    //dev_police fetch( 'http://172.16.11.146:9427/hbaseapi/rlxx?sfzh=640322199001282519',
      {
        credentials: 'include',
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
      .then((response) => response.json())
      .then((data) => {
        recognitionInformation = data || [];
        addTab(str);
        showRecognitionInformation(recognitionInformation);
      });
  }

  // 动态渲染人脸识别、车牌信息
  function addTab(name){
    if(Magicube.type === 'RENXX'){
      $(".entity-content>.tab-content>div").html(`
        <section id="entity_face_recognition">
          <div class="face_recognition_info">
            <div class="face_recognition_toolbar">
              <div class="face_recognition_chooseTime">
                <span class="face_recognition_chooseTime_title">抓拍时间：</span>
                <div class="clandar_boxs">
                  <input type="text" id="face_recognition_first_time" readOnly />
                  <button type="button" id="face_recognition_time_start" data-input="face_recognition_first_time" class="icon-calendar-cute"></button>
                </div>
                <span class="face_recognition_warning"></span>                      
              </div>
              <div class="face_recognition_searchBox">
                <div class="face_recognition_searchType">
                  <label htmlFor="">相机ID：
                    <input class="face_recognition_searchType_title" />
                  </label>
                  <span class="face_recognition_warning"></span>                                          
                </div>
                <button class="face_recognition_searchBtn">搜索</button>  
              </div>  
            </div>

            <div class="face_recognition_table">
              <div class="no-data">暂无数据!</div>
              <table>
                <thead>
                </thead> 
                <tbody>
                </tbody>
              </table>              
            </div>
          </div>                
        </section>
      `);
    $('#entity-info').append(`
      <div class="face_recognition_pic_box">
        <button class="icon-delete" id="deletePic"></button>
        <div class="no-data">暂无数据！</div>
        <div class="face_recognition_picInfo_box">
          <div class="face_recognition_pic">
            <img src="" alt=""/>
          </div>
          <div class="picInfo_box_content">
            <div class="picInfo_box_lt_border"></div>    
            <table>
              <tbody>
             
              </tbody>
            </table>
            <div class="picInfo_box_rb_border"></div>                        
          </div>
        </div>
      </div>
    `)

    }else if(Magicube.type === 'CHE'){
      $(".entity-content>.tab-content>div").html(`
        <section id="entity_face_recognition">
          <div class="face_recognition_info">
            <div class="face_recognition_toolbar">
              <div class="face_recognition_chooseTime">
                <span class="face_recognition_chooseTime_title">过车时间：</span>
                <div class="clandar_boxs">
                  <input type="text" id="face_recognition_first_time" readOnly />
                  <button type="button" id="face_recognition_time_start" data-input="face_recognition_first_time" class="icon-calendar-cute"></button>
                </div>
                <span class="face_recognition_warning"></span>                      
              </div>
              <div class="face_recognition_searchType">
                <label htmlFor="">相机ID：
                  <input class="face_recognition_searchType_title" />
                </label>
                <span class="face_recognition_warning"></span>                                          
              </div>
              <div class="face_recognition_searchType">
                <label htmlFor="">卡口ID：
                  <input class="face_recognition_searchType_title" />
                </label>
                <span class="face_recognition_warning"></span>                                          
              </div>
              <button class="face_recognition_searchBtn face_rsbtn_special">搜索</button>     
            </div>

            <div class="face_recognition_table">
              <div class="no-data">暂无数据!</div>
              <table>
                <thead>
                  
                </thead> 
                <tbody>
                </tbody>
              </table>
            </div>
          </div>                    
        </section>
      `);
      $('#entity-info').append(`
        <div class="face_recognition_pic_box">
          <button class="icon-delete" id="deletePic"></button>
          <div class="no-data">暂无数据！</div>
          <div class="face_recognition_picInfo_box">
            <div class="face_recognition_pic">
              <img src="" alt=""/>
            </div>
            <div class="picInfo_box_content">
              <div class="picInfo_box_lt_border"></div>    
              <table>
                <tbody>
            
                </tbody>
              </table>
              <div class="picInfo_box_rb_border"></div>                        
            </div>
          </div>
        </div>
      `)

    }

    laydate.render({
      elem: '#face_recognition_first_time',
      range: '~'
    });

    $('#deletePic').click(function(){ $('.face_recognition_pic_box').hide()});
  }

  // 人脸识别信息展示
  function showRecognitionInformation(data){
    if(Magicube.type === 'CHE'){
        // $('.face_recognition_table table tbody').css('height', '2.5em');
      }
    let tableHtml = '',
        photoHtml = '';
    if(data.length != 0){
      // 判断信息有无 选择性显示隐藏
      recognitionInfoTableExist(true);
      recognitionInfoDivExist(true);
      if(Magicube.type === 'RENXX'){
          // 渲染表格表头
        //`<th>` + `相机ID` + `</th>`
        //+ `<th>` + `详细` + `</th>`;
        let tableTr = `<th>` + `设备名称` + `</th>`
        + `<th>` + `抓拍时间` + `</th>`;

        $(".face_recognition_table thead").html(`<tr>` + tableTr + `</tr>`);
        // 渲染表格内容
        for(let i=0; i< data.length; i++){
          let content = '';
          for(let j in data[i]){
            data[i][j] = data[i][j] === "undefined"? '': data[i][j];
          }
           tableHtml += `<tr>`

                          + `<td>` + data[i]['ZPID'] + `</td>`
                          + `<td>` + data[i]['ZPSJ'] + `</td>`

                +  `</tr>`;
        //+ `<td>` + data[i]['XJID'] + `</td>`
        //  + `<td>查看</td>`
        }
      }else if(Magicube.type === 'CHE'){
        // 渲染表格表头
        // + `<th>` + `相机ID` + `</th>`
        //+ `<th>` + `相机名称` + `</th>`
        //+ `<th>` + `详细` + `</th>`
        let tableTr = `<th>` + `设备名称` + `</th>`
        + `<th>` + `车道ID` + `</th>`
        + `<th>` + `抓拍时间` + `</th>`;

        $(".face_recognition_table thead").html(`<tr>` + tableTr + `</tr>`);
        // 渲染表格内容
        for(let i=0; i< data.length; i++){
          let content = '';
          for(let j in data[i]){
            data[i][j] = data[i][j] === "undefined"? '': data[i][j];
          }
          tableHtml += `<tr>`
                          + `<td>` + data[i]['KKID'] + `</td>`
                          + `<td>` + data[i]['CDID'] + `</td>`
                          + `<td>` + data[i]['GCSJ'] + `</td>`

                +  `</tr>`;
          //+ `<td>` + data[i]['XJID'] + `</td>` 
          //+ `<td>` + data[i]['XJMC'] + `</td>` 
          //+ `<td>查看</td>`
        }
      }

      $(".face_recognition_table tbody").html(tableHtml);
      //tbody加滚动条
      let $reognitionTable = $(".face_recognition_table>table>tbody");
      try{
          !!$reognitionTable.data("mCS") && $reognitionTable.mCustomScrollbar("destroy"); //Destroy
      }catch (e){
          $reognitionTable.data("mCS",''); //手动销毁
      }
      $reognitionTable.mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });

      //外层加滚动条
      // let $entityContentBody = $("#entity-info>.entity-content>.tab-content>.table-max");
      // try{
      //   !!$entityContentBody.data("mCS") && $entityContentBody.mCustomScrollbar("destroy"); //Destroy
      // }catch (e){
      //   $entityContentBody.data("mCS",''); //手动销毁             
      // }
      // $entityContentBody.mCustomScrollbar({
      //   theme: Magicube.scrollbarTheme,
      //   autoHideScrollbar: true
      // });
      var passData = data;
      // 给表格每行增加点击事件查看详细
      $(".face_recognition_table tbody tr").bind('click', function(){
        if(flag){
          showPicInformation(passData, $(this).index());
        }
        flag = true;
      });

      $('.face_recognition_pic_box').hide();

      // 初始化渲染右侧图片详情      
      $(".face_recognition_table tbody tr:eq(0)").click();
      // 人脸识别 搜索
      recognitionInfofilter();
    }else{
      // 判断信息有无选择性显示隐藏      
      recognitionInfoTableExist(false);
      recognitionInfoDivExist(false);
    }
  }

  // 人脸识别信息展示右侧图片相关
  function showPicInformation(data, i){
    recognitionInfoDivExist(true);
    // 单独渲染照片  
    $(".face_recognition_pic img").attr('src', 'data:image/png;base64,'+ data[i]['ZPZP']);
    let content = '';
    // 循环渲染右侧详细 
    if(Magicube.type === 'RENXX'){
      content = `<tr>
                  <td>照片长度：</td>
                  <td>` + data[i]['ZPCD'] + `</td>
                </tr>`
              + `<tr>
                  <td>相似度：</td>
                  <td>` + data[i]['XSD'] + `</td>
              </tr>`
              + `<tr>
                  <td>黑名单人员姓名：</td>
                  <td>` + data[i]['HMDRYXM'] + `</td>
              </tr>`
              + `<tr>
                  <td>身份证号：</td>
                  <td>` + data[i]['SFZH'] + `</td>
              </tr>`;
    }else if(Magicube.type === 'CHE'){
      content = `<tr>
                  <td>车牌号码：</td>
                  <td>` + data[i]['CPHM'] + `</td>
                </tr>`
              + `<tr>
                  <td>目标方向：</td>
                  <td>` + data[i]['MBFX'] + `</td>
              </tr>`
              + `<tr>
                  <td>车辆颜色：</td>
                  <td>` + data[i]['CLYS'] + `</td>
              </tr>`
              + `<tr>
                  <td>车辆类型：</td>
                  <td>` + data[i]['CLLX'] + `</td>
              </tr>`;
    }

    $(".picInfo_box_content tbody").html(content);
    //滚动条
    let $reognitionBox = $(".face_recognition_picInfo_box");
    try{
        !!$reognitionBox.data("mCS") && $reognitionBox.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
        $reognitionBox.data("mCS",''); //手动销毁
    }
    $reognitionBox.mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });

    $('.face_recognition_pic_box').show();
  }

  // 判断表格有无
  function recognitionInfoTableExist(flag){
    if(flag){
      $(".face_recognition_table table").show();
      $(".face_recognition_table .no-data").hide();
    }else{
      $(".face_recognition_table table").hide();
      $(".face_recognition_table .no-data").show();
    }
  }
  // 判断右侧图片信息有无
  function recognitionInfoDivExist(flag){
    if(flag){
      $(".face_recognition_picInfo_box").show();
      $(".face_recognition_pic_box .no-data").hide();
    }else{
      $(".face_recognition_picInfo_box").hide();
      $(".face_recognition_pic_box .no-data").show();
    }
  }

  // 人脸识别信息绑定搜索事件
  function recognitionInfofilter(){
    $(".face_recognition_searchBtn").click(function(){
      event.stopPropagation();
      $(".face_recognition_chooseTime .face_recognition_warning").hide();
      $(".face_recognition_searchType .face_recognition_warning").hide();
      let str = $("#face_recognition_first_time").val().trim()
      let startTime = str.substring(0, 10);
      // console.log(startTime)      
      let endTime = str.substring(13, 23);
      // console.log(endTime)
      let cameraId = $(".face_recognition_searchType_title:eq(0)").val().trim();
      let bayonetId = '';
      if(Magicube.type === 'CHE'){
        bayonetId = $(".face_recognition_searchType_title:eq(1)").val().trim();
      }
      if(startTime == '' && endTime != ''){
        $(".face_recognition_chooseTime .face_recognition_warning").text("* 请选择起始时间").show();
      }else if(startTime != '' && endTime == ''){
        $(".face_recognition_chooseTime .face_recognition_warning").text("* 请选择结束时间").show();
      }else if(startTime != '' && endTime != ''){
        let reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if(!reg.test(startTime) || !reg.test(endTime)){
          $(".face_recognition_chooseTime .face_recognition_warning").text("* 请输入正确的时间，例如：2017-01-08").show();
        }else{
          let data;
          if(cameraId != '' && bayonetId != ''){
            data = recogInfoFilterCameraId(recognitionInformation, cameraId);
            data = recogInfoFilterBayonetId(recognitionInformation, bayonetId);
            data = recognitionInfoFilterTime(data, startTime, endTime);
          }else if(cameraId != '' && bayonetId == ''){
            data = recogInfoFilterCameraId(recognitionInformation, cameraId);
            data = recognitionInfoFilterTime(data, startTime, endTime);
          }else if(cameraId == '' && bayonetId != ''){
            data = recogInfoFilterBayonetId(recognitionInformation, bayonetId);
            data = recognitionInfoFilterTime(data, startTime, endTime);
          }else{
            data = recognitionInfoFilterTime(recognitionInformation, startTime, endTime);
          }
          showRecognitionInformation(data);
        }
      }else if(startTime == '' && endTime == ''){
        let data;
        if(cameraId != '' && bayonetId != ''){
          data = recogInfoFilterCameraId(recognitionInformation, cameraId);
          data = recogInfoFilterBayonetId(recognitionInformation, bayonetId);
          showRecognitionInformation(data);
        }else if(cameraId != '' && bayonetId == ''){
          data = recogInfoFilterCameraId(recognitionInformation, cameraId);
          showRecognitionInformation(data);
        }else if(cameraId == '' && bayonetId != ''){
          data = recogInfoFilterBayonetId(recognitionInformation, bayonetId);
          showRecognitionInformation(data);
        }else{
          showRecognitionInformation(recognitionInformation);
        }
      }
    });
  }

  // 人脸识别、车牌识别信息按时间筛选
  //把符合startTime 和endTime的data push 到一个数组中
  function recognitionInfoFilterTime(data, startTime, endTime){
    startTime = js_strto_time(startTime + ' 00:00:00');
    endTime = js_strto_time(endTime + ' 24:00:00');
    let newRecognitionInfo = [];
    if(Magicube.type === 'RENXX'){
      for(let i=0; i< data.length; i++){
        let time = js_strto_time(data[i]['ZPSJ']);
        if(time >= startTime && time <= endTime){
          newRecognitionInfo.push(data[i]);
        }
      }
    }else if(Magicube.type === 'CHE'){
      for(let i=0; i< data.length; i++){
        let time = js_strto_time(data[i]['GCSJ']);
        if(time >= startTime && time <= endTime){
          newRecognitionInfo.push(data[i]);
        }
      }
    }

    return newRecognitionInfo;
  }

  // 人脸识别、车牌识别信息按相机ID筛选
  function recogInfoFilterCameraId(data, id){
    let newRecognitionInfo = [];
    for(let i=0; i<data.length; i++){
      if(data[i]['XJID'] === id){
        newRecognitionInfo.push(data[i]);
      }
    }
    return newRecognitionInfo;
  }

  // 车牌识别信息按卡口ID筛选
  function recogInfoFilterBayonetId(data, id){
    let newRecognitionInfo = [];
    for(let i=0; i<data.length; i++){
      if(data[i]['KKID'] === id){
        newRecognitionInfo.push(data[i]);
      }
    }
    return newRecognitionInfo;
  }

  //时间格式 2014-02-02 14:10:00 改成时间戳  
  function js_strto_time(str_time){
    var new_str = str_time.replace(/:/g,"-");
    new_str = new_str.replace(/ /g,"-");
    var arr = new_str.split("-");
    var datum = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
    return strtotime = datum.getTime()/1000;
  }

  //分页————生成分页,设置分页,分页回调,填充数据  
  function TabMesPage(dataS, thisIn){
    // console.log(tableDataDetail)
    var dataS = dataS;
    var getPageTransData = {
      tableName: tableDataDetail.system,//'CAR_BJXX'
      parentId: objectId,
      sourceTableName: tableDataDetail.value[thisIn].table,
      pageSize: dataPageSize,//页尺寸
      pageNo: 0 //页号
    };

    setPagination( totalp, "#option_log_pagination", "#option_content_body", dataPageSize, pageCallback);

    function setPagination( totalpages, paginationId, bodyId, pagesize, callback ) {
      // var totalpages = parseInt( data );
      if (totalpages !== 0) {
        $( paginationId ).pagination( totalpages, {
          callback : callback,
          prev_text : '< 上一页',
          next_text: '下一页 >',
          items_per_page : pagesize,
          num_display_entries : 6,
          current_page: 0,
          num_edge_entries : 1,
          showData:10
        } );
        $( paginationId ).parent().show();
      } else {
        $( bodyId ).children("tbody").html( "" );
        $( paginationId ).parent().hide();
      }
    }

    function pageCallback( index ){
      getPageTransData.pageNo = index;
      // console.log(getPageTransData)
      $.get( EPMUI.context.url + '/object/detailInformation/group/page' , getPageTransData, function( data ) {
        //alert(data);
        $('.alert-content').html('');
        $("#entity-alert>.alert-content").html('');
        //let message = detailData;
        data = JSON.parse(data)
        if(data.magicube_interface_data){
          let message = data.magicube_interface_data;
          // 渲染弹框内表格数据
          for(let i=0; i<message.length; i++){
            if(typeof message[i] === 'string'){
              message[i] = JSON.parse(message[i]);
            }
            if(i === 0){
              $("#entity-alert>.alert-content").append($(`<li class="tableStyle table-show"><p>` + (getPageTransData.pageNo*dataPageSize+i+1) + dataS[thisIn].desc + `<span class="icon-angle-up"></span></p></li>`));//+ message[i].time
            }else{
              $("#entity-alert>.alert-content").append($(`<li class="tableStyle"><p>`+ (getPageTransData.pageNo*dataPageSize+i+1) + dataS[thisIn].desc   + `<span class="icon-chevron-down-blue"></span></p></li>`));//+ message[i].time
            }
            let str = '';
            for(let j in message[i]){
              if(j !== 'tableName'){
                str += `<tr><td>` + j + `</td><td style="word-break:break-all;">` + message[i][j] + `</td></tr>`;
              }
            }
            $(`<table>
                <tbody>`
                  + str +
                `</tbody>
              </table>`).appendTo($("#entity-alert>.alert-content>.tableStyle:eq(" + i + ")"));
          }
          //滚动条插件
          let $PaginationUl = $("#entity-shade .alert-content");
          try{
             !!$PaginationUl.data("mCS") && $PaginationUl.mCustomScrollbar("destroy"); //Destroy
          }catch (e){
             $PaginationUl.data("mCS",''); //手动销毁
          }
          $PaginationUl.mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          });

          $(".tableStyle").click(function(){
            if($(this).hasClass("table-show")){
              $(this).removeClass("table-show").find('span').removeClass("icon-angle-up").addClass("icon-chevron-down-blue");
              $(this).find('tableStyle').css('display', 'none');
            }else{
              $(this).addClass("table-show").find('span').addClass("icon-angle-up").removeClass("icon-chevron-down-blue");
              $(this).find('tableStyle').css('display', 'inline-table');
            }
          });

        }
      });
    }

  }

   //更改系统日志显示条数
  $("#option_page_ensure").on( 'click', function (){
    changePageSize( $("#option_page_num").val() );
  } );

  //改变每页显示条数
  function changePageSize( pagesize ){
    if( parseInt( parseInt( pagesize ) ) < 1 ) {
      $("#entity-alert").append('<div class="entity_waring" ><h4>警告!</h4><p>每页显示条数至少为1</p><button>确定</button></div>');
    } else if( !parseInt( pagesize ) ) {
      $("#entity-alert").append('<div class="entity_waring" ><h4>警告!</h4><p>请确定输入的每页显示条数是整数</p><button>确定</button></div>');
    }
    $('.entity_waring button').click(function(){
      $('.entity_waring').remove();
    })
    dataPageSize = parseInt( pagesize );
    TabMesPage(pageSearchData, thisIn);
  }
});