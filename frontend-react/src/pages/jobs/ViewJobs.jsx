import { React, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaBriefcase, FaMapMarkerAlt, FaMoneyBillAlt } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const ViewJobs = ({ approvalMode }) => {

    const { id } = useParams(); // Get ID from route param
    const [jobs, setJobs] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || '/jobs';
    const isApproval = approvalMode;
    const [action, setAction] = useState('');
    const { user } = useAuth();
    const [isApplied, setIsApplied] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [applicationDetails, setApplicationDetails] = useState([]);

    const FetchJobDetails = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_NODE_BASE_URL}/jobs/view/${id}`);
            setJobs(res.data.data);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    const ApprovalHandle = async (e, selectedAction) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/jobs/approve-job/${id}`, {
                action: selectedAction,
            });
            FetchJobDetails();
        } catch (err) {
            console.error("Failed to approve job:", err);
        }
    };

    const ApplayForJob = (id) => {
        navigate(`/apply-job/${id}`, { state: { from: location.pathname } });
    }

    const CheckAppliedStatus = async (id) => {
        try {
            const res = await api.post('/application/checkJobApplication', { job_id: id });
            if (res.data.data.existValue === true) {
                setIsApplied(true);
            }

        } catch (err) {
            console.error(err);
        }
    }

    const CloseAndOpenJob = async (id) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/jobs/CloseOpenJob`, { job_id: id });
            console.log(res.data);

            if (isClosed) {
                setIsClosed(false);
            } else {
                setIsClosed(true);
            }
        } catch (err) {
            console.error(err);

        }
    }

    const GetApplicationList = async (id) => {
        try {
            const res = await api.post('/application/getApplicationBasedonJobs', { job_id: id });
            setApplicationDetails(res.data.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        FetchJobDetails(id);
        CheckAppliedStatus(id);
        GetApplicationList(id);
    }, [id]);

    useEffect(() => {
        if (jobs) {
            setIsClosed(jobs.is_closed !== 0);
        }
    }, [jobs]);

    const ViewApplication = (id) => {
        navigate(`/application/view/${id}`, { state: { from: location.pathname } });
    }

    return (
        <div className="container mx-auto px-4 py-10">


            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-2 py-2 rounded-md">
                <h2 className="text-2xl font-bold text-center text-white dark:text-white">
                    Job Details
                </h2>
                <button
                    onClick={() => navigate(from)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                    <FaArrowLeft />
                    Back
                </button>
            </div>


            {jobs && (
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md transition hover:shadow-lg">
                    <div className='flex justify-between'>
                        <h5 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{jobs.title}</h5>
                        {user?.role !== 1 && jobs && !isApproval && (
                            <button
                                onClick={() => CloseAndOpenJob(jobs._id)}
                                className={`px-4 py-2 rounded-md text-white font-semibold shadow-md transition ${isClosed ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {isClosed ? "Open Job" : "Close Job"}
                            </button>
                        )}
                    </div>

                    {user.role != 1 &&
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                            {jobs.is_approved == 2 ? (
                                <span className="flex items-center text-green-600"><FaCheckCircle /> Approved</span>
                            ) : jobs.is_approved == 3 ? (
                                <span className="flex items-center text-red-600"><FaTimesCircle /> Rejected</span>
                            ) : (
                                <span className="flex items-center text-yellow-600"><FaBriefcase /> Pending Approval</span>
                            )}
                        </p>
                    }
                    <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <p><strong>Category:</strong> {jobs.category_id}</p>
                        <p className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" /> {jobs.location}
                        </p>
                        <p className="flex items-center gap-2">
                            <FaMoneyBillAlt className="text-green-500" /> ₹{jobs.salary}
                        </p>
                        <p><strong>Type:</strong> {jobs.job_type}</p>
                        <p><strong>Description:</strong> {jobs.description}</p>
                        <p><strong>Posted By:</strong> {jobs.posted_by_name}</p>
                        <p><strong>Posted At:</strong> {dayjs(jobs.created_at).format("DD-MMMM-YYYY hh:mm A ")}</p>
                    </div>
                </div>
            )}

            {/* Approval section */}
            {jobs && isApproval && jobs.is_approved == 1 && (
                <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                    <form className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={(e) => ApprovalHandle(e, 0)}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        >
                            <FaTimesCircle /> Reject
                        </button>

                        <button
                            type="button"
                            onClick={(e) => ApprovalHandle(e, 1)}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        >
                            <FaCheckCircle /> Approve
                        </button>

                    </form>
                </div>
            )}

            {/* Apply section */}
            {!isApproval && user.role == 1 && !isApplied && (
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => ApplayForJob(jobs._id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Apply for this Job
                    </button>
                </div>
            )}
            {isApplied && (
                <div className="mt-6 text-center">
                    <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-semibold shadow-sm border border-yellow-300 dark:border-yellow-700">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-600 dark:text-yellow-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Already Applied
                    </p>
                </div>
            )}



            {user?.role !== 1 ? (
                <>
                    <h2 className="text-2xl font-bold text-left text-gray-900 dark:text-white mb-5 mt-3">
                        Job Applications
                    </h2>

                    {applicationDetails?.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            No Applications found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {applicationDetails.map((application, index) => (
                                <div
                                    key={index}
                                    onClick={() => ViewApplication(application.enc_id)}
                                    className="cursor-pointer bg-gradient-to-br from-white to-blue-50 
                                   dark:from-gray-800 dark:to-blue-950 shadow-md rounded-xl p-6 
                                   transition hover:shadow-xl hover:-translate-y-1 border 
                                   border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-gray-800 dark:text-white font-semibold">
                                        {application.created_by}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {dayjs(application.created_at).format("DD-MMMM-YYYY hh:mm A")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : null}



        </div >
    );
}
