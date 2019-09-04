import React, { Component } from 'react';
//扩展关系的组件
class Ulist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            childRelationName: [],
            selectOptionData: []
        };
    }
    //每次点击请求数据，和第一次请求数据
    getSelectOptionData(child) {
        let dataSource = [];
        if(!child || child.length === 0) {
            return false;
        } else {
            dataSource = child;
            dataSource.sort((a,b) => {
                return a.displayName.length > b.displayName.length ? 1 : -1;
            });
            this.setState( {
                selectOptionData: dataSource,
                childRelationName: dataSource[0].child
            });
        }
    }

    componentDidMount() {
        this.getSelectOptionData( this.props.dataSource );
        $(".parent_relationName").mCustomScrollbar("destroy");
        $(".parent_relationName").mCustomScrollbar({
            theme: Magicube.scrollbarTheme,
            autoHideScrollbar: true
        });
    }
    //没啥用
    componentWillReceiveProps(nextProps){
        if( this.props.dataSource !== nextProps.dataSource || this.props.count !== nextProps.count ) {
            this.getSelectOptionData( nextProps.dataSource );
        }
    }
     //给创建的DOM绑定的单击事件
    handleSelectProperty(index, obj) {
        $(".child_relationName").mCustomScrollbar("destroy");
        $(".select_type_li").eq(index).addClass("selectedLi").removeClass("noSelectedLi").siblings().removeClass("selectedLi").addClass("noSelectedLi");
        $(".relation_input").removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
        this.setState( {
            childRelationName: obj.child
        },()=>{
            $(".child_relationName").mCustomScrollbar({
                theme: Magicube.scrollbarTheme,
                autoHideScrollbar: true
            });
        });
    }
    //选择具体扩展关系类型
    handleCheckRelation(index){
        const element = $(".relation_input").eq(index);
        if(element.hasClass('icon-square-o-big-blue')){
            element.removeClass("icon-square-o-big-blue").addClass("icon-check-square-o");
        } else{
            element.removeClass("icon-check-square-o").addClass("icon-square-o-big-blue");
        }
    }
    //根据数据创建页面DOM
    render() {
        const { childRelationName, selectOptionData} = this.state;
        childRelationName.sort((a,b) => {
            return a.displayName.length > b.displayName.length ? 1 : -1;
        });
        return (
            <div>
                <div className="parent_relationName">
                    <ul className="clearfix">
                        {
                            selectOptionData.map( ( item, index ) => {
                                if(item.systemName !== 'null'){
                                    const classLi = index == 0 ? "select_type_li selectedLi" : "select_type_li noSelectedLi";
                                    return (
                                        <li key={ index } className={classLi} data-systemname={item.systemName} onClick={ this.handleSelectProperty.bind( this, index, item )}>{ item.displayName}</li>
                                    )
                                }
                            })
                        }
                    </ul>
                </div>
                <div className="child_relationName">
                    <div className="ul clearfix">
                        {
                            childRelationName.map((d,i) => {
                                const content = d.displayName;
                                const systemName = d.systemName;
                                return (
                                    <div key={i} className="select_type_uli" onClick={this.handleCheckRelation.bind(this,i)}>
                                        <div id={i} className="relation_input icon-square-o-big-blue"  data-systemname={systemName} >
                                            <span className="child_relationName_span">{content}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Ulist;
export { Ulist };
