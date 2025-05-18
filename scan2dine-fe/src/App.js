import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { EmployeePage } from './pages/EmployeePage';
import { AdminPage } from './pages/AdminPage';
import CustomerLogin from './pages/FillInfo';
import PrivateRoute from './components/PrivateRoute';
import CartDetail from './components/C_CartDetail';
import OrderDetail from './components/C_OrderDetail';
import CustomerRoute from './components/C_CustomerRoute';
import { Owner } from './pages/Owner';
import ReviewProduct from './components/C_ReviewProduct';
import { AppProvider } from './components/AppContext';

function App() {
  const location = useLocation();

  return (
    <AppProvider>
      <Routes location={location} key={location.pathname}>
        {/* Khách hàng */}
        <Route path="/" element={<CustomerLogin />} />
        <Route path="/home" element={<CustomerRoute><Home /></CustomerRoute>} />
        <Route path="/menu" element={<CustomerRoute><Menu /></CustomerRoute>} />
        <Route path="/review" element={<CustomerRoute><ReviewProduct /></CustomerRoute>} />
        <Route path="/cartdetail" element={<CustomerRoute><CartDetail /></CustomerRoute>} />
        <Route path='/orderdetail' element={<CustomerRoute><OrderDetail /></CustomerRoute>} />

        {/* Scan2dine */}
        <Route path="/login" element={<Login />} />
        <Route path="/employee/*" element={<PrivateRoute><EmployeePage /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/owner/*" element={<PrivateRoute><Owner /></PrivateRoute>} />
      </Routes>
    </AppProvider>


  );
}

export default App;
