import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserDashboard } from './UserDashboard';

export const Dashboard = () => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user && user.role === 2) {
            setIsAdmin(true);
        }
    }, [user]);

    return (
        <>
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </>
    );
};
