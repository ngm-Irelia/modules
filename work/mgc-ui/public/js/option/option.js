$( function() {
  var optionLogPgeSize = 20,
      systemLogPgeSize = 20,
      delegationPgeSize = 20,
      optionLogPostBody = {
        pageSize: optionLogPgeSize
      },
      systemLogPostBody = {
        pageSize: systemLogPgeSize
      },
      delegationPostBody = {
        pageNo:0,
        pageSize: delegationPgeSize
      },
      optionFilterObject = {
        "#option_filter_username": "userName",
        "#option_filter_user": "operateType",
        "#option_filter_ip": "ip",
        "#option_time": "startTime~endTime"
      },
      systemFilterObject = {
        "#system_filter_username": "userName",
        "#option_filter_sys": "operateType",
        "#system_filter_ip": "ip",
        "#system_time": "startTime~endTime"
      };
  
  //根据用户权限显示页面
  let presenrAuth = localStorage.getItem('auth');
  if (presenrAuth == 'false') {
    $('#options_box_contents li:eq(2)').hide();
    $('#options_box_contents li:eq(3)').hide();
    $('#options_box_contents li:eq(4)').hide();
    $('#options_box_titles li:eq(2)').hide();
    $('#options_box_titles li:eq(3)').hide();
    $('#options_box_titles li:eq(4)').hide();
  }

  //判断在哪个tab页签上，然后调相应的方法
  switch( parseInt( localStorage.optionTab ) ){
    case 0: showTab( 0 );
            break;
    case 1: showTab( 1 );
            break;
    case 2: showTab( 2 );
            break;
    case 3: showTab( 3 );
            checkLogeIs( "option" );
            break;
    case 4: showTab( 4 );
            checkLogeIs( "system" );
            break;
    default:showTab(2);
            break;
  }

  //导航条上的工具组
  $(".options_box_title").on('click', function(){
    var index = $(this).index();
    localStorage.setItem( "optionTab", index );
    showTab( index );
  } );

  //点击tab进行切换显示内容
  function showTab(index){
    if( index ===1 ) {
      getAllMessage();
    } else if( index === 2 && $("#delegation_detail_body").find("tr").length === 0 ) {
      delegationDetail();
    } else if( index === 3 && $("#option_content_body").find("tr").length === 0 ) {
      //此处原来的接口/log/useroperate/totalnumber
      setLog( EPMUI.context.url + '/log/useroperate', optionLogPostBody, "#option_log_pagination", "#option_content_body", optionLogPgeSize, optionLogCallback );
      $("#option_log_lists").mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    } else if( index === 4 && $("#system_content_body").find("tr").length === 0) {
      setLog( EPMUI.context.url + '/log/sys/totalnumber', systemLogPostBody, "#system_log_pagination", "#system_content_body", systemLogPgeSize, systemLogCallback );
      $("#system_log_lists").mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    }else if( index === 0 ){
      getPersonalDetails();
    }
    $("#options_box").show();
    $(".options_box_title").eq(index).addClass("option_title_active").siblings().removeClass("option_title_active");
    $(".options_box_content").eq(index).addClass("options_content_active").siblings().removeClass("options_content_active");

  }

  //调用日历插件
  // $('#personal_date_btn').date_input();

  $(".selectable_day").click( function() {
    $(".register_birthday").hide();
  } );
  $("#personal_date").blur( function() {
    $(".register_birthday").show();
  } );

  //切换权限管理
  $(".delegation_tab_btn").on( 'click', function(){
    var index = $(this).index();
    //根据index来判断是权限管理详细还是获取用户组数据
    switch( index ) {
      case 0: delegationDetail();
        break;
      case 1: getGroupData();
    }
    $(this).addClass("delegation_tab_active").siblings().removeClass("delegation_tab_active");
    $(".delegation_content_box").hide().eq( index ).show();
  } );

  //获取个人信息
  function getPersonalDetails(){
    $.get( EPMUI.context.url +"/user/info", function(data){
      var datas = JSON.parse( data );
      $(".options_personal_username").text(datas.sysUserName);
      $(".options_personal_usergender").text(datas.sysUserGender);
      $(".options_personal_userage").text(datas.sysUserBirthday);
      $(".options_personal_userphone").text(datas.sysUserPhoneNumber);
      $(".options_personal_userhouseholdregister").text(datas.sysUserHouseholdRegister);
      $(".options_personal_userposition").text(datas.sysUserPosition);
      $(".options_personal_account").text(datas.sysUserAccount);
      $(".options_personal_useremail").text(datas.sysUserEmail);
      $(".options_personal_groupname").text(datas.sysGroupName);
      $(".options_personal_rolename").text(datas.sysRoleName);
      $("#option_modify_password").show();
      $("#option_modify_detail").show();
    })
  }

  //显示修改密码框
  $("#option_modify_password").on( 'click', function() {
    $(".modify_password_box").show();
  } );

  //显示修改个人信息
  $("#option_modify_detail").on( 'click', function() {
    $(".modify_detail_box").show();
  } );

  //获取个人消息
  function getAllMessage() {
    if( !!$("#new_messages").html() ) {
      return false;
    }
    $.get( EPMUI.context.url + '/message', function(data) {
      var datas = JSON.parse( data );
      var receiveData = datas.receivedDataSet;
      var pushData = datas.sharedDataSet;
      var receiveContent = receiveMessage( receiveData );
      var pushContent = shareMessage( pushData );

      // tab切换更新数据时需要先清除滚动条插件
      $(".options_message_box").mCustomScrollbar("destroy");
      $("#options_message_push_mine").html( receiveContent );
      $("#options_message_mine_push").html( pushContent );
      // 给消息盒子绑定滚动条插件
      $(".options_message_box").mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
      goTopology();
    } );
  }

  //获取到收到的消息
  function receiveMessage(data) {
    if( data.length === 0 ) {
      return null;
    }
    //拼接字符串，设置接收到的消息
    var content = '<div class="option_message_timeline"></div>';
    for( var i = 0, length = data.length; i < length; i ++ ) {
      content += '<div class="option_message_list">'
        +    '<span class="option_message_list_date">' + data[i].dataSetShareDate + '</span>'
        +    '<span class="option_message_list_number">消息' + ( i + 1 ) + '</span>'
        +    '<span class="option_message_list_people">' + data[i].sharer + '</span>'
        +    '<span class="option_message_list_content">向你推送了一条关于</span>'
        +    '<span class="option_message_list_name">' + data[i].dsiName + '</span>'
        +    '<span class="option_message_list_content">的分析结果</span>'
        +    '<span class="option_message_list_check" data-type="share" data-id="' + data[i].dsiId + '">点击查看！</span>'
        +  '</div>';
    }
    return content;
  }

  //获取到分享的消息
  function shareMessage(data) {
    if( data.length === 0 ) {
      return null;
    }
    //拼接字符串，设置分享的消息
    var content = '<div class="option_message_timeline"></div>';
    for( var i = 0, length = data.length; i < length; i ++ ) {  
      content += '<div class="option_message_list">'
        +    '<span class="option_message_list_date">' + data[i].dataSetShareDate + '</span>'
        +    '<span class="option_message_list_number">消息' + ( i + 1 ) + '</span>'
        +    '<span class="option_message_list_content">我向</span>'
        +    '<span class="option_message_list_people">' + data[i].receiver + '</span>'
        +    '<span class="option_message_list_content">推送了一条关于</span>'
        +    '<span class="option_message_list_name">' + data[i].dsiName + '</span>'
        +    '<span class="option_message_list_content">的分析结果</span>'
        +    '<span class="option_message_list_check" data-id="' + data[i].dsiId + '">点击查看！</span>'
        +  '</div>';
    }

    return content;
  }

  //推送与被推送之间的切换
  $(".options_message_push").click( function() {
    var index = $(this).index();
    $(".options_message_push").removeClass("options_message_push_active");
    $(this).addClass("options_message_push_active");
    $(".new_messages").removeClass("options_content_active").eq(index).addClass("options_content_active");
  } );

  //获取用户组信息
  function getGroupData() {
    $.get( EPMUI.context.url + "/grouplist", function(data) {
      var datas = JSON.parse( data );

      var content = "";

      for( var i = 0, length = datas.length; i < length; i++ ) {
        content += '<tr>'
          +   '<td>'
          +     '<p>' + datas[i].displayName + '</p>'
          +     '<span data-id="' + datas[i].systemName + '" class="delegation_delete_group_name icon-close-circle-blue"></span>'
          +     '<span data-id="' + datas[i].systemName + '" data-modify="false" class="delegation_modify_group_name icon-edit-blue"></span>'
          +   '</td>'
          + '</tr>'
      }

      $("#delegation_modify_group table tbody").html( content );
      delelationGroupContent();
    } );
  }
  //获取用户组列表
  function getGroupList(){
    $.get( EPMUI.context.url + "/grouplist", function(data) {
      var datas = JSON.parse( data );

      var content = "";

      for( var i = 0, length = datas.length; i < length; i++ ) {
        content += '<tr>'
          +   '<td>'
          +     '<p>' + datas[i].displayName + '</p>'
          +     '<span data-id="' + datas[i].systemName + '" class="delegation_delete_group_name icon-close-circle-blue"></span>'
          +     '<span data-id="' + datas[i].systemName + '" data-modify="false" class="delegation_modify_group_name icon-edit-blue"></span>'
          +   '</td>'
          + '</tr>'
      }

      $("#delegation_modify_group table tbody").html( content );
      delelationGroupContent();
    } );
  }

  //修改用户组信息
  function delelationGroupContent() {
    //修改用户组信息
    $(".delegation_modify_group_name").on( "click", function() {
      if( $(this).attr( "data-modify" ) === "false" ) {
        //可以用class控制
        $(this).attr("data-modify", true).addClass('icon-save').removeClass('icon-edit-blue').parent().find("p").attr("contentEditable", true).focus();
      } else {
        $(this).attr("data-modify", false).addClass('icon-edit-blue').removeClass('icon-save').parent().find("p").attr("contentEditable", false);
        var data = {
          id: $(this).attr("data-id"),
          name: $(this).parent().find("p").text()
        };

        $.post( EPMUI.context.url + '/updategroup', data, function( data ) {
          var datas = JSON.parse( data );
          if( data.status === "success" ) {
            $(this).parent().parent().remove();
            showAlert( "提示!", datas.message, "event_pagealert_notice_color_default" );
          } else {
            showAlert( "提示!", datas.message, "event_pagealert_notice_color_license" );
          }
        } )
      }
    } );

    //删除用户组
    $(".delegation_delete_group_name").on( "click", function() {
      var idArr = [];
      idArr.push( $(this).attr("data-id") );
      var data = {
        groupId: JSON.stringify( idArr )
      };
      var parentTr = $(this).parent().parent();
      $.post( EPMUI.context.url + '/group/delete', data, function(data){
        var datas = JSON.parse( data );
        if( datas.status === "success" ) {
          parentTr.remove();
          showAlert( "提示!", datas.message, "event_pagealert_notice_color_default" );
        } else {
          showAlert( "提示!", datas.message, "event_pagealert_notice_color_license" );
        }
      } )
    } );
  }

  //修改用户权限
  $("#delegation_modify_option_ensure").on( 'click', function() {
    var userIdArr = [];
    var groupFlag = false, roleFlag = false;
    //获取所有修改的用户
    $(".delegation_check_list:checked").each( function( index, item ) {
      userIdArr.push( $(item).attr("data-id") );
    } );
    //由于后台处理要，分割
    var userIdStr = userIdArr.join( ',' );
    var data = {
      userId: userIdStr
    };
    //如果用户组不为空，进行用户组的修改
    if( $("#delegation_modify_group_type").attr("data-type") !== "null") {
      data.groupId = $("#delegation_modify_group_type").attr("data-type");
      groupFlag = true;
    }
    //如果角色内容不为空，进行用户角色的修改
    if( $("#delegation_modify_role_type").attr("data-type") !== "null") {
      data.groupId = $("#delegation_modify_role_type").attr("data-type");
      roleFlag = true;
    }

    $.post( EPMUI.context.url + "/updategrouprole", data, function( data ) {
      var datas = JSON.parse( data );
      if( datas.status === "success" ) {
        $(".delegation_check_list:checked").parents("tr").each( function( index, item ) {
          if( groupFlag ) {
            // 修改后的替换修改之前的内容
            $( item ).children( ".delegation_detail_group" ).html( $("#delegation_modify_group_type").html() );
          }
          if( roleFlag ){
            // 修改后的替换修改之前的内容
            $( item ).children( ".delegation_detail_role" ).html( $("#delegation_modify_role_type").html() );
          }
        } );
      }
    } );

  } );

  //根据证件号码进行检索
  $("#delegation_modify_option_select_input").keydown(function(event){
    if (event.keyCode == 13) {
      $.post( EPMUI.context.url + '/userlist' , {}, function( data ) {
        let idcard = $("#delegation_modify_option_select_input").val();
        if(idcard){
          setSelectLogContent( JSON.parse( data ), "#delegation_detail_head", "#delegation_detail_body", idcard );
          delegationDetailOption();
        }else{
          setLogContent( JSON.parse( data ), "#delegation_detail_head", "#delegation_detail_body", "delegation" );
          delegationDetailOption();
        }
      } );
    }
  });

  $(".delegation_modify_option_idcard_search").bind("click",function () {
    $.post( EPMUI.context.url + '/userlist' , {}, function( data ) {
      let idcard = $("#delegation_modify_option_select_input").val();

      if(idcard){
        setSelectLogContent( JSON.parse( data ), "#delegation_detail_head", "#delegation_detail_body", idcard );
        delegationDetailOption();
      }else{
        delegationDetail();
      }

    } );
  });

  //删除用户
  $("#delegation_modify_option_delete").on( 'click', function() {
    var user = {},
      arr = [],
      nodes = [];
    //把所有要删除的用户放到数组中进行统一删除
    $(".delegation_check_list:checked").each( function( index, item ) {
      arr.push( $(item).attr( "data-id" ) );
      nodes.push( $(item).parents("tr") );
    } );

    user.userId = JSON.stringify( arr );
    $.post( EPMUI.context.url + '/userdelete', user, function( data ) {
      var datas = JSON.parse( data );
      if( datas.status === "success" ) {
        nodes.forEach( function( item, index ) {
          $(nodes[index]).remove();
        } );
        showAlert( "提示!", datas.message, "event_pagealert_notice_color_default" );
      } else {
        showAlert( "提示!", datas.message, "event_pagealert_notice_color_license" );
      }
    } )
  } );

  function checkLogeIs( flag ) {
    if( flag === "option" ) {
      setLog( EPMUI.context.url + '/log/useroperate/totalnumber', optionLogPostBody, "#option_log_pagination", "#option_content_body", optionLogPgeSize, optionLogCallback );
    } else if( flag === "system" ){
      setLog( EPMUI.context.url + '/log/sys/totalnumber', systemLogPostBody, "#system_log_pagination", "#system_content_body", systemLogPgeSize, systemLogCallback );
    } else if( flag === "delegation" ){
      setDelegationLog( EPMUI.context.url + '/userListPage', {pageNo:0,pageSize:0}, "#delegation_detail_pagination", "#delegation_detail_body", delegationPgeSize, delegationCallback );
    }
  }

  //过滤操作日志
  $("#option_filter_ensure").on( 'click', function() {
    checkLogFilterObject( optionLogPostBody, optionFilterObject );
    checkLogeIs( "option" );
  } );

  //过滤系统日志
  $("#system_filter_ensure").on( 'click', function() {
    checkLogFilterObject( systemLogPostBody, systemFilterObject );
    checkLogeIs( "system" );
  } );

  //更改操作日志显示条数
  $("#option_page_ensure").on( 'click', function (){
    changePageSize( $("#option_page_num").val(), "option" );
  } );

  //更改系统日志显示条数
  $("#system_page_ensure").on( 'click', function (){
    changePageSize( $("#system_page_num").val(), "system" );
  } );

  //更改用户管理显示条数
  $("#delegation_detail_pagination_ensure").on( 'click', function (){
    changePageSize( $("#delegation_detail_pagination_num").val(), "delegation" );
  } );

  //改变每页显示条数
  function changePageSize( pagesize, flag ){
    if( parseInt( parseInt( pagesize ) ) < 1 ) {
      showAlert( "警告!", "每页显示条数至少为1", "event_pagealert_notice_color_license");
      return false;
    } else if( !parseInt( pagesize ) ) {
      showAlert( "警告!", "请确定输入的每页显示条数是整数", "event_pagealert_notice_color_license");
      return false;
    }
    if(flag === "option") {
      optionLogPgeSize = parseInt( pagesize );
      optionLogPostBody = {
        pageSize: optionLogPgeSize
      };
    } else if(flag === "system"){
      systemLogPgeSize = parseInt( pagesize );
      systemLogPostBody = {
        pageSize: systemLogPgeSize
      };
    }else if(flag === "delegation"){
      delegationPgeSize = parseInt( pagesize );
      delegationPostBody = {
        pageNo:0,
        pageSize: delegationPgeSize
      };
    }
    checkLogeIs( flag )
  }

  //判断过滤日志信息条件
  function checkLogFilterObject ( logPostBody, filterObject ){
    for( var key in filterObject ) {
      if( $( key ).val() ) {
        // 判断搜索条件是否为时间
        if($( key ).val().indexOf('~') > 0 ){
          logPostBody[ filterObject[ key ].split('~')[0] ] = $( key ).val().split('~')[0].trim();
          logPostBody[ filterObject[ key ].split('~')[1] ] = $( key ).val().split('~')[1].trim();
        }else{
          logPostBody[ filterObject[ key ] ] = $( key ).val();  
        }
      } else {
        if( $( key ).attr("data-type") !== "ALL" ) {
          logPostBody[ filterObject[ key ] ] = $( key ).attr("data-type");
        } else {
          delete logPostBody[ filterObject[ key ] ];
        }
      }
    }
  }

  //生成分页
  function setLog( url, key, paginationId, bodyId, pagesize, callback ){
    $.post( url, key, function( data ){
      //此处data是，一共多少条，例如521
      setPagination( data, paginationId, bodyId, pagesize, callback );
    } );
  }

  //生成权限管理分页
  function setDelegationLog( url, key, paginationId, bodyId, pagesize, callback ){
    $.post( url, key, function( data ){
      let numdata = JSON.parse(data);
      setPagination( parseInt(numdata.count), paginationId, bodyId, pagesize, callback );
    } );
  }

  //设置分页
  function setPagination( data, paginationId, bodyId, pagesize, callback ) {
    var totalpages = parseInt( data );
    if (totalpages !== 0) {
      $( paginationId ).pagination( totalpages, {
        callback : callback,
        prev_text : '< 上一页',
        next_text: '下一页 >',
        items_per_page : pagesize,
        num_display_entries : 6,
        current_page: 0,
        num_edge_entries : 1
      } );
      $( paginationId ).parent().show();
    } else {
      $( bodyId ).children("tbody").html( "" );
      $( paginationId ).parent().hide();
    }
  }

  //操作日志分页回掉
  function optionLogCallback( index ){
    optionLogPostBody.pageNo = index;
    $.post( EPMUI.context.url + '/log/useroperate' , optionLogPostBody, function( data ) {
      setLogContent( JSON.parse( data ), "#option_content_head", "#option_content_body", "option" );
    } );
  }

  //系统日志分页回调
  function systemLogCallback( index ){
    systemLogPostBody.pageNo = index;
    $.post( EPMUI.context.url + '/log/sys' , systemLogPostBody, function( data ) {
      setLogContent( JSON.parse( data ), "#system_content_head", "#system_content_body", "system" );
    } );
  }

  //用户管理分页回调
  function delegationCallback( index ){
    delegationPostBody.pageNo = index;
    $.post( EPMUI.context.url + '/userListPage' , delegationPostBody, function( data ) {
      let newdata =  JSON.parse( data );
      setLogContent( newdata.userInfo,  "#delegation_detail_head", "#delegation_detail_body", "delegation" );
    } );
  }

  window.refreshDelegation = function (){
    delegationDetail();
  }
  //权限管理详细
  function delegationDetail() {
    //原不分页版
    /*$.post( EPMUI.context.url + '/userlist' , {}, function( data ) {
      setLogContent( JSON.parse( data ), "#delegation_detail_head", "#delegation_detail_body", "delegation" );
      delegationDetailOption();
    } );*/

    checkLogeIs( "delegation" );
  }

  //对权限管理详细的操作
  function delegationDetailOption() {
    // 权限管理list的全选
    $("#delegation_check_all").on( 'click', function() {
      if( $(this).prop( "checked" ) === true ) {
        $(".delegation_check_list").prop("checked", true);
        $("#delegation_check_all").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        $(".delegation_check_list").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
      } else {
        $(".delegation_check_list").prop("checked", false);
        $("#delegation_check_all").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
        $(".delegation_check_list").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
      }
    } );

    //权限管理list的单选，当全部选中，全选点亮
    $(".delegation_check_list").on( 'click', function() {
      if( $(".delegation_check_list").length === $(".delegation_check_list:checked").length ) {
        $("#delegation_check_all").prop( "checked", true );
        $("#delegation_check_all").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
      } else {
        $("#delegation_check_all").prop( "checked", false );
        $("#delegation_check_all").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
        if($(this).prop("checked")==true){
          $(this).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        }else{
          $(this).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
        } 
      }
    })

  }

  //给日志表格填充数据
  function setLogContent( data, headId, bodyId, flag ) {
    var content = "";
    var len = data.length;
    // 进行分类，系统日志，操作日志和权限管理的内容不一致
    if( flag === "system" ) {
      for( var i = 0; i < len; i ++ ) {
        var userName = data[i].userName ? data[i].userName : "未知用户";
        content += '<tr>'
          +  '<td>' + userName + '</td>'
          +  '<td>' + data[i].ip + '</td>'
          +  '<td>' + data[i].operateTime + '</td>'
          +  '<td>' + data[i].operateType + '</td>'
          + '</tr>';
      }
    } else if( flag === "option" ){
      for( var i = 0; i < len; i ++ ) {
        var userName = data[i].userName ? data[i].userName : "未知用户";
        content += '<tr>'
          +  '<td>' + userName + '</td>'
          // +  '<td>' + data[i].objectId + '</td>'
          +  '<td>' + data[i].ip + '</td>'
          +  '<td>' + data[i].operateTime + '</td>'
          +  '<td>' + data[i].operateType + '</td>'
          +  '<td>' + data[i].detail + '</td>'
          + '</tr>';
      }
    } else if( flag === "delegation" ) {
      for( var i = 0; i < len; i ++ ) {
        content += '<tr>'
          +  '<td><input type="checkbox" class="delegation_check_list icon-square-o-blue" data-id="' + data[i].sysUserId + '"/>' + data[i].sysUserId + '</td>'
          +  '<td>' + data[i].sysUserAccount + '</td>'
          +  '<td>' + data[i].sysUserIdCard + '</td>'
          +  '<td>' + data[i].sysUserPhoneNumber + '</td>'
          +  '<td class="delegation_detail_group">' + data[i].sysGroupName + '</td>'
          +  '<td class="delegation_detail_role">' + data[i].sysRoleName
          +    '<span class="icon-edit-blue authority_modify_detail" '
                    +'roleid="' + data[i].sysRoleId + '" roleName="' + data[i].sysRoleName + '" sysUserId="' + data[i].sysUserId + '" sysUserAccount="' + data[i].sysUserAccount
          + '"></span></td>'
          +  '<td>' + data[i].sysUserDescription + '</td>'
          + '</tr>';
      }
      //添加滚动条
      $( '#delegation_detail_lists' ).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    }
    $( headId ).hide();
    $( bodyId ).children("tbody").html( content ).parent().css( "visibility", "hidden" );

    //显示修改权限
    $(".authority_modify_detail").on( 'click', function() {
        let roleId = $(this).attr("roleid");
        let roleName = $(this).attr("roleName");
        let sysUserId = $(this).attr("sysUserId");
        let sysUserAccount = $(this).attr("sysUserAccount");
        $(".authority_user_name").html(sysUserAccount);
        $(".authority_user_name").attr("sysUserId",sysUserId);
        $("#authority_modify_auto_type").html(roleName);
        $("#authority_modify_auto_type").attr("data-type",roleId);
        $(".authority_modify_box").show();
    } );
    caculateHeaderWidth( headId, bodyId );
  }

  //给日志表格填充数据
  function setSelectLogContent( data, headId, bodyId, idcard ) {
    var content = "";
    var len = data.length;
    for( var i = 0; i < len; i ++ ) {
      if(idcard == data[i].sysUserIdCard){
        content += '<tr>'
          +  '<td><input type="checkbox" class="delegation_check_list icon-square-o-blue" data-id="' + data[i].sysUserId + '"/>' + data[i].sysUserId + '</td>'
          +  '<td>' + data[i].sysUserAccount + '</td>'
          +  '<td>' + data[i].sysUserIdCard + '</td>'
          +  '<td>' + data[i].sysUserPhoneNumber + '</td>'
          +  '<td class="delegation_detail_group">' + data[i].sysGroupName + '</td>'
          +  '<td class="delegation_detail_role">' + data[i].sysRoleName
          +    '<span class="icon-edit-blue authority_modify_detail" '
          +'roleid="' + data[i].sysRoleId + '" roleName="' + data[i].sysRoleName + '" sysUserId="' + data[i].sysUserId + '" sysUserAccount="' + data[i].sysUserAccount
          + '"></span></td>'
          + '<td>' + data[i].sysUserDescription + '</td>'
          + '</tr>';
      }

    }
    //添加滚动条
    $( '#delegation_detail_lists' ).mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });

    $( headId ).hide();
    $( bodyId ).children("tbody").html( content ).parent().css( "visibility", "hidden" );

    //显示修改权限
    $(".authority_modify_detail").on( 'click', function() {
      let roleId = $(this).attr("roleid");
      let roleName = $(this).attr("roleName");
      let sysUserId = $(this).attr("sysUserId");
      let sysUserAccount = $(this).attr("sysUserAccount");
      $(".authority_user_name").html(sysUserAccount);
      $(".authority_user_name").attr("sysUserId",sysUserId);
      $("#authority_modify_auto_type").html(roleName);
      $("#authority_modify_auto_type").attr("data-type",roleId);
      $(".authority_modify_box").show();
    } );
    caculateHeaderWidth( headId, bodyId );
  }
  //更改权限
  /*$("#authority_modify_ensure").on( 'click', function() {
      //向后端发送请求咯
      $.ajax({
        url: EPMUI.context.url + '/updateuserrole',
        type: 'get',
        data: {
          userId:$(".authority_user_name").attr("sysUserId"),
          roleId:$("#authority_modify_auto_type").attr("data-type")
        },
        dataType: 'json',
        success: function (data) {

          $(".authority_modify_box").hide();

          if(data.status === "success"){
            delegationDetail();
            $(".authority_modify_box_result").show();
            $("#authority_modify_box_result_value").html(data.message);
          }else{
            delegationDetail();
            $(".authority_modify_box_result").show();
            $("#authority_modify_box_result_value").html(data.message);
          }

          setTimeout(function () {
            $(".authority_modify_box_result").hide();
          },800);
        }
      });

  } );
  $("#authority_modify_reset").on( 'click', function() {
      $(".authority_modify_box").hide();
  } );*/

  //计算表头的宽度
  function caculateHeaderWidth( headId, bodyId ) {
    //表头宽度比较小，所以用tbody的宽度设置thead宽度
    var headColumns = $( headId ).find("td");
    var bodyColunms = $( bodyId ).find("tr").eq(0).children("td");

    $( headId ).width( $( bodyId ).innerWidth() );

    bodyColunms.each( function(index, item) {
      $(headColumns[index]).width( $(item).innerWidth() );
    } );
    $( bodyId ).css( "visibility", "visible" );
    $( headId ).show();
  }

  //alert弹框的出现
  function showAlert( title, content, color ) {
    /*$("#page_alert").show();

    $("#page_alert_title").html( title ).addClass(color);
    $("#page_alert_content").html( content );*/

    $(".component_alert").show();

    $(".component_alert_title").html( title ).addClass(color);
    $(".component_alert_content").html( content );
  }

  //alert弹框的隐藏
  $("#page_alert_button").on( 'click', function() {
    $("#page_alert").hide();
  } );

  //跳转到工作台
  function goTopology() {
    localStorage.setItem("topologyType", "topo");
    $(".option_message_list_check").click( function() {
      var dataset_new_show = { id: $(this).attr("data-id") };
      if($(this).attr("data-type") === 'share'){
        dataset_new_show.type = 'share'
      }
      localStorage.setItem( "dataset_new_show", JSON.stringify( dataset_new_show ) );
      localStorage.setItem("versionId", dataset_new_show.id);
      if( !localStorage.topo_url ) {
        location.href = '/topology'
      } else {
        location.href = localStorage.topo_url;
      }
    } );
  }

} );