import React, { Component } from 'react';
import { Header, Filter, MakeEntity, Select, Ulist, Alert, PageAlert, MyRadio} from '../../build/components/magicube';

const url = '/magicube';

const page = {
  title: '地理信息',
  css: [
    '/css/gisPlatform/gisPlatform.css'
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/utils.js',
    '/bower_components/d3/d3.min.js',
    //'/js/public/html2canvas.js',
    '/js/public/laydate/laydate.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/topology/base64images.js',
    '/js/gisPlatform/china-map.js',
    '/js/public/imagicubegis.js',
    '/js/gisPlatform/gisPlatform.js',
    '/js/gisPlatform/gisPlatformBase.js'
  ]
};

class gisPlatform extends Component {

  constructor(props) {
    super(props);
    this.state = {
      relateType: [],
      relateName: [],
      author: '',
      links: [],
      linksHtml: '',
      currentIndex: 0,
      setState: [
          {
              value: "包含正文",
              checked: true
          },
          {
              value: "包含标题",
              checked: true
          },
          {
              value: "包含标签",
              checked: true
          }
      ]
    }
  }

  handleChangeSet ( index ) {
      const setState = this.state.setState;
      setState[ index ].checked = !setState[ index ].checked;
      if(setState[ index ].checked){
          $(".search_conditions input").eq(index).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
      }else{
          $(".search_conditions input").eq(index).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
      }
      this.setState( {
          setState
      } );
  };

    /* 获取过滤的条件类型相关的全部数据 */
  componentDidMount() {

    //获取cookie
     const getCookie = (cookie_name) => {
      var allcookies = document.cookie;
      var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度

      // 如果找到了索引，就代表cookie存在，
      // 反之，就说明不存在。
      if (cookie_pos != -1){
        // 把cookie_pos放在值的开始，只要给值加1即可。
        cookie_pos += cookie_name.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
        var cookie_end = allcookies.indexOf(";", cookie_pos);

        if (cookie_end == -1)
        {
            cookie_end = allcookies.length;
        }
        var value = unescape(allcookies.substring(cookie_pos, cookie_end));    //这里就可以得到你想要的cookie的值了。。。
      }
      return value;
    }

     //删除cookie中指定变量函数
     const DelCookie = (name) => {
        var exp = new Date();
        exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
        var cval = getCookie(name);
        document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
      }

    // 调用函数
    this.setState({
      author: getCookie("name")
    })

    fetch(url + '/relation/data').then((response) => response.json()).then((data) => {
      const dataSource = data.magicube_interface_data;
      dataSource.unshift({systemName: "null", displayName: "请选择关系类型...", child: []});
      this.setState({relateType: dataSource, customName: dataSource[1].child})
    });

    switch(getCookie("theme")){
      case 'black':
          this.setState({ loadingUrl: '../image/loading2.gif' });
          break;
      case 'white':
          this.setState({ loadingUrl: '../image/loading.gif' });
          break;
      default:
          this.setState({ loadingUrl: '../image/loading2.gif' });
          break;
    }

    // 弹框日历插件集体调用

    // 过滤器弹框日历
    laydate.render({
      elem: '#filter_time',
      range: '~'
    });

    // 按关系扩展弹框日历
    laydate.render({
      elem: '#relation_time',
      range: '~'
    });


    // 地图过滤器日历
    laydate.render({
      elem: '#map_time',
      range: '~'
    });

    // 地图轨迹设置日历
    laydate.render({
      elem: '#map_path_time',
      range: '~'
    });


    laydate.render({
      elem: '#gis_table_time',
      range: '~'
    });

    // 卡口过车信息
    laydate.render({
      elem: '#gis_passCar_time',
      range: '~'
    });

    // 告警 行动轨迹 时间
    laydate.render({
      elem: '#gis_movepath_time',
      range: '~'
    });

  }

  handleLinksFilter(){
    this.setState({ links: window.filterLinks }, ()=>{
      var json = [];
      let linksHtml = this.state.links.length > 0
                  ?
                  <div className="relation_filter_box">
                    <h6 className="select_property_title">关系筛选</h6>
                    <div className="relation_tips_box" onClick={ this.handleSelectRelation.bind(this) }>
                      {

                        this.state.links.map( (item, index) => {
                          if(!json[item.relationTypeName]){
                           json[item.relationTypeName] = 1;
                           return <span className="relation_tip" key={ index } data-relationTypeName={ item.relationTypeName } >{ item.relationTypeName }</span>
                          }
                        })
                       }
                    </div>
                  </div>
                  :
                  '';
      this.setState({ linksHtml: linksHtml })
      })
    }

  //筛选关系类型
   handleSelectRelation(ev){
    var ev = ev || window.event;
　　var target = ev.target || ev.srcElement;
    if(target.className == 'relation_tip_active'){
      target.className = 'relation_tip';
    }else if(target.className == 'relation_tip'){
      target.className = 'relation_tip_active';
    }
  }

  render() {

    return (
      <div>
        <Header bSearch={true} /> {/* 此处是header部分 */}
        {/* 页面的弹框 */}
        <PageAlert />
        {/*创建实体*/}
        <MakeEntity labelType={false}/>

        <div className="gisPlatform_alert_box">
          <h4 className="header gisPlatform_alert_title"></h4>
          <div className="body gisPlatform_alert_content"></div>
          <div className="footer">
            <button type="button" className="gisPlatform_button_sure">确定</button>
            <button type="button" className="gisPlatform_button_cancel">取消</button>
          </div>
        </div>;

        <div id="topology_main" >

          {/*扩展数据*/}
          <div className="topo_modalBox" id="extend_more_modalBox">
            <h5>请单击选择进行扩展</h5>
            <div className="extend_list">
              <ul className="extend_list_ul clearfix"></ul>
            </div>
            <div className="button_boxs clearfix">
              <button type="button" id="extend-ensured" className="confirmed" name="button">确定</button>
              <button type="button" id="extend-canceled" className="canceled" name="button">取消</button>
            </div>
          </div>
          {/*扩展关系自定义扩展数据*/}
          <div className="topo_modalBox" id="relation_extend_modalBox">
            <h5>请选择需要扩展的数据类型</h5>
            <Ulist dataSource={this.state.relateType} />
            <div className="button_custom">
              <div className="save_custom">存为自定义<span>+</span></div>
              <h6 className="select_property_title select_property_extend">时间设定</h6>
              <div id="network_filter_time" className="filter_classify_box">
                <div className="clandar_box">
                  <input type="text" id="relation_time"  placeholder="请选择时间范围" readOnly />
                  <button type="button" id="relation_time_btn" className="icon-calendar-cute"></button>
                </div>
              </div>
              <button type="button" id="custom_confirmed" className="confirmed" name="button">确定</button>
              <button type="button" className="canceled" name="button">取消</button>
            </div>
          </div>

            <div id="topology_relative">
              {/*<div id="topo_buttons">
                <div id="topo_map">图表</div>
                <div id="topo_gis">拓扑</div>
                <div id="topo_dashboard">发布</div>
              </div>*/}
              <div id="topology_relative_network">

                {/* 控制台遮罩 */}
                <div id="topo_alert">
                  <div id="topo_alert_box">
                    <h6 id="topo_alert_title"></h6>
                    <div id="topo_alert_content"></div>
                    <button type="button" id="topo_alert_button" className="confirmed">确定</button>
                  </div>
                </div>

                <div id="topology_map">
                  {/*这里放的是gis地图*/}
                  <div className="search_nodes_modalBox">
                    <button type="button" className="search_nodes_modalBox_btn icon-search"></button>
                    <input type="text" className="map_nodes_find" placeholder="输入名字"/>
                  </div>
                  <div className="basemap" id="basemap">
                  </div>

                  {/*功能菜单*/}
                  <div id="map_usual_tools">
                    {/*<div id="map_tool"><span className="icon-select-area"></span></div>*/}
                    <div id="map_findnodes"><span className="icon-search"></span></div>{/* 搜索页面节点 */}
                    <div id="map_resetscreen"><span className="icon-repeat"></span></div>
                    <div id="map_back"><span className="icon-replay"></span></div>
                    <div id="map_filter" onClick={ this.handleLinksFilter.bind(this) }><span className="icon-filter"></span></div>
                    <div id="map_fullscreen"><span className="icon-fullscreen"></span></div>
                    {/*<div id="map_heat"><span className="icon-line-style"></span></div> <div id="map_show"><span className="icon-eye"><span></div>*/}
                    {/*<div id="map_area_statistics"><span className="icon-area-statistics"></span></div>*/}
                    {/*<div id="map_gis_table"><span className="icon-group-layout"></span></div>*/}
                    {/*<div id="map_bayonet"><span className="icon-bayonet"></span></div>*/}
                    {/*<div id="map_event_visual"><span className="icon-setup"></span></div>*/}
                  </div>
                  <div id="map_tools">
                    <div id="map_tools_header"><span className="icon-map-setting-head"></span></div>
                    <div id="topo_dashboard"><span className="icon-dashboard"></span></div>
                    <div id="map_warning_person"><span className="icon-warning-bell"></span></div>
                  </div>

                  {/* 设置菜单 */}
                  <div id="map_setting_tab_div">
                    {/*边框*/}
                    <div className="map_setting_tab_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                    </div>
                    <div className="map_setting_tab_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                    </div>
                    <div className="map_setting_tab_border3">
                      <span className="side1"></span>
                    </div>

                    <div className="map_setting_tab map_settings_tab_list map_setting_tab_active" value="基本设置">
                      <span>基本设置</span>
                    </div>
                    <span className="map_setting_center">|</span>
                    <div className="map_setting_tab map_settings_tab_list" value="显示设置">
                      <span>显示设置</span>
                    </div>
                    <span className="map_setting_center">|</span>
                    <div className="map_setting_tab map_settings_tab_list" value="区域设置">
                      <span>区域设置</span>
                    </div>
                  </div>
                  {/* 设置菜单 弹框*/}
                  <div id="map_settings">
                    {/*边框*/}
                    <div className="setting_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>
                    <div className="setting_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>

                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_border3">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_border4">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>

                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_left_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="setting_bottom_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="setting_right_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                      <span className="side7"></span>
                      <span className="side8"></span>
                    </div>

                    <div id="map_settings_box">
                      <span className="border_right_side6"></span>
                      <span className="border_left_side6"></span>
                      {/*<ul id="map_settings_tabs">
                        <li id="map_settings_base_title" className="map_settings_tab_list1 map_settings_tab_active">基本设置</li>
                        <li id="map_settings_show_title" className="map_settings_tab_list1">显示设置</li>
                        <li id="map_settings_area_title" className="map_settings_tab_list1">区域设置</li>
                      </ul>*/}
                      <div className="map_settings_message" id="map_settings_base">
                        <div className="map_set_coverage">
                          <div className="map_set_h6"><h6 className="map_select_title">样式设置:</h6></div>
                          <div className="map_set_inputDiv" id="testInputDiv">
                            <div className="map_fontline">
                              <div className="setradio">
                                <input className="icon-dot-circle" type="radio" name="coverage" value="defaultmap" />
                              </div>标准数据点
                            </div>
                            <div className="map_fontline">
                              <div className="setradio">
                                <input className="icon-nodot-circle-o" type="radio" name="coverage" value="smallPointmap" />
                              </div>集合点(大数据量)
                            </div>
                            <div className="map_fontline">
                              <div className="setradio" id="heatmapsetradio">
                                <input className="icon-nodot-circle-o" type="radio" name="coverage" value="heatmap" />
                              </div>热力图
                            </div>
                          </div>
                        </div>
                        <div className="map_set_coverage">
                          <div className="map_set_h6"><h6 className="map_select_title">内容设置:</h6></div>
                          <div className="map_set_inputDiv">
                            <div className="map_fontline" id="map_setLine">
                              <div className="setradio">
                                <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="fontline" value="hideline" />
                              </div>隐藏关系线
                            </div>
                            <div className="map_fontline" id="map_setFont" >
                              <div className="setradio">
                                <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="fontline" value="hidefont" />
                              </div>隐藏对象标签
                            </div>
                            <div className="map_fontline" id="map_setAggregation" >
                              <div className="setradio">
                                <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="setAggregation" value="aggregation" />
                              </div>允许聚合
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="map_settings_message map_settings_message_hide" id="map_settings_show">
                        <div className="map_set_coverage">
                          <div className="map_set_inputDiv">
                            <div className="map_left_setting" id="map_settings_show_bayonet">
                              <div className="setradio">
                                <input className="icon-nodot-circle-o" type="radio" name="showSettings" value="bayonet" />
                                {/*<input  className="map_set_input icon-square-o-blue"  type="checkbox" name="showSettings" value="bayonet" />*/}
                              </div>卡口设备
                            </div>
                            <div className="map_left_setting" id="map_settings_area_keyArea">
                              <div className="setradio">
                                <input className="icon-nodot-circle-o" type="radio" name="showSettings" value="keyArea" />
                                {/*<input  className="map_set_input icon-square-o-blue"  type="checkbox" name="areaSettings" value="keyArea" />*/}
                              </div>重点区域
                            </div>
                            {/*<div className="map_fontline" id="map_settings_show_keyPerson" >
                              <div className="setradio">
                                <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="showSettings" value="keyPerson" />
                              </div>重点人
                            </div>*/}
                          </div>
                        </div>
                      </div>
                      <div className="map_settings_message map_settings_message_hide" id="map_settings_area">
                        <div className="map_set_coverage">
                          <div className="map_set_inputDiv" id="testInputDiv">
                            <div className="map_fontline">
                              <div className="setradio">
                                <input className="icon-nodot-circle-o" type="radio" name="drawArea" value="circle" />
                              </div>圆形选区
                            </div>
                            <div className="map_fontline">
                              <div className="setradio">
                                <input className="icon-nodot-circle-o" type="radio" name="drawArea" value="rectangle" />
                              </div>方形选区
                            </div>
                            <div className="map_fontline">
                              <div className="setradio" id="heatmapsetradio">
                                <input className="icon-nodot-circle-o" type="radio" name="drawArea" value="polygon" />
                              </div>多边形选区
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="map_set_coverage_btn">
                        <div className="map_set_btnDiv1"><button className="map_set_btn" id="setting_btn">确认设置</button></div>
                        <div className="map_set_btnDiv2"><button className="map_set_btn" id="ret_setting_btn">取消设置</button></div>
                      </div>
                    </div>
                  </div>
                  {/* 过滤器 */}
                  <div id="map_network_filter" draggable >
                    <h4 id="map_network_filter_title" className="icon-filter-blue">过滤器</h4>
                    <div id="map_network_filter_scope">
                      <ul className="network_filter_box">
                        <li>
                          <h6 className="select_property_title">筛选范围</h6>
                          <input type="text" id="map_network_filter_object" value="全部" readOnly/>
                        </li>
                        <li>
                          <h6 className="select_property_title">时间设定</h6>
                          <div id="map_network_filter_time" className="filter_classify_box">
                            <div className="map_clandar_box">
                              <input type="text" id="map_time" placeholder="请点击选择时间范围" readOnly />
                              <button className="icon-calendar-cute" type="button" id="map_time_btn"></button>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <Filter />
                    {/* 筛选关系类型 */}
                    {
                        this.state.linksHtml
                    }
                    <div id="map_filter_option_box">
                      <button id="map_filter_option_ensure" className="confirmed">开始过滤</button>
                      <button id="map_filter_option_cancel" className="canceled">取消过滤</button>
                    </div>
                  </div>
                  {/* 轨迹设置 */}
                  <div className="map_path">
                    <h6 className="map_path_title">轨迹设置:</h6>
                    <div id="map_path_time_box" className="map_path_box">
                      <h6 className="map_select_title">时间设定:</h6>
                      <div className="map_path_clandar_box">
                        <input type="text" id="map_path_time" placeholder="请选择时间范围" readOnly />
                        <button className="icon-calendar-cute" type="button" id="map_path_time_btn"></button>
                      </div>
                    </div>
                    <div className="map_set_coverage">
                      <div className="map_set_h6"><h6 className="map_select_title">内容设定:</h6></div>
                      <div className="map_set_inputDiv">
                        <div className="map_fontline" id="">
                          <div className="setradio">
                            <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="mapPath" value="pathMigratory" />
                          </div>迁徙轨迹
                        </div>
                        {/*<div className="map_fontline" id="cxdd" >
                          <div className="setradio">
                            <input  className="map_set_input icon-square-o-blue"  type="checkbox" name="mapPath" value="pathAppearSite" />
                          </div>出现地点
                        </div>*/}
                      </div>
                    </div>
                    <div className="map_set_coverage">
                      <div id="map_path_foot_box">
                        <button id="map_path_ensure" className="map_path_confirmed">查询轨迹</button>
                        <button id="map_path_cancel" className="map_path_canceled">取消查询</button>
                      </div>
                    </div>
                  </div>
                  {/* 卡口信息表 */}
                  <section id="map_entity-main">
                    <div id="map_entity-shade">
                      <div id="map_entity-alert">
                        <div className="gis-passCar-table-title">
                          <div className="gis-table-time">
                            <h6 className="map_select_title">选择时间:</h6>
                            <div className="gis-table-clandar-box">
                              <input type="text" id="gis_passCar_time" placeholder="请选择时间范围" readOnly />
                              <button className="icon-calendar-cute" type="button" id="gis_table_time_btn"></button>
                            </div>
                          </div>
                          <div className="gis-table-type">
                            <button id="map_passCar_ensure" className="map_path_confirmed">查询</button>
                          </div>
                        </div>

                        <ul className="map_alert-content">

                        </ul>
                        <div id="map_kkxx_page">

                        </div>
                        <div className="alert-operate">
                          <button className="cancel">关闭</button>
                        </div>
                      </div>
                    </div>
                  </section>
                  {/* 告警信息表 */}
                  <div className="gis-warning-table">
                    <div className="gis_table_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>
                    <div className="gis_table_border3">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border4">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>

                    <div className="gis_table_name">
                      <p>告警信息</p>
                      <img src="/image/gis/gis-table-title.svg" width="100%" height="100%" />
                    </div>

                    <div className="gis_table_top">
                      <div className="gis-table-title">
                        <div className="gis-table-type">
                          <div className="map_select_title" id="gis-table-warning-person">人员</div>
                        </div>
                        <div className="gis-table-type">
                          <div className="map_select_title" id="gis-table-warning-event">事件</div>
                        </div>
                        <div className="gis-table-search-property">
                          <button type="button" id="gis-warning-table-search-btn" className="gis-table-search-btn icon-search"></button>
                          <input className="gis-table-search" id="gis-warning-table-search" placeholder=" 输入检索内容" />
                        </div>
                        <div className="gis-table-right-attribute">
                          <div className="map_select_title" id="gis-warning-table-movepath">行动轨迹</div>
                        </div>
                        <div className="gis-table-search-property">
                          {/*<h6 className="map_select_title">选择时间:</h6>*/}
                          <div className="gis_movepath_time_box">
                            <input type="text" id="gis_movepath_time" placeholder="选择行动轨迹时间范围" readOnly />
                            {/*<button className="icon-calendar-cute" type="button" id="gis_table_time_btn"></button>*/}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <table id="gis_table_conditions">
                        <thead>
                        <tr>
                          <td className="gis_table_property_5">
                            <div> <input id="gis-warning-table-allCheck" className="icon-square-o-blue"  type="checkbox" name="allCheck" value="gis-warning-table" /></div>
                          </td>

                          <td className="gis_table_property_5">
                            <h4>序号</h4>
                          </td>
                          <td className="gis_table_property_7">
                            <h4>级别</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>姓名</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>人员属性</h4>
                          </td>
                          <td className="gis_table_property_15">
                            <h4>证件号码</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>所属区域</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>预警时间</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>操作</h4>
                          </td>
                        </tr>
                        </thead>
                        <tbody className="gis-warning-table-tbody">

                        </tbody>
                      </table>
                    </div>
                    <div className="gis-table-page gis-warning-table-page"></div>
                    <div>
                      <div className="map-table-close">
                        <div className="map-table-close-x">取消</div>
                        <div className="map-table-ensure" id="gis-warning-table-ensure">确定</div>
                      </div>
                    </div>
                  </div>
                  {/* 卡口设备 */}
                  <div className="gis-bayonet-table">
                    <div className="gis_table_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>
                    <div className="gis_table_border3">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border4">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>

                    <div className="gis_table_name">
                      <p>卡口设备</p>
                      <img src="/image/gis/gis-table-title.svg" width="100%" height="100%" />

                    </div>

                    <div className="gis_table_top">
                      <div className="gis-table-title">
                        <div className="gis-table-search-property">
                          <button type="button" id="gis-bayonet-table-search-btn" className="gis-table-search-btn icon-search"></button>
                          <input className="gis-table-search" id="gis-bayonet-table-search" placeholder=" 输入检索内容" />
                        </div>
                        <div className="gis-table-right-attribute">
                          <div className="map_select_title" id="gis-bayonet-table-surveillance">实时监控</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <table id="gis_table_conditions">
                        <thead>
                        <tr>
                          <td className="gis_table_property_5">
                            <div> <input id="gis-bayonet-table-allCheck" className="icon-square-o-blue"  type="checkbox" name="allCheck" value="gis-bayonet-table" /></div>
                          </td>
                          <td className="gis_table_property_5">
                            <h4>序号</h4>
                          </td>
                          <td className="gis_table_property_15">
                            <h4>名称</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>所属区域</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>操作</h4>
                          </td>
                        </tr>
                        </thead>
                        <tbody className="gis-bayonet-table-tbody">

                        </tbody>
                      </table>
                    </div>
                    <div className="gis-table-page gis-bayonet-table-page"></div>
                    <div>
                      <div className="map-table-close">
                        <div className="map-table-close-x">取消</div>
                        <div className="map-table-ensure" id="gis-bayonet-table-ensure">确定</div>
                      </div>
                    </div>
                  </div>
                  {/* 重点区域 */}
                  <div className="gis-keyarea-table">
                    <div className="gis_table_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>
                    <div className="gis_table_border3">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="gis_table_border4">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>

                    <div className="gis_table_name">
                      <p>重点区域</p>
                      <img src="/image/gis/gis-table-title.svg" width="100%" height="100%" />
                    </div>

                    <div className="gis_table_top">
                      <div className="gis-table-title">
                        {/*<div className="gis-table-type">
                          <div className="map_select_title" id="gis-table-warning-person">人员</div>
                        </div>
                        <div className="gis-table-type">
                          <div className="map_select_title" id="gis-table-warning-event">事件</div>
                        </div>*/}
                        <div className="gis-table-search-property">
                          <button type="button" id="gis-keyarea-table-search-btn" className="gis-table-search-btn icon-search"></button>
                          <input className="gis-table-search" id="gis-keyarea-table-search" placeholder=" 输入检索内容" />
                        </div>
                        <div className="gis-table-right-attribute">
                          <div className="map_select_title" id="gis-keyarea-table-camera">摄像头</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <table id="gis_table_conditions">
                        <thead>
                        <tr>
                          <td className="gis_table_property_5">
                            <div> <input id="gis-keyarea-table-allCheck" className="icon-square-o-blue"  type="checkbox" name="allCheck" value="gis-keyarea-table" /></div>
                          </td>
                          <td className="gis_table_property_5">
                            <h4>序号</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>区域名称</h4>
                          </td>
                          <td  className="gis_table_property_15">
                            <h4>区域地点</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>区域摄像头数量</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>区域级别</h4>
                          </td>
                          <td className="gis_table_property_10">
                            <h4>操作</h4>
                          </td>
                        </tr>
                        </thead>
                        <tbody className="gis-keyarea-table-tbody">

                        </tbody>
                      </table>
                    </div>
                    <div className="gis-table-page gis-keyarea-table-page"></div>
                    <div>
                      <div className="map-table-close">
                        <div className="map-table-close-x">取消</div>
                        <div className="map-table-ensure" id="gis-keyarea-table-ensure">确定</div>
                      </div>
                    </div>
                  </div>
                  {/* 新增重点区域 */}
                  <div id="gis-add-keyarea">
                    <div className="setting_border1">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                    </div>
                    <div className="setting_border2">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>

                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_border3">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_border4">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>

                      <span className="side7"></span>
                      <span className="side8"></span>
                      <span className="side9"></span>
                    </div>
                    <div className="setting_left_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="setting_bottom_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                    </div>
                    <div className="setting_right_center">
                      <span className="side1"></span>
                      <span className="side2"></span>
                      <span className="side3"></span>
                      <span className="side4"></span>
                      <span className="side5"></span>
                      <span className="side6"></span>
                      <span className="side7"></span>
                      <span className="side8"></span>
                    </div>

                    <div id="map_settings_box">
                      <span className="border_right_side6"></span>
                      <span className="border_left_side6"></span>

                      <div>
                        <div className="gis-add-keyarea-title">输入重点区域信息:</div>
                        <div className="map_set_coverage">
                             <div  className="gis-add-keyarea-name-div"><span>区域名称:</span><input id="gis-add-keyarea-name" type="text" placeholder="请输入区域名称" /></div>
                        </div>
                        <div className="map_set_coverage">
                          <div  className="gis-add-keyarea-address-div"><span>区域地址:</span><input id="gis-add-keyarea-address" type="text" placeholder="请输入区域地址" /></div>
                        </div>
                        <div className="map_set_coverage">
                          <div  className="gis-add-keyarea-level-div"><span>区域级别:</span>
                            <select id="gis-add-keyarea-level">
                              <option value="紧急">紧急</option>
                              <option value="严重">严重</option>
                              <option value="一般">一般</option>
                              <option value="普通">普通</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="map-table-close">
                          <div className="map-table-close-x">取消</div>
                          <div className="map-table-ensure" id="gis-add-keyarea-ensure">确定</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 时间轴 */}
                  <div id="topology_relative_timeline">
                    <div id="topology_timeline_taggle" className="icon-chevron-down-blue"></div>
                    <div id="topology_timeline_box">
                      <div id="topology_timeline">
                        <div className="event_selected">
                          <p id="event_title">
                            <i id="event_icon">-</i>关系类别</p>
                          <div id="event_list_child"></div>
                          <p className="showList"></p>
                        </div>
                        <div id="topology_timeline_axis">
                          <svg className='topo_timeline_svg ctrl'></svg>
                        </div>
                      </div>
                      <div id="topology_chart_record">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
    );
  }
}
gisPlatform.epmUIPage = page;
module.exports = gisPlatform;
