$( function(){
  //初始化本地缓存数据
  localStorage.removeItem("page");
  localStorage.removeItem("s_index");
  localStorage.removeItem("optionTab");
  localStorage.removeItem("topo_url");
  localStorage.removeItem("advanceBody");
  localStorage.removeItem("topoNodes");
  localStorage.removeItem("datasetName");
  localStorage.removeItem("versionName");
  localStorage.removeItem("saveState");
  localStorage.removeItem("datasetId");
  localStorage.removeItem("versionId");
  localStorage.removeItem("topologyType");
  localStorage.removeItem("colleNodes");
  localStorage.removeItem("messageAllContent");
  localStorage.removeItem("advanceSearchFlag");
  localStorage.removeItem("s_keyword");
  localStorage.removeItem("gisAllSearchDatas");
  localStorage.removeItem("mapOverlays");
  localStorage.removeItem("reqFlag");
  sessionStorage.removeItem("chartFlag");
  sessionStorage.removeItem("chartMainHtmlData");
  sessionStorage.removeItem("chartLargeObj");
  sessionStorage.removeItem("scIndexData");
  sessionStorage.removeItem("chartSizeSData");
  // localStorage.setItem("searchAddNode", "");
  localStorage.setItem("topo_flag", false);
  // localStorage.setItem("goTopo", true);
  localStorage.setItem( "tabArrHtml", JSON.stringify( [ { title: "全部", _html: '' } ] ) );
  localStorage.setItem( "pro_index", 0 );

  $("#home_pwd").bind( 'keyup', function(e){
    if(e.keyCode === 13){
      handleLogin();
    }
  } );

  $("#index_login_btn").on( 'click', handleLogin );

  /**
   * 用户登录请求
   * @param params
   * @param callback
   */
  let vertifyLogin = function ( params, callback ) {
    $.post( '/login/check', { account: params.userName, passwd: params.password }, function( data ) {
      if( typeof callback === 'function') {
        callback( data );
      }
    } );
  };

  /**
   * 获取主题（皮肤）
   * @param userId
   * @param callback
   */
  let fetchSkinColor = function ( userId, callback ) {
    fetch( EPMUI.context.url + '/memory/findSkinColor?userId=' + userId,
      {
        credentials: 'include',
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      } )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        if( typeof callback === 'function') {
          callback( data );
        }
      } );
  };

  /**
   * 处理用户登录请求
   */
  function handleLogin() {
    let userName = $("#home_user").val(),
      password = $("#home_pwd").val();
    vertifyLogin( { userName: userName, password: password }, function ( data ) {
      // 登陆不成功绑定动画
      if( data.status !== "success" ){
        $("#login_warning p").html( data.message );
        $("#index_login_input").animate({"left": "60px"}, 70, "linear", function(){
          $("#index_login_input").animate({"left": "20px"}, 60, "linear", function(){
            $("#index_login_input").animate({"left": "35px"}, 50, "linear", function(){
              $("#index_login_input").animate({"left": "30px"}, 40, "linear" );
            } )
          } )
        } )
      }else if (data.code == 333) {
        // 用户已经登录，直接跳转到index页面
        location.href = '/index';
      } else {
        let userId = data.data.userId || '';
        document.cookie = "name=" + data.data.userName;
        document.cookie = "userId=" + userId;
        document.cookie = "IDCardNo=" + data.data.idCard;

        localStorage.removeItem('auth');
        //在登录里存储这个值，在离开登录或超时登录时，移除这个值
        localStorage.setItem('auth', data.data.auth.toString());

        fetchSkinColor( userId, function ( themeData ) {
          let theme = themeData.magicube_interface_data || 'black';
          document.cookie = "theme=" + theme;
          if(theme === 'black'){
            document.cookie = "scrollbarTheme=minimal";
          }else{
            document.cookie = "scrollbarTheme=minimal-dark";
          }
          location.href = '/index';
        } );
      }
    } );
  }

} );

