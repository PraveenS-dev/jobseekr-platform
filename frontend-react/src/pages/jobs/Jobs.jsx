import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { FaBriefcase, FaTimesCircle, FaCheckCircle, FaSearch, FaSyncAlt } from "react-icons/fa";

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  //Fetch Jobs

  const FetchJobs = async (query = '') => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_BASE_URL}/jobs/list`, {
        params: { search: query, role: user.role, user_id: user.id },
      });
      setJobs(res.data.data || []);

    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  //Fetch Bookmarks & Extract Job IDs
  const FetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmark/getdata');
      const bookmarks = res.data.data.job_book_mark || [];
      const jobIds = bookmarks.map(b => b.job_id);
      setBookmarkedJobIds(jobIds);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  };

  useEffect(() => {
    FetchJobs();
    FetchBookmarks();
  }, []);

  const SubmitHandler = (e) => {
    e.preventDefault();
    FetchJobs(searchTerm);
  };

  //Bookmark function
  const Bookmark = async (id) => {
    try {
      await api.post('/bookmark/store', { job_id: id });
      FetchBookmarks();
    } catch (err) {
      console.error("Failed to bookmark job:", err?.response?.data || err.message || err);
    }
  };

  const RemoveBookmark = async (id) => {
    try {
      await api.post('/bookmark/remove', { job_id: id });

      setBookmarkedJobIds((prev) => prev.filter(jobId => jobId !== id));

    } catch (err) {
      console.error("Failed to bookmark job:", err?.response?.data || err.message || err);
    }
  };

  const ViewJob = (id) => {
    navigate(`/view-job/${id}`, { state: { from: location.pathname } });
  }
  const ApproveJob = (id) => {
    navigate(`/view-job/approval/${id}`, { state: { from: location.pathname } });
  }

  const AddJob = () => {
    navigate(`/jobs/store`, { state: { from: location.pathname } });
  }

  const Reset = () => {
    setSearchTerm('');
    FetchJobs();

  }

  return (
    <div className="container mx-auto px-4 py-8">


      <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-2 py-2 rounded-md">
        <h2 className="text-2xl font-bold text-center text-white dark:text-white">
          Job List
        </h2>
        {user.role == 3 &&
          <div className='text-end '>
            <button className='bg-green-500 text-white font-bold px-6 py-2 rounded-md hover:bg-green-600 cursor-pointer' onClick={() => AddJob()}>Add Job</button>
          </div>
        }
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

      {jobs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => ViewJob(job._id)}
              className="cursor-pointer job-card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950  shadow-md rounded-xl p-6 transition hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {job.title}
                </h3>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    bookmarkedJobIds.includes(job._id)
                      ? RemoveBookmark(job._id)
                      : Bookmark(job._id);
                  }}
                  className="text-blue-500 hover:text-blue-700 transition text-xl cursor-pointer"
                >
                  {bookmarkedJobIds.includes(job._id) ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>

              {/* <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                {job.description}
              </p> */}

              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li><strong>Category:</strong> {job.category_id}</li>
                <li><strong>Location:</strong> {job.location}</li>
                <li><strong>Salary:</strong> ₹{job.salary}</li>
                <li><strong>Type:</strong> {job.job_type}</li>
                {user.role == 2 && (
                  <li>
                    <strong>Status:</strong>{' '}
                    {job.is_approved == 2 ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> Approved
                      </span>
                    ) : job.is_approved == 3 ? (
                      <span className="flex items-center text-red-600">
                        <FaTimesCircle className="mr-1" /> Rejected
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaBriefcase className="mr-1" /> Pending Approval
                      </span>
                    )}
                  </li>
                )}
              </ul>

              {user.role == 2 && job.is_approved == 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    ApproveJob(job._id);
                  }}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                >
                  Approve
                </button>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
