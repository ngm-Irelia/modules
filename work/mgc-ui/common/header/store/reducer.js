import { SEARCH_FOCUS, SEARCH_BLUR, INIT_LIST_ACTION } from './actionTypes'

const defaultState = {
  focused:true,
  storeName:'ngmstore'
};

export default (state=defaultState, action) => {
  
  if(action.type === SEARCH_FOCUS){
    const newState = JSON.parse( JSON.stringify(state));
    
    newState.focused = true;
    return newState;
  }


  if(action.type === SEARCH_BLUR){
    const newState = JSON.parse( JSON.stringify(state));

    newState.focused = false;
    return newState;
  }

  if(action.type === INIT_LIST_ACTION){
    console.log("reducer---- action.value ===")
    console.log(action.value);
  }

  return state;
}