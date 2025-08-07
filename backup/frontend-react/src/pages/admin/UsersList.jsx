import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FaSearch, FaSyncAlt, FaTrash, FaBan, FaUnlock, FaEye } from 'react-icons/fa';
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from "react-router-dom";


const UsersList = () => {
    const [userList, setUserList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const MySwal = withReactContent(Swal);
    const navigate = useNavigate()
    

    const FetchUsers = async (search = "") => {
        try {
            const res = await api.get("/users/list", {
                params: { search },
            });
            setUserList(res.data.data.usersDetails.list);
        } catch (err) {
            toast.error("Failed to fetch users.");
        }
    };

    useEffect(() => {
        FetchUsers();
    }, []);

    const FilterSubmit = (e) => {
        e.preventDefault();
        FetchUsers(searchTerm);
    };

    const Reset = () => {
        setSearchTerm("");
        FetchUsers();
    };

    const handleStatusChange = async (id, status) => {
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
                toast.success(
                    status === 1 ? "User blocked successfully" : "User unblocked successfully"
                );
                FetchUsers(searchTerm);
            } catch {
                toast.error("Failed to change status.");
            }
        }
    };

    const handleDelete = async (id) => {

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
    };

    const Viewprofile = (id) => {
        navigate(`/users/view/${id}`, { state: { from: location.pathname } });
    }

    return (
        <div className="p-2 sm:p-4 animate-fade-in">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Search + Reset */}
            <form
                onSubmit={FilterSubmit}
                className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
                <div className="relative w-full sm:w-[300px]">
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

                <button
                    type="submit"
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
                >
                    <FaSearch />
                    <span className="hidden sm:inline">Search</span>
                </button>

                <button
                    type="reset"
                    onClick={Reset}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
                >
                    <FaSyncAlt />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </form>

            {/* Mobile Card View */}
            <div className="block sm:hidden">
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
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            u.status === 1 
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
                                            className={`flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded transition ${
                                                u.status === 1
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

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm text-left border dark:border-gray-600 dark:text-gray-100">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-2 border dark:border-gray-700">Name</th>
                            <th className="px-4 py-2 border dark:border-gray-700">Email</th>
                            <th className="px-4 py-2 border dark:border-gray-700">Role</th>
                            <th className="px-4 py-2 border dark:border-gray-700">Status</th>
                            <th className="px-4 py-2 border dark:border-gray-700">Created At</th>
                            <th className="px-4 py-2 border dark:border-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList && userList.length > 0 ? (
                            userList.map((u) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-2 border dark:border-gray-700">{u.name}</td>
                                    <td className="px-4 py-2 border dark:border-gray-700">{u.email}</td>
                                    <td className="px-4 py-2 border dark:border-gray-700">
                                        {u.role_name}
                                    </td>
                                    <td className="px-4 py-2 border dark:border-gray-700">
                                        {u.status === 1 ? (
                                            <span className="text-green-500 font-semibold">Active</span>
                                        ) : (
                                            <span className="text-red-500 font-semibold">Blocked</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border dark:border-gray-700">
                                        {u.created_at}
                                    </td>

                                    <td className="px-4 py-2 border dark:border-gray-700 space-x-2 text-center flex">
                                        <button
                                            onClick={() => handleStatusChange(u.id, u.status)}
                                            className={`flex items-center justify-center gap-1 px-2 py-1 text-sm rounded cursor-pointer transition ${u.status === 1
                                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            {u.status === 1 ? <FaBan /> : <FaUnlock />}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="flex items-center justify-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition cursor-pointer"
                                        >
                                            <FaTrash />
                                        </button>

                                        <button
                                            onClick={() => Viewprofile(u.enc_id)}
                                            className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition cursor-pointer"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>

                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersList;
