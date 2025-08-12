import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function AnimatedLayout() {
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const variants = {
        initial: { opacity: 0, y: 10, scale: 0.995, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, scale: 0.995, filter: "blur(6px)" }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-slate-900 dark:to-blue-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

            {/* Rotating Logo */}
            <motion.img
                src="/fav-2.png" // Your logo path
                alt="Logo"
                className="fixed top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer"
                style={{
                    translateX: "-50%",
                    translateY: "-50%"
                }}
                animate={{ rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    duration: 20, // slow and smooth rotation
                    ease: "linear"
                }}
            />


            {/* Decorative animated blobs remain static across routes */}
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-400/30 dark:bg-blue-700/20 blur-3xl"
                animate={{ y: [0, 10, -6, 0], x: [0, -6, 4, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-300/20 dark:bg-indigo-600/10 blur-3xl"
                animate={{ y: [0, -8, 6, 0], x: [0, 6, -4, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Animate only the routed content */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={`${location.pathname}-${theme}`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.18, ease: "easeInOut", filter: { duration: 0.1 } }}
                    className="relative"
                    style={{ willChange: "opacity, transform, filter" }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
