import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

function AddJobs() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({ mode: "onChange" });

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/jobs';

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append("comp_id", user.comp_id);
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category_id", data.category_id);
        formData.append("location", data.location);
        formData.append("salary", data.salary);
        formData.append("job_type", data.job_type);
        formData.append("created_by", user.id);
        formData.append("created_by_name", user.name);

        try {
            await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/jobs/store`, formData);
            navigate("/jobs");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md dark:shadow-lg ring-1 ring-gray-200 dark:ring-gray-600">
            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-2 py-2 rounded-md">
                <h2 className="text-2xl font-bold text-center text-white dark:text-white">
                    Add Job
                </h2>
                <button
                    onClick={() => navigate(from)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                    <FaArrowLeft />
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Job Title</label>
                        <input
                            type="text"
                            {...register("title", { required: "Title is required" })}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Description</label>
                    <textarea
                        rows="4"
                        {...register("description", { required: "Description is required" })}
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Category</label>
                        <select
                            {...register("category_id", { required: "Category is required" })}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Category</option>
                            <option value="Software">Software</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Design">Design</option>
                        </select>
                        {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Location</label>
                        <input
                            type="text"
                            {...register("location", { required: "Location is required" })}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Salary</label>
                        <input
                            type="number"
                            {...register("salary", { required: "Salary is required" })}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Job Type</label>
                        <select
                            {...register("job_type", { required: "Job Type is required" })}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Job Type</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                        </select>
                        {errors.job_type && <p className="text-red-500 text-sm mt-1">{errors.job_type.message}</p>}
                    </div>
                </div>

                <div className="text-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Post Job
                    </button>
                </div>
            </form>
        </div>

    );
}

export default AddJobs;
