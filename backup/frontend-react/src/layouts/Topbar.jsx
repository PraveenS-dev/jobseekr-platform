import { Notification } from "../pages/admin/Notification";
import LogoDropdown from "./LogoDropdown";
import ThemeToggle from "./ThemeToggle";

const Topbar = () => {
  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 shadow-md z-50 gap-3">
      {/* Left Section (Title) */}
      <div className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
        {/* Optional: Put page name or logo here */}
      </div>

      {/* Right Section (Actions) */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Notification />
        <ThemeToggle />
        <LogoDropdown />
      </div>
    </header>
  );
};

export default Topbar;
