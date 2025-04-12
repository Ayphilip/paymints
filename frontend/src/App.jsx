import React, { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import './App.css'
import Home from './Pages/Home';
import Signin from './Pages/Signin';
import { useSelector } from 'react-redux';
import OrderPage from './Pages/OrderPage';
import Preview from './Pages/Preview';
import PaymentPage from './Pages/PaymentPage';

function App() {
  const userSignin = useSelector(state => state.userSignin);
  const { userInfo } = userSignin;

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'  element={<Signin/>}/>
        <Route path='/dashboard' element={<Home/>} />
        <Route path='/paymentorder' element={<OrderPage/>}/>
        <Route path='/order' element={<Preview/>}/>
        <Route path='/order/:id/pay' element={<PaymentPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  </BrowserRouter>
  )
}

export default App
