import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import useDirection from './hooks/useDirection';
import { Login } from './pages/Login';
import { EmployeePage } from './pages/EmployeePage';
import { AdminPage } from './pages/AdminPage';
import CustomerLogin from './pages/FillInfo';
import PrivateRoute from './components/PrivateRoute';
import CartDetail from './components/CartDetail';
import OrderDetail from './components/OrderDetail';
import CustomerRoute from './components/CustomerRoute';


function App() {
  const location = useLocation();
  const direction = useDirection();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        //Khách hàng
        <Route path="/" element={<CustomerLogin direction={direction} />} />

        <Route path="/home" element={<CustomerRoute><Home direction={direction} /></CustomerRoute>} />
        <Route path="/menu" element={<CustomerRoute><Menu direction={direction} /></CustomerRoute>} />
        {/* <Route path="/cart" element={<CustomerRoute><Cart direction={direction} /></CustomerRoute>} /> */}
        <Route path="/cartdetail" element={<CustomerRoute><CartDetail direction={direction} /></CustomerRoute>} />
        <Route path='/orderdetail' element={<CustomerRoute><OrderDetail direction={direction} /></CustomerRoute>} />
        //Scan2dine
        <Route path="/login" element={<Login direction={direction} />} />

        <Route path="/employee/*" element={<PrivateRoute><EmployeePage direction={direction} /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute><AdminPage direction={direction} /></PrivateRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
