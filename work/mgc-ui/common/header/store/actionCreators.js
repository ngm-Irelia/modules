/* 统一存放action */
import { SEARCH_FOCUS, SEARCH_BLUR, INIT_LIST_ACTION } from './actionTypes';
import axios from 'axios';

export const setSearchFocus = () => ({
  type: SEARCH_FOCUS
})

export const setSearchBlur = () => ({ 
  type: SEARCH_BLUR
})

const initListAction = (res) => ({ 
  type: INIT_LIST_ACTION,
  value:res.data
})

export const getTodoList = () => {
	return (dispatch)=>{ //combineReducers的作用，不用使用store.dispatch
		axios.get('./headerList.json').then( (res)=>{
			console.log(res);
			const action = initListAction(res);
			dispatch(action);
    	}).catch( (res)=>{
			console.log("catch--- ");

			const action = initListAction(["hello", "axios", "ngm"]);
			dispatch(action);
		})
	}
}