// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch logged-in user
    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get('/user');
            setUser(res.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = useCallback(async (email, password) => {
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            await fetchUser();
        } catch (error) {
            throw error; // let the UI handle the error
        }
    }, [fetchUser]);

    // Register function
    const register = useCallback(async (form) => {
        try {
            const res = await api.post('/register', form);
            localStorage.setItem('token', res.data.access_token);
            await fetchUser();
        } catch (error) {
            throw error;
        }
    }, [fetchUser]);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.warn('Logout request failed, clearing token anyway.');
        }
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // On mount → check token & fetch user
    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser: fetchUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
