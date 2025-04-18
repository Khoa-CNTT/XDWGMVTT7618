import { Navigate } from 'react-router-dom';
import React from 'react';
const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('user'); // hoặc dùng context/auth state

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
