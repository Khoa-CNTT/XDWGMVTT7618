import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [employeeRefreshFlag, setEmployeeRefreshFlag] = useState(false);

    const triggerEmployeeRefresh = () => {
        setEmployeeRefreshFlag(prev => !prev); // toggle để trigger useEffect
    };

    return (
        <AppContext.Provider value={{ employeeRefreshFlag, triggerEmployeeRefresh }}>
            {children}
        </AppContext.Provider>
    );
};
