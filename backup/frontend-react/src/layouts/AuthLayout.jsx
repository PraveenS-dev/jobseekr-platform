import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import authIllustration from '../assets/auth-illustration.png';
import logo from '../assets/logo.png';


const AuthLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-cyan-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-300">

      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <img
          src={authIllustration}
          alt="JobSeekr Illustration"
          className="max-w-lg w-full drop-shadow-xl transform scale-90"
          style={{
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700 text-gray-900 dark:text-gray-100">

          <div className="flex justify-between items-center mb-6">
            <img
              src={logo}
              alt="JobSeekr Logo"
              className="h-8 sm:h-10 object-contain scale-250 ps-3"
            />
            <ThemeToggle />
          </div>

          <div className="mt-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
