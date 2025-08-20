import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaBriefcase,
  FaBookmark,
  FaUser,
  FaClipboardList,
  FaFacebookMessenger,
  FaUsers,
  FaBell,
} from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import favIcon from "../assets/fav-2.png";
import logo from "../assets/logo.png";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", icon: <FaHome />, to: "/dashboard" },
  { name: "Jobs", icon: <FaBriefcase />, to: "/jobs" },
  { name: "Bookmarks", icon: <FaBookmark />, to: "/bookmarks" },
  { name: "Users", icon: <FaUser />, to: "/users/list" },
  { name: "Applications", icon: <FaClipboardList />, to: "/application/list" },
  { name: "Message", icon: <FaFacebookMessenger />, to: "/chats" },
  { name: "Connections", icon: <FaUsers />, to: "/connections" },
  { name: "Notifications", icon: <FaBell />, to: "/notifications" },
];

// Shake animation for icon click
const shakeAnimation = {
  x: [0, -4, 4, -4, 4, 0],
  transition: { duration: 0.4 },
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [clickedIndex, setClickedIndex] = useState(null);

  const checkJobsActive = () => {
    const path = location.pathname;
    return (
      path.startsWith("/jobs") ||
      path.startsWith("/view-job/") ||
      path.startsWith("/apply-job/")
    );
  };

  const checkApplicationsActive = () => {
    const path = location.pathname;
    return (
      path.startsWith("/application/list") ||
      path.startsWith("/application/view/")
    );
  };

  const profileMenu = {
    name: "Profile",
    icon: (
      <img
        src={
          user?.profile_path ||
          `https://ui-avatars.com/api/?name=${user?.name || "U"}&size=40`
        }
        alt="Profile"
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
      />
    ),
    to: "/users/profile",
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-16 sm:w-64 bg-white dark:bg-gray-800 shadow-lg px-2 sm:px-4 py-4 sm:py-6 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8 flex-shrink-0">
          <img
            src={favIcon}
            alt="JobSeekr"
            className="block sm:hidden w-9 h-9 object-contain rounded-lg overflow-hidden shadow-md border border-gray-300 dark:border-gray-600"
          />
          <img
            src={logo}
            alt="JobSeekr"
            className="hidden sm:block max-h-10 object-contain scale-250"
          />
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Mobile profile */}
          <div className="sm:hidden mb-6">
            <NavLink
              to={profileMenu.to}
              className={`flex justify-center items-center p-2 rounded-lg transition-all ${location.pathname === profileMenu.to
                  ? "bg-blue-100 dark:bg-blue-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              title="Profile"
            >
              {profileMenu.icon}
            </NavLink>
          </div>

          <ul className="space-y-1 sm:space-y-2">
            {/* Desktop profile link */}
            <li className="hidden sm:block">
              <NavLink
                to={profileMenu.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium 
                  transform transition-transform duration-150 active:scale-95 hover:scale-105
                  ${isActive
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {profileMenu.icon}
                <span>{profileMenu.name}</span>
              </NavLink>
            </li>

            {/* Main nav */}
            {navItems
              .filter((item) => {
                if (item.name === "Users" && user?.role !== 2) return false;
                return true;
              })
              .map((item, index) => {
                let isActive = location.pathname === item.to;
                if (item.name === "Jobs") isActive = checkJobsActive();
                if (item.name === "Applications") isActive = checkApplicationsActive();

                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        setClickedIndex(index);
                        setTimeout(() => setClickedIndex(null), 400);
                      }}
                      className={`flex items-center justify-center sm:justify-start space-x-0 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                          ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      title={item.name}
                    >
                      <motion.span
                        animate={clickedIndex === index ? shakeAnimation : {}}
                        className="text-lg sm:text-base"
                      >
                        {item.icon}
                      </motion.span>
                      <span className="hidden sm:inline">{item.name}</span>
                    </NavLink>
                  </motion.li>
                );
              })}

          </ul>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default Sidebar;
