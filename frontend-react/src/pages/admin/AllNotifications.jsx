import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return `${diff} sec${diff > 1 ? "s" : ""} ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min${diff >= 120 ? "s" : ""} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${diff >= 7200 ? "s" : ""} ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} day${diff >= 172800 ? "s" : ""} ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${diff >= 5184000 ? "s" : ""} ago`;
    return `${Math.floor(diff / 31536000)} year${diff >= 63072000 ? "s" : ""} ago`;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/notification/getNotification`);
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    })();
  }, [user.id]);

  const markAllAsRead = async (id = '') => {
    try {
      await api.post("/notification/markAllRead", { id });
      if (id) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const reDirectPage = (url) => {
    if (url) {
      navigate(url);
    }
  }

  return (
    <div
      
    >
      <div
        className="p-4 max-h-auto 
        scrollbar-thin scrollbar-thumb-blue-400/50 scrollbar-track-transparent"
      >
        {notifications.length === 0 ? (
          <p className="text-center py-20 text-gray-600 dark:text-gray-300 italic select-none">
            No notifications
          </p>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.is_read;
            return (
              <div
                key={n.id}
                onClick={() => {
                  markAllAsRead(n.id);
                  reDirectPage(n.url);
                }}
                className={`cursor-pointer p-5 mb-3 rounded-2xl transition-transform duration-300 ease-in-out
                  ${isUnread
                    ? "bg-gradient-to-r from-blue-100/70 to-blue-200/60 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-300 dark:border-blue-700 shadow-md hover:shadow-blue-400 hover:scale-[1.03]"
                    : "bg-white/60 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-700 hover:scale-[1.01]"
                  }
                  flex flex-col`}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { markAllAsRead(n.id); reDirectPage(n.url); } }}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4
                    className={`text-lg font-semibold truncate
                      ${isUnread ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 select-none">
                    {formatTimeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {n.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
