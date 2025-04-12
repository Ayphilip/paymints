import { combineReducers, compose, applyMiddleware } from "redux";
// import thunk from 'redux-thunk';
import {thunk} from 'redux-thunk'
import Cookie from 'js-cookie';
import { configureStore } from "@reduxjs/toolkit";
import { userDetailsReducer, userListReducer, userRegisterReducer, userSigninReducer, userUpdateReducer } from "./Reducers/userReducers";
import {
  orderSaveReducer,
  orderListReducer,
  orderDetailsReducer,
  orderDeleteReducer,
  orderPayReducer,
} from "./Reducers/orderReducers";

// console.log(JSON.parse(Cookie.get("adminInfo")))
const userInfo = Cookie.get("userInfo") ? JSON.parse(Cookie.get("userInfo")) : null

const initialState = { userSignin:{ userInfo } };
const reducer = combineReducers({
  // Users Reducers
  userSignin: userSigninReducer,
  userList: userListReducer,  
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdate: userUpdateReducer,

  // Order Reducers
  orderSave: orderSaveReducer,
  orderList: orderListReducer,
  orderDetails: orderDetailsReducer,
  orderDelete: orderDeleteReducer,
  orderPay: orderPayReducer,
})

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [thunk];
const store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });
export default store;