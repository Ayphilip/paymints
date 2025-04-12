import Axios from 'axios';
import Cookie from 'js-cookie';
import { USER_LIST_SUCCESS, USER_LIST_REQUEST, USER_LIST_FAIL, USER_SIGNIN_REQUEST, USER_SIGNIN_SUCCESS, USER_SIGNIN_FAIL, USER_REGISTER_FAIL, USER_REGISTER_SUCCESS, USER_REGISTER_REQUEST, USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAIL, USER_DETAILS_REQUEST, USER_DETAILS_SUCCESS, USER_DETAILS_FAIL } from "../Constants/userConstants";



const listUsers = (
  searchKeyword = '',
  address = '',
  username = ''
) => async (dispatch) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });
    const { data } = await Axios.get(
      '/api/users?searchKeyword=' +
      searchKeyword +
      '&address=' +
      address +
      '&username=' +
      username);
    dispatch({ type: USER_LIST_SUCCESS, payload: data.data });

  }
  catch (error) {
    dispatch({ type: USER_LIST_FAIL, payload: error.message });
  }
};


const update = ({ userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin }) => async (dispatch, getState) => {
  const { userSignin: { adminInfo } } = getState();
  dispatch({ type: USER_UPDATE_REQUEST, payload: { userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin } });
  try {
    const { data } = await Axios.put('/api/users/' + userId,
      { name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin }, {
      headers: {
        Authorization: 'Bearer ' + adminInfo.token
      }
    });
    dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
    Cookie.set('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({ type: USER_UPDATE_FAIL, payload: error.message });
  }
}

const updateX = ({ userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin }) => async (dispatch, getState) => {
  dispatch({ type: USER_UPDATE_REQUEST, payload: { userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin } });
  try {
    const { data } = await Axios.put('/api/users/' + userId,
      { userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin });
    dispatch({ type: USER_UPDATE_SUCCESS, payload: data });

  } catch (error) {
    dispatch({ type: USER_UPDATE_FAIL, payload: error.message });
  }
}

const updateXX = ({ userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin }) => async (dispatch, getState) => {
  const { userSignin: { adminInfo } } = getState();
  dispatch({ type: USER_UPDATE_REQUEST, payload: { userId, name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin } });
  try {
    const { data } = await Axios.put('/api/users/' + userId,
      { name, email, profile, phone, address, level, company, gender, status, dob, password, city, recovery, country, personalInfo, major, sessionId, isAdmin }, {
      headers: {
        Authorization: 'Bearer ' + adminInfo.token
      }
    }); dispatch({ type: USER_UPDATE_SUCCESS, payload: data });

  } catch (error) {
    dispatch({ type: USER_UPDATE_FAIL, payload: error.message });
  }
}



const signin = (privyInformation) => async (dispatch) => {

  dispatch({ type: USER_SIGNIN_REQUEST, payload: { privyInformation } });

  try {
    const { data } = await Axios.post("/api/users/signin", privyInformation);
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: data });
    Cookie.set('userInfo', JSON.stringify(data));
    window.location.reload();
  } catch (error) {
    console.log(error)
    dispatch({ type: USER_SIGNIN_FAIL, payload: error.response.data.message });
  }
}



const detailsUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST, payload: userId });
    const { data } = await Axios.get('/api/users/' + userId);
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_DETAILS_FAIL, payload: error.message })
  }
};

const register = (name, email, phone, password, gender) => async (dispatch) => {

  dispatch({ type: USER_REGISTER_REQUEST, payload: { name, email, phone, password, gender } });

  try {
    const { data } = await Axios.post("/api/users/register", { name, email, phone, password, gender });
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAIL, payload: error.message });
  }
}

const registerX = (name, email, company, phone, password, gender) => async (dispatch) => {

  dispatch({ type: USER_REGISTER_REQUEST, payload: { name, email, company, phone, password, gender } });

  try {
    const { data } = await Axios.post("/api/users/register", { name, email, company, phone, password, gender });
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAIL, payload: error.message });
  }
}


const logouts = () => (dispatch) => {
  Cookie.remove("userInfo");
  window.location.reload();
  dispatch({ type: USER_LOGOUT })
}


export { listUsers, signin, register, registerX, detailsUser, update, updateX, updateXX, logouts }; 