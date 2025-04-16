import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import useDirection from './hooks/useDirection';
import { Login } from './pages/Login';
import Cart from './pages/Cart';
import { EmployeePage } from './pages/EmployeePage';
import { AdminPage } from './pages/AdminPage';


function App() {
  const location = useLocation();
  const direction = useDirection();
  const [cart, setCart] = useState([]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home direction={direction} />} />
        <Route path="/menu" element={<Menu direction={direction} />} />
        <Route path="/login" element={<Login direction={direction} />} />

        <Route path="/cart" element={<Cart direction={direction} />} />
        <Route path="/employee" element={<EmployeePage direction={direction} />} />
        <Route path="/admin" element={<AdminPage direction={direction} />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
