import React, {Component} from 'react';
import {UserInfo} from './userInfo';

class HeaderMenu extends Component {

  constructor(props) {
    super(props);

    this.handleGoHome = this.handleGoHome.bind(this);
    this.handleGoSearchlist = this.handleGoSearchlist.bind(this);
    this.handleGoTopology = this.handleGoTopology.bind(this);
    this.handleGoMap = this.handleGoMap.bind(this);
    this.handleGoChart = this.handleGoChart.bind(this);
    this.handleGoDashboard = this.handleGoDashboard.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);    
  }
  
  componentDidMount(e){
    $(".headerTipStyle").on('mouseover', function(){
      return false;
      e.stopPropagation();
      event.stopPropagation();
    })
  }

  // 从主页跳转其他页面
  handleGoOther() {
    if(window.location.pathname === '/' || window.location.pathname === '/index'){
      let value = $(".search_group_input").val();
      localStorage.setItem("s_keyword", value.trim());
    }
  }

  // 返回首页
  handleGoHome() {
    location.href = '/';
    localStorage.setItem("s_keyword", '');
  }

  //返回搜索列表
  handleGoSearchlist() {
    $("#handleGoSearchlist").removeClass("icon-searchlist").addClass("icon-searchlist-blue");
    const flag = this.props.bSearchlist;
    if (!flag) {
      return false;
    }
    const keyword = !localStorage.s_keyword ? "" : localStorage.s_keyword;
    if(localStorage.s_keyword === ""){
      location.href = '/searchlist';
    }else{
      location.href = '/searchlist?keyword=' + keyword;
    }
  }

  //返回控制台
  handleGoTopology() {
    if (localStorage.getItem("topologyType") == "topo") {
      location.href = '/topology';
    } else if(localStorage.getItem("topologyType") == "chart"){
      location.href = '/topology';
      localStorage.setItem("topologyType", "topo")
    }
    else {
      localStorage.setItem("topologyType", "topo")
      location.href = '/topology';
      /*if (!localStorage.topo_url) {

      } else {
        location.href = localStorage.topo_url;
      }*/
    }

  }

  //返回地图
  handleGoMap() {

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
        localStorage.setItem("topologyType", "topo");
        /*location.href = '/topology';*/
        location.href = '/gisPlatform';
      });

  }

  handleGoChart() {
    // localStorage.setItem("topologyType", "chart");
    // location.href = '/topology';
    localStorage.setItem("topologyType", "chart");
    location.href = '/Chartprobe';
  }
  
  handleGoDashboard(){
    location.href = '/dashboard';
  }

  //搜索获得光标
  handleFocus() {
    const className = this.textInput.className;
    if (className !== "search_focus") {
      this.textInput.className = "search_focus"
    }
  };

  //搜索失去光标
  handleBlur() {
    const val = this.textInput.value;
    if (!val) {
      this.textInput.className = "search_blur";
    }
  };

  //button tooltip
  handleShowTip(e){
    let tipText = ['首页', 'DASHBOARD','搜索列表','关系拓扑','GIS','图表探查'];
    let tipIndex = e.target.getAttribute('data-index');
    if(this.props.bHome){
      $(".headerTipStyle").text(tipText[tipIndex]).show().css('left',58+tipIndex*40+(tipIndex-1)*12+'px')
    }else{
      if(tipIndex == 0){
        $(".headerTipStyle").text(tipText[tipIndex]).show().css('left','46px')
      }else{     
        $(".headerTipStyle").text(tipText[tipIndex]).show().css('left',58+(tipIndex-1)*40+(tipIndex-2)*12+'px')
      }
    }    
      
  }
  
  handleHideTip(){
    $(".headerTipStyle").hide();
  }


  render() {
    const {bHome, bSearchlist, bTopo, bMap, bChart, bDashboard, bSearch, bUser, positionStyle, arrowDirection, triangleStyle} = this.props;
    return (
      <div id="selectBar" className={this.props.topology ? "select_topo" : ""} onClick={this.handleGoOther}>
        
        {
          bHome
          &&
          <div className="selectBar_div selectBar_href icon-homeicon" id="go_home" data-index='0' onClick={this.handleGoHome} 
          onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)}/>
        }
        {
          bDashboard &&
          <div className="selectBar_div selectBar_href icon-dashboard" id="go_dashboard" data-index='1' onClick={this.handleGoDashboard}
          onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)} />
        }
        {
          bSearchlist &&
          <div className="selectBar_div selectBar_href icon-searchlist" id="go_searchlist" data-index='2' 
            onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)} onClick={this.handleGoSearchlist}/>
        }
        {
          bTopo &&
          <div className="selectBar_div selectBar_href icon-topology" id="go_topo" data-index='3' onClick={this.handleGoTopology}
          onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)}/>
        }
        {
          bMap &&
          <div className="selectBar_div selectBar_href icon-earth" id="go_map" data-index='4' onClick={this.handleGoMap}
          onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)}/>
        }
        {
          bChart &&
          <div className="selectBar_div selectBar_href icon-chart" id="go_chart" data-index='5' onClick={this.handleGoChart}
          onMouseOver={this.handleShowTip.bind(this)} onMouseOut={this.handleHideTip.bind(this)} />
        }        
        {
          bSearch &&
          <div id="searchbox" className="selectBar_div">
            <button type="button" id="search_btn"><span className="icon-search-gray"/></button>
            <input type="text" ref={(input) => {
              this.textInput = input
            }} id="search_input" placeholder="搜索" onFocus={this.handleFocus} onBlur={this.handleBlur}/>
          </div>
        }
        {
          bUser &&
          <UserInfo
            positionStyle={positionStyle}
            arrowDirection={arrowDirection}
            triangleStyle={triangleStyle}/>
        }
        <div className='headerTipStyle'></div>
      </div>
    );
  }

}

HeaderMenu.defaultProps = {
  bHome: true,
  bSearchlist: true,
  bTopo: true,
  bMap: true,
  bChart: true,
  bDashboard: true,
  bSearch: false,
  bUser: true
};

export default HeaderMenu;
export {HeaderMenu};