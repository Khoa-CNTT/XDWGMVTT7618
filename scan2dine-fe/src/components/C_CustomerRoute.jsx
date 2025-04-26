import React from "react";
import { Navigate } from "react-router-dom";

const CustomerRoute = ({ children }) => {
    const customer = JSON.parse(sessionStorage.getItem("customer"));

    if (!customer || !customer.name || !customer.phone) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default CustomerRoute;
