import React, { Component } from 'react';
import { Header, MakeEntity, Select, PageAlert } from '../../build/components/magicube';

const url = '/magicube';

const page = {
  title: '文档详细',
  css: [
    '/css/document/document.css'
  ],
  js: [
    //'/js/public/watermask.js',
    '/js/public/quill.js',
    '/js/public/laydate/laydate.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/document/document.js'
  ]
};

class Document extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      relateType: [],
      relateName: []
    }
    this.getCookie = this.getCookie.bind(this);

  }

  componentDidMount() {
    // 时间插件
    laydate.render({
      elem: '#relate_time'
    });

    fetch(url + '/relation/data').then((response) => response.json()).then((data) => {
      const dataSource = data.magicube_interface_data;
      this.setState({
        relateType: dataSource
      });
    });
    switch(this.getCookie("theme")){
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
  }

  getCookie(name){
    var arr, reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
  }

  handleSelect(index) {
    let dataSource;
    if (index.child.length > 0 ) {
      dataSource = index.child;
      this.setState({
        relateName: dataSource
      })
    } else {
      dataSource = index;
      this.setState({
        relateName: dataSource
      });
    }
  }



  render() {

    return (
      <div>
        <Header />
        <PageAlert />
        <section id="document_main">
          <article id="document_content">
            <div id="toolbar_shade"></div>
            <div id="document_tab_box">
              <div id="document_tab_origintext" className="document_tab_active icon-menubg"><span>原文</span></div>
              <div id="document_tab_digest" className="icon-menubg"><span>摘要</span></div>
            </div>
            <h3 id="document_title"></h3>
            <div id="document_tiau">
              <span className="document_time"></span><span className="document_name"></span>
            </div>
            <b id="makeEntity" className="icon-box-open" ></b>
            <div id="document_origintext">
              <div id="document_origintext_content"></div>
            </div>
            <div id="document_digest"></div>
          </article>
          <div id="document_loading">
            <img src={ this.state.loadingUrl } />
          </div>
          {/* 判断实体是否在库内 */}
          <div id="document_is_exist" className="document_is_exist">
            <p className="entity_model_title"><span className="icon-exclamation-circle-blue"></span>检测到数据库已包含同样的标签数据</p>
            <div className="entity_content icon-watermarklogo" id="entity_content">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </div>
            <div className="entity_model_button">
              <div id="entity_model_button_create" className="entity_btn_create_default">新创建</div>
              <div id="entity_model_button_relate" className="document_btn_relate_default">对象关联</div>
              <div id="entity_model_button_cancel" className="entity_btn_cancel_default">取消</div>
            </div>
          </div>
        </section>

        

        {/*创建实体*/}
        <MakeEntity />

        {/*给实体添加属性*/}
        <div id="document_add_property">
          <h3 id="add_property_title">为<span id="document_object_name">力达康</span>对象添加属性</h3>
          <div className="make_pro_box">
            <div className="add_property_list">
              <span>属性类型</span>
              <div id="add_property_box">
                <h6 id="add_property_type" className="add_property_type_color" data-type="null">请选择属性...</h6>
                <div id="add_property_lists"></div>
              </div>
            </div>
            <div className="add_property_list">
              <span>属性名称</span>
              <input id="add_property_value" type="text"/>
            </div>
          </div>
          <div id="add_property_option">
            <button id="add_property_ensure">确定</button>
            <button id="add_property_cancel">取消</button>
          </div>
        </div>

        <section id="document_shade"></section>

        <div id="document_makelink">
          <div className="makelink_box">
            <h5>请选择创建连接的关系类型：</h5>
            <div className="select_box">
              <Select dataSource={this.state.relateType} selectId="make_relate_type" parentId="make_relate_type_lists" selectProperty="null" selectValue="" showInput="true" selectTitle="请选择或输入关系类型..." onHandleSelect={this.handleSelect.bind(this)}/>
            </div>
            <div className="select_box">
              <Select dataSource={this.state.relateName} selectId="make_relate_name" parentId="make_relate_name_lists" selectProperty="null" selectValue="" showInput="true" selectTitle="请选择或输入关系类型..."/>
            </div>
            <h5>请填写对象的关系信息:</h5>
            <div id="relate_name_box">
              <span id="relate_name_one"></span>
              <span id="relate_direction" className="icon-topo-arrow" data-flag="true"></span>
              <span id="relate_name_two"></span>
            </div>
            <div className="clandar_box">
              <input type="text" id="relate_time" data-type="RELATIONSHIP_TIME" placeholder="请选择关系创建时间" readOnly />
              <button type="button" id="relate_start" className="icon-calendar-cute"></button>
            </div>
            <input type="text" placeholder="请输入关系形成的媒介" data-type="RELATIONSHIP_MEDIUM" id="relate_medium"/>
          </div>
          <div id="makelink_opt">
            <button id="makelink_ensure" className="makelink_active confirmed">确定</button>
            <button id="makelink_cancel">取消</button>
          </div>
        </div>
      </div>
    );

  }

}

Document.epmUIPage = page;
module.exports = Document;