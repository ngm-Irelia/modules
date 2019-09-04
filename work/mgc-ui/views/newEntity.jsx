import React, { Component } from 'react';

const page = {
  title: '实体详细',
  css: [
    '/css/newEntity/entity.css' 
  ],
  js: [
    '/js/public/watermask.js',
    '/bower_components/d3/d3.min.js',
    '/js/public/newRelation.js',
    '/js/public/laydate/laydate.js',
    '/js/topology/china-map.js',
    '/js/public/d3map/d3-map.js',
    '/js/newEntity/entity.js'
  ]
};

class NewEntity extends Component {

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
    laydate.render({
      elem: '#activity_trajectory_time',
      range: '~'
    })
  }

  render() {

    return (
      <div>

        <section id="entity-main">   
          <section id="entity-info">
            <div className="entity-title">
              <h4>对象信息</h4>
              <img src="../image/entity/title-block-left.svg" />
              {/* <div className="entity-oprate">
                <button className="icon-earth-blue" id="entity_map"></button>
                <button className="icon-topology" id="entity_topo"></button>
              </div> */}
            </div>
            <div className="entity-content"> 
              <div className="title-tabs"></div>
              <div className="tab-content">
                <table className="table-max">
                  <tbody>

                  </tbody>
                </table>
              </div>              
            </div>
            <div className="entity-relateTable">
              <div className="title-tabs"></div>
              <div className="tab-content">
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
                <ul className="topo-filter-ul"></ul>
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
                  <div className="container">

                  </div>
                </div>
              </div>
            </div>
          </section>
          <div id="entity-shade">
            <div id="entity-alert">
              <ul className="alert-content">
                
              </ul>
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

NewEntity.epmUIPage = page;

module.exports = NewEntity;