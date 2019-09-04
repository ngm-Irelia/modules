import React, {Component} from 'react';

const page = {
  js: [
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
  ]
};

class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selectOpen: false,
        selectProperty: this.props.selectProperty,
        selectValue: this.props.selectValue,
        selectTitle:this.props.selectTitle, //默认的文字提示
        selectOptionData: [],
        inputDisplay:"block", //文字提示显示隐藏
        isFocus:false
    };
    this.hideOptionLists = this.hideOptionLists.bind( this );
    this.handleChangeValue = this.handleChangeValue.bind( this );
    this.handleBlurValue = this.handleBlurValue.bind( this );
    this.handleKeyUpValue = this.handleKeyUpValue.bind(this);
  }

  getSelectOptionData(optionData){
    let dataSource = [];
    if(!optionData || optionData.length === 0) {
      this.setState({
        selectOpen: false,
        selectOptionData: dataSource
      });
    } else if (!Array.isArray(optionData) && typeof optionData !== "string") {
      this.setState({
        selectOpen: false,
        selectProperty: optionData.systemName,
        selectValue: optionData.displayName,
        selectOptionData: dataSource,
        inputDisplay:"none"
      });
    // 请求数据填充
    } else if (typeof optionData === "string") {
      fetch(this.props.dataSource)
        .then((response) => response.json())
        .then((data) => {
          dataSource = data;
          dataSource.sort((a,b) =>
            a.displayName.length > b.displayName.length ? 1 : -1
          );
          if(!this.props.hasAll){
              dataSource.unshift({
                systemName:"ALL",
                displayName:"全部"
              });
          }
          this.setState({
              selectOptionData: dataSource,
              selectOpen: false
          });
      });
    } else {
      dataSource = optionData;
      dataSource.sort((a,b) => 
        a.displayName.length > b.displayName.length ? 1 : -1
      );
      this.setState({
        selectOptionData: dataSource,
        selectProperty: this.props.selectProperty,
        selectValue: this.props.selectValue,
        inputDisplay:"block",
        isFocus:false
      });
    }
  }

  componentDidMount() {
    this.getSelectOptionData( this.props.dataSource );
    document.addEventListener( 'click', this.hideOptionLists, false );
    $(".confirmed").on('click',() => {
      this.setState({
        selectProperty: this.props.selectProperty,
        selectValue: this.props.selectValue,
        inputDisplay:"block",
        isFocus:false
      });
    })
    $(".canceled").on('click',() => {
      this.setState({
        selectProperty: this.props.selectProperty,
        selectValue: this.props.selectValue,
        inputDisplay:"block",
        isFocus:false
      });
    })
  }

  componentWillReceiveProps( nextProps ) {
    if(this.props.dataSource !== nextProps.dataSource || this.props.count !== nextProps.count) {
      this.getSelectOptionData( nextProps.dataSource );
    }
  }

  hideOptionLists(ev) {
    if(ev.target !== document.getElementById( this.props.parentId ) && ev.target !== document.getElementById(this.props.selectId)){
      if (this.state.selectProperty == 'null') {
        this.setState({
          selectProperty: this.props.selectProperty,
          selectValue: this.props.selectValue,
          inputDisplay:"block"
        });
      }
      this.setState({
        selectOpen: false,
        isFocus:false
      });
    }
  }

  handleChangeValue(){
    //没有选择数据，就检测父组建是否有事件
    if (!this.state.selectOptionData || this.state.selectOptionData.length === 0) {
        this.props.onClick ? this.props.onClick() : null;
    } else {
      this.props.onClick ? this.props.onClick() : null;
      this.setState({
        selectOpen: true
      },() => {
        $(this.refs.selectList).mCustomScrollbar({
          theme: Magicube.scrollbarTheme,
          autoHideScrollbar: true
        });
      });
    }
    this.setState({
      isFocus:true
    });
    this.props.showInput === 'true' ? this.refs.input.focus() : null;
  }

  handleBlurValue(){
    if (this.refs.input.value){
      this.setState({
        selectOpen: false,
        selectProperty: this.refs.input.value,
        selectValue: this.refs.input.value,
        inputDisplay:"none",
        isFocus:false
      });
    }
    this.refs.input.value = '';
    this.refs.input.removeAttribute("style");
  }

  handleKeyUpValue(){
    const inContent = this.refs.input.value;
    if (inContent.length) {
      this.refs.input.style.width = inContent.length * 12 + 'px';
    } else {
      this.refs.input.removeAttribute("style");
    }
    this.setState({
      selectOpen: false,
      selectProperty: this.props.selectProperty,
      selectValue: this.props.selectValue,
      inputDisplay:"none"
    });
  }

  handleSelectProperty(obj){
    this.setState({
      selectOpen: false,
      selectProperty: obj.systemName,
      selectValue: obj.displayName,
      inputDisplay:"none",
      isFocus:false
    });
    this.props.onHandleSelect ? this.props.onHandleSelect(obj) : null;
  }

  render(){
    const { selectProperty, selectOpen, selectValue, selectOptionData ,inputDisplay, selectTitle,isFocus} = this.state;
    return (
      <div className="select_main_box">
          <div className={["selectParent_elemnt_box",isFocus ? "selectParent_elemnt_box_selset" : null].join(" ")} id={"div_" + this.props.selectId}>
            <p className="selectParent_elemnt_title" style={{"display":inputDisplay}}>{selectTitle}</p>
            <p className="selectParent_elemnt_select_content" data-type={selectProperty} id={this.props.selectId} onClick={this.handleChangeValue}>{selectValue}</p>
            {this.props.showInput === 'true' ? <input ref="input" className="selectParent_input" id={"input_"+this.props.selectId} autoComplete="off" onBlur={this.handleBlurValue} onKeyUp={this.handleKeyUpValue}/> : ''}
          </div>
        {
          selectOpen && selectOptionData.length
          ?
          <div className="select_list_box" ref="selectList">
            {
              selectOptionData.map( ( item, index ) => {
                return(
                  <p key={ index } className="select_type_list" id={this.props.parentId} onClick={ this.handleSelectProperty.bind( this, item ) }>{ item.displayName }</p>
                )
              })
            }
          </div>
          :
          ""
        }
      </div>
    );
  }
}
Select.defaultProps = {
  hasAll: false
};

export default Select;
export { Select };
