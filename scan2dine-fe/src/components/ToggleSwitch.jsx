import React, { useState, useEffect } from "react";

const ToggleSwitch = ({ status, onToggle }) => {
    const [isOn, setIsOn] = useState(status === "1");

    useEffect(() => {
        setIsOn(status === "1");
    }, [status]);

    const handleClick = () => {
        const newStatus = isOn ? "0" : "1"; // Trả về string "0" hoặc "1"
        setIsOn(!isOn);
        onToggle?.(newStatus); // Callback với chuỗi
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
