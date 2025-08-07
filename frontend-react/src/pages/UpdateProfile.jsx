import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    headline: "",
    phone: "",
    location: "",
    profile_status: 1,
    skills: "",
    preferred_job_type: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [experiences, setExperiences] = useState([]);

  const GetUserData = async () => {
    try {
      const res = await api.get("/users/view", { params: { id } });
      const user = res.data.data?.userDetails;
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          headline: user.headline || "",
          phone: user.phone || "",
          location: user.location || "",
          profile_status: user.profile_status ?? 1,
          skills: user.skills || "",
          preferred_job_type: user.preferred_job_type || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  useEffect(() => {
    GetUserData();
    // Fetch experience data separately from Laravel backend
    const fetchExperiences = async () => {
      try {
        const res = await api.get("/users/exp", { params: { id } });
        if (res.data.data?.userExpDetails) {
          setExperiences(res.data.data.userExpDetails);
        }
      } catch (err) {
        console.error("Failed to fetch experiences", err);
      }
    };
    fetchExperiences();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: "", // necessary for hidden input mapping
        company_name: "",
        job_title: "",
        start_date: "",
        end_date: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (index) => {
    const updated = [...experiences];
    updated.splice(index, 1);
    setExperiences(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();

    // Add basic form data
    Object.entries(formData).forEach(([key, val]) => {
      payload.append(key, val);
    });

    if (resumeFile) {
      payload.append("resume", resumeFile);
    }

    payload.append("id", id);

    // Add experience data to FormData
    experiences.forEach((exp, index) => {
      payload.append("experience_ids[]", exp.id || ""); // empty string for new ones
      payload.append(`experiences[${index}][company_name]`, exp.company_name || "");
      payload.append(`experiences[${index}][job_title]`, exp.job_title || "");
      payload.append(`experiences[${index}][start_date]`, exp.start_date || "");
      payload.append(`experiences[${index}][end_date]`, exp.end_date || "");
      payload.append(`experiences[${index}][description]`, exp.description || "");
    });

    try {
      await api.post("/users/update", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Profile updated successfully!");
      navigate(from);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile.");
    }
  };

  const parseDMY = (dateStr) => {
    if (!dateStr) return "";
    const [d, m, y] = dateStr.split("-");
    if (!d || !m || !y) return dateStr;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };
  
  const formatYMDToDMY = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  };

  return (
    <div className="max-w-full mx-auto p-2 sm:p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-2 sm:mt-4 md:mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Update Profile</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-1" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { label: "Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Headline", name: "headline", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Location", name: "location", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
              />
            </div>
          ))}

          {/* Preferred Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Job Type</label>
            <select
              name="preferred_job_type"
              value={formData.preferred_job_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select...</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Freelance">Freelance</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>

          {/* Skills */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma-separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. React, Node.js, MongoDB"
              className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Experience Section */}
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Experience</h3>
            <button
              type="button"
              onClick={addExperience}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center text-sm"
            >
              <FaPlus className="mr-2" /> Add More
            </button>
          </div>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="border rounded-md p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 relative"
              >
                {/* Hidden Experience ID */}
                <input type="hidden" name="experience_ids[]" value={exp.id || ""} />

                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company_name}
                    onChange={(e) => handleExperienceChange(idx, "company_name", e.target.value)}
                    className="px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.job_title}
                    onChange={(e) => handleExperienceChange(idx, "job_title", e.target.value)}
                    className="px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600"
                  />
                  {/* Start Date Picker */}
                  <Flatpickr
                    value={parseDMY(exp.start_date)}
                    options={{
                      dateFormat: "Y-m-d",
                      altInput: true,
                      altFormat: "d-m-Y",
                      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                    }}
                    onChange={([date]) => {
                      const formatted = date ? formatYMDToDMY(date.toISOString().slice(0, 10)) : "";
                      handleExperienceChange(idx, "start_date", formatted);
                    }}
                    className={`px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600`}
                  />
                  {/* End Date Picker */}
                  <Flatpickr
                    value={parseDMY(exp.end_date)}
                    options={{
                      dateFormat: "Y-m-d",
                      altInput: true,
                      altFormat: "d-m-Y",
                      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                    }}
                    onChange={([date]) => {
                      const formatted = date ? formatYMDToDMY(date.toISOString().slice(0, 10)) : "";
                      handleExperienceChange(idx, "end_date", formatted);
                    }}
                    className={`px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600`}
                  />
                  <textarea
                    rows="2"
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                    className="col-span-1 sm:col-span-2 px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center sm:text-right mt-4 sm:mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
