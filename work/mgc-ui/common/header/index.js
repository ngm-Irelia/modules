

import React from 'react';
import { connect,Provider } from 'react-redux';

import { actionCreators } from './store/index';
/* import store from '../../build/store/store';
console.log("store ======================== Provider *******************");
console.log(store);
console.log(Provider); */

//把store中的数据，映射到props
const mapStateToProps = (state) => {
    return {
        focused: state.header.focused, //因为使用combineReducers，路径发生变化，需要加上.header
        storeName: state.header.storeName
    }
}

const mapDispatchToProps = (dispatch) => {

    return {
        handleFocused() {
            console.log("aaaaaabbbcccdddeeefffggg !!!!!");
            const action = actionCreators.setSearchFocus();
            dispatch(action);  //其实就是store.dispatch()

            console.log(this)
            //发送请求接口
            const listAction = actionCreators.getTodoList();
            dispatch(listAction);
        },
        handleBlur() {
            const action = actionCreators.setSearchBlur();
            dispatch(action);
        }
    }
}

//无状态组件性能更好

class Header extends React.Component {

    render() {

        return (
             
                <div className="header">
                    <div>
                        <div className="header_logo" name={this.props.focused ? "name" : 'false'} test={ this.props.storeName }></div>
                        <div className="header_ryxq" onClick={this.props.handleFocused}>眼中有日月星辰</div>
                    </div>

                    <div className="header_list"> <a href="/knowledge" >知识</a></div>
                    <div className="header_list"> <a href="/H5" >H5</a></div>
                    <div className="header_list"> <a href="/CSS3" >CSS3</a></div>
                    <div className="header_list"> <a href="/visualization" >可视化</a></div>
                    <div className="header_list"> <a href="/index" >首页</a></div>
                </div>
            
            
        )
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Header);