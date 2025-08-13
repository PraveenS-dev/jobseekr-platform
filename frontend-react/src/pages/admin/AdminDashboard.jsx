import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const { theme } = useTheme();

  const LaravelDashData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data.data.success);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    LaravelDashData();
  }, []);

  if (!data) {
    return <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  const isDark = theme === 'dark';

  const baseChartOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    legend: {
      labels: { colors: isDark ? '#fff' : '#000' },
    },
    dataLabels: {
      style: { colors: [isDark ? '#fff' : '#000'] },
    },
    responsive: [
      {
        breakpoint: 640, // mobile
        options: {
          legend: { position: 'bottom', horizontalAlign: 'center' },
        },
      },
      {
        breakpoint: 768, // small tablets
        options: {
          legend: { position: 'bottom', horizontalAlign: 'center' },
        },
      },
    ],
  };

  const pieOptions = {
    ...baseChartOptions,
    chart: { type: 'pie' },
  };

  const donutOptions = {
    ...baseChartOptions,
    chart: { type: 'donut' },
  };

  const barOptions = {
    ...baseChartOptions,
    chart: { type: 'bar' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%',
      },
    },
    xaxis: {
      categories: ['Admins', 'Employers', 'Jobseekers'],
      labels: { style: { colors: isDark ? '#fff' : '#000' } },
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#fff' : '#000' } },
    },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    fill: { colors: ['#00E396'] },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: { bar: { columnWidth: '70%' } },
          legend: { position: 'bottom', horizontalAlign: 'center' },
        },
      },
    ],
  };

  const getChartHeight = () => {
    if (window.innerWidth < 640) return 250;
    if (window.innerWidth < 768) return 280;
    return 300;
  };

  return (
    <div className="p-2 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md w-full"
      >
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">User Role Distribution</h2>
        <ReactApexChart
          options={{ ...pieOptions, labels: ['Admins', 'Employers', 'Job Seekers'] }}
          series={[data.total_admins, data.total_employer, data.total_jobseekers]}
          type="pie"
          height={getChartHeight()}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md w-full"
      >
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Users by Role</h2>
        <ReactApexChart
          options={barOptions}
          series={[{ name: 'Users', data: [data.total_admins, data.total_employer, data.total_jobseekers] }]}
          type="bar"
          height={getChartHeight()}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md w-full"
      >
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Overall Stats</h2>
        <ReactApexChart
          options={{ ...donutOptions, labels: ['Users', 'Applications', 'Bookmarks'] }}
          series={[data.total_users, data.total_applications, data.total_bookmarks]}
          type="donut"
          height={getChartHeight()}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md w-full"
      >
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Applications vs Bookmarks</h2>
        <ReactApexChart
          options={{ ...pieOptions, labels: ['Applications', 'Bookmarks'] }}
          series={[data.total_applications, data.total_bookmarks]}
          type="pie"
          height={getChartHeight()}
        />
      </motion.div>
    </div>
  );
};
