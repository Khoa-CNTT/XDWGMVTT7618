import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useDirection() {
    const location = useLocation();
    const prevPath = useRef(location.pathname);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const forwardPages = ["/", "/menu", "/cart"]; // chỉnh theo flow của bạn
        const prevIndex = forwardPages.indexOf(prevPath.current);
        const currentIndex = forwardPages.indexOf(location.pathname);

        if (currentIndex > prevIndex) {
            setDirection(1); // đi tới
        } else {
            setDirection(-1); // quay lại
        }

        prevPath.current = location.pathname;
    }, [location]);

    return direction;
}
