import React, { Component } from 'react';
import { Select } from './select';

const page = {
  js: [
    '/js/public/jquery-custom-content-scroller/jquery.mCustomScrollbar.concat.min.js',
  ]
};

const initType = {
  systemName: "null",
  displayName: "请选择..."
};

/* 创建实体的组件 */
class MakeEntity extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      dataSource: [],
      firstData: [],
      secondData: [],
      selectedIndex: 1,
      defalutValue:"请选择..."
    }
  }

  componentDidMount() {
    /* 获取创建组建时对应的参数 */
    fetch( EPMUI.context.url + '/document/objecttypeproperty' )
      .then( ( res ) => res.json() )
      .then( ( data ) => {
        const firstData = [];
        data[ 1 ].node.forEach( ( item, index ) => {
          if( item.property.length !== 0 ) {
            firstData.push( item );
          }
        } );
        this.setState( {
          dataSource: data,
          firstData: firstData
        } );
      } );
    
               
    $("#make_detail_box").mCustomScrollbar({
      theme: Magicube.scrollbarTheme,
      autoHideScrollbar: true
    });
  }

  componentWillUpdate(){
    let $makeDetail = $("#make_detail_box");
    try{
       !!$makeDetail.data("mCS") && $makeDetail.mCustomScrollbar("destroy"); //Destroy
    }catch (e){
       $makeDetail.data("mCS",''); //手动销毁             
    } 
  }

  /* 如果名字用户已输入，则隐藏错误提示 */
  handleBlurName(ev){
    if( !!ev.target.value ) {
      this.nameError.style.display = "none";
    }
  }

  /* 实体事件之间的切换 */
  handleChangeData( index ) {
    /* 如果当点的tab索引等于点击事件的索引，返回false */
    if( this.state.selectedIndex === index ) {
      return null;
    }
    /* 根据index获取对应类型的所有第二级数据 */
    const dataSource = this.state.dataSource;
    const firstData = [];
    dataSource[ index ].node.forEach( ( item, index ) => {
      if( item.property.length !== 0 ) {
        firstData.push( item );
      }
    } );
    this.setState( {
      firstData: firstData,
      secondData:  [],
      selectedIndex: index,
      defalutValue: "请选择..."
    } );
  }

  /* select抛出的index用来获取对应的详细属性 */
  handleSelect( index ) {
    //if( index !== 0 ) {
      //this.typeError.style.display = "none";
    //}
    // this.setState( {
    //   secondData: index === 0 ? [] : this.state.firstData[ index ].property
    // } );
    this.setState( {
      secondData: index.property
    },()=>{
      $(this.refs.tableBody).mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    })
  }

  /* 点击确定按钮，初始化数据 */
  handleInitContent() {
    // const dataSource = this.state.dataSource;
    // const firstData = [ initType ];
    // dataSource[ 1 ].node.forEach( ( item, index ) => {
    //   if( item.property.length !== 0 ) {
    //     firstData.push( item );
    //   }
    // } );
    // debugger
    // this.setState( {
    //   firstData: firstData,
    //   secondData:  [],
    //   selectedIndex: 1
    // } );
  }

  handleWhetherSync(){
    if($("#add_topo_checkbox").prop( "checked" ) === true){
      $("#add_topo_checkbox").addClass('icon-dot-circle').removeClass('icon-nodot-circle-o');
    }else{
      $("#add_topo_checkbox").addClass('icon-nodot-circle-o').removeClass('icon-dot-circle');
    }
  }
  render() {
    return (
      <div id="document_modal">
          <h3 id="make_title">请为所选内容创建相关信息</h3>
          {/* 根据selectIndex的值设置实体和事件的高亮 */}
          <span className={`document_makeEntity_tab ${ this.state.selectedIndex === 1 ? "make_active" : "" }`} data-type="entity" onClick={ this.handleChangeData.bind( this, 1 ) } id="make_entity">实体</span>
          <span className={`document_makeEntity_tab ${ this.state.selectedIndex === 0 ? "make_active" : "" }`} id="make_event" data-type="event" onClick={ this.handleChangeData.bind( this, 0 ) }>事件</span>
          <div id="make_box">
            <div className="make_pro_box">
              <h5>对象属性</h5>
              <div className="make_pro">
                <span>名称</span>
                <input id="make_label" onBlur={ this.handleBlurName.bind( this ) } type="text" autoComplete='off' />
                <span ref={ ( span ) => this.nameError = span } className="error">*</span>
              </div>
              <div className="make_pro">
                <span>类型</span>
                <Select
                  dataSource={ this.state.firstData }
                  selectId="makeEntity_type"
                  parentId="makeEntity_type_list"
                  selectProperty = "null"
                  selectValue=""
                  selectTitle="请选择类型..."
                  showInput="false"
                  onHandleSelect={ this.handleSelect.bind( this )}
                />
              </div>
            </div>
            <div className="make_pro_box">
              <h5>基本属性</h5>
              <div id="make_detail_box" ref="tableBody">
                {                 
                  this.state.secondData.length !== 0
                  ?
                    <table id="make_base_property">
                      <tbody>
                      {
                        this.state.secondData.map( ( item, index ) => {
                          return (
                            <tr key={ index }>
                              <td>{ item.displayName }</td>
                              <td className="make_detail_list" data-type={ item.systemName } contentEditable={ true }></td>
                            </tr>
                          )
                        })
                      }
                      </tbody>
                    </table>
                    :
                    <p className="make_detail_tip">请先选择对象类型</p>
                }
              </div>
            </div>
            <div id="make_sync_box">
              <label id="add_topo" onClick={ this.handleWhetherSync.bind( this ) }>
                <input type="checkbox" id="add_topo_checkbox" className="icon-nodot-circle-o" />
                对象同步到控制台
              </label>
            </div>
            <div id="make_opt_box">
              <button className="opt_active" id="make_ensure" onClick={ this.handleInitContent.bind( this ) }>确定</button>
              <button id="make_cancel">取消</button>
            </div>
          </div>
      </div>
    );
  }
}

export default MakeEntity;
export { MakeEntity }