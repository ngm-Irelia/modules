import React, { Component } from 'react';

const page = {
  js: [
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
  ]
};

const initSelectData = {
  firstValue: "请选择...",
  secondValue: "请选择...",
  thirdValue: "请选择...",
  fourthValue: "请输入...",
  classifyProperty: {},
  firstNum: null,
  secondNum: null,
  thirdNum: null,
  dataType: null
};
/* 声明公共请求路径 */
const url = '/magicube';

/* 初始化数据 */
let selectData = Object.assign( {}, initSelectData );
class Filter extends Component {
  constructor ( props ) {
    super( props );
    this.state = {
      dataSource: [],
      firstData: [],
      secondData: [],
      thirdData: [],
      fourthData: "",
      classifyData: [],
      argumentError: "",
      firstShow: false,
      secondShow: false,
      thirdShow: false,
      fourthShow: true
    };
    this.handleClickFirstSelect = this.handleClickFirstSelect.bind( this );
    this.handleClickSecondSelect = this.handleClickSecondSelect.bind( this );
    this.handleClickThirdSelect = this.handleClickThirdSelect.bind( this );
    this.handleChangeFourthSelect = this.handleChangeFourthSelect.bind( this );
    this.handleAddClassify = this.handleAddClassify.bind( this );
    this.selectBoxHide = this.selectBoxHide.bind( this );
  }

  /* 先获取联动数据 */
  componentDidMount() {
    fetch(url + '/search/metadata?type=search')
      .then((response) => response.json() )
      .then((data) => {
        this.setState({
          dataSource: data
        })
      });
    /* 用事件冒泡进行事件委托 */
    document.addEventListener('click', this.selectBoxHide, false);
  }

  /* 选择第一级过滤条件 */
  handleClickFirstSelect( ev ) {
    ev.stopPropagation();
    ev.nativeEvent.stopImmediatePropagation();
    if(!this.state.fourthData ) {
      this.setState({
        argumentError: ""
      })
    }
    selectData.secondValue = "请选择...";
    selectData.thirdValue = "请选择...";
    selectData.fourthValue = "请输入...";
    this.setState({
      firstData: this.state.dataSource,
      fourthData: "",
      firstShow: true,
      secondShow: false,
      thirdShow: false,
      fourthShow: true
    },
    () => {
      $(this.refs.objClassfication).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    })
  }

  /* 选择第二级过滤条件 */
  handleClickSecondSelect(ev) {
    ev.stopPropagation();
    ev.nativeEvent.stopImmediatePropagation();
    if( this.state.firstData.length === 0 ) {
      return null;
    }
    selectData.thirdValue = "请选择...";
    this.setState({
      secondData: this.state.firstData[selectData.firstNum].node.sort((a,b) => {
        return a.displayName.length > b.displayName.length ? 1 : -1;
      }),
      firstShow: false,
      secondShow: true,
      thirdShow: false,
      fourthShow: true,
      fourthData: ""
    }, ()=>{
      $(this.refs.objType).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    });
  }

  /* 选择第三级过滤条件 */
  handleClickThirdSelect(ev) {
    ev.stopPropagation();
    ev.nativeEvent.stopImmediatePropagation();
    if(this.state.secondData.length === 0) {
      return null;
    }
    this.setState({
      thirdData:this.state.secondData[selectData.secondNum].property.sort((a,b) => {
        return a.displayName.length > b.displayName.length;
      }),
      thirdShow: true
    }, ()=>{
      $(this.refs.objParam).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    });
  }

  /* 输入最终属性 */
  handleChangeFourthSelect( ev ) {
    let value = ev.target.value;
    this.setState({
      fourthData: value
    });
  }

  /* 点击添加按钮把选择好的属性添加到虚框中 */
  handleAddClassify() {
    /* 进行是否有输入参数 */
    if(!this.state.fourthData) {
      this.setState({
        argumentError: "请添加参数！"
      });
      return false;
    }

    const calendarRegexp = /^([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))?$/
    /* 如果输入类型是date，进行日期正则匹配 */
    if( selectData.dataType === "date" ) {
      const result = calendarRegexp.test( this.state.fourthData );
      if( !result ) {
        this.setState({
          argumentError: "请按照规定的日期格式填写！"
        });
        return false;
      }
      /* 如果是付典型，长整型进行数字正则匹配 */
    } else if( selectData.dataType === "float" || selectData.dataType === "integer" || selectData.dataType === "long" ) {
      if( !/^(\d+(~\d+)?)$/.test( this.state.fourthData ) && !/^\d+~\d$/.test( this.state.fourthData ) && !/^(>|<|\u5927\u4e8e|\u5c0f\u4e8e)\d+$/.test( this.state.fourthData ) ) {
        this.setState( {
          argumentError: "请按照规定的范围格式填写！"
        } );
        return false;
      }
    }

    /* 如果第三项已选择 */
    if( selectData.thirdValue !== "请选择..." ){
      const classifyData = [].concat( this.state.classifyData );
      /* 拼接添加dom的内容 */
      const classifyText = `${ selectData.firstValue }_${ selectData.secondValue }_${ selectData.thirdValue }_${ this.state.fourthData }`;
      const classifyCondition = Object.assign( {}, selectData.classifyProperty );
      const classifyContent = [ classifyText, classifyCondition ];
      classifyData.push( classifyContent );
      selectData = Object.assign( {}, initSelectData );
      $(this.refs.filterBox).mCustomScrollbar("destroy");
      /* 添加完节点后，初始化state数据 */
      const newClassifyData = this.state.classifyData;
      this.setState({
        firstData: [],
        secondData: [],
        thirdData: [],
        fourthData: "",
        classifyData: newClassifyData.concat(classifyData),
        argumentError: "",
        firstShow: false,
        secondShow: false,
        thirdShow: false,
        fourthShow: true
      },
      () => {
          // 在渲染页面完毕后调用滚动条插件
          $(this.refs.filterBox).mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
          })
      })
    }
  };

  /* 删除数组中的对应的数据，节点会对应改变 */
  handleDeleteClassify(index) {
    const classifyData = this.state.classifyData;
    $(this.refs.filterBox).mCustomScrollbar("destroy");
    this.setState({
      classifyData : classifyData.filter((d,i) => {
        return i !== index;
      })
    },
    () => {
      // 在渲染页面完毕后调用滚动条插件
      $(this.refs.filterBox).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      })
    })
  };

  handleSelectContent( index, num, obj ) {
    switch( num ) {
      /* 选择一级属性，把对应的参数存放在初始化的selectData中 */
      case 0:
        selectData.firstNum = index;  /* 用来获取第二级数据的索引 */
        selectData.firstValue = obj.displayName;  /* 获取选择的内容，进行渲染页面 */
        selectData.classifyProperty.firstProperty = obj.systemName; /* 获取隐藏属性，用于数据提交 */
        this.setState({
          firstShow: false
        });
      break;
      /* 选择二级属性，把对应的参数存放在初始化的selectData中 */
      case 1:
        selectData.secondNum = index; /* 用来获取第三级数据的索引 */
        selectData.secondValue = obj.displayName; /* 获取选择的内容，进行渲染页面 */
        selectData.classifyProperty.secondProperty = obj.systemName;  /* 获取隐藏属性，用于数据提交 */
        this.setState({
          secondShow: false
        });
      break;
      /* 选择三级属性，把对应的参数存放在初始化的selectData中 */
      case 2:
        selectData.thirdNum = index;  /* 用来获取第四级属性的索引 */
        selectData.thirdValue = obj.displayName;  /* 获取选择的内容，进行渲染页面 */
        selectData.fourthValue = obj.tip; /* 获取提示 */
        selectData.classifyProperty.thridProperty = obj.systemName; /* 获取隐藏属性，用于数据提交 */
        selectData.classifyProperty.dataType = obj.dataType;
        selectData.dataType = obj.dataType;
        this.fourth.focus();
        this.setState({
          thirdShow: false,
          fourthShow: false
        });
      break;
    }
  };

  /* 隐藏所有的下拉框中的内容 */
  selectBoxHide() {
    this.setState({
      firstShow: false,
      secondShow: false,
      thirdShow: false
    })
  };
 
  render() {
    return(
      <div className="filter_box">
        <div className="filter_classify_content" ref="filterBox">
          {
            this.state.classifyData.length > 0 ?
            this.state.classifyData.map( ( item, index ) => {
              return (
                  <div key={ index } className="advance_search_detail">
                    <span className="property_value" data-root={ item[1].firstProperty }
                      data-object={ item[1].secondProperty } data-type={ item[1].thridProperty }
                      data-flag={ item[1].dataType }
                    >
                      { item[0] }
                    </span>
                    <strong className="classify_delete icon-close-circle-blue" onClick={ this.handleDeleteClassify.bind( this, index ) }></strong>
                  </div>
              )
            })
            : null
          }
        </div>
        <ul className="network_filter_box">
          <li>
            <h6 className="select_property_title">对象分类</h6>
            <div className="filter_classify_box">
              <p className="filter_classify_placeholder"  onClick={ this.handleClickFirstSelect }>
                {selectData.firstValue}
              </p>
              {
                this.state.firstShow
                  ?
                  <div className="filter_classify_lists" ref="objClassfication">
                    {
                      this.state.firstData.map( ( item, index ) => {
                        return (
                          <p className="filter_classify_list" key={ index }
                           onClick={ this.handleSelectContent.bind( this, index, 0, item ) }>
                            { item.displayName }
                          </p>
                        );
                      } )
                    }
                  </div>
                  :
                  null
              }
            </div>
          </li>
          <li>
            <h6 className="select_property_title">对象类型</h6>
            <div className="filter_classify_box">
              <p className="filter_classify_placeholder" onClick={ this.handleClickSecondSelect }>
                {selectData.secondValue}
              </p>
              {
                this.state.secondShow
                ?
                <div className="filter_classify_lists" ref="objType">
                  {
                    this.state.secondData.map( ( item, index ) => {
                      return (
                        <p className="filter_classify_list" key={ index }
                         onClick={ this.handleSelectContent.bind( this, index, 1, item ) }
                        >
                          { item.displayName }
                        </p>
                      );
                    } )
                  }
                </div>
                :
                null
              }
            </div>
          </li>
          <li>
            <h6 className="select_property_title">对象参数</h6>
            <div className="filter_classify_box">
              <p className=" filter_classify_placeholder" onClick={ this.handleClickThirdSelect }>
                { selectData.thirdValue }
              </p> 
              {
                this.state.thirdShow
                ?
                <div className="filter_classify_lists" ref="objParam">
                  {
                    this.state.thirdData.map( ( item, index ) => {
                      return (
                        <p className="filter_classify_list" key={ index }
                           onClick={ this.handleSelectContent.bind( this, index, 2, item )}>
                          { item.displayName }
                        </p>
                      );
                    })
                  }
                </div>
                :
                null
              }
            </div>
          </li>
          <li>
            <h6 className="select_property_title">参数值</h6>
            <div className="filter_classify_box">
              <input
                ref={ ( input ) => this.fourth = input } readOnly={ this.state.fourthShow }
                type="text" placeholder={ selectData.fourthValue } value={ this.state.fourthData }
                onChange={ this.handleChangeFourthSelect } className="select_property_value"
              />
            </div>
            <span className="filter_error">
              { this.state.argumentError }
            </span>
          </li>
        </ul>
        
        {/* 添加一个属性来做是否需要添加到虚框的判断 */}
        { this.props.hasAddButton
          ?
          <button className="filter_add_btn" onClick={ this.handleAddClassify }>添加</button>
          :
          <button className="filter_add_btn">添加</button>
        }
      </div>
    )
  }

}

Filter.defaultProps = {
  hasAddButton: true
};

export default Filter;
export { Filter };
