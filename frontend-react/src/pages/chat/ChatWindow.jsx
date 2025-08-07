import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import MessageBubble from "./MessageBubble";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ChatWindow({ myUserId, selectedUser, onBack }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [friendTyping, setFriendTyping] = useState(false);
    const lastMessageRef = useRef(null);
    const navigate = useNavigate();

    const selectedUserId = selectedUser?.userId;

    // Load chat history
    useEffect(() => {
        if (!selectedUserId) return;

        axios
            .get(`${import.meta.env.VITE_NODE_BASE_URL}/chat/${myUserId}/${selectedUserId}`)
            .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
            .catch(() => setMessages([]));
    }, [selectedUserId, myUserId]);

    // Handle incoming messages
    useEffect(() => {
        if (!selectedUserId) return;

        const handlePrivateMsg = (message) => {
            const isForCurrentChat =
                (String(message.senderId) === String(selectedUserId) &&
                    String(message.receiverId) === String(myUserId)) ||
                (String(message.senderId) === String(myUserId) &&
                    String(message.receiverId) === String(selectedUserId));

            if (!isForCurrentChat) return;

            setMessages((prev) => {
                if (message.tempId) {
                    const exists = prev.find((m) => m.tempId === message.tempId);
                    if (exists) {
                        return prev.map((m) =>
                            m.tempId === message.tempId ? { ...m, ...message } : m
                        );
                    }
                }
                if (message._id && prev.some((m) => m._id === message._id)) {
                    return prev;
                }
                return [...prev, message];
            });
        };

        socket.on("PrivateMsg", handlePrivateMsg);
        return () => socket.off("PrivateMsg", handlePrivateMsg);
    }, [selectedUserId, myUserId]);

    // Typing indicator
    useEffect(() => {
        if (!selectedUserId) return;

        const handleTyping = ({ senderId, isTyping }) => {
            if (String(senderId) === String(selectedUserId)) {
                setFriendTyping(isTyping);
            }
        };

        socket.on("typing", handleTyping);
        return () => socket.off("typing", handleTyping);
    }, [selectedUserId]);

    // Handle input typing
    const handleTypingChange = (e) => {
        setInput(e.target.value);
        if (!typing) {
            setTyping(true);
            socket.emit("typing", { senderId: myUserId, receiverId: selectedUserId, isTyping: true });
        }
        setTimeout(() => {
            setTyping(false);
            socket.emit("typing", { senderId: myUserId, receiverId: selectedUserId, isTyping: false });
        }, 1000);
    };

    // Send message
    const sendMessage = () => {
        if (!input.trim()) return;

        const tempId = Date.now();
        const tempMessage = {
            tempId,
            senderId: myUserId,
            receiverId: selectedUserId,
            text: input,
            status: 1,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, tempMessage]);
        socket.emit("PrivateMsg", tempMessage);
        setInput("");
    };

    // Listen for read receipts
    useEffect(() => {
        const handleMessagesRead = ({ readerId }) => {
            if (String(readerId) === String(selectedUserId)) {
                setMessages(prev => prev.map(m => ({ ...m, status: 3 })));
            }
        };
        socket.on("messagesRead", handleMessagesRead);
        return () => socket.off("messagesRead", handleMessagesRead);
    }, [selectedUserId]);

    // Auto-scroll to last message
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Handle user profile navigation
    const handleUserProfileClick = () => {
        navigate(`/users/view/${selectedUser?.userId}`, { 
            state: { from: '/chats' } 
        });
    };

    return (
        <div
            className="flex flex-col w-full h-full
        bg-gradient-to-b from-blue-50 via-white to-blue-50 
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
        transition-colors duration-500"
        >

            {/* Header */}
            <div
                className="flex-shrink-0 flex items-center p-3 
            border-b border-blue-100 dark:border-gray-800 
            bg-gradient-to-r from-blue-500 to-blue-600 
            dark:from-blue-700 dark:to-blue-900 shadow-md"
            >
                <button
                    onClick={onBack}
                    className="text-white mr-2 sm:mr-3 hover:scale-110 transition-transform p-1"
                >
                    <FaArrowLeft size={16} />
                </button>
                
                <img
                    src={selectedUser?.profile_path || `https://ui-avatars.com/api/?name=${selectedUser?.name || "U"}&size=40`}
                    alt="User Avatar"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 object-cover 
                border-2 border-white shadow-md"
                />
                <div className="flex-1 min-w-0">
                    <button
                        onClick={handleUserProfileClick}
                        className="text-left w-full hover:opacity-80 transition-opacity"
                    >
                        <div className="font-semibold text-white text-sm sm:text-base truncate hover:underline">
                            {selectedUser?.name || "Unknown User"}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-100 dark:text-blue-200">
                            {selectedUser?.online ? "🟢 Online" : "⚪ Offline"}
                        </div>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 
            scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-800 chat-scroll"
            >
                {messages.map((msg, i) => (
                    <div key={i} ref={i === messages.length - 1 ? lastMessageRef : null}>
                        <MessageBubble message={msg} myUserId={myUserId} />
                    </div>
                ))}
                {friendTyping && (
                    <p className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 italic">
                        Typing...
                    </p>
                )}
            </div>

            {/* Input */}
            <div
                className="flex-shrink-0 p-2 sm:p-3 border-t border-blue-100 dark:border-gray-800 
            flex items-end gap-2 bg-white/70 dark:bg-gray-900/60 
            backdrop-blur-md shadow-inner"
            >
                <textarea
                    value={input}
                    onChange={handleTypingChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl px-3 sm:px-4 py-2 
                text-gray-800 dark:text-gray-100 text-sm sm:text-base
                bg-white dark:bg-gray-800 
                focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                shadow-sm transition-all"
                />
                <button
                    onClick={sendMessage}
                    className="px-3 sm:px-5 py-2 rounded-xl 
                bg-gradient-to-r from-blue-500 to-blue-600 
                dark:from-blue-600 dark:to-blue-800 
                text-white font-medium shadow-md hover:shadow-lg 
                hover:scale-105 transition-transform text-sm sm:text-base"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
