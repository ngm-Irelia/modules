import React, {Component} from 'react';
import {Header, Filter, MakeEntity, Select, Ulist, Alert, PageAlert, MyRadio} from '../../build/components/magicube';

const url = '/magicube';

const page = {
  title: '关系拓扑',
  css: [
    '/css/topology/topology.css'
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/utils.js',
    '/bower_components/d3/d3.min.js',
    '/js/public/html2canvas.js',
    '/js/public/saveSvgAsPng.js',
    '/js/public/laydate/laydate.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/topology/topology.js',
    '/js/topology/message.js',
    '/js/topology/dataset-magic.js',
    '/js/topology/magicube-totips.js',
    /*'/js/topology/china-map.js',*/
    /*'/js/public/imagicubegis.js',*/
    /*'/js/topology/gis.js',*/
    '/js/topology/magicube-topo.js'
  ]
};

class Topology extends Component {

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

  handleChangeSet(index) {
    const setState = this.state.setState;
    setState[index].checked = !setState[index].checked;
    if (setState[index].checked) {
      $(".search_conditions input").eq(index).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
    } else {
      $(".search_conditions input").eq(index).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
    }
    this.setState({
      setState
    });
  };

  /* 获取过滤的条件类型相关的全部数据 */
  componentDidMount() {
    //获取cookie
    const getCookie = (cookie_name) => {
      var allcookies = document.cookie;
      var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度

      // 如果找到了索引，就代表cookie存在，
      // 反之，就说明不存在。
      if (cookie_pos !== -1) {
        // 把cookie_pos放在值的开始，只要给值加1即可。
        cookie_pos += cookie_name.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
        var cookie_end = allcookies.indexOf(";", cookie_pos);

        if (cookie_end == -1) {
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
      //dataSource.unshift({systemName: "null", displayName: "请选择关系类型...", child: []});
      this.setState({relateType: dataSource, customName: dataSource[0].child});
    });

    switch (getCookie("theme")) {
      case 'black':
        this.setState({loadingUrl: '../image/loading2.gif'});
        break;
      case 'white':
        this.setState({loadingUrl: '../image/loading.gif'});
        break;
      default:
        this.setState({loadingUrl: '../image/loading2.gif'});
        break;
    }

    // 弹框日历插件集体调用
    // 创建关系弹框日历
    laydate.render({
      elem: '#relate_time'
    });

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

    // 地图高级搜索日历
    laydate.render({
      elem: '#map_advance_search_time',
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
  }

  //选择关系类型
  handleSelectType(index) {
    let dataSource;
    let dataCustom;
    if (index.child.length > 0) {
      dataSource = index.child;
      dataCustom = index.child;
      this.setState({customName: dataCustom, relateName: dataSource});
    } else {
      dataSource = index;
      dataCustom = index.child;
      this.setState({customName: dataCustom, relateName: dataSource});
    }
  }

  //导出
  //导出：显示导出弹框
  handleExport() {
    this.setState({
      exportVisible: 'block',
      exportValue: 'excel'
    })
  }

  //导出：选择导出类型
  handleTypeSure(e) {
    e = e || window.event;
    this.setState({
      exportValue: e.target.value,
      typeVisible: 'none'
    })
  }

  //导出：确定导出
  handleExportSure(e) {
    let userSetJson = {
      savetnodes: window.nodes,
      savetlinks: window.links
    };
    userSetJson = JSON.stringify(userSetJson);
    //利用form表单请求下载文件
    let fileName = $("#dsname_tip h4").attr("data-versionName") || 'topo文件';
    downloadFile({
      fileName: encodeURIComponent(fileName),
      userSetJson: userSetJson,
      type: this.state.exportValue
    });
    this.setState({
      exportVisible: 'none'
    });
    $(".versionNameBox").css("display", "block")

    function downloadFile(obj) {
      var url = EPMUI.context.url + '/file';
      $("#downloadform").remove();
      var form = $("<form>");//定义一个form表单
      form.attr({
        "id": "downloadform",
        "style": "display:none",
        "target": "",
        "method": "POST",
        "action": url,
        "enctype": "multipart/form-data"
      });
      for (var key in obj) {
        var input = $("<input>");
        input.attr({
          "type": "hidden",
          "name": key,
          "value": obj[key]
        });
        form.append(input);
      }
      $("body").append(form);//将表单放置在web中
      form.acceptCharset = 'utf-8';
      form.submit();//表单提交
    }
  }

  //点击弹出框取消事件
  handleClickCancel() {
    this.setState({
      pushVisible: 'none',
      exportVisible: 'none',
      deleteVisible: 'none'
    });
  }

  handleLinksFilter() {
    this.setState({links: window.links}, () => {
      var json = [];
      let linksHtml = this.state.links.length > 0
        ?
        <div className="relation_filter_box">
          <h6 className="select_property_title">关系筛选</h6>
          <div className="relation_tips_box" onClick={this.handleSelectRelation.bind(this)}>
            {

              this.state.links.map((item, index) => {
                if (!json[item.relationTypeName]) {
                  json[item.relationTypeName] = 1;
                  return <span className="relation_tip" key={index}
                               data-relationTypeName={item.relationTypeName}>{item.relationTypeName}</span>
                }
              })
            }
          </div>
        </div>
        :
        '';
      this.setState({linksHtml: linksHtml})
    })
  }

  //筛选关系类型
  handleSelectRelation(ev) {
    var ev = ev || window.event;
    var target = ev.target || ev.srcElement;
    if (target.className == 'relation_tip_active') {
        target.className = 'relation_tip';
    } else if (target.className == 'relation_tip') {
        target.className = 'relation_tip_active';
    }
  }

  //选择操作类型
  handleChangeOperate(index) {
    this.setState({
      currentIndex: index
    })
  }

  //选择碰撞方式
  handleChangeCollide(e) {
    let className = $(e.target).attr("class");
    if (className == 'icon-square-o-big-blue'){
      $(e.target).removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
    } else {
      $(e.target).removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
    }
  }
  handleClickGetTimeFilter() {
    let trajectoryTime = [{displayName: '全部'}];
    let data = $("#trajectory_time").data("timeFilter");
    data.map(function (item) {
      trajectoryTime.push({
        displayName: item
      });
    });
    this.setState({
      trajectoryTime: trajectoryTime
    })
  }
  handleClickGetTypeFilter(){
    let trajectoryType = [{displayName: '全部'}];
    let data = $("#trajectory_type").data("typeFilter");
    data.map(function (item){
      trajectoryType.push({
        displayName: item
      })
    });
    this.setState({
      trajectoryType: trajectoryType
    });
  }
  render() {

    return (
      <div>
        <Header bSearch={true}/> {/* 此处是header部分 */}
        {/* 页面的弹框 */}
        {/* <Alert type="confirm" icon="icon-save" title="保存" content={ <div>哈哈</div> } show={ true } sure={ function(){ console.log(112, this.state) }.bind(this) } /> */}
        <PageAlert/>
        {/*创建实体*/}
        <MakeEntity labelType={false}/>
        <div id="topology_main">
          {/* 控制台 */}
          <div id="topology_relative">
            <div id="topo_buttons">
              <div id="topo_map">图表</div>
              <div id="topo_gis">GIS</div>
            </div>
            <div id="topology_relative_network">
              {/*全部可能路径模态框*/}
              {/* 搜索页面节点 */}
              <div className="search_nodes_modalBox">
                <button type="button" className="search_nodes_modalBox_btn icon-search"></button>
                <input type="text" className="nodes_find" placeholder="输入名字"/>
              </div>
              {/* 模型框 */}
              <div className="topo_modalBox" id="model_longestPath_modalBox">
                <ul>
                  <li>
                    <h5 className="findway">查找路径：</h5>
                    <div className="line_box"></div>
                  </li>
                  <li>
                    <h5 className="findway findway1">深度设置：</h5>
                    <input type="text" id="screeDepth" name="depth" placeholder="输入深度数值" autoComplete="off"/>
                    <h5 className="way_error">没有找到,请输入别的深度</h5>
                  </li>
                  <li>
                    <h5 className="findway findway4">关系设置：</h5>
                    <Select dataSource={this.state.relateType} selectId="model_relate_type" showInput="false"
                            parentId="model_relate_type_lists" selectProperty="null" selectValue="" selectTitle="请选择父关系..."
                            onHandleSelect={this.handleSelectType.bind(this)}/>
                  </li>
                  <li>
                    <h5 className="findway findway4" style={{"opacity":0}}>关系设置：</h5>
                    <Select dataSource={this.state.relateName} selectId="model_relate_name" showInput="false"
                            parentId="model_relate_name_lists" selectProperty="null" selectValue="" selectTitle="请选择子关系...(可选)" />
                  </li>
                  <li>
                    <div className="relateType_classify_content"></div>
                  </li>
                  <li>
                    <h5 className="findway findway3">方向设定：</h5>
                    <MyRadio class={"choseDirection "} number={[1, 2]} text={[" 有向筛选", " 无向筛选"]} value={[1, 0]}/>
                  </li>
                  <li className="button_li">
                    <button type="button" id="model_self" className="confirmed" name="model_self">保存为自定义模型</button>
                    <button type="button" id="model_sure" className="confirmed" name="button">确定</button>
                    <button type="button" className="canceled" name="button">取消</button>
                  </li>
                  <button className="model_add_btn">添加</button>
                  <div id="self_model_name">
                    <input type="text" placeholder="输入名字，建议5个字符" id="model_name_input"/>
                    <button type="button" id="model_name_sure" className="confirmed" name="button" data-click="0">确定
                    </button>
                  </div>
                </ul>
              </div>
              {/* 模型查找结果 */}
              <div className="topo_modalBox" id="model_search_result_modalBoxBox">
                <ul>
                  <li>
                    <h5 className="findway">查找结果：</h5>
                  </li>
                </ul>
                <div className="model_search_reslut_box"></div>
                <div className="button_r_li">
                  <button type="button" id="ensured" className="confirmed" name="button">确定</button>
                  <button type="button" className="canceled model-canceled" name="button">返回</button>
                </div>
              </div>
              {/* 自定义模型更多显示框 */}
              <div className="topo_modalBox " id="customModel_more_modalBox">
                <div className="custom_tab_list">
                  <table>
                    <thead>
                    <tr>
                      <th>编号</th>
                      <th>名称</th>
                      <th>创建时间</th>
                      <th>状态</th>
                    </tr>
                    </thead>
                    <tbody id="more_custom">
                    <tr></tr>
                    </tbody>
                  </table>
                </div>
                <div className="button_boxs">
                  <button type="button" id="ensured" className="confirmed" name="button">确定</button>
                  <button type="button" className="canceled" name="button">取消</button>
                </div>
              </div>
              {/*扩展数据*/}
              <div className="topo_modalBox" id="extend_more_modalBox">
                <h5>请单击选择进行扩展</h5>
                <div className="extend_list">
                  <ul className="extend_list_ul clearfix"></ul>
                </div>
                <div className="button_boxs clearfix">
                  <button type="button" id="extend-ensured" className="confirmed" name="button">确定</button>
                  <button type="button" className="canceled" name="button">取消</button>
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
                      <input type="text" id="relation_time" placeholder="请选择时间范围" readOnly/>
                      <button type="button" id="relation_time_btn" className="icon-calendar-cute"></button>
                    </div>
                  </div>
                  <button type="button" id="custom_confirmed" className="confirmed" name="button">确定</button>
                  <button type="button" className="canceled" name="button">取消</button>
                </div>
              </div>
              <div className="topo_modalBox" id="topo_creat_link_modalBox" data-type="null">
                <div className="makelink_box">
                  <h5>请选择创建连接的关系类型：</h5> 
                  <div className="select_box">
                    <Select dataSource={this.state.relateType} selectId="make_relate_type" showInput="true"
                            parentId="make_relate_type_lists" selectProperty="null" selectValue="" selectTitle="请选择或输入关系类型..."
                            onHandleSelect={this.handleSelectType.bind(this)} 
                    />
                  </div>
                  <div className="select_box">
                    <Select dataSource={this.state.relateName} selectId="make_relate_name" showInput="true"
                            parentId="make_relate_name_lists" selectProperty="null" selectValue="" selectTitle="请选择或输入关系类型..."
                    />
                  </div>
                  <h5>请填写对象的关系信息:</h5>
                  <div id="relate_name_box">
                    <span id="relate_name_one">张三</span>
                    <span id="relate_direction" className="icon-topo-arrow" data-flag="true"></span>
                    <span id="relate_name_two">李四</span>
                  </div>
                  <div className="clandar_box">
                    <input type="text" id="relate_time" data-type="RELATIONSHIP_TIME" placeholder="请选择关系创建时间" readOnly/>
                    <button type="button" id="relate_time_btn" className="relate_time_btn icon-calendar-cute"></button>
                  </div>
                  <input type="text" placeholder="请输入关系形成的媒介" data-type="RELATIONSHIP_MEDIUM" id="relate_medium"/>
                </div>
                <div id="makelink_opt">
                  <button id="makelink_ensure" className="makelink_active confirmed">确定</button>
                  <button className="canceled">取消</button>
                </div>
              </div>
              <div className="topo_modalBox" id="save_topoData_modalBox">
                <h4><span className="icon-folder-open-o-blue"></span>保存</h4>
                <div className="save_list_box">
                  <span>数据集名称：</span>
                  <input type="text" id="topo_save_name" autoComplete="off" placeholder="请输入数据集名称"/>
                  <label>* 数据集名称不能为空</label>
                </div>
                <div className="save_list_box">
                  <span>版本名称：</span>
                  <input type="text" id="topo_save_versionName" autoComplete="off" placeholder="请输入版本名称"/>
                  <label>* 版本名称不能为空</label>
                </div>
                <div className="save_list_box">
                  <span>描述：</span>
                  <textarea id="topo_save_describle"></textarea>
                </div>
                <div className="save_list_box">
                  <span>作者：  </span><p id="topo_save_author"> {this.state.author} </p>
                  <span style={{marginLeft: '35%', marginRight: '10px'}}>标记：</span>
                  <span className="save_mark icon-mark"></span>
                </div>
                <div id="save_option_box">
                  <button type="button" id="save_sure" className="confirmed">保存</button>
                  <button type="button" id="save_close" className="canceled">取消</button>
                </div>
              </div>
              <div className="topo_modalBox" id="save_screenShot_modalBox">
                <h4>截图成功</h4>
                <img id="snapShot"/>
                {/*<canvas id="sereevCanvas"  style={{border:"1px solid #33d0ff",width:"578px",height:"260px"}}></canvas>*/}
                <div id="save_option_imgbox">
                  <a id="downloadSnapshot" className="confirmed">保存</a>
                  <button type="button" id="remove_box" className="canceled">取消</button>
                </div>
              </div>
              {/* 导出 */}
              <div className="alert_model" id="export_topoData_modalBoxl" style={{display: this.state.exportVisible}}>
                <h4><span className="icon-export-blue"></span>内容导出</h4>
                <div className="model_box">
                  <p>请预先选择需要导处的数据类型 :</p>
                  <div>
                    <p>
                      <label htmlFor="excel">
                        <input type="radio" value="excel" id="excel" name="type"
                               checked={this.state.exportValue == 'excel' ? true : false}
                               onChange={this.handleTypeSure.bind(this)}/> EXCEL (*xls)
                      </label>
                      <span>将文件到导出为EXCEL文件</span>
                    </p>
                    <p>
                      <label htmlFor="xml">
                        <input type="radio" value="xml" id="xml" name="type"
                               checked={this.state.exportValue == 'xml' ? true : false}
                               onChange={this.handleTypeSure.bind(this)}/> XML文件 (*xml)
                      </label>
                      <span>将文件到导出为XML文件（可导入）</span>
                    </p>
                    <p>
                      <label htmlFor="json">
                        <input type="radio" value="json" id="json" name="type"
                               checked={this.state.exportValue == 'json' ? true : false}
                               onChange={this.handleTypeSure.bind(this)}/> JSON文件(*txt)
                      </label>
                      <span>将文件到导出为JSON文件（可导入）</span>
                    </p>
                  </div>
                </div>
                <div className="button_box">
                  <button className="ok confirmed" onClick={this.handleExportSure.bind(this)}>确定</button>
                  <button className="cancel canceled" onClick={this.handleClickCancel.bind(this)}>取消</button>
                </div>
              </div>
              {/* 过滤器 */}
              <div className="topo_network_filter" draggable>
                <h4 id="network_filter_title" className="icon-filter-blue">过滤器</h4>
                <div id="network_filter_scope">
                  <ul className="n  etwork_filter_box">
                    <li>
                      <h6 className="select_property_title">筛选范围</h6>
                      <input type="text" id="network_filter_object" value="全部" readOnly/>
                    </li>
                    <li>
                      <h6 className="select_property_title">时间设定</h6>
                      <div id="network_filter_time" className="filter_classify_box">
                        <div className="clandar_box">
                          <input type="text" id="filter_time" placeholder="请点击选择时间范围" readOnly/>
                          <button type="button" id="filter_time_btn" className="icon-calendar-cute"></button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <Filter/>
                </div>
                {/* 筛选关系类型 */}
                {
                  this.state.linksHtml
                }
                <div id="filter_option_box">
                  <button id="filter_option_ensure" className="confirmed">开始过滤</button>
                  <button id="filter_option_cancel" className="canceled">取消过滤</button>
                </div>
              </div>
              <div className="topo_modalBox" id="virtual_search_reslut_modalBox">
                <h5>相关节点信息列表</h5>
                <span className="screenToShow">筛选查看</span>
                <span className="addtopology">添加到工作台</span>
                <span className="dsm_close"><i className="cross_icon icon-delete-blue"></i></span>
                <div className='virtual_search_reslut_modalBox_content'></div>
                <div id='searchlist_pagination'></div>
              </div>
              {/* 删除对比信息确认框 */}
              <div id="delete_alert">
                <h5>提示</h5>
                <p>当前删除操作将会把数据库数据删除，一旦删除将无法检索到</p>
                <div>
                  <button id="delete_ensure_true">依然删除</button>
                  <button id="delete_ensure_false">取消</button>
                </div>
              </div>
              {/*信息比对 obj_mes_out */}
              <div className="obj_message">
                <div className="obj_title_box">
                  <h4>数据对比</h4>
                  <div></div>
                </div>
                {/* <div id="topo_detaiCompare_opt">
                  <div id="compare_detail_delete" className="icon-delete-blue"></div>
                  <div id="compare_detail_edit" className="icon-edit-blue"></div>
                </div> */}
                <div id="topo_compare_box">
                  <div id="compare_selected_border"></div>
                  <div id="topo_compare_content"></div>
                </div>
                <div className="obj_title_box">
                  <h4>轨迹对比</h4>
                  <div></div>
                  <span className="icon-angle-up"></span>
                </div>
                <div id="topo_relateCompare_opt">
                  {/*<div id="compare_relate_delete"></div>*/}
                  {/*<div id="compare_relate_add" className="icon-add"></div>*/}
                  {/*<div id="compare_relate_edit"></div>*/}
                </div>
                <div id="obj_bottom">
                  <div id="trajectory_operate">
                    <div className="choose_time">
                      <div>时间选择：</div>
                      <Select dataSource={this.state.trajectoryTime} selectId="trajectory_time" showInput="false"
                              parentId="trajectory_time_lists" selectProperty="null" selectValue="" selectTitle="请选择时间..."
                              onClick={this.handleClickGetTimeFilter.bind(this)}
                              />
                    </div>
                    <div className="choose_type">
                      <div>轨迹类别选择：</div>
                      <Select dataSource={this.state.trajectoryType} selectId="trajectory_type" showInput="false"
                              parentId="trajectory_type_lists" selectProperty="null" selectValue="" selectTitle="请选择轨迹类别..."
                              onClick={this.handleClickGetTypeFilter.bind(this)}
                              />
                    </div>
                    <div className="search_sure">搜索</div>
                  </div>
                  <div className="trajectory_operate_main_content"></div>
                </div>
                <div id="compare_commit_box">
                  <button id="topo_compare_ensure">保存</button>
                  <button id="topo_compare_cancel">取消</button>
                </div>
                <div id="compare_shade">
                  <img src={this.state.loadingUrl}/>
                </div>
              </div>
              <div className="topo_modalBox" id="virtual_filter_reslut_modalBox">
                <h5>筛选展示节点信息</h5>
                <span className="virtual_filter_reslut_modalBox_close"><i
                  className="cross_icon icon-delete-blue virtual_filter_reslut_modalBox_close_icon"></i></span>
                <div className='virtual_filter_reslut_modalBox_content'></div>
                <div className="virtual_filter_reslut_modalBox_box">
                  <button id="virtual_filter_reslut_modalBox_ensure" className="confirmed">筛选</button>
                  <button id="virtual_filter_reslut_modalBox_cancel" className="canceled">取消</button>
                </div>
              </div>
              {/* 控制台遮罩 */}
              <div id="topo_alert">
                <div id="topo_alert_box">
                  <h6 id="topo_alert_title"></h6>
                  <div id="topo_alert_content"></div>
                  <button type="button" id="topo_alert_button" className="confirmed">确定</button>
                </div>
              </div>
              <div id="topo_usual_tools">
                <div id="tool_fullscreen"><span className="icon-fullscreen"></span></div>
                <div id="tool_photo"><span className="icon-camera"></span></div>
                <div id="tool_filter" onClick={this.handleLinksFilter.bind(this)}><span className="icon-filter"></span>
                </div>
                <div id="tool_findnodes"><span id="right-search" className="icon-search"></span></div>
                <div id="tool_back"><span className="icon-replay"></span></div>
                <div id="tool_linepath"><span className="icon-ligature"></span></div>
                <div id="tool_resetscreen"><span className="icon-repeat"></span></div>
                <div id="tool_export"><span className="icon-export" onClick={this.handleExport.bind(this)}></span></div>
              </div>

              {/* 当选择 '打开到控制台' 时，向用户提示是否保存控制台的分析数据 */}
              <div id="dataset_save_tip">
                <h4><span className="icon-send-blue"></span>提示</h4>
                <div className="dst_content">
                  <p>在打开新的内容之前，是否保存当前分析数据？</p>
                </div>
                <div className="dst_footer">
                  {/* <label><input name="defaultTip" type="checkbox"/>下次不再提醒</label> */}
                  <button value="cancel" className="dstf_cancel canceled">不保存</button>
                  <button value="ok" className="dstf_ok confirmed">保存</button>
                </div>
              </div>

              <div id="topology_topo">
                <div id="push_modal">
                  <h4><span className="icon-send-blue"></span>内容推送</h4>
                  <div className="push_input_list" id="push_input_group">
                    <span>推送用户组 :</span>
                    <button className="pig_input">请选择</button>
                    {/* <div className="pig_select">
                      </div> */}
                  </div>
                  <div className="push_input_list" id="push_input_user">
                    <span>推送用户 :</span>
                    <button className="pig_input">请选择</button>
                    {/* <div className="pig_select">
                      </div> */}
                  </div>
                  <div className="push_input_list" id="push_input_desc">
                    <span>推送描述 :</span>
                    <div className="pid_desc" contentEditable></div>
                  </div>
                  <div className="push_input_button">
                    <button className="push_ok confirmed">确定</button>
                    <button className="push_cancel canceled">取消</button>
                  </div>
                </div>
                {/* 对数据集将要进行的操作：交集/并集/差集/打开到控制台 */}
                <div id="dataset_opera">
                  <h5>您选择了两个数据集，请选择您需要完成的操作：</h5>
                  <div className="dataset_content">
                    <MyRadio class={"datasetRadio "} number={[1, 2, 3, 4]} text={[" 打开", " 交集", " 并集", " 差集"]}
                             value={["open", "intersection", "together", "diff"]}/>
                  </div>
                  <h5>请选择数据的碰撞方式：</h5>
                  <div className="dataset_content">
                    <label htmlFor="entityId">
                      <input type="checkbox" id="entityId" name="datasetCheckbox" value="entity" defaultChecked="true"
                             className="icon-check-square-o" onClick={this.handleChangeCollide.bind(this)}/>实体碰撞
                    </label>
                    <label htmlFor="relationshipId">
                      <input type="checkbox" id="relationshipId" name="datasetCheckbox" value="relationship"
                             className="icon-square-o-big-blue" onClick={this.handleChangeCollide.bind(this)}/>关系碰撞
                    </label>
                  </div>
                  <div className="dataset_footer">
                    <button className="dataset_ok confirmed">确定</button>
                    <button className="dataset_cancel canceled">取消</button>
                  </div>
                </div>
                {/* 数据交、并集统计结果 */}
                <div id="dataset_merge">
                  <div className="ds_header">
                    <div className="dsh_border"></div>
                    <h5>碰撞结果</h5>
                  </div>
                  <div className="ds_content">
                    <div className="ds_cont_item">
                      <div>
                        <label>控制台数据: &nbsp;</label>
                        <span>
                            <span className="dsc_num"></span>个对象，
                            <span className="dsc_num"></span>条关系连接</span>
                      </div>
                      <div className="ds_cont_item">
                        <label>数据集集合: &nbsp;</label>
                        <span>
                            <span className="dsc_num"></span>个对象，
                            <span className="dsc_num"></span>条关系连接</span>
                      </div>
                    </div>
                    <div className="ds_cont_item" id="dsc_result">
                      <div>
                        <label>碰撞结果: &nbsp;</label>
                        <span>
                            <span className="dsc_num"></span>个对象，
                            <span className="dsc_num"></span>条关系连接</span>
                      </div>
                    </div>
                  </div>
                  <div className="ds_footer">
                    <button className="dataset_ok confirmed">确定</button>
                  </div>
                </div>

                {/* 数据集打开到控制台提示 */}
                <div id="dataset_finished">
                  <h5>数据已加载完毕！</h5>
                </div>
                {/* 数据集管理模态框 */}
                <div id="dataset_manage">
                  <h5>数据集</h5>
                  <span className="dsm_close">
                      <i className="cross_icon icon-delete-blue"></i>
                    </span>
                  <div className="dataset_content">
                    <div className="dataset_edit clearFloat">
                      <div className="dse_opera">
                        <button className="return icon-arrow_back" title="返回">返回</button>
                      </div>
                      <div className="search">
                        <input type="text" placeholder="搜索"/>
                        <button className="search_btn icon-search-gray"></button>
                      </div>
                    </div>
                    <div className="dataset_list">
                      <ul>
                        {/* <li>
                            <img src="../image/dataset/sample.png"/>
                            <p className="transition_x">人员分析1</p>
                          </li> */}
                      </ul>
                    </div>
                    <div className="dataset_pagination"></div>
                  </div>
                </div>
                <div id="timeline-layout" className="timeline-layout">
                </div>
                <div id="topo_network" className="topo_network">
                  <svg className="topo-console ctrl" id='topo_svgContent'>
                    <g className="main" id='gmain'></g>
                  </svg>
                  {/* <div id="thumbnail">
                      <i className="thumbnail_small icon-thumbnailsmall"></i>
                      <svg className="thumbnail_svg ctrl">
                        <g className="thumb_img">
                          <image className="thumb_imgs"></image>
                        </g>
                        <g className="thumb_g">
                          <rect className="brushRect" style = {{fill:"#ddd",opacity:"0.1"}}>
                          </rect>
                        </g>
                      </svg>
                    </div>
                    <div className="thumbnail_big icon-thumbnailbig"></div> */}
                </div>
                {/*创建链接*/}
                <div id="dsname_tip">
                  <h4></h4>
                </div>
                <div id="import_model" style={{'display': 'none'}}>
                  {/*第一种方式*/}
                  <h4>导入数据集</h4>
                  <input type="file" name="fileField" id="import"/>
                  <button value="上传" id="import_">选择文件</button>
                  <button className="import_sure">导入</button>
                  <button className="import_cancel">取消</button>
                  */}
                  {/*<div className="line"></div>*/}
                  {/*<div className="line"></div>*/}
                  <form id="dataSetImport" action="" method="post" target="">
                    <h4>导入数据集</h4>
                    <input type="file" name="fileField" id="import"/>
                    <input type="button" id="import_" value="选择文件"/>
                    <input type="submit" className="import_sure" value="导入"/>
                    <button className="import_cancel">取消</button>
                  </form>
                </div>
                {/*工具条*/}
                <ul id="toolsBar" style={{"overflow": "hidden", "height": "26px"}}>
                  <div id="toolsShade">
                    <span className="lineTable icon-toolbox"></span>
                  </div>
                  <div className="hideBars"></div>
                  <div className="tool_box1">
                    <li className="tool-parent-left" id="tool_reload5"><span className="icon-thumb-tack"></span></li>
                    {/*固定*/}
                    <li className="tool-parent-left" id="tool_locked"><span className="icon-eye"></span></li>
                    {/* 隐藏、显示 */}
                    <li className="tool-parent-left tool_find"><span id="left-search" className="icon-search"></span>
                    </li>
                    {/* 查找 */}
                    <li className="tool-parent-left tool_rotate_li" style={{
                      "height": "1px"
                    }}></li>
                    <li className="tool-parent-left tool_save" id="tool_save" data-id=""><span
                      className="icon-save1"></span></li>
                    {/*保存 */}
                    <li className="tool-parent-left" id="tool_import"><span className="icon-import1"></span></li>
                    {/* 导入 */}
                    <li className="tool-parent-left tool_rotate_li" style={{
                      "height": "1px"
                    }}></li>
                    <li className="tool-parent-left"><span className="icon-camera"></span></li>
                    {/*截图*/}
                    <li className="tool-parent-left"><span className="icon-repeat"></span></li>
                    {/* 清屏 */}
                    {/* <li className="tool"><span className="icon-memorandum"></span></li>备忘录*/}
                  </div>
                  <div className="tool_box1">
                    <li className="tool-parent-right" id="tool_rotate"><span className="icon-turn"></span></li>
                    {/* 转向 */}
                    <li className="tool-parent-right">{/* 排布 */}
                      <span className="icon-network-topology"></span>
                      <i className="smallIcon"></i>
                      <div className="tipBoxs tipBoxs_list">
                        <div className="tool-children-layout">
                          <span className="icon-network-topology"></span>
                          <p>网络布局</p>
                        </div>
                        <div className="tool-children-layout">
                          <span className="icon-square-layout"></span>
                          <p>方形布局</p>
                        </div>
                        <div className="tool-children-layout">
                          <span className="icon-circle-layout"></span>
                          <p>圆形布局</p>
                        </div>
                        <div className="tool-children-layout">
                          <span className="icon-hierarchical-layout"></span>
                          <p>层级布局</p>
                        </div>
                        <div className="tool-children-layout">
                          <span className="icon-timeline-layout"></span>
                          <p>时间线布局</p>
                        </div>
                        <div className="tool-children-layout tipBoxs_img_undone">
                          <span className="icon-group-layout"></span>
                          <p>群组布局</p>
                        </div>
                      </div>
                    </li>
                    <li className="tool-parent-right">{/* 连接线*/}
                      <span className="icon-line-style"></span>
                      <i className="smallIcon"></i>
                      <div className="tipBoxs tipBoxs_path">
                        {/* <div className="tool-children-link">
                            <span className="icon-line-style"></span>
                            <p>线条样式</p>*/}
                        {/*path虚线或者实线 */}
                        {/* <div className="pathsWork pathstyle" >
                              <div>
                                <span className="icon-active-line"></span>
                                <text className="styletext">实线</text>
                              </div>
                              <div>
                                <span className="icon-dashed"></span>
                                <text className="styletext">虚线</text>
                              </div>
                            </div>
                          </div> */}
                        <div className="tool-children-link">
                          <span className="icon-line-color"></span>
                          <p>线条颜色</p>
                          {/* path颜色 */}
                          <div className="pathsWork pathcolors" style={{width: "35px", height: "100px"}}>
                            <div style={{width: "30px", height: "15px", transform: "scale(1, 1)"}}></div>
                            <div style={{width: "30px", height: "15px", background: "rgb(255, 255, 255)"}}></div>
                            <div style={{width: "30px", height: "15px", background: "rgb(51, 208, 255)"}}></div>
                            <div style={{width: "30px", height: "15px", background: "rgb(177, 181, 183)"}}></div>
                            <div style={{width: "30px", height: "15px", background: "rgb(205, 71, 74)"}}></div>
                          </div>
                        </div>
                        <div className="tool-children-link">
                          <span className="icon-line-thickness"></span>
                          <p>线条粗细</p>
                          {/* path粗细 */}
                          <div className="pathsWork pathwidth" style={{width: "35px", height: "50px"}}>
                            <div style={{textAlign: "center", width: "35px", height: "30px"}}>
                              <text>1px</text>
                            </div>
                            <div style={{textAlign: "center", width: "35px", height: "30px"}}>
                              <text>2px</text>
                            </div>
                            <div style={{textAlign: "center", width: "35px", height: "30px"}}>
                              <text>3px</text>
                            </div>
                            <div style={{textAlign: "center", width: "35px", height: "30px"}}>
                              <text>4px</text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="tool-parent-right tool_rotate_li" style={{
                      "height": "1px"
                    }}></li>
                    <li className="tool-parent-right tool_save" id="tool_saveAs"><span
                      className="icon-share-square-o"></span></li>
                    {/*另存为*/}
                    <li className="tool-parent-right" id="tool_push"><span className="icon-send"></span></li>
                    {/* 推送 */}
                    <li className="tool-parent-right tool_rotate_li" style={{
                      "height": "1px"
                    }}></li>
                    <li className="tool-parent-right"><span className="icon-replay"></span></li>
                    {/* 上一步 */}
                    <li className="tool-parent-right"><span className="icon-trash-o"></span></li>
                    {/*删除 */}
                  </div>
                </ul>
              </div>
            </div>
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
          <div id="topology_message_taggle" className="icon-chevron-right-blue"></div>
          <div id="topology_message">
            <div id="topology_message_drag"></div>
            <div id="topology_message_box">
              <ul id="topology_message_tabs">
                <li id="topo_base_title" className="message_tab_list topology_message_tab_active">详细</li>
                <li id="topo_total_title" className="message_tab_list">统计</li>
                <li id="topo_search_title" className="message_tab_list">搜索</li>
              </ul>
              <div className="topo_message" id="topology_message_detail">
                <div id="topology_detail_loading">
                  <img src={this.state.loadingUrl}/>
                </div>
                <div id="topo_detail_content">
                  <h5 id="topo_check_detialTitle">基本信息</h5>
                  <div id="check_detail_contents"></div>
                  <h5 id="topo_check_relateTitle">相关内容</h5>
                  <div id="check_relate_contents"></div>
                </div>
              </div>
              <div className="topo_message" id="topology_message_total">
                <div id="topology_message_main">
                  <div id="topology_total_loading">
                    <img src={this.state.loadingUrl}/>
                  </div>
                  <div id="topo_total_message">
                    <h3 className="topo_total_title">类型展示</h3>
                    <div id="total_type_box">
                      <div id="total_type"></div>
                      <div id="total_option_box">
                        <button data-checkbox="show" id="total_checkbox_flag">选择</button>
                        <button data-total="show" id="total_checkbox_refresh">刷新</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="topo_message" id="topology_message_search">
                <div id="topo_search_none" className="icon-search-file">
                  <p>请通过搜索菜单搜索...</p>
                </div>
                <div id="topo_search_content">
                  <h3 className="topology_message_title">
                    搜索结果</h3>
                  <div id="topo_search_result"></div>
                  <h3 id="topo_secrch_detailTitle">
                    详细</h3>
                  <div id="topo_search_detail"></div>
                </div>
                <div id="topo_search_tip" className="icon-notfind">
                  <p>没有搜索结果，是否为</p>
                  <p>
                    <span id="topo_go_search"></span>
                    <span id="topo_go_makeLabel">创建对象</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Topology.epmUIPage = page;
module.exports = Topology;
