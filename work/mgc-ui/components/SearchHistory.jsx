import React, { Component } from 'react';
let mark_ = false;

class HistoryHead extends Component {
  constructor(props) {
    super(props);
  }

  onSearchKeywordChange(e) {
    this.props.onSearchKeywordChange(e.target.value);
  }

  render() {
    return (
      <div className="search_history_head">
        <h4>{this.props.historyTitle}</h4>
        检索关键字：<input type="text" onChange={this.onSearchKeywordChange.bind(this)} value={this.props.inputText}/>
      </div>
    );
  }
}

class HistoryItem extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const value = $(e.target).text();
    localStorage.setItem('s_keyword', value.trim());
    location.href = '/searchlist' + '?keyword=' + encodeURIComponent(value.trim());
  }

  render() {
    const {historyItem, historyNumber} = this.props;
    return (
      <li>{historyNumber + 1 + '、 '}
        <span className="history_item_user">{historyItem.realName} </span>
        在 <span className="history_item_time">{historyItem.operateTime} </span>
        检索了 <a
          onClick={this.handleClick.bind(this)}
          className="history_item_keyword">{historyItem.detail}</a>
      </li>
    );
  }
}

class HistoryList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {historyList, inputText} = this.props;
    const lis = [];

    historyList.forEach((item, index) => {
      if(!item.detail) {
        return;
      }
      if(item.detail.indexOf(inputText) === -1) {
        return;
      }

      lis.push(<HistoryItem historyItem={item} historyNumber={index} key={item.id}/>)
    });
    return (
      <div className="ul_wrapper"><ul>{lis}</ul></div>
    );
  }
}

class HistoryFooter extends Component {
  constructor(props) {
    super(props);
  }
   // 共 {this.props.totalCount} 条记录
  render() {
    return (
      <p></p>
    );
  }
}

class SearchHistoryBox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let boxInnerHtml = '';
    if (this.props.inPage === 'index') {
      boxInnerHtml = <div className="search_history_box" onClick={this.props.onSearchHistoryToggle}>
       <span> {/*className="icon-search-blue"*/}
          <a> {this.props.boxTitle}</a>
          <span className='arrow_btn_br'>↖</span>
       </span>
      </div>
    }else {
      boxInnerHtml = <div className="search_history_box" onClick={this.props.onSearchHistoryOpen}>
        <span className="icon-button">
          <span className="path1"/><span className="path2"/>
          <a> {this.props.boxTitle}</a>
          </span>
        </div>;
    };


    return (
      <div>
        {boxInnerHtml}
      </div>
    );
  }
}

class SearchHistoryPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: ''
    };

    this.handleSearchKwChange = this.handleSearchKwChange.bind(this);
  }

  handleSearchKwChange(value) {
    this.setState({
      inputText: value
    });
  }

  render() {
    const {historyList, showSearchHistory} = this.props;

    return (
      <div className="search_history" style={{display: showSearchHistory}}>
        <span className="search_history_close" onClick={this.props.onSearchHistoryClose}>
          <i className="cross_icon icon-delete-blue"/>
        </span>
        <HistoryHead
          historyTitle="检索历史记录"
          inputText={this.state.inputText}
          onSearchKeywordChange={this.handleSearchKwChange}
        />
        <HistoryList
          historyList={historyList.content || []}
          inputText={this.state.inputText}
        />
        <HistoryFooter totalCount={historyList.totalElements}/>
      </div>
    );
  }
}

class SearchHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historyList: [],
      showSearchHistory: 'none'
    };

    this.handleHistoryClose = this.handleHistoryClose.bind(this);
    this.handleHistoryOpen = this.handleHistoryOpen.bind(this);
    this.handleHistoryToggle = this.handleHistoryToggle.bind(this);
  }

  handleHistoryClose() {
    this.setState({
      showSearchHistory: 'none'
    });
  }

  handleHistoryOpen() {
    fetch( EPMUI.context.url + '/log/useroperate/operatedetail?pageNo=0&pageSize=100', {credentials: 'include'} )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        const dataSource = data;
        this.setState({
          historyList: dataSource || {},
          showSearchHistory: 'block'
        }, () => {
          //初始化滚动条
          $(".search_history .ul_wrapper").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          });
        });
      } );
  }

  componentDidMount(){
    const showPane = this.props.showPane;
 
    if (showPane) {
      this.handleHistoryOpen();
    }
  }

  handleHistoryToggle(){
    mark_ = !mark_;
    if(mark_){
      this.handleHistoryOpen();
      $('.arrow_btn_br').text('↘');
    }else{
      this.handleHistoryClose();
      $('.arrow_btn_br').text('↖');
    }
  }

  render() {
    return (
      <div className="searchlistBox">
        <SearchHistoryBox
          boxTitle="搜索历史"
          inPage={this.props.inPage}
          onSearchHistoryOpen={this.handleHistoryOpen}
          onSearchHistoryToggle={this.handleHistoryToggle}
        />
        
        <SearchHistoryPane
          historyList={this.state.historyList}
          showSearchHistory={this.state.showSearchHistory}
          onSearchHistoryClose={this.handleHistoryClose}
        />
      </div>
    );
  }
}

export default SearchHistory;
export { SearchHistory }