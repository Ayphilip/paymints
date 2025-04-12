import { USER_LIST_SUCCESS, USER_LIST_REQUEST, USER_LIST_FAIL, USER_SIGNIN_REQUEST, USER_SIGNIN_SUCCESS, USER_SIGNIN_FAIL, USER_REGISTER_FAIL, USER_REGISTER_SUCCESS, USER_REGISTER_REQUEST, USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAIL, USER_DETAILS_REQUEST, USER_DETAILS_SUCCESS, USER_DETAILS_FAIL } from "../Constants/userConstants";

function userSigninReducer(state={}, action){
    switch(action.type){
        case USER_SIGNIN_REQUEST:
            return{ loading: true};
        case USER_SIGNIN_SUCCESS:
            return { loading: false, adminInfo: action.payload};
        case USER_SIGNIN_FAIL:
            return { loading: false, error: action.payload};
        default: return state;
    }
}

function userListReducer(state = {user: []}, action ){

  switch(action.type){
      case USER_LIST_REQUEST:
          return {loading: true, user: []};
      case USER_LIST_SUCCESS:
          return {loading: false, user: action.payload};
      case USER_LIST_FAIL:
          return {loading: false, error: action.payload};
      default:
          return state;
  }
}

function userDetailsReducer(state={users: { activity: [], messages: [], otherDocs: []}}, action){
    switch(action.type) {
        case USER_DETAILS_REQUEST:
            return { loading : true};
        case USER_DETAILS_SUCCESS:
            return { loading: false, users: action.payload};
        case USER_DETAILS_FAIL:
            return { loading: false, error: action.payload};
        default: return state;
    }
}

function userUpdateReducer(state = {}, action) {
    switch (action.type) {
      case USER_UPDATE_REQUEST:
        return { loading: true };
      case USER_UPDATE_SUCCESS:
        return { loading: false, adminInfo: action.payload, success: true };
      case USER_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      default: return state;
    }
  }

function userRegisterReducer(state={}, action){
    switch(action.type){
        case USER_REGISTER_REQUEST:
            return{ loading: true};
        case USER_REGISTER_SUCCESS:
            return { loading: false, success: true, adminInfo: action.payload};
        case USER_REGISTER_FAIL:
            return { loading: false, error: action.payload};
        default: return state;
    }
}


export {
    userSigninReducer, userRegisterReducer, userUpdateReducer, userListReducer, userDetailsReducer
}