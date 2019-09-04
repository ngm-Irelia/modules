import { combineReducers } from 'redux'; // 用来整合所有细分的 reducer文件 ;; 使用 combineReducers 完成对数据的拆分管理
import {reducer as headerReducer } from '../common/header/store/index';

export default combineReducers({
  header: headerReducer
})
