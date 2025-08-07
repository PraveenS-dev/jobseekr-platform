import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import api from "../../services/api";

export default function ChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userList, setUserList] = useState([]);
    const [lastActiveMap, setLastActiveMap] = useState({});
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const { user } = useAuth();
    const myUserId = user.id;

    const getMessageUserList = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_NODE_BASE_URL}/chat/user/getMessageUserList/${user.id}`
            );
            const chats = Array.isArray(res.data) ? res.data : [];

            const unreadMap = {};
            chats.forEach(chat => {
                unreadMap[String(chat._id)] = chat.unreadCount || 0;
            });
            setUnreadCounts(unreadMap);

            const updatedLastActive = {};
            chats.forEach(chat => {
                updatedLastActive[String(chat._id)] = new Date(chat.latestMessage.timestamp).getTime();
            });
            setLastActiveMap(updatedLastActive);

            chats.forEach(chat => {
                if (!userList.some(u => String(u.id) === String(chat._id))) {
                    GetUserData(chat._id);
                }
            });
        } catch (err) {
            console.error("Failed to fetch chat list", err);
        }
    };

    const GetUserData = async (id) => {
        try {
            const res = await api.get("/users/view", { params: { id } });
            const details = res.data.data?.userDetails;
            if (details) {
                setUserList(prev => {
                    if (!prev.some(u => String(u.id) === String(details.id))) {
                        return [...prev, details];
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    useEffect(() => {
        getMessageUserList();
    }, []);

    useEffect(() => {
        const handlePrivateMsg = (msg) => {
            const contactId = String(
                msg.senderId === myUserId ? msg.receiverId : msg.senderId
            );

            setLastActiveMap(prev => ({
                ...prev,
                [contactId]: new Date(msg.timestamp || Date.now()).getTime()
            }));

            if (msg.receiverId === myUserId && contactId !== selectedUser?.userId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [contactId]: (prev[contactId] || 0) + 1
                }));
            }
        };

        socket.on("PrivateMsg", handlePrivateMsg);
        return () => socket.off("PrivateMsg", handlePrivateMsg);
    }, [myUserId, selectedUser]);

    useEffect(() => {
        socket.emit("join", myUserId);
        socket.on("onlineUsers", (ids) => {
            setOnlineUserIds(ids.map(String));
        });
        return () => socket.off("onlineUsers");
    }, [myUserId]);

    useEffect(() => {
        const merged = userList.map(u => ({
            userId: u.id,
            username: u.username,
            name: u.name,
            profile_path: u.profile_path,
            online: onlineUserIds.includes(String(u.id)),
            lastMessageTime: lastActiveMap[String(u.id)] || 0
        }));

        merged.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

        setUsers(merged);

        if (selectedUser) {
            const stillExists = merged.find(u => String(u.userId) === String(selectedUser.userId));
            if (stillExists) {
                setSelectedUser(stillExists);
            }
        }
    }, [userList, onlineUserIds, lastActiveMap]);

    const handleSelectUser = async (user) => {
        setSelectedUser(user);

        setUnreadCounts(prev => ({
            ...prev,
            [user.userId]: 0
        }));

        try {
            await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/chat/markAsRead`, {
                senderId: user.userId,
                receiverId: myUserId
            });
        } catch (err) {
            console.error("Failed to mark messages as read", err);
        }

        socket.emit("markAsRead", {
            senderId: user.userId,
            receiverId: myUserId
        });
    };

    const handleBack = () => {
        setSelectedUser(null);
    };

    return (
        <div
            className="flex w-full h-full
            bg-gradient-to-b from-blue-50 via-white to-blue-50 
            dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
            transition-colors duration-500"
            style={{ height: "calc(100vh - 90px)" }}
        >
            <div className="hidden lg:flex w-full h-full rounded-2xl overflow-hidden 
                shadow-2xl border border-gray-200 dark:border-gray-800 
                transition-all duration-500"
                style={{
                    backdropFilter: "blur(20px)",
                    background: "var(--chat-bg)"
                }}
            >
                <div className="w-80 flex-shrink-0">
                    <ChatSidebar
                        users={users}
                        currentUserId={myUserId}
                        onSelectUser={handleSelectUser}
                        selectedUser={selectedUser}
                        unreadCounts={unreadCounts}
                        onlineUserIds={onlineUserIds}
                    />
                </div>
                
                <div className="flex-1">
                    {selectedUser ? (
                        <ChatWindow
                            myUserId={myUserId}
                            selectedUser={selectedUser}
                            onBack={handleBack}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-6xl mb-4">💬</div>
                            <div className="text-lg font-medium">Select a conversation to start chatting</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:hidden w-full h-full">
                {selectedUser ? (
                    <ChatWindow
                        myUserId={myUserId}
                        selectedUser={selectedUser}
                        onBack={handleBack}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-blue-50 via-white to-blue-50 
                        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
                        transition-colors duration-500"
                    >
                        <ChatSidebar
                            users={users}
                            currentUserId={myUserId}
                            onSelectUser={handleSelectUser}
                            selectedUser={selectedUser}
                            unreadCounts={unreadCounts}
                            onlineUserIds={onlineUserIds}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
