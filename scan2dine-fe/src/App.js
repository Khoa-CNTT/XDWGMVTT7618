import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import useDirection from './hooks/useDirection';


function App() {
  const location = useLocation();
  const direction = useDirection();


  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home direction={direction} />} />
        <Route path="/menu" element={<Menu direction={direction} />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
