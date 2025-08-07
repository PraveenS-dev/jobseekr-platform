import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaEnvelope, FaMapPin, FaBriefcase } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Connections = () => {
    const [users, setUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch random 10 users (role != 2)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users/connections", {
                params: {
                    limit: 10,
                    exclude_role: 2,
                    current_user_id: user.id
                }
            });
            
            if (response.data.success) {
                setUsers(response.data.data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        } finally {
            setLoading(false);
        }
    };

    // Search users across all database
    const searchUsers = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setSearchLoading(true);
            setIsSearching(true);
            
            const response = await api.get("/users/search-connections", {
                params: {
                    search: term,
                    exclude_role: 2,
                    current_user_id: user.id
                }
            });
            
            if (response.data.success) {
                setSearchResults(response.data.data.users || []);
            }
        } catch (error) {
            console.error("Failed to search connections:", error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                searchUsers(searchTerm);
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Handle user profile navigation
    const handleUserClick = (userId) => {
        navigate(`/users/view/${userId}`, { 
            state: { from: '/connections' } 
        });
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false);
    };

    // Determine which users to display
    const displayUsers = isSearching ? searchResults : users;
    const showNoResults = isSearching && searchResults.length === 0 && !searchLoading;
    const showEmptyState = !isSearching && users.length === 0 && !loading;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        🔗 Connections
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        Discover and connect with amazing people
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative mb-8"
                >
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, username, or email..."
                            className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                                transition-all duration-300 shadow-lg"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                                    transition-colors duration-200"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Users Grid */}
                <div className="relative">
                    {/* Blur/Overlay when searching */}
                    <AnimatePresence>
                        {isSearching && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl z-10"
                                style={{ pointerEvents: 'none' }}
                            />
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <AnimatePresence>
                                {displayUsers.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        onClick={() => handleUserClick(user.enc_id)}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl 
                                            border border-gray-200 dark:border-gray-700 cursor-pointer 
                                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                                            group relative z-20"
                                    >
                                        {/* User Avatar */}
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={user.profile_path || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&size=60`}
                                                alt={user.name}
                                                className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 shadow-md"
                                            />
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {user.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <FaEnvelope className="mr-2 text-blue-500" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            
                                            {user.location && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <FaMapPin className="mr-2 text-green-500" />
                                                    <span className="truncate">{user.location}</span>
                                                </div>
                                            )}
                                            
                                            {user.headline && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <FaBriefcase className="mr-2 text-purple-500" />
                                                    <span className="truncate">{user.headline}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        {user.skills && (
                                            <div className="mt-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.skills.split(',').slice(0, 3).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                                                        >
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                    {user.skills.split(',').length > 3 && (
                                                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                                            +{user.skills.split(',').length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Search Loading */}
                    {searchLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 relative z-20"
                        >
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
                        </motion.div>
                    )}

                    {/* No Search Results */}
                    {showNoResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 relative z-20"
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No connections found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try adjusting your search terms
                            </p>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {showEmptyState && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No connections available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Check back later for new connections
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Connections; 