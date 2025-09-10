import React from 'react'
import { io } from "socket.io-client";
import { FaBell } from "react-icons/fa";
import { socket } from '../../socket';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

export const Notification = () => {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000); // in seconds

        if (diff < 60) return `${diff} sec${diff > 1 ? "s" : ""} ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} min${diff >= 120 ? "s" : ""} ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour${diff >= 7200 ? "s" : ""} ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} day${diff >= 172800 ? "s" : ""} ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${diff >= 5184000 ? "s" : ""} ago`;
        return `${Math.floor(diff / 31536000)} year${diff >= 63072000 ? "s" : ""} ago`;
    };

    useEffect(() => {
        socket.emit("join", user.id);
    }, [user.id]);

    useEffect(() => {

        socket.on("notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((count) => count + 1);
        });

        (async () => {
            const res = await api.get(`/notification/getNotification`);

            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.is_read).length);
        })();

        return () => {
            socket.off("notification");
        };
    }, [user.id]);

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    const markAllAsRead = async (id = '') => {
        await api.post("/notification/markAllRead", { id });

        if (id) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => prev - 1);
        } else {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };
    const reDirectPage = (url) => {
        if (url != null && url != '') {
            navigate(url);
        }

    }


    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-md hover:shadow-blue-500/40 hover:scale-110 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-300 ease-out"
            >
                <FaBell className="text-blue-600 dark:text-blue-400 text-2xl drop-shadow-sm" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <div
                className={`fixed top-16 left-2 right-2 sm:absolute sm:top-auto sm:left-auto sm:right-0 mt-0 sm:mt-3 w-[calc(100vw-1rem)] sm:w-[420px] min-w-[280px] max-w-[100vw] bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/40 overflow-hidden z-50 transform transition-all duration-300 ease-out origin-top ${isOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
            >
                <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 shadow-md">
                    <span className="font-semibold text-white text-lg drop-shadow">
                        Notifications
                    </span>
                    <button
                        onClick={() => markAllAsRead(null)} // wrap in arrow function
                        className="text-xs font-medium text-white/90 hover:text-yellow-200 underline-offset-2 hover:underline transition cursor-pointer"
                    >
                        Mark all as read
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400/50 scrollbar-track-transparent p-3">
                    {notifications.length === 0 ? (
                        <p className="text-center py-6 text-gray-600 dark:text-gray-300 italic">
                            No notifications
                        </p>
                    ) : (
                        notifications.map((n, idx) => {
                            const isUnread = !n.is_read;
                            return (
                                <div key={idx} onClick={() => { markAllAsRead(n.id); reDirectPage(n.url) }
                                }>
                                    <div
                                        className={`p-4 rounded-xl shadow-sm transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${isUnread
                                            ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500"
                                            : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h4
                                                className={`font-semibold text-sm ${isUnread
                                                    ? "text-blue-800 dark:text-blue-300"
                                                    : "text-gray-800 dark:text-gray-200"
                                                    }`}
                                            >
                                                {n.title}
                                            </h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTimeAgo(n.created_at)}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-snug">
                                            {n.message}
                                        </p>
                                    </div>

                                    {idx !== notifications.length - 1 && (
                                        <div className="flex items-center my-3">
                                            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-white/20 dark:border-gray-700/40 px-5 py-3 bg-gray-50/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <Link
                        to="/notifications"
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition"
                    >
                        View All
                    </Link>
                </div>
            </div>
        </div >
    );

}
