import React, { useState, useEffect } from "react";

const ToggleSwitch = ({ status, onToggle }) => {
    const isOn = status === "1";

    const handleClick = () => {
        const newStatus = isOn ? "0" : "1";
        onToggle?.(newStatus); // Giao toàn quyền điều khiển cho cha
    };

    return (
        <button
            onClick={handleClick}
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${isOn ? "bg-primary" : "bg-gray-300"
                }`}
        >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${isOn ? "translate-x-6" : "translate-x-0"
                    }`}
            ></div>
        </button>
    );
};

export default ToggleSwitch;
