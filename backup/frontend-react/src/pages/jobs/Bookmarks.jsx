import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaBookmark, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

export const Bookmarks = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const { user } = useAuth();

  const FetchBookMarks = async (query = '') => {

    try {
      const res = await api.get('/bookmarks/list', {
        params: { search: query }
      });

      setBookmarks(res.data.data.book_mark_details?.list || [])

    } catch (err) {

      console.error("Failed to fetch bookmarks:", err);
    }

  }

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

  const RemoveBookmark = async (id) => {
    try {
      await api.post('/bookmark/remove', { job_id: id });
      FetchBookMarks();

    } catch (err) {
      console.error("Failed to bookmark job:", err?.response?.data || err.message || err);
    }
  };

  useEffect(() => {
    FetchBookMarks();
    FetchJobs();
  }, []);

  const SubmitHandler = (e) => {
    e.preventDefault();
    FetchBookMarks();
    FetchJobs(searchTerm);
  };

  const ViewJob = (id) => {
    navigate(`/view-job/${id}`, { state: { from: location.pathname } });
  }

  const Reset = () => {
    setSearchTerm('');
    FetchJobs();

  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-2 py-2 rounded-md">
        <h2 className="text-2xl font-bold text-center text-white dark:text-white">
          BookMarks
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

      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No bookmarks found.</p>
      ) : (
        (() => {
          const matchedJobs = bookmarks
            .map((bookmark) => jobs.find((job) => job._id === bookmark.job_id))
            .filter((job) => job); // Remove null/undefined

          if (matchedJobs.length === 0) {
            return (
              <p className="text-center text-gray-500 dark:text-gray-400">No bookmarks found.</p>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedJobs.map((matchedJob) => (
                <div
                  key={matchedJob._id}
                  onClick={() => ViewJob(matchedJob._id)}
                  className="cursor-pointer bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 shadow-md rounded-xl p-6 transition hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {matchedJob.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        RemoveBookmark(matchedJob._id);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition text-lg cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <FaBookmark />
                    </button>
                  </div>

                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li><strong>Category:</strong> {matchedJob.category_id}</li>
                    <li><strong>Location:</strong> {matchedJob.location}</li>
                    <li><strong>Salary:</strong> ₹{matchedJob.salary}</li>
                    <li><strong>Type:</strong> {matchedJob.job_type}</li>
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
