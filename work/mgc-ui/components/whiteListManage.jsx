import React, { Component } from 'react';

const page = {
  js: [
    '/js/public/DateUtils.js',    
    '/js/public/laydate/laydate.js'
  ]
};

let dataID = [] ;
let dataIDCard = '';
let idObj = {};

class DataList extends Component{
  constructor( props ) {
    super (props);

    this.state = {
    }

    this.handleDeleteList = this.handleDeleteList.bind(this);
    this.handleClick = this.handleClick.bind(this);
   
  }  

  handleDeleteInit(e){
    dataID = []; 
    dataID.push( Number( e.target.parentNode.parentNode.getAttribute('data-props') ));
    dataIDCard =  e.target.parentNode.parentNode.getAttribute('data-idCard');
    idObj = { 'id': dataIDCard }; 
    $("#deleteSuccessTip").show();
  }

  handleDeleteList (e) {
    //删除es里的
    fetch( EPMUI.context.url+'/whitelist/deletewl',{
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
      body: 'id=' + dataIDCard
    })
    .then( ( response) => response.json() )
    .then( (data) => {        
    })
    //删除mysercel
    fetch( '/magicube/whitelist/delete',
      {method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(dataID)
      })
      .then( ( response) => response.json() )
      .then( (data) => {

        fetch( '/magicube/whitelist/list',
          {method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(this.state.param)
          })
          .then( ( response) => response.json() )
          .then( (data) => {
            this.props.setDataDataSource(data.magicube_interface_data.content)
            $("#deleteSuccessTip").hide();
            // setTimeout(function(){ $("#deleteSuccessTip").hide() } ,1600)
          })

      } )
  }

  handleClick (e) {
    
    if( $(".wlmCheck").length === $(".wlmCheck:checked").length ) {
      $("#wlmCheckAll").prop( "checked", true );
      $("#wlmCheckAll").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
      e.target.setAttribute('class','wlmCheck icon-check-square-o');
      e.target.parentNode.parentNode.setAttribute('class','style_checked');
    } else {
      $("#wlmCheckAll").prop( "checked", false );
      $("#wlmCheckAll").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
      if(e.target.checked==true){
        //e.target.addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        e.target.setAttribute('class','wlmCheck icon-check-square-o');
        e.target.parentNode.parentNode.setAttribute('class','style_checked');
      }else{
        e.target.setAttribute('class','wlmCheck icon-square-o-blue');
        e.target.parentNode.parentNode.setAttribute('class','style_nochecked')
      } 
    }
  }
  
  handleDeleteCancel(e){
    e.target.parentNode.style.display='none';
  }

  componentDidMount(){
    fetch( '/magicube/whitelist/list',
        {method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(this.props.param)
        })
        //.then( JSON.stringify(this.state.param) )
        .then( ( response) => response.json() )
        .then( (data) => {
          this.props.setDataDataSource(data.magicube_interface_data.content)
        })
   }

  render(){
    const {dataSource} = this.props;
    let trs = [];

    dataSource.map(function (item,i) {
        return trs.push(<tr data-props={item.id} data-idCard={item.idCard} key={item.id}>
        <td><input type='checkbox' className='icon-square-o-blue wlmCheck' onClick={this.handleClick.bind(this)}/>{i+1}</td>
            <td>{item.name}</td>
            <td>{item.idCard}</td>
            <td>{item.updateTime}</td>
            <td><span className='icon-eye wlm_detail' /></td>
            <td><span className='icon-delete wlm_delete' onClick={this.handleDeleteInit.bind(this)}/></td>
             </tr>);
        },this );

    return (
      <div className="wlm_list">
        <div id='deleteSuccessTip'>
          <h4>删除</h4>
          <p>确定删除吗？</p>
          <button id='dstSure' onClick={this.handleDeleteList.bind(this)}>确定</button>
          <button id='dstCancel' onClick={this.handleDeleteCancel.bind(this)}>取消</button>
        </div>
        <table className='wlm_table_body'>
          <tbody className='wlm_table_body_tbody'>
          {trs}
          </tbody>
        </table>
      </div>
    )}

}


class WhiteListManage extends Component{

  constructor( props ) {
    super (props);

    this.state = {  
      addPersonShow: 'none', 
      idCardErrorTip:'none'
    }

    this.handleCheckAll = this.handleCheckAll.bind(this);
    this.handleConditionSearch = this.handleConditionSearch.bind(this);
    this.handleAddPersonOpen = this.handleAddPersonOpen.bind(this);
    this.handleAddCancel = this.handleAddCancel.bind(this);
    this.handleAddSure = this.handleAddSure.bind(this);
    this.handleVerifyIdCard = this.handleVerifyIdCard.bind(this);

  }
 
  handleCheckAll(e){
    if( e.target.checked === true ) {
        $(".wlmCheck").prop("checked", true);
        $("#wlmCheckAll").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        $(".wlmCheck").addClass('icon-check-square-o').removeClass('icon-square-o-blue');
        //$(".wlmCheck").parent().parent().addClass('style_checked').removeClass('style_nochecked');
      } else {
        $(".wlmCheck").prop("checked", false);
        $("#wlmCheckAll").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
        $(".wlmCheck").addClass('icon-square-o-blue').removeClass('icon-check-square-o');
        //$(".wlmCheck").parent().parent().addClass('style_nochecked').removeClass('style_checked');
      }
  }
  
  onSearchContentChange(e){
    this.props.setDataSearchKeyWord(e.target.value)    
  }

  onSearchTimeChange(e){
    this.props.setDataSearchTimeRange(e.target.value);
  }

  handleConditionSearch(){
    let time_ = $("#wlmTimeSet").val();
    this.props.setDataSearchTimeRange(time_); 
    fetch( '/magicube/whitelist/search',
        {method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
          body: 'keyWord=' + this.props.searchKeyWord+'&timeRange='+time_
                +'&pageNo='+this.props.pageNo+'&pageSize='+this.props.pageSize
        })
        .then( ( response) => response.json() )
        .then( (data) => {
          this.props.setDataDataSource(data.magicube_interface_data.content);
        })
  }
  
  // handleDeleteAll(){
  //   $("#wlmCheck:checked").each();
  // }  
  handleAddPersonOpen(){
    this.setState({
      addPersonShow:'block'
    })
  }

  handleVerifyIdCard(e){
    var regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
    if(!regIdNo.test(e.target.value)){
      this.setState({
        idCardErrorTip:'block'
      }) 
    }else{
      this.setState({
        idCardErrorTip:'none'
      }) 
    }
    
  }

  handleAddSure(){

    fetch( '/magicube/whitelist/add',
        {method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(this.props.param)
        })
        //.then( JSON.stringify(this.state.param) )
        .then( ( response) => response.json() )
        .then( (data) => {
          this.props.setDataDataSource(data.magicube_interface_data.content)
        })

    this.setState({
      addPersonShow:'none'
    })
  }

  handleAddCancel(){
    this.setState({
      addPersonShow:'none'
    })
  }

  render(){
    const {addPersonShow, idCardErrorTip} = this.state;
    return (
      <div className='wlm'>
        <div className='wlm_nav'>
          <span>搜索内容</span>
          <input type='text' id='wlmSearchContent' onChange={this.onSearchContentChange.bind(this)} />
          <span>时间设定</span>
          <div>
            <input type='text' id='wlmTimeSet' onChange={this.onSearchTimeChange.bind(this)}/>
            <button type='button' className='icon-calendar-cute' id='wlmTimeSetBtn' ></button>
          </div>
          <span className="wlm_import_btn">导入名单</span>
          <div className='wlm_import_btn'>
            <label className='wlm_import_btn_styl' >请选择文件路径</label>
            <input type='file' id='wlmImportBtn'/>
          </div>
          <button type='button' id='wlmDeleteAllBtn' onClick={this.handleDeleteAll}>全部删除</button>
          <button type='button' id='wlmSearchBtn' onClick={this.handleConditionSearch}>搜索</button>
          <button type='button' id='wlmAddBtn' onClick={this.handleAddPersonOpen}>添加</button>
        </div>
        <div className='wlm_add_person' style={{ display: addPersonShow }}>
          <h4>添加人员至白名单</h4>
          {/*<input type='text'/>
          <button id='addSearchBtn'>搜索</button>
          <div className='reault_list'></div>*/}  
          <label><span>姓名: </span><input type='text' id='addInfoName'/></label>
          <label><span>身份证号: </span><input type='text' id='addInfoIDcard' onBlur={this.handleVerifyIdCard}/></label>
          <button className='add_cancel' onClick={this.handleAddCancel}>取消</button>
          <button className='add_sure' onClick={this.handleAddSure}>添加</button>
          <p className='idcard_errortip' style={{display:idCardErrorTip}}>*身份证号有误</p>
        </div>
        <table className='wlm_table_head'>
          <tbody>
            <tr>
              <td><input type='checkbox' className='icon-square-o-blue' id='wlmCheckAll'  onClick={this.handleCheckAll.bind(this)}/>ID</td>
              <td>姓名</td>
              <td>身份证号</td>
              <td>时间</td>
              <td>查看</td>
              <td>删除</td>
            </tr>
          </tbody>
        </table>
        
        {/*<table className='wlm_table_body'></table>*/}        
      </div>      
      )
  }
    
}


class WhiteListManageOut extends Component {
  constructor(props) {
    super(props);

    this.state = {
      param:{
        pageNo : 0,
        pageSize : 1000000,
      },
      pageNo : 0,
      pageSize : 1000000,  
      searchKeyWord : '',
      searchTimeRange : '',
      dataSource:[]
    }

    this.handleSetDataDataSource = this.handleSetDataDataSource.bind(this);
    this.handleSetDataSearchKeyWord = this.handleSetDataSearchKeyWord.bind(this);
    this.handleSetDataSearchTimeRange = this.handleSetDataSearchTimeRange.bind(this);
  }

  handleSetDataDataSource (dataSource) {
    $(".wlm_list").mCustomScrollbar("destroy");
    this.setState({
      dataSource: dataSource
    }, () => {
      $('.wlm_list ').mCustomScrollbar({
        theme: Magicube.scrollbarTheme,
        autoHideScrollbar: true
      });
    })
  }

  handleSetDataSearchKeyWord (searchKeyWord) {
    this.setState({
      searchKeyWord:searchKeyWord
    })
  }

  handleSetDataSearchTimeRange (searchTimeRange) {
    this.setState({
      searchTimeRange:searchTimeRange
    })
  }

  render() {
    return (
      <div className='wlm_out'>
      {/*前面一个变量指的是父组件中的*/}
      <WhiteListManage 
        setDataDataSource={this.handleSetDataDataSource}
        setDataSearchKeyWord={this.handleSetDataSearchKeyWord}
        setDataSearchTimeRange={this.handleSetDataSearchTimeRange}
        dataSource={this.state.dataSource}
        searchKeyWord={this.state.searchKeyWord}
        searchTimeRange={this.state.searchTimeRange}
        pageNo={this.state.pageNo}
        pageSize={this.state.pageSize}
      />
      <DataList 
      setDataDataSource={this.handleSetDataDataSource}
      dataSource={this.state.dataSource} />
      </div>
    );
  }
}

WhiteListManageOut.epmUIPage = page;

export default WhiteListManageOut;

export { WhiteListManageOut };