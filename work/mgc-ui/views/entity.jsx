import React, { Component } from 'react';
import { Header, Select, PageAlert } from '../../build/components/magicube';

const page = {
  title: '实体详细',
  css: [
    '/css/entity/entity.css'
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/utils.js',
    '/bower_components/d3/d3.min.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/public/relation.js',
    '/js/public/DateUtils.js',
    '/js/public/laydate/laydate.js',
    '/js/gisPlatform/china-map.js',
    '/js/public/d3map/d3-map.js',
    '/js/entity/entity.js'
  ]
};

class Entity extends Component {

  constructor( props ) {
    super( props );

    this.state = {
     activityTrajectoryType: [{
        systemName: "ALL",
        displayName: "全部"
      },
      {
        systemName: "train",
        displayName: "火车出行"
        }]
    };

  }

  componentDidMount() {
    // 活动轨迹部分绑定日历插件
    laydate.render({
      elem: '#activity_trajectory_time',
      range: '~'
    })
    laydate.render({
      elem: '#face_recognition_first_time',
      range: '~'
    })
    // 筛选绑定滚动条
    $(".topo-filter").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  render() {

    return (
      <div>

        <Header />
        {/* <PageAlert /> */}
        <section id="entity-main">
          <section id="entity-info">
            <div className="entity-title">
              <h4>对象信息</h4>
              <img src="../image/entity/title-block-left.svg" />
              <div className="entity-mark"/>
              <div className="entity-oprate">
                <button className="icon-save property-save-btn" style={{display: 'none'}}/>
                <button className="icon-add property-add-btn"/>
                <button className="icon-earth-blue" id="entity_map"/>
                <button className="icon-topology" id="entity_topo"/>
              </div>
            </div>
            <div className="entity-content">
              <div className="title-tabs"></div>
              <div className="tab-content">
                <div className="table-max"></div>
                {/*<table className="table-max">
                  <tbody>

                  </tbody>
                </table>*/}
              </div>
            </div>
            <div className="entity-relateTable">
              <div className="title-tabs"></div>
              <div className="tab-content">
              {/*<div className="table-max"></div>*/}
                <table className="table-max">
                  <tbody>

                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section id="entity-relate">
            <div className="entity-title">
                <h4>关联关系展示</h4>
                <img src="../image/entity/title-block-left-long.svg" />
            </div>
            <div className="entity-topo">
              <div className="topo"></div>
              <div className="topo-filter">
                <ul className="topo-filter-ul" />
              </div>
            </div>
            <div className="entity-relateInfo">
              <div className="tabs">

              </div>
              <div className="tab-content">
                <div id="time-filter">
                  <p>按年份查找：</p>
                  <div className="filter-content">
                    <div className="time-choose">
                      全部
                    </div>
                    <ul className="time-list">

                    </ul>
                  </div>
                </div>
                <div className="container-scroller">
                </div>
              </div>
            </div>
          </section>
          <div id="entity-shade">
            <div id="entity-alert">
              <ul className="alert-content">

              </ul>
              <div id="option_pagination_box">
                <div id="option_log_pagination"></div>
                <div className="pagination_page_box">
                  <span className="pagination_page_tip">每页显示</span>
                  <input type="text" id="option_page_num" defaultValue={ 10 }/>
                  <span className="pagination_page_tip">条</span>
                  <button id="option_page_ensure">确定</button>
                </div>
              </div>
              <div className="alert-operate">
                <button className="cancel">关闭</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

}

Entity.epmUIPage = page;

module.exports = Entity;
