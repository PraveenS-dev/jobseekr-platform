import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const { theme } = useTheme(); // detects light/dark mode

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
    return <div className="text-center mt-10 text-xl font-semibold">Loading dashboard...</div>;
  }

  const isDark = theme === 'dark';

  const pieOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
    },
    labels: [],
    legend: {
      labels: {
        colors: isDark ? '#fff' : '#000'
      }
    },
    dataLabels: {
      style: {
        colors: [isDark ? '#fff' : '#000']
      }
    }
  };

  const donutOptions = {
    ...pieOptions,
    chart: { type: 'donut' },
  };

  const barOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false }
    },
    xaxis: {
      categories: ['Admins', 'Employers', 'Jobseekers'],
      labels: {
        style: { colors: isDark ? '#fff' : '#000' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#fff' : '#000' }
      }
    },
    legend: {
      labels: {
        colors: isDark ? '#fff' : '#000'
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '40%',
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'
    },
    fill: {
      colors: ['#00E396']
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Chart 1: User Role Pie */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">User Role Distribution</h2>
        <ReactApexChart
          options={{ ...pieOptions, labels: ['Admins', 'Employers', 'Job Seekers'] }}
          series={[data.total_admins, data.total_employer, data.total_jobseekers]}
          type="pie"
          height={300}
        />
      </motion.div>

      {/* Chart 2: Users by Role - Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Users by Role</h2>
        <ReactApexChart
          options={barOptions}
          series={[{
            name: 'Users',
            data: [data.total_admins, data.total_employer, data.total_jobseekers]
          }]}
          type="bar"
          height={300}
        />
      </motion.div>

      {/* Chart 3: Overall Stats - Donut */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Overall Stats</h2>
        <ReactApexChart
          options={{ ...donutOptions, labels: ['Users', 'Applications', 'Bookmarks'] }}
          series={[data.total_users, data.total_applications, data.total_bookmarks]}
          type="donut"
          height={300}
        />
      </motion.div>

      {/* Chart 4: Applications vs Bookmarks - Pie */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-center dark:text-white mb-4">Applications vs Bookmarks</h2>
        <ReactApexChart
          options={{ ...pieOptions, labels: ['Applications', 'Bookmarks'] }}
          series={[data.total_applications, data.total_bookmarks]}
          type="pie"
          height={300}
        />
      </motion.div>
    </div>
  );
};
