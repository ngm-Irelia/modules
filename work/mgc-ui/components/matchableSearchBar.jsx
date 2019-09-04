import React, {Component} from 'react';

class SelectItem extends Component {
  constructor(props) {
    super(props);
  }

  autoMouseDown(e) {
    e.preventDefault();
  }

  click(e) {
    this.props.onSelectItemClick(e.target.getAttribute('value'));
  }

  render() {
    return (
      <li onMouseDown={this.autoMouseDown.bind(this)}
          onClick={this.click.bind(this)}
          value={this.props.selectItem}>
        {this.props.selectItem}
      </li>
    );
  }
}

class SelectItemPane extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    const {selectItems, inputText, paneShow} = this.props;
    const lis = [];
    let filterArr, filterText;

    if(selectItems.length !== 0) {
      filterArr = /\S+$/.exec(inputText);
      filterText = filterArr ? filterArr[0] : '';

      selectItems.forEach((item, index) => {
        // 根据用户输入的关键字从下拉列表中匹配过滤
        if(item.indexOf(filterText) === -1) {
          return;
        }
        lis.push(<SelectItem
          selectItem={ item }
          key={index}
          onSelectItemClick={this.props.onSelectItemClick} />);
      });
    }

    return (
      <div className="ul_wrapper" style={{display: paneShow}} ><ul>{lis}</ul></div>
    );
  }
}

class SearchInput extends Component {
  constructor(props) {
    super(props);
  }

  onSearchInputChange(e) {
    this.props.onSearchInputChange(e.target.value);
  }

  onSearchInputBlur(e) {
    this.props.onSearchInputBlur(e);
  }

  render() {
    return (
      <input type="text"
             className="search_group_input"
             autoFocus="autoFocus"
             value={this.props.inputText}
             onChange={this.onSearchInputChange.bind(this)}
             onBlur={this.onSearchInputBlur.bind(this)}
      />
    );
  }
}

class MatchableSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      selectItems: [],
      paneShow: 'none'
    };

    this.handleSelectItemClick = this.handleSelectItemClick.bind(this);
    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.updateSelectItemPane = this.updateSelectItemPane.bind(this);
    this.handleSearchInputBlur = this.handleSearchInputBlur.bind(this);
    this.initInputText = this.initInputText.bind(this);
  }

  componentDidMount() {
    this.connector = ['AND', 'OR', 'NOT'];
    fetch( EPMUI.context.url + '/metaData/searchPrompt', {credentials: 'include'} )
      .then( ( response ) => response.json() )
      .then( ( data ) => {
        if(data.code === 200) {
          this.dataSource = data.magicube_interface_data || [];
          this.setState({
            selectItems: this.dataSource.field
          }, () => {
            $('.search_group .ul_wrapper').mCustomScrollbar({
              theme: Magicube.scrollbarTheme,
              autoHideScrollbar: true
            });
          });
        }
      } );

    this.initInputText();
    $('.search_group .ul_wrapper').css('display','none');
  }

  initInputText() {
    const keyword = Magicube.keyword || '';
    this.setState({inputText: keyword});
  }

  handleSelectItemClick(value) {
    const inputText = this.state.inputText;

    // /\s+$/ 以空字符结尾（用户未输入，直接从下拉列表选）
    // /\S+$/ 以非空白字符结尾（用户输入一半，然后点击下拉列表）
    if(/\s+$/.test(inputText)) {
      this.setState({ inputText: this.state.inputText + value });
    }else {
      this.setState({ inputText: inputText.replace(/\S*$/, value) });
    }
  }

  handleSearchInputChange(value) {
    this.setState({
      inputText: value.replace(/^\s+|\s+$/g, ' '), // 将过多的空格替换成一个空格
      paneShow: 'block'
    });

    this.updateSelectItemPane(value);
  }

  updateSelectItemPane(value) {
    const inputText = value.replace(/^\s+|\s+$/g, ' ');
    let inputTextArr, lastInputText, secondLastText;

    inputTextArr = inputText.replace(/^\s+|\s+$/g, '').split(/\s+/); // 去掉首尾空格后根据空格分隔
    lastInputText = inputTextArr.length > 0 ? inputTextArr[inputTextArr.length - 1] : '';
    secondLastText = inputTextArr.length >= 2 ? inputTextArr[inputTextArr.length - 2] : '';

    // 更新一组条件的 第一个匹配的下拉列表
    if (/^\s+$/.test(inputText) || /(AND|OR|NOT)\s+$/.test(inputText)) {
      this.setState({
        selectItems: this.dataSource.field || []
      });
    }

    // 更新一组条件的 第二个匹配的下拉列表
    if (/^\s*[^\s]+\s+$/.test(inputText) || /(AND|OR|NOT)\s+[^\s]+\s+$/.test(inputText)) {
      this.setState({
        selectItems: this.dataSource.fieldop[lastInputText] || []
      });
    }

    // 更新一组条件的 第三个匹配的下拉列表
    if (/(=|!=|>|>=|<|<=|is|~|!~)\s+$/.test(inputText)) {
      const value = this.dataSource.values[this.dataSource.valuemap[secondLastText + '#' + lastInputText]];
      this.setState({
        selectItems: value ? value.data : []
      });
    }

    // 更新每组条件之间的连接符
    if (/(=|!=|>|>=|<|<=|is|~|!~)\s+[^\s]+\s+$/.test(inputText)) {
      this.setState({
        selectItems: this.connector
      });
    }
  }

  handleSearchInputBlur() {
    this.setState({
      paneShow: 'none'
    },()=>{
      $('.search_group .ul_wrapper').css('display','none'); 
    });
  }

  render() {
    return (
      <div className="search_group">
        <SearchInput
          inputText={this.state.inputText}
          onSearchInputChange={this.handleSearchInputChange}
          onSearchInputBlur={this.handleSearchInputBlur}
        />
        {/*添加 ul_wapper 为了适应滚动条插件*/}
        <div>
          <SelectItemPane
            selectItems={this.state.selectItems}
            inputText={this.state.inputText}
            paneShow={this.state.paneShow}
            onSelectItemClick={this.handleSelectItemClick}
          />
        </div>
      </div>
    );
  }
}

export default MatchableSearchBar;
export { MatchableSearchBar }