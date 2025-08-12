import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full p-1 transition-all duration-500 shadow-lg overflow-hidden
                 bg-gradient-to-r from-yellow-400 via-blue-200 to-blue-500
                 dark:from-indigo-800 dark:via-purple-800 dark:to-blue-900
                 hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
      aria-label="Toggle Theme">
        
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold">
        {/* Day side */}
        <div className="flex flex-col items-center space-y-0.5">
          <Sun className="text-yellow-300 drop-shadow" size={14} />
          <div className="w-2 h-1 bg-white/90 rounded-full"></div>
        </div>
        {/* Night side */}
        <div className="flex flex-col items-center space-y-0.5">
          <Moon className="text-yellow-200 drop-shadow" size={14} />
          <div className="flex space-x-0.5">
            <span className="w-0.5 h-0.5 bg-yellow-100 rounded-full"></span>
            <span className="w-0.5 h-0.5 bg-yellow-200 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Knob with 3D effect */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.2)] 
                    bg-gradient-to-b from-white to-gray-200 transition-transform duration-500
                    ${dark ? "translate-x-8" : "translate-x-0"}`}
      />
    </button>
  );
}
