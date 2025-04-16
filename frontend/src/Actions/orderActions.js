import Axios from "axios";
import Cookie from "js-cookie";
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
import { generate7DigitId } from "../component/utils";

// Save a new order (POST /orders)
const saveOrder = (orderData) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_SAVE_REQUEST, payload: orderData });
        const {
            userSignin: { userInfo },
        } = getState();

        if (orderData.orderNo) {
            const { data } = await Axios.put(`/api/orders/orders/${orderData.orderNo}`, orderData, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            console.log(data)
            dispatch({ type: ORDER_SAVE_SUCCESS, payload: data });
        } else {
            const invoice = generate7DigitId()

            const { data } = await Axios.post("/api/orders/orders", { ...orderData, orderNo: invoice}, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: ORDER_SAVE_SUCCESS, payload: data });
        }
    } catch (error) {
        dispatch({
            type: ORDER_SAVE_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// List all orders (GET /orders) - Admin only
const listOrders = () => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_LIST_REQUEST });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.get("/api/orders/orders", {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        });

        console.log(data)
        dispatch({ type: ORDER_LIST_SUCCESS, payload: data.orders });
    } catch (error) {
        dispatch({
            type: ORDER_LIST_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

const updateOrder = (orderNo, orderData) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_SAVE_REQUEST, payload: { orderNo, orderData } });
        const { userSignin: { userInfo } } = getState();
        const { data } = await Axios.put(`/api/orders/orders/${orderNo}`, orderData, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: ORDER_SAVE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ORDER_SAVE_FAILED, payload: error.response?.data?.message || error.message });
    }
};

// Get order details (GET /orders/:orderNo)
const detailsOrder = (orderNo) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST, payload: orderNo });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.get(`/api/orders/orders/${orderNo}`);
        dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
    } catch (error) {
        console.log(error.response?.data?.message)
        dispatch({
            type: ORDER_DETAILS_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Delete an order (DELETE /orders/:orderNo) - Admin only
const deleteOrder = (orderNo) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_DELETE_REQUEST, payload: orderNo });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.delete(`/api/orders/orders/${orderNo}`, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        });
        dispatch({ type: ORDER_DELETE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_DELETE_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Mark an order as paid (PATCH /orders/:orderNo/pay)
const payOrder = (orderNo, paymentData = {}) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_PAY_REQUEST, payload: { orderNo, paymentData } });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.patch(`/api/orders/orders/${orderNo}/pay`, paymentData, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        });
        dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_PAY_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Add an item to an order (POST /orders/:orderNo/items)
const addItemToOrder = (orderNo, itemData) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_SAVE_REQUEST, payload: { orderNo, itemData } });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.post(`/api/orders/orders/${orderNo}/items`, itemData, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        });
        dispatch({ type: ORDER_SAVE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_SAVE_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Add a recipient to an order (POST /orders/:orderNo/recipients)
const addRecipientToOrder = (orderNo, recipientData) => async (dispatch, getState) => {
    try {
        dispatch({ type: ORDER_SAVE_REQUEST, payload: { orderNo, recipientData } });
        const {
            userSignin: { userInfo },
        } = getState();
        const { data } = await Axios.post(`/api/orders/orders/${orderNo}/recipients`, recipientData, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        });
        dispatch({ type: ORDER_SAVE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ORDER_SAVE_FAILED,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export {
    saveOrder,
    listOrders,
    detailsOrder,
    deleteOrder,
    payOrder,
    addItemToOrder,
    addRecipientToOrder,
};