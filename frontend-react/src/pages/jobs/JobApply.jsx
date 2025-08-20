import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaMoneyBillAlt,
    FaFilePdf,
    FaUpload,
} from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";


export const JobApply = () => {
    const { id } = useParams();
    const [jobs, setJobs] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [generatedObjectUrl, setGeneratedObjectUrl] = useState(null);
    const [useDefault, setUseDefault] = useState(false);
    

    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || "/jobs";

    const FetchJobDetails = async (id) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_NODE_BASE_URL}/jobs/view/${id}`
            );
            setJobs(res.data.data);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    useEffect(() => {
        FetchJobDetails(id);
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            if (generatedObjectUrl) URL.revokeObjectURL(generatedObjectUrl);
            const url = URL.createObjectURL(file);
            setGeneratedObjectUrl(url);
            setPreviewUrl(url);
            setUseDefault(false);
        } else {
            alert("Only PDF files are allowed");
        }
    };

    const toggleDefaultResume = () => {
        if (!useDefault) {
            Swal.fire({
                title: "Use Default Resume?",
                text: "Are you sure you want to use your saved default resume?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2563eb",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, use it",
            }).then((result) => {
                if (result.isConfirmed) {
                    setUseDefault(true);
                    setPdfFile(null);
                    setPreviewUrl(user.resume_link || null);
                    Swal.fire({
                        title: "Default Resume Selected!",
                        icon: "success",
                        timer: 1200,
                        showConfirmButton: false,
                    });
                }
            });
        } else {
            setUseDefault(false);
            if (generatedObjectUrl) {
                URL.revokeObjectURL(generatedObjectUrl);
                setGeneratedObjectUrl(null);
            }
            setPreviewUrl(null);
            Swal.fire({
                title: "Upload New Resume Enabled",
                icon: "info",
                timer: 1200,
                showConfirmButton: false,
            });
        }
    };

    useEffect(() => {
        return () => {
            if (generatedObjectUrl) URL.revokeObjectURL(generatedObjectUrl);
        };
    }, [generatedObjectUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pdfFile && !useDefault) {
            return alert("Please upload your resume or select 'Use Default'.");
        }

        const formData = new FormData();
        if (useDefault) {
            formData.append("use_default_resume", true);
        } else {
            formData.append("resume", pdfFile);
        }
        formData.append("job_id", id);
        formData.append("job_created_by", jobs.created_by);
        formData.append("job_name", jobs.title);

        try {
            await api.post("/apply", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            Swal.fire({
                title: "Application Submitted!",
                text: "Your job application has been sent successfully.",
                icon: "success",
                confirmButtonColor: "#2563eb",
            }).then(() => navigate(from));
        } catch (err) {
            console.error("Failed to submit application:", err);
            Swal.fire({
                title: "Error!",
                text: "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    const onDocumentLoadSuccess = () => {};

    return (
        <div className="max-w-full mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-4 py-3 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-white">Job Application</h2>
                <button
                    onClick={() => navigate(from)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition"
                >
                    <FaArrowLeft />
                    Back
                </button>
            </div>

            {/* Job Details */}
            {jobs && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {jobs.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-gray-700 dark:text-gray-300 text-sm">
                        <p className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" /> {jobs.location}
                        </p>
                        <p className="flex items-center gap-2">
                            <FaMoneyBillAlt className="text-green-500" /> ₹{jobs.salary}
                        </p>
                        <p>
                            <strong>Category:</strong> {jobs.category_id}
                        </p>
                        <p>
                            <strong>Type:</strong> {jobs.job_type}
                        </p>
                        <p>
                            <strong>Posted By:</strong> {jobs.posted_by_name}
                        </p>
                        <p>
                            <strong>Posted At:</strong>{" "}
                            {dayjs(jobs.created_at).format("DD MMM YYYY, hh:mm A")}
                        </p>
                    </div>

                    <div className="mt-4">
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Description:</strong>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {jobs.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Resume Upload Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-full mx-auto"
            >
                {/* Title */}
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    Upload Your Resume
                </h4>

                <div className="flex flex-col gap-5">
                    {/* File Upload Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Stylish Upload */}
                        <label
                            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-md cursor-pointer transition text-sm font-medium ${useDefault
                                    ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500"
                                    : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200"
                                }`}
                        >
                            <FaUpload className="text-blue-600 dark:text-blue-300" />
                            <span>Choose File</span>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                disabled={useDefault}
                                className="hidden"
                            />
                        </label>

                        {/* Toggle Button */}
                        {user.resume_link && (
                            <button
                                type="button"
                                onClick={toggleDefaultResume}
                                className={`px-5 py-3 rounded-lg font-medium text-white shadow-md transition ${useDefault
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {useDefault ? "Upload New Resume" : "Use Default Resume"}
                            </button>
                        )}
                    </div>

                    {/* Resume Summary (stylish replacement for preview) */}
                    {previewUrl && (
                        <div className="mt-2 w-full">
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <FaFilePdf className="text-red-500" /> Resume
                            </h5>
                            <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between shadow-sm">
                                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                    <div className="h-10 w-8 sm:h-12 sm:w-9 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center text-xs font-bold">
                                        PDF
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-full sm:max-w-[50vw]">
                                            {pdfFile ? pdfFile.name : "Saved resume"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {useDefault ? "From your profile" : (pdfFile ? `${(pdfFile.size/1024/1024).toFixed(2)} MB` : "")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
                                    <a href={previewUrl} target="_blank" rel="noopener" className="w-full sm:w-auto px-3 py-2 text-sm rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition text-center transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300/60 dark:focus:ring-blue-700/50">Open</a>
                                    {!useDefault && (
                                        <button type="button" onClick={() => { setPdfFile(null); setPreviewUrl(null); }} className="w-full sm:w-auto px-3 py-2 text-sm rounded-md bg-red-400 dark:bg-red-700 text-white dark:text-gray-200 hover:bg-red-500 dark:hover:bg-red-600 transition transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300/60 dark:focus:ring-gray-600/50">Remove</button>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tip: Use the Open button to view the PDF in a new tab.</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
                    >
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
};
