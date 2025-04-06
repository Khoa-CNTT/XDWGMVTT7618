import { motion } from "framer-motion";

export default function PageWrapper({ children, direction = 1 }) {
    const variants = {
        initial: { x: direction > 0 ? "100%" : "-100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: direction > 0 ? "-100%" : "100%", opacity: 0 },
    };

    return (
        <motion.div
            initial={{ x: direction === 1 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="w-full h-full absolute top-0 left-0 bg-white z-10"
        >
            {children}
        </motion.div>
    );
}
