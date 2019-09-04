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
  localStorage.setItem("searchAddNode", "");
  localStorage.setItem("topo_flag", false);
  localStorage.setItem("goTopo", true);
  localStorage.setItem("tabArrHtml", JSON.stringify([{title: "全部", _html: ''}]));
  localStorage.setItem("pro_index", 0);

  $("#index_search_btn").click( function(){
    search();
  });

  $(".search_group_input").bind( 'keyup', function(e){
    if(e.keyCode === 13){
      search();
    }
  });

  function search(){
    if($(".search_group_input").val().trim() != ''){
      location.href = '/searchlist' + '?keyword=' + encodeURIComponent($(".search_group_input").val().trim());
    } else{
      location.href = '/searchlist';
    }
  }

  function searchGetVolume(){
    $.get(EPMUI.context.url+'/metadata/logNumber', function (data) {
      $("#svDate").text(data.magicube_interface_data.date);
      $("#svToday").text(data.magicube_interface_data.dayNum);
      $("#svWeek").text(data.magicube_interface_data.weekNum);
      $("#svTotal").text(data.magicube_interface_data.allNum);
    }, 'json');
  }
  searchGetVolume();
  var flag_ = false;
  $("#searDesBtn").click(function(){
    flag_ = !flag_;
    $("#searchFuncDescribe").toggle('slow');
    if(flag_){
       $(".arrow_btn").text("↖");
    }else{
      $(".arrow_btn").text("↘");
    }
   
  })
  var usvM = false;
  $('.us_btn').click(function(){
    usvM = !usvM;
    if(usvM){
      $('.userSearch').show();
      $('.arrow_btn_tr').text('↗');
    }else{
      $('.userSearch').hide();
      $('.arrow_btn_tr').text('↙');
    }
    
  })
  
} );
