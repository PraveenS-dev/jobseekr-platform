import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FaSearch, FaSyncAlt, FaTrash, FaBan, FaUnlock, FaEye } from 'react-icons/fa';
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useTheme } from "../../contexts/ThemeContext";


const UsersList = () => {
    const [userList, setUserList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const MySwal = withReactContent(Swal);
    const navigate = useNavigate();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();

    // Compute styles directly from the current theme so they update immediately on toggle
    const isDark = theme === "dark";

    const selectTheme = (defaultTheme) => ({
        ...defaultTheme,
        borderRadius: 12,
        colors: {
            ...defaultTheme.colors,
            primary25: isDark ? "#334155" : "#bfdbfe",
            primary: "#3b82f6",
            neutral0: isDark ? "#1e293b" : "#ffffff",
            neutral80: isDark ? "#f1f5f9" : "#000000",
            neutral20: isDark ? "#475569" : "#d1d5db",
            neutral30: isDark ? "#64748b" : "#9ca3af",
        },
    });

    // Memoize select options so they're not re-created every render
    const perPageOptions = useMemo(() => [
        { value: 1, label: "1 per page" },
        { value: 5, label: "5 per page" },
        { value: 10, label: "10 per page" },
        { value: 20, label: "20 per page" },
        { value: 50, label: "50 per page" },
        { value: 100, label: "100 per page" },
    ], []);

    // Inline style object (no memoization) so it recalculates on every render
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            background: isDark
                ? "linear-gradient(to bottom right, #1e293b, #0f172a)"
                : "linear-gradient(to bottom right, white, #ebf8ff)",
            borderRadius: "12px",
            border: state.isFocused
                ? "2px solid #3b82f6"
                : `1px solid ${isDark ? "#475569" : "rgba(0,0,0,0.1)"}`,
            boxShadow: state.isFocused
                ? "0 4px 12px rgba(0,0,0,0.15)"
                : "0 2px 6px rgba(0,0,0,0.08)",
            padding: "4px",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
        }),
        menu: (base) => ({
            ...base,
            background: isDark
                ? "linear-gradient(to bottom right, #1e293b, #0f172a)"
                : "linear-gradient(to bottom right, white, #ebf8ff)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused
                ? "linear-gradient(to bottom right, #3b82f6, #1e3a8a)"
                : "transparent",
            color: state.isFocused ? "white" : isDark ? "#f1f5f9" : "black",
            padding: "10px 15px",
            cursor: "pointer",
        }),
        singleValue: (base) => ({
            ...base,
            color: isDark ? "#f1f5f9" : "#111",
            fontWeight: "500",
        }),
        placeholder: (base) => ({
            ...base,
            color: isDark ? "#94a3b8" : "#6b7280",
        }),
        input: (base) => ({
            ...base,
            color: isDark ? "#f1f5f9" : "#111",
        }),
    };


    const FetchUsers = useCallback(async (search = "", page = currentPage, per_page = perPage) => {
        try {
            setLoading(true);
            const res = await api.get("/users/list", {
                params: { search, page, per_page },
            });
            const details = res.data.data.usersDetails;
            setUserList(details.list);
            setPagination({
                current_page: details.current_page,
                total_page: details.total_page,
                total: details.total
            });
        } catch {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage]);

    useEffect(() => {
        FetchUsers(searchTerm, currentPage, perPage);
    }, [FetchUsers, searchTerm, currentPage, perPage]);

    const FilterSubmit = useCallback((e) => {
        e.preventDefault();
        setCurrentPage(1);
        FetchUsers(searchTerm, 1, perPage);
    }, [FetchUsers, searchTerm, perPage]);

    const Reset = useCallback(() => {
        setSearchTerm("");
        setPerPage(10);
        setCurrentPage(1);
        FetchUsers("", 1, 10);
    }, [FetchUsers]);

    const handleStatusChange = useCallback(async (id, status) => {
        const actionText = status === 1 ? "block" : "unblock";
        const result = await MySwal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${actionText} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${actionText}`,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            confirmButtonColor: status === 1 ? '#e74c3c' : '#27ae60',
        });

        if (result.isConfirmed) {
            try {
                await api.post("/users/statuschange", { id, types: status });
                toast.success(status === 1 ? "User blocked successfully" : "User unblocked successfully");
                FetchUsers(searchTerm);
            } catch {
                toast.error("Failed to change status.");
            }
        }
    }, [MySwal, FetchUsers, searchTerm]);

    const handleDelete = useCallback(async (id) => {
        const result = await MySwal.fire({
            title: `Are you sure?`,
            text: `Do you want to Delete this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, Delete`,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            confirmButtonColor: '#e74c3c',
        });

        if (result.isConfirmed) {
            try {
                const res = await api.post("/users/deleteUser", { id });
                toast.success(res.data.data?.message);
                FetchUsers(searchTerm);
            } catch {
                toast.error("Failed to delete user.");
            }
        }
    }, [MySwal, FetchUsers, searchTerm]);

    const Viewprofile = useCallback((id) => {
        navigate(`/users/view/${id}`, { state: { from: location.pathname } });
    }, [navigate]);

    const LoadingRows = useMemo(() =>
        Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
                <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 w-full bg-blue-100 dark:bg-blue-900 rounded"></div>
                </td>
            </tr>
        )), []
    );

    return (
        <div
            key={theme}
            className="p-2 sm:p-4 animate-fade-in bg-gray-100 dark:bg-gray-900 max-w-full overflow-x-auto"
        >
            <Toaster position="top-right" reverseOrder={false} />

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Select
                    key={theme}
                    classNamePrefix="rs"
                    value={perPageOptions.find(opt => opt.value === perPage)}
                    onChange={(selected) => {
                        setPerPage(selected.value);
                        setCurrentPage(1);
                    }}
                    options={perPageOptions}
                    styles={selectStyles}
                    theme={selectTheme}
                />


                <form
                    onSubmit={FilterSubmit}
                    className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 w-full sm:w-auto"
                >
                    <div className="relative w-full max-w-[300px]">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 shadow-sm text-sm sm:text-base"
                        />
                    </div>
                    <button type="submit" className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base">
                        <FaSearch />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                    <button type="reset" onClick={Reset} className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base">
                        <FaSyncAlt />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </form>
            </div>

            {/* Render only one view depending on screen size */}
            <div className="block lg:hidden">
                <div className="space-y-3">
                    {userList && userList.length > 0 ? (
                        userList.map((u) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{u.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{u.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${u.status === 1
                                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                            }`}>
                                            {u.status === 1 ? "Active" : "Blocked"}
                                        </span>
                                    </div>

                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        <p><span className="font-medium">Role:</span> {u.role_name}</p>
                                        <p><span className="font-medium">Created:</span> {u.created_at}</p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleStatusChange(u.id, u.status)}
                                            className={`flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded transition ${u.status === 1
                                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            {u.status === 1 ? <FaBan size={12} /> : <FaUnlock size={12} />}
                                            <span className="hidden xs:inline">{u.status === 1 ? "Block" : "Unblock"}</span>
                                        </button>

                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                                        >
                                            <FaTrash size={12} />
                                            <span className="hidden xs:inline">Delete</span>
                                        </button>

                                        <button
                                            onClick={() => Viewprofile(u.enc_id)}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                                        >
                                            <FaEye size={12} />
                                            <span className="hidden xs:inline">View</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found.
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden lg:block overflow-x-auto p-4 rounded-2xl w-full shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 border border-blue-200 dark:border-blue-800 backdrop-blur-xl">
                <table className="min-w-full w-full text-sm text-left rounded-xl overflow-hidden border border-blue-300 dark:border-blue-700 shadow-md">
                    <thead className="bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-900 text-gray-800 dark:text-gray-100 font-semibold">
                        <tr>
                            {["Name", "Email", "Role", "Status", "Created At", "Action"].map((heading, i) => (
                                <th key={i} className="px-4 py-3 border-b border-blue-300 dark:border-blue-700">{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? LoadingRows : (
                            userList.length > 0 ? (
                                userList.map((u) => (
                                    <motion.tr key={u.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-300 border-b border-blue-200 dark:border-blue-800">
                                        <td className="px-4 py-3 dark:text-white">{u.name}</td>
                                        <td className="px-4 py-3 dark:text-white">{u.email}</td>
                                        <td className="px-4 py-3 dark:text-white">{u.role_name}</td>
                                        <td className="px-4 py-3">{u.status === 1 ? <span className="text-green-500 font-semibold">Active</span> : <span className="text-red-500 font-semibold">Blocked</span>}</td>
                                        <td className="px-4 py-3 dark:text-white">{u.created_at}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button onClick={() => handleStatusChange(u.id, u.status)} className={`flex items-center justify-center gap-1 px-2 py-1 text-sm rounded-lg transition shadow-sm ${u.status === 1 ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                                                {u.status === 1 ? <FaBan /> : <FaUnlock />}
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="flex items-center justify-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition shadow-sm">
                                                <FaTrash />
                                            </button>
                                            <button onClick={() => Viewprofile(u.enc_id)} className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition shadow-sm">
                                                <FaEye />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-6 text-gray-500 dark:text-gray-400">No users found.</td></tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.total_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button disabled={pagination.current_page === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 rounded-xl border border-blue-400 dark:text-white bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-blue-300/50 dark:hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                    {Array.from({ length: pagination.total_page }, (_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105 dark:text-white ${pagination.current_page === i + 1 ? "border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg hover:shadow-blue-400/50" : "border-blue-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 text-gray-800 dark:text-gray-200 hover:shadow-md"}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button disabled={pagination.current_page === pagination.total_page} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 rounded-xl border border-blue-400 dark:text-white bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-blue-300/50 dark:hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
            )}
        </div>
    );
};

export default UsersList;
