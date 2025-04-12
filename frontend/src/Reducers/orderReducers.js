import {
    ORDER_SAVE_REQUEST,
    ORDER_SAVE_SUCCESS,
    ORDER_SAVE_FAILED,
    ORDER_LIST_REQUEST,
    ORDER_LIST_SUCCESS,
    ORDER_LIST_FAILED,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAILED,
    ORDER_DELETE_REQUEST,
    ORDER_DELETE_SUCCESS,
    ORDER_DELETE_FAILED,
    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS,
    ORDER_PAY_FAILED,
  } from "../Constants/orderConstants";
  
  // Reducer for saving an order (create, add item, add recipient)
  function orderSaveReducer(state = {}, action) {
    switch (action.type) {
      case ORDER_SAVE_REQUEST:
        return { loading: true };
      case ORDER_SAVE_SUCCESS:
        return { loading: false, order: action.payload, success: true };
      case ORDER_SAVE_FAILED:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  }
  
  // Reducer for listing all orders
  function orderListReducer(state = { orders: [] }, action) {
    switch (action.type) {
      case ORDER_LIST_REQUEST:
        return { loading: true, orders: [] };
      case ORDER_LIST_SUCCESS:
        return { loading: false, orders: action.payload };
      case ORDER_LIST_FAILED:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  }
  
  // Reducer for fetching order details
  function orderDetailsReducer(state = { order: {} }, action) {
    switch (action.type) {
      case ORDER_DETAILS_REQUEST:
        return { loading: true };
      case ORDER_DETAILS_SUCCESS:
        return { loading: false, order: action.payload };
      case ORDER_DETAILS_FAILED:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  }
  
  // Reducer for deleting an order
  function orderDeleteReducer(state = {}, action) {
    switch (action.type) {
      case ORDER_DELETE_REQUEST:
        return { loading: true };
      case ORDER_DELETE_SUCCESS:
        return { loading: false, success: true, message: action.payload.message };
      case ORDER_DELETE_FAILED:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  }
  
  // Reducer for paying an order
  function orderPayReducer(state = {}, action) {
    switch (action.type) {
      case ORDER_PAY_REQUEST:
        return { loading: true };
      case ORDER_PAY_SUCCESS:
        return { loading: false, order: action.payload, success: true };
      case ORDER_PAY_FAILED:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  }
  
  export {
    orderSaveReducer,
    orderListReducer,
    orderDetailsReducer,
    orderDeleteReducer,
    orderPayReducer,
  };