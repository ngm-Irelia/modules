import React, { Component } from 'react';

class AuthorityManage extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            selectOpen: false,
            selectProperty: this.props.selectProperty,
            selectValue: '',
            selectOptionData: [],
            allTable:[],
            baseAllTable:[],
            hadeTable:[],
            baseHadeTable:[],
            allTableNum:0,
            hadeTableNum:0,
            changeTable:[],
        };

        this.hideOptionLists          =  this.hideOptionLists.bind( this );
        this.handleChangeValue        = this.handleChangeValue.bind( this );

    }

    getSelectOptionData( optionData ) {
        let dataSource = [];
        if( !optionData || optionData.length === 0 ) {
            return false;
        }
        if( typeof optionData === "string" ){
            fetch( this.props.dataSource )
                .then( ( response ) => response.json() )
                .then( ( data ) => {
                    dataSource = data;
                    if( !this.props.hasAll ) {
                        dataSource.unshift( {
                            systemName: "ALL",
                            displayName: "全部"
                        } );
                    }
                    this.setState( {
                        selectOptionData: dataSource,
                        selectOpen: false,
                        selectValue: dataSource[0].displayName,
                        selectProperty: dataSource[0].systemName
                    } );

                    //运行请求
                    let obj = {
                        systemName: this.state.selectProperty,
                        displayName: this.state.selectValue
                    };
                    this.handleSelectProperty("a", obj);
                } );
        } else {
            dataSource = optionData;
            this.setState( {
                selectOptionData: dataSource,
                selectOpen: false,
                selectProperty: dataSource[ 0 ].systemName,
                selectValue: dataSource[ 0 ].displayName
            } );
        }
    }

    componentDidMount() {
        this.getSelectOptionData( this.props.dataSource );

        document.addEventListener( 'click', this.hideOptionLists, false );
    }

    componentWillReceiveProps( nextProps ) {
        if( this.props.dataSource !== nextProps.dataSource || this.props.count !== nextProps.count ) {
            this.getSelectOptionData( nextProps.dataSource );
        }
    }

    hideOptionLists( ev ) {
        if(
            ev.target !== document.getElementById( this.props.parentId )
            && ev.target !== document.getElementById( this.props.selectId )
        ){
            this.setState( {
                selectOpen: false
            } );
        }
    }

    handleChangeValue() {
        this.setState( {
            selectOpen: true
        } );
    }

    handleSelectProperty(index, obj ) {
        this.setState( {
            selectOpen: false,
            selectProperty: obj.systemName,
            selectValue: obj.displayName
        } );
        let _that = this;
        let getData = { roleId:obj.systemName };
        $.post( EPMUI.context.url + "/getAllTable",getData, function(data) {
            let allTabels = JSON.parse( data ).magicube_interface_data;
            _that.setState( {
                allTable: allTabels,
                baseAllTable: allTabels,
                allTableNum: allTabels.length
            } );
        } );
        $.post( EPMUI.context.url + "/getHadeTable",getData, function(data) {
            let hadeTabels = JSON.parse( data ).magicube_interface_data;
            _that.setState( {
                hadeTable: hadeTabels,
                baseHadeTable: hadeTabels,
                hadeTableNum: hadeTabels.length
            }, () => {
              //权限管理-权限管理 添加滚动条
              $('.ul_wrapper').mCustomScrollbar({
                theme: Magicube.scrollbarTheme,
                autoHideScrollbar: true
              });
            } );
        } );
    }

    handleClickCheckbox(e){
        if($(e.target).prop("checked")){
            $(e.target).addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", "checked");
        }else{
            $(e.target).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false);
        }

    }

    handleAllNoselectClickCheckbox(e){
        if($(e.target).prop("checked")){
            $(e.target).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
            $(".authority_tabel_noselect_check").addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", "checked");
        }else{
            $(e.target).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
            $(".authority_tabel_noselect_check").addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false);
        }

    }

    handleAllSelectedClickCheckbox(e){
        if($(e.target).prop("checked")){
            $(e.target).addClass('icon-check-square-o').removeClass('icon-square-o-blue');
            $(".authority_tabel_selected_check").addClass('icon-check-square-o').removeClass('icon-square-o-blue').prop("checked", "checked");
        }else{
            $(e.target).addClass('icon-square-o-blue').removeClass('icon-check-square-o');
            $(".authority_tabel_selected_check").addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false);
        }

    }

    handleTableAdd(){
        let contentNoselect = [];
        let contentSelected = this.state.hadeTable;
        $("#authority_tabel_noselect input:not(:checked)").each( function( index, item ) {
            let table = {
                system_name: $(item).parent("li").attr("value"),
                name: $(item).parent("li").attr("name")
            };
            contentNoselect.push(table);
        } );
        $("#authority_tabel_noselect input:checked").each( function( index, item ) {
            let table = {
                system_name: $(item).parent("li").attr("value"),
                name: $(item).parent("li").attr("name")
            };
            contentSelected.push(table);
            $(item).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false);
            $(item).prop("checked",false);
        } );
        this.setState( {
            allTable: contentNoselect,
            baseAllTable: contentNoselect,
            allTableNum: contentNoselect.length,
            hadeTable: contentSelected,
            baseHadeTable: contentSelected,
            hadeTableNum: contentSelected.length
        } );

    }

    handleTableRemove(){
        let contentNoselect = this.state.allTable;
        let contentSelected = [];

        $("#authority_tabel_selected input:not(:checked)").each( function( index, item ) {
            let table = {
                system_name: $(item).parent("li").attr("value"),
                name: $(item).parent("li").attr("name")
            };
            contentSelected.push(table);
            //name: $(item).context.parentElement.innerText
        } );
        $("#authority_tabel_selected input:checked").each( function( index, item ) {
            let table = {
                system_name: $(item).parent("li").attr("value"),
                name: $(item).parent("li").attr("name")
            };
            contentNoselect.push(table);
            $(item).addClass('icon-square-o-blue').removeClass('icon-check-square-o').prop("checked", false);
            $(item).prop("checked",false);
        } );

        this.setState( {
            allTable: contentNoselect,
            baseAllTable: contentNoselect,
            allTableNum: contentNoselect.length,
            hadeTable: contentSelected,
            baseHadeTable:contentSelected,
            hadeTableNum: contentSelected.length
        } );
    }

    handleAuthorityEnsure() {
        let tableList = [];
        let roleId = this.state.selectProperty;
        let ht = this.state.hadeTable;
        /*$("#authority_tabel_selected input").each( function( index, item ) {
            tableList.push( $(item).parent("li").attr("value") );
        } );*/

        tableList = ht.map( (item,index) => {
            return item.system_name;
        });

        let _that = this;
        let getData = {
            roleId:roleId,
            tableList:tableList
        };
        $.ajax({
            url: EPMUI.context.url + "/addAuth",
            traditional: true, //是否自动解析数组
            type: "POST",
            data: getData,
            dataType: "json",
            complete: function() { },
            success: function(data) {
              _that.props.onSubmit( "succeed", "提示!", "权限修改成功" )
                /*$("#authority_msg").html("权限修改成功");
                setTimeout(function(){
                    $("#authority_msg").html(" ");
                },1500);*/
            },
            error: function(error) {
              _that.props.onSubmit( "fail", "提示!", "权限修改失败" )
                /*$("#authority_msg").html("权限修改失败");
                setTimeout(function(){
                    $("#authority_msg").html(" ");
                },1500);*/
            }
        })
    }

    handleAuthorityReset(){
        let obj = {
            systemName: this.state.selectProperty,
            displayName: this.state.selectValue
        };
        this.handleSelectProperty("a", obj);
    }

    onAuthNoSearchKeywordChange(e) {
        //在这对未选择表做处理
        let newAllTable = [];
        let at = this.state.allTable;
        if(e.target.value && at){
          let delAllTable = at;
          newAllTable = delAllTable.filter( ( item, index ) => {
            return item.name.indexOf(e.target.value) !== -1
          } );
          this.setState({
            baseAllTable: newAllTable
          });
        }else{
          this.setState({
            baseAllTable: at
          });
        }

    }
    onAuthSearchedKeywordChange(e) {
        //在这对已选择表做处理
        let newHadetable = [];
        let ht = this.state.hadeTable;
        if(e.target.value && ht){
          let delHadetable = ht;
          newHadetable = delHadetable.filter( ( item, index ) => {
            return item.name.indexOf(e.target.value) !== -1
          } );
          this.setState({
            baseHadeTable: newHadetable
          });
        }else{
          this.setState({
            baseHadeTable: ht
          });
        }
    }

    render() {
        const { selectProperty, selectOpen, selectValue, selectOptionData, allTable, baseAllTable, hadeTable, baseHadeTable, allTableNum, hadeTableNum } = this.state;
        const color = selectProperty === "null" || selectProperty === "ALL" ? { "color": "#9fa6ab" } : { "color": "#fff" };
        return (
            <div className="authority">
                <div className="authority_lists_box">
                    <div className="authority_users">
                        <div className="authority_users_box">
                            <span>请为</span>
                            <div className="authority_users_select">
                                <div style={ { "display": "inline-block" } }>
                                    <h6 id={ this.props.selectId } data-type={ selectProperty } onClick={ this.handleChangeValue }>{ selectValue }</h6>
                                    {
                                        selectOpen
                                            ?
                                            <div id={ this.props.parentId } >
                                                {
                                                    selectOptionData.map( ( item, index ) => {
                                                        return(
                                                            <p key={ index } className="select_type_list" onClick={ this.handleSelectProperty.bind( this, index, item ) }>{ item.displayName }</p>
                                                        )
                                                    } )
                                                }
                                            </div>
                                            :
                                            ""
                                    }
                                </div>
                            </div>
                            <span>设定权限范围</span>
                        </div>
                    </div>

                    <div className="authority_import">
                        <div className="authority_import_file">
                            <div className="authority_import_head">1.外部导入</div>
                            <div className="authority_import_box">
                                <div className="authority_file_head">请选择要导入的内容: </div>
                                <div className="authority_file">
                                    <label>浏览数据内容</label>
                                    <input id="fileInput" type="file" name="file" multiple="multiple" />
                                </div>
                            </div>
                        </div>
                        <div className="authority_import_tabel">
                            <div className="authority_import_head">2.手动导入</div>
                            <div className="authority_tabel_box">
                                <div className="authority_tabel">
                                    <div className="authority_tabel_type">
                                        <input type="checkbox" className="authority_all_noselect icon-square-o-blue" onClick={ this.handleAllNoselectClickCheckbox.bind(this) }/>
                                        <span className="authority_tabel_type_span">可选择表类型</span>
                                        <span className="authority_tabel_size">{ allTableNum }张</span>
                                        {/*<span id="authority_tabel_noselect_size" className="authority_tabel_size">0</span>*/}
                                    </div>
                                    <div className="authority_tabel_type">
                                       <span>检索关键字:</span><input className="authority_tabel_search" type="text" onChange={this.onAuthNoSearchKeywordChange.bind(this)}/>
                                    </div>
                                    <div className="ul_wrapper">
                                      <ul className="authority_tabel_ul" id="authority_tabel_noselect">
                                        {
                                          baseAllTable?
                                            baseAllTable.map( ( item, index ) => {
                                                return(
                                                <li key={ index } className="authority_tabel_li" value={ item.system_name } name={ item.name }>
                                                    <input type="checkbox" className="authority_tabel_noselect_check icon-square-o-blue" onClick={ this.handleClickCheckbox.bind(this) }/>
                                                    <span className="authority_tabel_span" value={ item.system_name } title={ item.name }>{" "}{ item.name }</span>
                                                </li>
                                                )
                                            } )
                                          :
                                            " "
                                        }
                                      </ul>
                                    </div>
                                </div>
                                <div className="authority_tabel_change">
                                    <div className="authority_tabel_add" onClick={ this.handleTableAdd.bind(this) }> {">"} </div>
                                    <div className="authority_tabel_remove" onClick={ this.handleTableRemove.bind(this) }> {"<"} </div>
                                </div>
                                <div className="authority_tabel">
                                    <div className="authority_tabel_type">
                                        <input type="checkbox" className="authority_all_selected icon-square-o-blue" onClick={ this.handleAllSelectedClickCheckbox.bind(this) }/>
                                        <span className="authority_tabel_type_span">已选择表类型</span>
                                        <span className="authority_tabel_size">{ hadeTableNum }张</span>
                                        {/*<span id="authority_tabel_selected_size" className="authority_tabel_size">0</span>*/}
                                    </div>
                                    <div className="authority_tabel_type">
                                        <span>检索关键字:</span><input className="authority_tabel_search"  type="text" onChange={this.onAuthSearchedKeywordChange.bind(this)}/>
                                    </div>
                                    <div className="ul_wrapper">
                                      <ul className="authority_tabel_ul" id="authority_tabel_selected">
                                        {
                                          baseHadeTable?
                                            baseHadeTable.map( ( item, index ) => {
                                              return(
                                                <li key={ index } className="authority_tabel_li" value={ item.system_name } name={ item.name }>
                                                  <input type="checkbox" className="authority_tabel_selected_check icon-square-o-blue" onClick={ this.handleClickCheckbox.bind(this) }/>
                                                  <span className="authority_tabel_span" value={ item.system_name } title={ item.name }>{" "}{ item.name }</span>
                                                </li>
                                              )
                                            } )
                                            :
                                            " "
                                        }
                                      </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="authority_options_box">
                            <button type="button" id="authority_add_ensure" onClick={ this.handleAuthorityEnsure.bind(this) }>确定</button>
                            <button type="button" id="authority_add_reset" onClick={ this.handleAuthorityReset.bind(this) }>取消</button>
                            <b id="authority_msg"></b>
                        </div>
                    </div>
                </div>
            </div>



            /*<div style={ { "display": "inline-block" } }>
                <h6 id={ this.props.selectId } data-type={ selectProperty } onClick={ this.handleChangeValue }>{ selectValue }</h6>

                {
                    selectOpen
                        ?
                        <div id={ this.props.parentId } >
                            {
                                selectOptionData.map( ( item, index ) => {
                                    return(
                                        <p key={ index } className="select_type_list" onClick={ this.handleSelectProperty.bind( this, index, item ) }>{ item.displayName }</p>
                                    )
                                } )
                            }
                        </div>
                        :
                        ""
                }
            </div>*/
        );
    }

}

AuthorityManage.defaultProps = {
    hasAll: false
};
export default AuthorityManage;
export { AuthorityManage };
