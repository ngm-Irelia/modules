import React, { Component } from 'react';
import { context } from 'epm-ui';
import { Header, Filter, MakeEntity, PageAlert, SearchHistory, MatchableSearchBar } from '../../build/components/magicube';

const url = '/magicube';

const page = {
  title: '搜索列表',
  css: [
    '/css/searchlist/searchlist.css'
  ],
  js: [
    '/js/public/watermask.js',
    '/js/public/utils.js',
    '/js/public/laydate/laydate.js',
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
    '/js/searchlist/searchlist.js'
  ]
};

class SearchList extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      languageState: [
        {
          value: "全部语言",
          checked: true
        },
        {
          value: "仅简体中文",
          checked: false
        },
        {
          value: "仅英文",
          checked: false
        }
      ],
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
      ],
      classifyData: []
    }
    this.getCookie = this.getCookie.bind(this);
  }

  componentDidMount() {
    $("#searchlist_main_content").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });

    $("#go_searchlist").addClass("selectBar_selected")//让头部图标高亮
    fetch( url + '/search/metadata?type=search' )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      this.setState( {
        classifyData: data//这个接口拿到了分类下具体分类的属性
      } )
    } );
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

    // let left_ = ($("#searchList_main_search").width()-532)/2+548;
    let left_ = ($("#searchList_main_search").width()-428)/2+436;
    $(".search_history_box").css("left",left_+"px");

  }

  getCookie(name){
    var arr, reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
  }

  handleChangeLanguage ( index ) {
    const languageState = this.state.languageState.map( ( item, _index ) => {
      item.checked = index === _index ? true : false;
      return item;
    } );

    this.setState( {
      languageState
    } );
  };

  handleChangeSet ( index ) {//此为高级搜索里的
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

  render() {
    return (
      <div>

        <Header />
        <PageAlert /> 
        <MakeEntity />
        <SearchHistory showPane={false} inPage="searchlist"/>

        <div id="searchList_main">
          <div id="searchList_main_search">
            <div id="searchList_search_box">
              {/*<input type="text" id="searchLsit_search_input" autoFocus="autoFocus"/>*/}
              <MatchableSearchBar />
              <button type="button" id="searchLsit_search_btn">
                <div className="icon-button">
                  <span className="path1"/>
                  <span className="path2"/>
                  <p>搜索 </p>
                </div>
              </button>
              {/*<button type="button" id="searchLsit_search_advancedBtn">*/}
                {/*<div className="icon-button">*/}
                  {/*<span className="path1"/>*/}
                  {/*<span className="path2"/>*/}
                  {/*<p>高级搜索 </p>*/}
                {/*</div>*/}
              {/*</button>*/}
            </div>
          </div>
            <ul id="searchList_main_tab">
              {/*<li className="searchlist_tab searchlist_tab_all">
                <span id="search_all" className="parent_classify tab_active" data-key="All">全部</span>
              </li>
              <li className="searchlist_tab searchlist_tab_entity">
                <span className="parent_classify" data-key="Entity">实体</span>
                <i id="entity_more" className="child_classify_more" data-key="open">...</i>
              </li>
              <li className="searchlist_tab">
                <span className="parent_classify" data-key="Event">事件</span>
                <i id="event_more" className="child_classify_more" data-key="open">...</i>
              </li>
              <li className="searchlist_tab">
                <span className="parent_classify" data-key="Document">文档</span>
                <i id="document_more" className="child_classify_more" data-key="open">...</i>
              </li>*/}
            </ul>

          <div id="searchlist_main_content">
            <div id="searchList_main_box">
              <div id="searchlist_loading">
                <img src={ this.state.loadingUrl }/>
              </div>
            </div>
            <div id="searchlist_nomessage" className="icon-notfind"></div>
          </div>
          <div id="searchlist_pagination_box">
            <div id="searchlist_pagination"></div>
          </div>
        </div>
        <div id="search_shade">
          <div id="advanceSearch_box">
            <div id="advanceSearch_search">
              <h6 className="advance_search_title">检索内容</h6>
              <input type="text" id="advance_search_value" placeholder="请输入检索内容"/>
              
            </div>
            <ul id="advance_search_condition">
              <li>
                <h6 className="advance_search_title">时间设定</h6>
                <div id="advance_search_time" className="advance_search_box">
                  <div className="clandar_box">
                    <input type="text" id="search_time" placeholder="请选择时间范围" readOnly/>
                    <button className="icon-calendar-cute" type="button" id="search_time_btn" data-parent="advanceSearch_box"></button>
                  </div>
                </div>
              </li>
              <li>
                <h6 className="advance_search_title">内容设定</h6>
                <div id="advance_search_set" className="advance_search_box">
                  {
                    this.state.setState.map( ( item, index ) => {
                      return (
                        <div key={ index } className="search_conditions">
                          <input className="icon-check-square-o" type="checkbox" checked={ item.checked } onChange={ this.handleChangeSet.bind( this, index ) }/>
                          { item.value }
                        </div>
                      )
                    } )
                  }
                </div>
              </li>
              <li>
                <h6 className="advance_search_title">范围设定</h6>
                <input type="text" id="advance_search_map_value" placeholder="请填写检索对象的地理区间(范围是搜选区间10km半径范围)" />
                <div className="advance_search_map searchlist_searchMap_width_default" id="searchMap">
                </div>  
                <div className="search_map_operate">
                  <div className="search_map_return">返回</div>
                  <div className="search_map_clear" style={{ 'display': 'none' }}>
                    <p style={{ 'display': 'none' }}>清屏</p>
                  </div>
                  <div className="search_map_area circle circle_hover">
                    <p style={{ 'display': 'none' }}>圆形选区</p>
                  </div>
                  <div className="search_map_area square">
                    <p style={{ 'display': 'none' }}>方形选区</p>
                  </div>
                </div>              
                
              </li>
              <Filter url={ context.url + '/search/advancedsearch' }/>

              <li>
                <h6 className="advance_search_title">业务类型</h6>
                <div id="advance_search_object" className="advance_search_box">
                  <input type="text" id="advance_search_business" placeholder="请输入业务类型..."/>
                </div>
                <p id="advance_business_description">制定搜索，只能找指定业务类型搜索；如：话单，住宿，行车等</p>
              </li>
            </ul>
            <div className="advanceSearch_button">
              <button type="button" id="advance_search_ensure">确认检索</button>
              <button type="button" id="advance_search_cancel">取消检索</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

SearchList.epmUIPage = page;

module.exports = SearchList;
