import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronDown } from "react-icons/fa";

const LogoDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Generate initials for mobile display
  const getInitials = (name) => {
    if (!name) return "Me";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 
          bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950
          text-gray-800 dark:text-white font-semibold rounded-lg 
          shadow-md border border-blue-200 dark:border-gray-700
          hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out"
      >
        {/* Mobile: show initials */}
        <span className="sm:hidden">{getInitials(user.name)}</span>

        {/* Desktop / larger screens: show full name */}
        <span className="hidden sm:inline truncate max-w-[140px]">{user.name}</span>

        {/* Chevron icon */}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FaChevronDown size={14} />
        </motion.span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-2 w-48 sm:w-56 
              bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950
              border border-blue-200 dark:border-gray-700 
              shadow-xl rounded-lg z-50 overflow-hidden"
          >
            {/* Menu Items */}
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm font-medium 
                text-gray-800 dark:text-white 
                hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/logout"
              className="block px-4 py-2 text-sm font-medium 
                text-gray-800 dark:text-white 
                hover:bg-red-100 dark:hover:bg-red-900 transition"
              onClick={() => setOpen(false)}
            >
              Logout
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoDropdown;
