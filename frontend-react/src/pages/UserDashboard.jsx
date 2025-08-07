import { React, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const UserDashboard = () => {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [id, setId] = useState('');

    const GetUserData = async () => {
        try {
            const res = await api.get('/users/profile');
            const details = res.data.data?.userDetails;

            if (details) {
                setUserData(details);
                setId(details.enc_id);
            }
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    const Jobs = () => {
        navigate('/jobs')
    }

    const handleEditProfile = (id) => {
        navigate(`/users/editProfile/${id}`, { state: { from: location.pathname } });
    };

    useEffect(() => {
        GetUserData();
    }, [])


    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <motion.div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 max-w-xl w-full text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <FaUserCircle className="text-6xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Welcome{user?.name ? `, ${user.name}` : ''}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    This is your personalized <span className="text-blue-600 dark:text-blue-400 font-medium">job dashboard</span>.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => Jobs()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
                        View Jobs
                    </button>
                    <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer" onClick={() => handleEditProfile(id)}>
                        Edit Profile
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
