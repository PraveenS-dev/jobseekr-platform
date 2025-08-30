import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import axios from "axios";
import dayjs from "dayjs";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaEye,
    FaFileAlt,
    FaTimesCircle,
    FaClock,
    FaEyeSlash,
    FaCheck,
    FaTimes
} from "react-icons/fa";

export const ApplicationView = () => {
    const { id } = useParams();
    const [ApplicationDetails, setApplicationDetails] = useState(null);
    const [JobDetails, setJobDetails] = useState(null);
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const from = location.state?.from || "/application/list";
    const [userData, setUserData] = useState(null);

    // Status constants
    const APPLICATION_STATUS = {
        PENDING: 1,
        VIEWED: 2,
        RESUME_VIEWED: 3,
        APPROVED: 4,
        REJECTED: 5
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case APPLICATION_STATUS.PENDING:
                return { text: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: FaClock };
            case APPLICATION_STATUS.VIEWED:
                return { text: "Viewed", color: "text-blue-600", bgColor: "bg-blue-100", icon: FaEye };
            case APPLICATION_STATUS.RESUME_VIEWED:
                return { text: "Resume Viewed", color: "text-purple-600", bgColor: "bg-purple-100", icon: FaEyeSlash };
            case APPLICATION_STATUS.APPROVED:
                return { text: "Approved", color: "text-green-600", bgColor: "bg-green-100", icon: FaCheck };
            case APPLICATION_STATUS.REJECTED:
                return { text: "Rejected", color: "text-red-600", bgColor: "bg-red-100", icon: FaTimes };
            default:
                return { text: "Unknown", color: "text-gray-600", bgColor: "bg-gray-100", icon: FaClock };
        }
    };

    const GetApplicationData = async (appId) => {
        try {
            const res = await api.get("/application/view", { params: { id: appId } });
            setApplicationDetails(res.data.data);
        } catch (error) {
            console.error("Failed to load application:", error);
        }
    };

    const FetchJobDetails = async (jobId) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_NODE_BASE_URL}/jobs/view/${jobId}`
            );
            setJobDetails(res.data.data);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    const GetUserData = async (uid) => {
        try {
            const res = await api.get('/users/view', { params: { id: uid } });
            setUserData(res.data.data?.userDetails);
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    const Viewprofile = (uid) => {
        navigate(`/users/view/${uid}`, { state: { from: location.pathname } });
    };

    const ResumeView = async (appId, job_name) => {
        try {
            const res = await api.post("/application/resumeViewed", { id: appId, job_name });
            if (res.data.success) {
                GetApplicationData(appId);
            }
        } catch (error) {
            console.log("Something went wrong!", error);
        }
    };

    const ApprovalHandle = async (appId, action, job_name) => {
        try {
            const res = await api.post("/application/approval", { id: appId, action, job_name });
            if (res.data.success) {
                GetApplicationData(appId);
            }
        } catch (error) {
            console.log("Something went wrong!", error);
        }
    };

    useEffect(() => {
        if (id) {
            GetApplicationData(id);
        }
    }, [id]);

    useEffect(() => {
        if (ApplicationDetails?.created_by_id) {
            GetUserData(ApplicationDetails.created_by_id);
        }
    }, [ApplicationDetails?.created_by_id]);

    useEffect(() => {
        if (ApplicationDetails?.job_id) {
            FetchJobDetails(ApplicationDetails.job_id);
        }
    }, [ApplicationDetails?.job_id]);

    useEffect(() => {
        if (ApplicationDetails?.application_status == 1 && user.role == 3 && id) {

            const markAsViewed = async (id, job_name) => {
                try {
                    const res = await api.post("/application/applicationViewed", { id, job_name });
                    if (res.data.success) {
                        GetApplicationData(id);
                    }
                } catch (error) {
                    console.log("Something went wrong!", error);
                }
            };
            markAsViewed(id, JobDetails.title);
        }
    }, [ApplicationDetails?.application_status, id]);

    if (!ApplicationDetails) {
        return (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Loading Application Details...
            </div>
        );
    }

    const statusInfo = getStatusInfo(ApplicationDetails?.application_status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-4 py-3 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white tracking-wide">
                    Application Details
                </h2>
                <button
                    onClick={() => navigate(from)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100 font-medium rounded-md 
                           hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors 
                           shadow-sm"
                >
                    <FaArrowLeft />
                    Back
                </button>
            </div>

            {/* Application Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 
                        shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 
                        space-y-6 transition-colors duration-300">

                {/* Job Title */}
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {JobDetails?.title || "Loading job details..."}
                </h3>

                {/* Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 
                            rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} dark:bg-opacity-30`}>
                        <StatusIcon className={`${statusInfo.color} dark:text-opacity-90`} />
                        <span className={`font-medium ${statusInfo.color} dark:text-opacity-90`}>
                            {statusInfo.text}
                        </span>
                    </div>
                </div>

                {/* Job Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Category:</span> {JobDetails?.category_id || "—"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Location:</span> {JobDetails?.location || "—"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Salary:</span> ₹{JobDetails?.salary || "—"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Job Type:</span> {JobDetails?.job_type || "—"}
                    </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Description:</span> {JobDetails?.description || "—"}
                </p>
                {user.role != 1 &&
                    < div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                    bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg 
                            border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Applied By:</span> {ApplicationDetails.created_by || "—"}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Profile:</span>
                            <button
                                onClick={() => Viewprofile(userData?.enc_id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                                   text-white text-sm rounded-md shadow-md transition-colors"
                            >
                                <FaEye /> View
                            </button>
                        </div>
                    </div>
                }
                {/* Applied Time */}
                <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Applied At:</span>{" "}
                    {dayjs(ApplicationDetails.created_at).format("DD-MMMM-YYYY hh:mm A")}
                </p>

                {/* Resume */}
                {ApplicationDetails.resume_path && (
                    <a
                        href={ApplicationDetails.resume_path}
                        onClick={() => ResumeView(id, JobDetails.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                               text-white rounded-md shadow-md transition-colors"
                    >
                        <FaFileAlt /> View Resume
                    </a>
                )}

                {/* Approve / Reject */}
                {user?.role === 3 && ApplicationDetails?.application_status != 4 && ApplicationDetails?.application_status != 5 && (
                    <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                        <form className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => ApprovalHandle(id, 2, JobDetails.title)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white 
                                       rounded-md hover:bg-red-700 transition-colors shadow-md"
                            >
                                <FaTimesCircle /> Reject
                            </button>

                            <button
                                type="button"
                                onClick={() => ApprovalHandle(id, 1, JobDetails.title)}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white 
                                       rounded-md hover:bg-green-700 transition-colors shadow-md"
                            >
                                <FaCheckCircle /> Approve
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div >
    );

};
