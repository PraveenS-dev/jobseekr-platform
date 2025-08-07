import { useLocation, useNavigate, useParams } from "react-router-dom"
import api from "../../../services/api"
import { useEffect, useState } from "react"
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { FaSearch, FaSyncAlt, FaTags, FaMapMarkerAlt, FaMoneyBillWave, FaBriefcase, FaUser, FaClock } from 'react-icons/fa';
import dayjs from "dayjs";


const ApplicationList = () => {
    const [ApplicationDetails, setApplicationDetails] = useState([]);
    const location = useLocation();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const GetApplicationList = async () => {
        const res = await api.get("/application/list");
        setApplicationDetails(res.data.data.applicationDetails?.list);
        
    }

    const FetchJobs = async (query = '') => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_NODE_BASE_URL}/jobs/list`,
                {
                    params: {
                        search: query,
                        role: user.role,
                        user_id: user.id
                    }
                }
            );

            const fetchedJobs = res.data?.data || [];
            setJobs(fetchedJobs);


        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    useEffect(() => {
        GetApplicationList();
        FetchJobs();
    }, []);

    const SubmitHandler = (e) => {
        e.preventDefault();
        GetApplicationList();
        FetchJobs(searchTerm);
    };

    const ViewApplication = (id) => {
        navigate(`/application/view/${id}`, { state: { from: location.pathname } });
    }

    const Reset = () => {
        setSearchTerm('');
        FetchJobs();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-2 py-2 rounded-md">
                <h2 className="text-2xl font-bold text-center text-white dark:text-white">
                    Application List
                </h2>

            </div>
            <form
                onSubmit={SubmitHandler}
                className="flex flex-col sm:flex-row items-center justify-end gap-4 mb-8 animate-fade-in"
            >
                <div className="relative w-full sm:w-[300px]">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 shadow-sm"
                    />
                </div>

                <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                >
                    <FaSearch />
                    Search
                </button>

                <button
                    type="reset"
                    onClick={Reset}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                >
                    <FaSyncAlt />
                    Reset
                </button>
            </form>

            {ApplicationDetails.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No Applications found.</p>
            ) : (
                (() => {
                    const matchedJobs = ApplicationDetails
                        .map((application) => jobs.find((job) => job._id === application.job_id))
                        .filter((job) => job);
                        
                    if (matchedJobs.length === 0) {
                        return (
                            <p className="text-center text-gray-500 dark:text-gray-400">No Applications found.</p>
                        );
                    }
                    
                    return (

                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                            {matchedJobs.map((matchedJob, key) => (
                                <div
                                    key={ApplicationDetails[key].enc_id}
                                    onClick={() => ViewApplication(ApplicationDetails[key].enc_id)}
                                    className="cursor-pointer bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 shadow-md rounded-xl p-6 transition hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                                >
                                    {/* Title */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                            {matchedJob.title}
                                        </h3>
                                    </div>

                                    {/* Job Info */}
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <FaTags className="text-blue-500" />
                                            {matchedJob.category_id}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-red-500" />
                                            {matchedJob.location}
                                        </li>

                                        {/* Salary & Applied By in same row */}
                                        <li className="flex justify-between">
                                            <span className="flex items-center gap-2">
                                                <FaMoneyBillWave className="text-green-500" />
                                                ₹{matchedJob.salary}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <FaUser className="text-purple-500" />
                                                {ApplicationDetails[key].created_by}
                                            </span>
                                        </li>

                                        {/* Job Type & Applied At in same row */}
                                        <li className="flex justify-between">
                                            <span className="flex items-center gap-2">
                                                <FaBriefcase className="text-yellow-500" />
                                                {matchedJob.job_type}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <FaClock className="text-orange-500" />
                                                {dayjs(ApplicationDetails[key].created_at).format("DD-MMMM-YYYY hh:mm A")}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                    );
                })()
            )}

        </div>
    );
}

export default ApplicationList;