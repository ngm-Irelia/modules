import React, { Component } from 'react';
import { HeaderMenu, SearchHistory, MatchableSearchBar} from "../../build/components/magicube"

const page = {
  title: '首页',
  css: [
    '/css/index/index.css'
    // '/css/public/scrollBar.css'
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/index/index.js'
  ]
};

let flag_ = true;

function interceptString(str, len) {
  if(Number.isNaN(parseInt(len))) {
    return str;
  }
  return str.length < len ? str : str.substring(0, len) + '...';
}

class WarningTab extends Component {
  constructor(props) {
    super(props);

    this.handleWarningTabClickChange = this.handleWarningTabClickChange.bind(this);
  }

  handleWarningTabClickChange(event) {
    this.props.onWarningTabClick(event.target.tabIndex);
  }

  render() {
    const warningTabBgStyle = {
      // backgroundImage: 'url('+EPMUI.context.url + this.props.warningTab.icon+')'
      backgroundImage: 'url(/image/dashboard/'+ this.props.warningTab.type +'.svg)'
    };

    return (
      <div className="early_warning_menu_item" >
        <div className={this.props.tabClass}
             style={ warningTabBgStyle }
             tabIndex={this.props.index}
             onClick={this.handleWarningTabClickChange} />
        <span>{this.props.warningTab.description}</span>
      </div>
    );
  }
}

function DangerRings() {
  return (
    <span className="rings rings_danger"/>
  );
}
function WarningRings() {
  return (
    <span className="rings rings_warning"/>
  );
}
function InfoRings() {
  return (
    <span className="rings rings_info"/>
  );
}
function Rings(props) {
  const level = parseInt(props.level);

  let ringsLevel;
  switch(level) {
    case 1:
      ringsLevel = <DangerRings/>;
      break;

    case 2:
      ringsLevel = <WarningRings/>;
      break;

    case 3:
    default:
      ringsLevel = <InfoRings/>;
  }
  return ringsLevel;
}
class WarningInfoItem extends Component {
  constructor(props) {
    super(props);

    this.state = { detailsDisplay: false };

    this.handleArrowClick = this.handleArrowClick.bind(this);
    this.handleJumpClick = this.handleJumpClick.bind(this);
    this.handleJumpDetailsClick = this.handleJumpDetailsClick.bind(this);
  }

  handleArrowClick() {
    this.setState((prevState, props) => {
      return {
        detailsDisplay: !prevState.detailsDisplay
      };
    });
  }

  fetchNodeInfo(url, jumpLink) {
    fetch( url, {credentials: 'include'} )
      .then( ( response ) => response.json() )
      .then( ( node ) => {
        node && this.redirectPage(node, jumpLink);
      } );
  }

  redirectPage(node, jumpLink) {
    //console.log(node);
    const nodeArr = Array.of({
      id: node.id,
      nodeId: node.nodeId,
      name: node.target,
      objectType: node.objectType,
      type: node.type,
      markIcons: node.markIcons,
      quantity:node.quantity,
      page_type:node.page_type,
      nodeType:node.nodeType,
      nodeWeight:node.nodeWeight ? parseInt(node.nodeWeight) : 0,
      display: "block",
      fill: node.mark?"#fc311a":"#0088b1",
      stroke: node.mark?"#ffbcaf":"#33d0ff",
      selected:true
    });
    localStorage.setItem("topologyType", jumpLink);
    localStorage.setItem("goTopo", true);
    localStorage.setItem( "searchAddNode", JSON.stringify(nodeArr) );
    if( 'gis' === jumpLink ) {
      location.href = 'gisPlatform';
    }else {
      location.href = '/topology';
    }
  }

  handleJumpClick(event) {
    const jumpLink = event.target.getAttribute('value');

    const warning = this.props.warning;
    const url = EPMUI.context.url + "/object/partInformation/" + warning.objectId + "/" + warning.type;

    this.fetchNodeInfo(url, jumpLink);
  }

  handleJumpDetailsClick() {
    const warning = this.props.warning;
    location.href = '/' + warning.objectType + '?id=' + warning.objectId + '&type=' + warning.type;
  }

  render() {
    const isDisplay = this.state.detailsDisplay ? 'block' : 'none';
    const baseInfoArr = [];
    this.props.warning.baseInfo.forEach((item, index) => {
      baseInfoArr.push(<span className="detail_item" key={index}>
        {item.displayName}: {item.baseValue}
        </span>);
    });
    baseInfoArr.unshift(<img alt="头像"
      key={this.props.warning.objectId}
      src={EPMUI.context.url + '/image/' + this.props.warning.icon + '/' + this.props.warning.objectType} />);

    return (
      <li>
        <p onClick={this.handleArrowClick}>
          <Rings level={this.props.warning.level}/>
          <span className="message">{ interceptString(this.props.warning.description, 16) }</span>
          <span className="rotating_arrow"
                style={ this.state.detailsDisplay ? {transform: "rotate(-135deg)"} : {transform: "rotate(-45deg)"} } />
        </p>

        <div className="details" style={{display: isDisplay}}>
          {baseInfoArr}
          <div className="icon_group">
            <span className="icon-topology" onClick={this.handleJumpClick} value="topo"/>
            <span className="icon-earth" onClick={this.handleJumpClick} value="gis"/>
            <span className="icon-line-color" onClick={this.handleJumpDetailsClick} value="details"/>
            {/*<span className="icon-chart" onClick={this.handleJumpClick} value="chart"/>*/}
          </div>

        </div>
      </li>
    );
  }
}

class WarningInfoPane extends Component {
  constructor(props) {
    super(props);

    this.handleWarningFilterChange = this.handleWarningFilterChange.bind(this);
  }

  handleWarningFilterChange(event) {
    this.props.onWarningFilterClick(event.target.getAttribute('value'));
  }

  render() {
    const {infos, panelClassName, panelDisplay, currentWarningTab} = this.props;
    const lis = [];
    infos.length === 0 ?
      lis.push(<p className="nodata" key="-1">没有更多了~</p>)
      :
      infos.forEach((info, index) => {
        lis.push(<WarningInfoItem warning={info} key={index}/>);
      });

    return (
      <div className={"early_warning_panel" +" " + panelClassName}
           style={{display: panelDisplay}}>
        <div className="content">
          <h3>{currentWarningTab.description}</h3>
          <div className="warning_filter_group">
            <span className="icon-login-user-o"
                  onClick={this.handleWarningFilterChange}
                  value="0"/>
            <span className="icon-warning-filter"
                  onClick={this.handleWarningFilterChange}
                  value="1"/>
            <span className="icon-warning-filter"
                  onClick={this.handleWarningFilterChange}
                  value="2"/>
            <span className="icon-warning-filter"
                  onClick={this.handleWarningFilterChange}
                  value="3"/>
          </div>
          <div className="divider"/>
          <div className="ul_wrapper">
            <ul>{lis}</ul>
          </div>
        </div>
        <div className="corner">
          <span/><span/><span/><span/><span/><span/>
        </div>
      </div>
    );
  }
}

class EarlyWarning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWarningTab: {},   // 记录当前选中的tab
      warningTabIndex: -1,     // 记录当前选中的tab索引
      leftInfos: [],
      rightInfos: []
    };

    this.handleWarningTabClick = this.handleWarningTabClick.bind(this);
    this.handleWarningFilterClick = this.handleWarningFilterClick.bind(this);
  }

  // 更新tab对应的列表数据
  handleWarningTabClick(tabIndex) {
    this.setState((prevState, props) => {
      if (prevState.warningTabIndex === tabIndex) {
        return {warningTabIndex: -1};
      }

      const panelLocation = tabIndex < this.mid ? 'left' : 'right';
      this.fetchWarningInfo(props.warningTabs[tabIndex].url, panelLocation);

      return {
        currentWarningTab: props.warningTabs[tabIndex],
        warningTabIndex: tabIndex
      };
    });
  }

  fetchWarningInfo(url, location) {
    fetch( EPMUI.context.url + url, {credentials: 'include'} )
      .then( ( response ) => response.json() )
      .then( ( data ) => {

        if(data.magicube_interface_data) {
          this.infos = data.magicube_interface_data || [];
          this.setState({
            [location + "Infos"]: data.magicube_interface_data
          }, () => {
            $('.early_warning_panel_'+ location +' .content .ul_wrapper').mCustomScrollbar({
              theme: Magicube.scrollbarTheme,
              autoHideScrollbar: true
            });
          });
          // const arr = [{"baseInfo":[{"baseValue":"李达康","displayName":"姓名","propertyName":"PERSONAL_NAME"},{"baseValue":"男","displayName":"性别","propertyName":"PERSONAL_SEX"},{"baseValue":"48","displayName":"年龄","propertyName":"PERSONAL_AGE"},{"baseValue":"汉","displayName":"民族","propertyName":"PERSONAL_NATION"},{"baseValue":"本科","displayName":"学历","propertyName":"PERSONAL_EDUCATION"},{"baseValue":"公务员","displayName":"职业","propertyName":"PERSONAL_OCCUPATION"},{"baseValue":"140322196909042951","displayName":"身份证号","propertyName":"PERSONAL_ID"},{"baseValue":"15892308321","displayName":"电话","propertyName":"PERSONAL_TELEPHONE"},{"baseValue":"山西省阳泉市盂县大沽口村","displayName":"户口所在地","propertyName":"PERSONAL_BRITHPLACE"},{"baseValue":"常住人口","displayName":"人口类别","propertyName":"PERSONAL_PERSONTYPE"},{"baseValue":"","displayName":"移动轨迹","propertyName":"TRACK"},{"baseValue":"","displayName":"人脸信息","propertyName":"FACE"}],"icon":"李达康.jpg","level":0,"nodeId":"124772","objectId":"b9e647c8-9ff8-42f7-a5d6-07e2c3ca1f97","objectType":"entity",time:"",description:"李达康事件出现了李达康事件出现了李达康事件出现了李达康事件出现了李达康事件出现了李达康事件出现了"}];
          // this.setState({
          //   [location + "Infos"]: arr
          // }, () => {
          //   $('.early_warning_panel_'+ location +' .content ul').mCustomScrollbar({
          //     theme: Magicube.scrollbarTheme,
          //     autoHideScrollbar: true
          //   });
          // });
        }
      } );
  }

  handleWarningFilterClick(value) {
    const filterInfos = value == 0 ?
      this.infos
      :
      this.infos.filter((info) => {
        if(value == 3) {
          return info.level >= value;
        }
        return info.level == value;
      });

    const panelLocation = this.state.warningTabIndex < this.mid ? 'left' : 'right';
    this.setState({ [panelLocation + "Infos"]: filterInfos });
  }

  render() {
    const {currentWarningTab, warningTabIndex, leftInfos, rightInfos} = this.state;
    const tabs = [];
    this.props.warningTabs.forEach((tab, index) => {

      tabs.push(<WarningTab
        warningTab={tab}
        tabClass={warningTabIndex === index ? 'selected' : ''}
        index={index}
        key={tab.description}
        onWarningTabClick={this.handleWarningTabClick} />);
    });

    // 计算tab中间值
    this.mid = Math.ceil(this.props.warningTabs.length / 2);

    return (
      <div className="early_warning">
        <div className="early_warning_menu">{tabs}</div>

        <WarningInfoPane
          panelClassName="early_warning_panel_left"
          panelDisplay={warningTabIndex != -1 && warningTabIndex < this.mid ? "block" : "none"}
          infos={leftInfos}
          currentWarningTab={currentWarningTab}
          onWarningFilterClick={this.handleWarningFilterClick}/>
        <WarningInfoPane
          panelClassName="early_warning_panel_right"
          panelDisplay={warningTabIndex >= this.mid ? "block" : "none"}
          infos={rightInfos}
          currentWarningTab={currentWarningTab}/>
      </div>
    );
  }
}

const paramArr = ['day', 'week', 'month'];
//用户搜索统计
class UserSearchStatistics extends Component{
  constructor(props){
    super(props);

    this.state = {
        ussData:[],
        showType:"day",
        ussDataDay:[],
        ussDataWeek:[],
        ussDataMonth:[]
    };

  }

  componentWillUpdate(){
    let $SSTable = $(".table_body");
    try{
       !!$SSTable.data("mCS") && $SSTable.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
       $SSTable.data("mCS",''); //手动销毁             
    } 
  }

  componentDidMount(){
      function downDay(x,y){//默认按照 日 排序
          return y.num-x.num;
      }
      function downWeek(x,y){//默认按照 日 排序
          return y.num-x.num;
      }
       function downMonth(x,y){//默认按照 日 排序
          return y.num-x.num;
      }
      let sortData;
      paramArr.map(function(item, i){
        fetch( EPMUI.context.url+'/metadata/logStatistics?type='+item,//paramArr[0]
          {method: 'get',
              headers: { 'Content-Type': 'application/json', }
          })
          .then( ( response) => response.json() )
          .then( (data) => {
            if(item == 'day'){
              sortData = data.magicube_interface_data.sort(downDay);
              this.setState({
                  ussDataDay:sortData,
                  ussData:sortData
              },()=>{
                $(this.refs.SearchSTable).mCustomScrollbar({
                  theme: Magicube.scrollbarTheme,
                  autoHideScrollbar: true
                });
              })
            }else if(item == 'week'){
              sortData = data.magicube_interface_data.sort(downWeek);
              this.setState({
                  ussDataWeek:sortData
              })
            }else if(item =='month'){
              sortData = data.magicube_interface_data.sort(downMonth);
              this.setState({
                  ussDataMonth:sortData
              })
            }

          })
            
      }, this)

  }

  handleStatisticsShowDay(e){
      let dayData = this.state.ussDataDay;
      this.setState({
          ussData:dayData,
          showType:"day"
      },()=>{
        $(this.refs.SearchSTable).mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });
      });
      e.target.style.border='1px solid #33d0ff';
      e.target.nextSibling.style.border = '1px #273139 solid';
      e.target.nextSibling.nextSibling.style.border = '1px #273139 solid';
    /*$('.statisticsResult').map(function (item,i){
     let day_ = i.getAttribute('data-day');
     console.log(day_);
     i.innerText = day_
     })*/
  }
  handleStatisticsShowWeek(e){
      let weekData = this.state.ussDataWeek;
      this.setState({
          ussData:weekData,
          showType:"week"
      },()=>{
        $(this.refs.SearchSTable).mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });
      });

      e.target.style.border='1px solid #33d0ff';
      e.target.nextSibling.style.border = '1px #273139 solid';
      e.target.previousSibling.style.border = '1px #273139 solid';
    /* $('.statisticsResult').map(function (item,i){
     let week_ = i.getAttribute('data-week');
     console.log(week_);
     i.innerText = week_
     })*/
  }

  handleStatisticsShowMonth(e){
      let mouthData = this.state.ussDataMonth;
      this.setState({
          ussData:mouthData,
          showType:"month"
      },()=>{
        $(this.refs.SearchSTable).mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });
      });

      e.target.style.border='1px solid #33d0ff';
      e.target.previousSibling.style.border = '1px #273139 solid';
      e.target.previousSibling.previousSibling.style.border = '1px #273139 solid';
    /*$('.statisticsResult').map(function (item,i){
     let month_ = i.getAttribute('data-month');
     console.log(month_);
     i.innerText = month_
     })*/
  }

  render(){
      const {ussData,showType} = this.state;
      let trs = [];
      ussData.map(function (item , i){
          let showData;
          if(showType === "day" && item.num>0){
              return trs.push(<tr key={'key'+i}>
                <td>{i+1}</td>
                <td>{item.userName}</td>
                <td>{item.idCard}</td>
                <td className='statisticsResult' data-week={item.num} data-month={item.num} data-day={item.num}>{item.num}</td>
              </tr>)
          }
          if(showType === "week" && item.num>0){
              return trs.push(<tr key={'key'+i}>
                <td>{i+1}</td>
                <td>{item.userName}</td>
                <td>{item.idCard}</td>
                <td className='statisticsResult' data-week={item.num} data-month={item.num} data-day={item.num}>{item.num}</td>
              </tr>)
          }
          if(showType === "month" && item.num>0){
              return trs.push(<tr key={'key'+i}>
                <td>{i+1}</td>
                <td>{item.userName}</td>
                <td>{item.idCard}</td>
                <td className='statisticsResult' data-week={item.num} data-month={item.num} data-day={item.num}>{item.num}</td>
              </tr>)
          }
      },this)

    return (
      <div className='userSearchOut'>
      <div className="us_btn ">用户搜索<span className="arrow_btn_tr">↙</span></div>
        <div className='userSearch'>
          <h4>用户搜索统计</h4>
          <div>
            <button className='statistics_method' onClick={this.handleStatisticsShowDay.bind(this)}>日</button>
            <button className='statistics_method' onClick={this.handleStatisticsShowWeek.bind(this)}>周</button>
            <button className='statistics_method' onClick={this.handleStatisticsShowMonth.bind(this)}>月</button>
          </div>
          <table className='table_head'>
            <thead>
            <tr>
              <td>序号</td>
              <td>用户名称</td>
              <td>身份证</td>
              <td>次数</td>
            </tr>
            </thead>
          </table>
          <div className='table_body' ref='SearchSTable'>
            <table>
              <tbody className='dataRecord'>{trs}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }


}

class IndexApp extends Component {

  constructor(props) {
    super(props);

    this.state = {
      warningTabs: []
    };
    this.handleGetCookie = this.handleGetCookie.bind(this);
  }

  componentDidMount() {
    fetch( EPMUI.context.url + '/metadata/dashBoard', {credentials: 'include'} )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        data.magicube_interface_data &&
        this.setState({ warningTabs: data.magicube_interface_data });
      } );

    $(".search_func_describe").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  handleGetCookie ( arg , arg_all ){    
    let cookie_name_no = document.cookie.indexOf(arg);
    if( cookie_name_no != -1 ){
      // 把cookie_pos放在值的开始，只要给值加1即可。
      cookie_name_no += arg.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
      
      var cookie_end = arg_all.indexOf(";", cookie_name_no);//从cookie_name_no的位置开始检索分号，返回分号的索引  
      if (cookie_end == -1){
        cookie_end = arg_all.length;
      }  
      var value = unescape(arg_all.substring(cookie_name_no, cookie_end));         //这里就可以得到你想要的cookie的值了。。。
      return value;
     }
  }

  //handleGoNoCrimeAudit(){
  //  let name_ = 'name';
  //  let id = 'IDCardNo';
  //  let all_cookie = document.cookie;
  //  let name_val = this.handleGetCookie ( name_ , all_cookie);
  //  let id_val = this.handleGetCookie ( id , all_cookie);
  //  
  //  
  //  
  //  // url: 要添加参数的url
  //  // name: 参数的名称
  //  // value: 参数的值
  //  function addURLParam(url, name, value) {
  //    url += (url.indexOf("?") == -1 ? "?" : "&");
  //    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
  //    return url;
  //  }
//
  //  // 使用示例
  //  var url = "http://172.16.61.24:3039";
  //  url = addURLParam('http://172.16.61.24:3039', name_val, id_val);
  //  window.open('http://172.16.61.24:3039/index?name=' + encodeURIComponent(name_val) + '&IDCardNo=' + encodeURIComponent(id_val));
//
  //}
  
  render() {
    const positionStyle = { bottom: '50px', borderBottom: 'none' };
    const arrowDirection = 'icon-angle-up';
    const triangleStyle = 'triangleUp';

    return (
      <div>      
        <SearchHistory showPane={false} inPage="index"/>
        <div id="index_main">
          <div id="index_main_logo">
            <img src="../image/logo.svg" alt=""/>
          </div>
          <div id="index_main_title">
            <p>情报魔方</p>
          </div>
          <div id="index_search">
            <div id="index_search_div" className="">
              {/*<input type="text" id="index_search_input" autoFocus="autoFocus"/>*/}
              <MatchableSearchBar/>
            </div>
            <div className="index_button icon-index-btn">
              <span className="path1 index_position"/>
              <span className="path2 index_position"/>
              <span className="path3 index_position"/>
              <span className="index_font">搜  索</span>
              <input type="button" id="index_search_btn" value="搜  索"/>
            </div>
          </div>
          {/* <div className='noCrimeAuditbtn' onClick={this.handleGoNoCrimeAudit.bind(this)}>
            无犯罪记录证明
            <span className='side_style_lt'></span>
            <span className='side_style_lb'></span>
            <span className='side_style_rt'></span>
            <span className='side_style_rb'></span>
          </div> */}
          <div className="sear_des_btn" id="searDesBtn"><span className="arrow_btn">↘</span>搜索描述</div>
        </div>
        <EarlyWarning warningTabs={this.state.warningTabs} />
        <UserSearchStatistics/>
        <div className="search_func_describe_out">
          <div className="search_func_describe" id="searchFuncDescribe">
            <h4>搜索功能描述</h4>
            <p>
              <span className="des_title">简单检索：</span>
              <span className="des_content">输入完整人名、手机号、身份证号等进行检索</span>
              <span className="des_example">检索电话，如：1510937322/63459212</span>
              <span className="des_example">检索人名，如: 李强,王强等</span>
              <span className="des_example">检索身份证号，如:11022247923114771</span>
            </p>
            <p>
              <span className="des_title">模糊检索：</span>
              <span className="des_content">利用通配符*,? 匹配模糊查询 ，其中*代表0到多个字符，?代表1个字符</span>
              <span className="des_example">检索某人，如："梁某伟"，可以为“粱*伟”或“粱?伟”</span>
            </p>
            <p>
              <span className="des_title">特定字段检索：</span>
              <span className="des_content">选中或输入字段后空格自动提示比较符，比较符后会根据字段属性提示可选值</span>
              <span className="des_example">例：当输入"姓名"选项时，系统可自动检索出全部相关内容，如：姓名，户主姓名，驾驶证姓名.....</span>
            </p>
            <p>
              <span className="des_title">表达式复合检索：</span>
              <span className="des_content">表达式检索可以更精确地反应用户的检索意图，支持多个表达式:与(AND)或(OR)非(NOT)组合，支持()增加优先级</span>
              <span className="des_example">例：如查找未婚女博士女硕士，可表示为：性别 = 女 AND (文化程度 = 博士 OR 文化程度 = 硕士) AND 婚姻状况 = 未婚</span>
            </p>
            {/*<span className="des_border1"></span>*/}
            {/*<span className="des_border2"></span>*/}
            {/*<span className="des_border3"></span>*/}
            {/*<span className="des_border4"></span>*/}
          </div>
        </div>
        <div className="search_volume">
          <div className="sv_details">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span>日期 :</span>
            <span id="svDate"></span>
          </div>
          <div className="sv_details">
            <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span>今日搜索量 :</span>
              <span id="svToday"></span>
            </div>
          <div className="sv_details">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span>本周搜索量 :</span>
            <span id="svWeek"></span>
          </div>
          <div className="sv_details">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span>累计搜索量 :</span>
            <span id="svTotal"></span>
          </div>
        </div>
        <div id="index_footer">
          <ul id="index_footer_nav">
            <li>
              <img src="../image/logo.svg" alt=""/>
              <p>情报魔方</p>
            </li>
          </ul>
          <div id="index_footer_copy">
            <h3>Copyright © 2006-2017</h3>
          </div>
          <HeaderMenu
            bHome={ false }
            positionStyle={ positionStyle }
            arrowDirection={ arrowDirection }
            triangleStyle={ triangleStyle }/>
        </div>
      </div>
    );
  }

}

IndexApp.epmUIPage = page;

module.exports = IndexApp;
