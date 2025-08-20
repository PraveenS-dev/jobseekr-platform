import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";

const PageLoader = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.img
        src="/fav-2.png"
        alt="Loading..."
        className="w-20 h-20 drop-shadow-lg"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </motion.div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);

  // Fake delay for loader on route change
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const variants = {
    initial: { opacity: 0, y: 10, scale: 0.995, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -8, scale: 0.995, filter: "blur(6px)" },
  };

  return (
    <div
      className={`flex h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col transition-colors duration-300 min-w-0">
        <Topbar />

        <main className="p-4 overflow-y-auto flex-1 min-w-0 relative">
          <AnimatePresence mode="wait" initial={false}>
            {loading && <PageLoader key="loader" />}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.18,
                ease: "easeInOut",
                filter: { duration: 0.1 },
              }}
              className="relative w-full min-w-0"
              style={{ willChange: "opacity, transform, filter" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
