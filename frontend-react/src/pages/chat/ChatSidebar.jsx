import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ChatSidebar({
    users,
    currentUserId,
    onSelectUser,
    selectedUser,
    unreadCounts,
    onlineUserIds
}) {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.selectedChatUser) {
            const profileUser = location.state.selectedChatUser;
            const foundUser = users.find(u => String(u.userId) === String(profileUser.id));

            if (foundUser) {
                onSelectUser(foundUser);
            } else {
                onSelectUser({
                    userId: profileUser.id,
                    name: profileUser.name,
                    profile_path: profileUser.profile,
                    online: onlineUserIds.includes(String(profileUser.id))
                });
            }
        }
    }, [location.state, users, onlineUserIds]);

    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700">
            
            {/* Header */}
            <div className="flex-shrink-0 flex items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-sm">
                <div className="text-base sm:text-lg tracking-wide">💬 Chats</div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {users
                    .filter(u => u.userId !== currentUserId)
                    .map(user => {
                        const isSelected = user.userId === selectedUser?.userId;
                        const unread = unreadCounts?.[user.userId] || 0;

                        return (
                            <div
                                key={user.userId}
                                onClick={() => onSelectUser(user)}
                                className={`flex items-center justify-between p-2 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-sm
                                    ${isSelected
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-[1.02]"
                                        : "bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-700 dark:hover:to-gray-800"
                                    }`}
                            >
                                {/* Profile */}
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={user.profile_path || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&size=40`}
                                            alt="Profile"
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-transparent shadow-sm"
                                        />
                                        <span
                                            className={`absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white dark:border-gray-800
                                                ${user.online ? "bg-green-500" : "bg-gray-400"}`}
                                        ></span>
                                    </div>
                                    <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                                        <div className={`font-semibold text-xs sm:text-sm truncate ${isSelected ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
                                            {user.name || user.username}
                                        </div>
                                        <div className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                                            {user.online ? "Online" : "Offline"}
                                        </div>
                                    </div>
                                </div>

                                {/* Unread badge */}
                                {unread > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-md flex-shrink-0">
                                        {unread > 99 ? '99+' : unread}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                
                {/* Empty state */}
                {users.filter(u => u.userId !== currentUserId).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-2xl mb-2">💬</div>
                        <div className="text-sm text-center">No conversations yet</div>
                    </div>
                )}
            </div>
        </div>
    );
}
