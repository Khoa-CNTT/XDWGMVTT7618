import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Menu from './pages/Menu';
import { Route, Routes } from 'react-router-dom';


function App() {
  const [searchTerm, setSearchTerm] = useState('');
  // const [showMenu, setShowMenu] = useState(false);

 

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu/>} />
    </Routes>
  );
}

export default App;
