import React, { Component } from 'react';
import { Header, PageAlert } from '../../build/components/magicube';

const page = {
  title: '事件详细',
  css: [
    '/css/event/event.css'   
  ],
  js: [
    '/js/public/watermask.js',
    '/bower_components/d3/d3.min.js',
    '/js/public/relation.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/event/event.js'
  ]
};

class Event extends Component {
  constructor(props) {
    super(props);
  }

  // componentDidMount() {
  //   // 基本信息绑定滚动条
  //   $("#event_message_box").mCustomScrollbar({
  //     theme: Magicube.scrollbarTheme,
  //     autoHideScrollbar: true
  //   });
  // }

  render() {

    return (
      <div>

        <Header />
        <PageAlert />
        <section id="event_main">
          <section id="event_base">
            <div className="event_title">
              <h3>基本信息</h3>
              <div className="event_title_border"/>
              <span id="event_option" className="icon-edit-blue"/>
            </div>
            <div id="event_message_box"/>
          </section>
          <section id="event_relate">
            <div className="event_title">
              <h3>相关事件</h3>
              <div className="event_title_border"/>
            </div>
            <div id="event_relate_tab_mes">
              <div id="event_relate_optBox">
                <div className="event_relate_opt event_relate_active">
                  <span className="icon-check-circle-o-blue"/>
                  <span>默认</span>
                </div>  
                <div className="event_relate_opt">
                  <span className="icon-align-justify"/>
                  <span>详细</span>
                </div>
                <div className="event_relate_opt">
                  <span className="icon-relation-map"/>
                  <span>关系图</span>
                </div>                
              </div>
              <div id="event_relateMes" className="entity_relate_box">
                <div className="event_relateMes_box">
                  <h6><span className="event_icon"/>相关实体（人、地、物、组）</h6>
                  <div className="event_relateMes_contents">
                  </div>
                </div>
                <div className="event_relateMes_box">
                  <h6><span className="event_icon"/>相关事件</h6>
                  <div className="event_relateMes_contents">
                  </div>
                </div>
                <div className="event_relateMes_box">
                  <h6><span className="event_icon"/>相关文档</h6>
                  <div className="event_relateMes_contents">
                  </div>
                </div>
              </div>
              <div id="event_relateDetail" className="entity_relate_box">
                <table id="relate_detail_tableMes">
                  <thead>
                    <tr>
                      <th>对象类型</th>
                      <th>标签</th>
                      <th>类别</th>
                      <th>关系</th>
                    </tr>
                  </thead>
                  <tbody/>
                </table>
              </div>
              <div id="event_topo" className="entity_relate_box"/>
            </div>
          </section>

          <section id="event_trend">
            <div className="event_title">
              <h3>事件趋势</h3>
              <div className="event_title_border"/>
            </div>
            <div id="event_trend_box">
              <ul>
                <li className="event_trend_tab_tit trend_tab_active">过程</li>
              </ul>
              <div className="event_trend_tab_mes trend_mes_active">
                <div id="trend_mes_content">
                  <div id="content_scroller">
                  
                  </div>
                </div>
              </div>
              {/*<div className="event_trend_tab_mes">*/}
                {/*<ol>*/}
                  {/*<li>*/}
                    {/*<div className="event_trend">*/}
                      {/*<p>腾讯成立了</p><b className="icon-virtualarrows">起因</b>*/}
                    {/*</div>*/}
                    {/*<span className="happen">已发生</span>*/}
                  {/*</li>*/}
                  {/*<li>*/}
                    {/*<div className="event_trend">*/}
                      {/*<p>微信投入使用</p><b className="icon-virtualarrows>发展</b>*/}
                    {/*</div>*/}
                    {/*<span className="happen">已发生</span>*/}
                  {/*</li>*/}
                  {/*<li>*/}
                    {/*<div className="event_trend">*/}
                      {/*<p>微信和QQ合并</p><b className="icon-virtualarrows>经过<i>结果</i></b>*/}
                    {/*</div>*/}
                    {/*<span>未发生</span>*/}
                  {/*</li>*/}
                  {/*<li>*/}
                    {/*<div className="event_trend">*/}
                      {/*<p>腾讯倒闭了</p>*/}
                    {/*</div>*/}
                    {/*<span>未发生</span>*/}
                  {/*</li>*/}
                {/*</ol>*/}
              {/*</div>*/}
            </div>
          </section>
        </section>
      </div>
    );
  }

}

Event.epmUIPage = page;

module.exports = Event;