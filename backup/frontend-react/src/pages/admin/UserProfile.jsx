import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Pencil } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
import { FiMail, FiPhone, FiUser, FiMapPin, FiBriefcase, FiCalendar, FiTag, FiType, FiEye, FiMessageSquare } from "react-icons/fi";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const UserProfile = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [viewCount, setViewCount] = useState(null);
    const [userExpData, setUserExpData] = useState([]);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isChangeCoverModalOpen, setIsChangeCoverOpen] = useState(false);
    const [isChangeProfileModalOpen, setIsChangeProfileOpen] = useState(false);
    const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || '/users/list';

    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState();
    const [brightness, setBrightness] = useState(100);
    const imgRef = useRef();

    const GetUserData = async (id) => {
        try {
            const res = await api.get('/users/view', { params: { id } });
            setUserData(res.data.data?.userDetails);
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    const GetUserExpData = async (id) => {
        try {
            const res = await api.get("/users/exp", { params: { id } });
            setUserExpData(res.data.data?.userExpDetails || []);
        } catch (err) {
            console.error("Failed to fetch experience", err);
        }
    };

    const GetViewCount = async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_NODE_BASE_URL}/profileViewCount/getViewerCount/${id}`);
            setViewCount(res.data?.viewCount || 0);

        } catch (err) {
            console.error("Failed to fetch Count", err);
        }
    };

    const StoreViewCount = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/profileViewCount/store`, { profile_id: userData.id, viewer_id: user.id });

        } catch (err) {
            console.error("Failed to fetch Count", err);
        }
    };

    useEffect(() => {
        GetUserData(id);
        GetUserExpData(id);
    }, [id]);

    useEffect(() => {
        if (userData) {
            StoreViewCount();
            GetViewCount(userData.id);
        }
    }, [userData]);


    useEffect(() => {
        if (userData) {
            const fields = ['name', 'email', 'headline', 'phone', 'location', 'resume_link', 'skills', 'preferred_job_type'];
            const filled = fields.filter(field => userData?.[field]);
            const percent = Math.floor((filled.length / fields.length) * 100);

            let current = 0;
            const interval = setInterval(() => {
                if (current < percent) {
                    setProgress(prev => Math.min(prev + 1, percent));
                    current++;
                } else {
                    clearInterval(interval);
                }
            }, 15);
        }
    }, [userData]);

    const defaultProfile = `https://ui-avatars.com/api/?name=${userData?.name || "user"}&size=40`;
    const defaultCover = "https://www.dummyimage.com/1200x375/000/5a57ab&text=COVER";

    const changeCoverImage = async (blob) => {
        const formData = new FormData();
        formData.append("id", userData.enc_id);
        formData.append("image", blob, "cover.jpg");

        await api.post("/users/changeCoverimage", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        GetUserData(id);
    };

    const changeProfileImage = async (blob) => {
        const formData = new FormData();
        formData.append("id", userData.enc_id);
        formData.append("image", blob, "cover.jpg");

        await api.post("/users/changeProfileimage", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        GetUserData(id);
    };

    const handleEditProfile = () => {
        navigate(`/users/editProfile/${id}`, { state: { from: location.pathname } });
    };

    // Load image into crop tool
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setSelectedImage(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Save cropped image to backend
    const handleSave = async () => {
        if (!imgRef.current) return;

        const canvas = document.createElement("canvas");
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        const ctx = canvas.getContext("2d");

        // ✅ Output in ORIGINAL resolution
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        ctx.filter = `brightness(${brightness}%)`;

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // ✅ Save at 100% JPEG quality (or PNG for lossless)
        canvas.toBlob(
            async (blob) => {
                if (blob) {
                    await changeCoverImage(blob);
                    setIsChangeCoverOpen(false);
                    setSelectedImage(null);
                }
            },
            "image/jpeg",
            1.0 // 100% quality
        );
    };

    const handleProfileSave = async () => {
        if (!imgRef.current) return;

        const canvas = document.createElement("canvas");
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        const ctx = canvas.getContext("2d");

        // ✅ Output in ORIGINAL resolution
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        ctx.filter = `brightness(${brightness}%)`;

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            async (blob) => {
                if (blob) {
                    await changeProfileImage(blob);
                    setIsChangeProfileOpen(false);
                    setSelectedImage(null);
                }
            },
            "image/jpeg",
            1.0
        );
    };


    const onImageLoad = (e) => {
        const img = e.currentTarget;
        const aspect = 16 / 5;

        let cropWidth = img.width;
        let cropHeight = cropWidth / aspect;

        // Ensure crop fits vertically
        if (cropHeight > img.height) {
            cropHeight = img.height;
            cropWidth = cropHeight * aspect;
        }

        setCrop({
            unit: "px",
            width: cropWidth,
            height: cropHeight,
            x: (img.width - cropWidth) / 2,
            y: (img.height - cropHeight) / 2
        });
    };

    const onProfileImageLoad = (e) => {
        const img = e.currentTarget;
        const aspect = 150 / 150;

        // Fit crop to image display size
        let cropWidth = img.width;
        let cropHeight = cropWidth / aspect;

        if (cropHeight > img.height) {
            cropHeight = img.height;
            cropWidth = cropHeight * aspect;
        }

        setCrop({
            unit: "px",
            width: cropWidth,
            height: cropHeight,
            x: (img.width - cropWidth) / 2,
            y: (img.height - cropHeight) / 2
        });
    };

    const handleSendMessage = () => {
        navigate("/chats", { state: { selectedChatUser: userData } });
    };


    if (!userData) return <p className="text-center mt-10 text-gray-500 dark:text-gray-300">Loading profile...</p>;

    return (
        <>
            {/* Header Section - Mobile Responsive */}
            <div className="flex flex-wrap justify-between items-center bg-blue-600 dark:bg-blue-800 mb-6 px-4 py-3 rounded-md gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">User Details</h2>
                <button
                    onClick={() => navigate(from)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition text-sm sm:text-base"
                >
                    <FaArrowLeft /> Back
                </button>
            </div>

            <div className="max-w-full mx-auto mt-6 rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="relative aspect-[16/5] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-600 group">
                    <img
                        src={userData.cover_image || defaultCover}
                        alt="Cover"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    {user.role == 2 && (
                        <button
                            onClick={() => setIsChangeCoverOpen(true)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 
                                bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white 
                                p-1.5 sm:p-2 rounded-full transition-all 
                                opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Change cover image"
                        >
                            <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    )}
                </div>

                <div className="relative px-4 sm:px-6 pb-6 sm:pb-8 pt-16 sm:pt-20">
                    <div className="absolute top-2 sm:top-6 right-2 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={handleSendMessage}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 sm:gap-2 shadow-md text-xs sm:text-sm"
                        >
                            <FiMessageSquare size={14} className="sm:w-4 sm:h-4" /> Send
                        </button>

                        {user.role == 2 &&
                            <button
                                onClick={handleEditProfile}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-xs sm:text-sm"
                            >
                                Update Profile
                            </button>
                        }
                    </div>

                    <div className="absolute -top-12 sm:-top-20 left-4 sm:left-6">
                        <div className="relative group w-24 h-24 sm:w-36 sm:h-36">
                            <img
                                src={userData.profile || defaultProfile}
                                alt="Profile"
                                className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                onClick={() => setIsProfilePreviewOpen(true)}
                            />

                            <button
                                onClick={() => setIsChangeProfileOpen(true)}
                                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 
                                    bg-black/60 hover:bg-black/80 text-white 
                                    p-1.5 sm:p-2 rounded-full shadow-md transition-all 
                                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                title="Change profile picture"
                            >
                                <Pencil size={12} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>


                    <div className="ml-0 sm:ml-4 mt-4 sm:mt-4">
                        <h2 className="text-xl sm:text-2xl font-bold">{userData.name}</h2>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{userData.headline}</p>

                        <div className="mt-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-xl p-3 sm:p-4 shadow-md border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Profile Completion
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {progress}%
                                </span>
                            </div>

                            <div className="w-full h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-md"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </div>
                        </div>

                        <div className="max-w-full mx-auto p-3 sm:p-6">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">User Profile</h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300 border border-blue-200 dark:border-blue-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    🧾 About <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">(Profile Info)</span>
                                </h2>

                                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-800 dark:text-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiUser className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <span className="font-semibold">Name:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.name}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiType className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <span className="font-semibold">Headline:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.headline}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiBriefcase className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <span className="font-semibold">Preferred Job Type:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.preferred_job_type}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiMapPin className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <span className="font-semibold">Location:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.location}</span>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <FiTag className="mt-1 text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <div className="flex-1">
                                                <span className="font-semibold">Skills:</span>
                                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                                    {userData.skills?.split(',').map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 px-2 py-1 text-xs sm:text-sm rounded-lg shadow-sm transition-all hover:bg-blue-200 dark:hover:bg-blue-600"
                                                        >
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiCalendar className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
                                            <span className="font-semibold">Joined:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.created_at}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Experience Section */}
                            {userExpData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="mb-8 sm:mb-10"
                                >
                                    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 transition-transform hover:shadow-2xl hover:scale-[1.01] duration-300 border border-blue-200 dark:border-blue-700">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6 sm:mb-8 flex items-center gap-2">
                                            🧑‍💼 Experience
                                        </h2>

                                        <div className="space-y-6 sm:space-y-8">
                                            {userExpData.map((exp, index) => (
                                                <motion.div
                                                    key={exp.id || index}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                                    className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition"
                                                >
                                                    <div className="flex flex-col gap-3 sm:gap-4">
                                                        <div>
                                                            <h4 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300">
                                                                {exp.job_title}
                                                            </h4>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                {exp.company_name}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full">
                                                                {exp.start_date}
                                                            </span>
                                                            <span className="hidden sm:inline">-</span>
                                                            <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full">
                                                                {exp.end_date}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {exp.description && (
                                                        <p className="mt-3 sm:mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                            {exp.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 sm:mt-4 text-xs text-gray-400">
                                                        ⏱ Added on: <span className="italic">{exp.created_at}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Contact Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 transition-transform hover:shadow-xl hover:scale-[1.02] duration-300 border border-blue-200 dark:border-blue-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                    📞 Contact
                                </h2>

                                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-800 dark:text-gray-200">
                                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiMail className="text-lg text-blue-700 dark:text-blue-400 animate-pulse" />
                                            <span className="font-medium">Email:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0 break-all">{userData.email}</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <FiPhone className="text-lg text-blue-700 dark:text-blue-400 animate-pulse" />
                                            <span className="font-medium">Phone:</span>
                                        </div>
                                        <span className="ml-6 sm:ml-0">{userData.phone}</span>
                                    </p>
                                </div>
                            </motion.div>

                            {/* Activity Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-transform hover:scale-[1.02] hover:shadow-xl duration-300 border border-blue-200 dark:border-blue-700"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                    <motion.span
                                        whileHover={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                        className="inline-block"
                                    >
                                        🧠
                                    </motion.span>
                                    Activity
                                </h2>

                                <button className="w-full text-left transition-all duration-300 group-hover:translate-x-1">
                                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-800 dark:text-gray-200">
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <FiEye className="text-lg sm:text-xl text-blue-700 dark:text-blue-400 animate-pulse" />
                                                <span className="font-semibold">Count:</span>
                                            </div>
                                            <span className="ml-6 sm:ml-0">{viewCount} Profile Views</span>
                                        </p>
                                        <p className="text-xs sm:text-sm italic text-gray-600 dark:text-gray-400">
                                            Discover who's viewed your profile recently.
                                        </p>
                                    </div>
                                </button>

                                {/* Stylish gradient border on hover */}
                                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-purple-500 group-hover:animate-pulse pointer-events-none" />
                            </motion.div>

                            {/* Resume Section */}
                            {userData.resume_link && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-transform hover:scale-[1.02] hover:shadow-xl duration-300 border border-blue-200 dark:border-blue-700"
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                                        📄 Resume
                                    </h2>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <button
                                            onClick={() => setIsResumeModalOpen(true)}
                                            className="px-4 py-2 bg-blue-600 text-white dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-300 text-sm sm:text-base"
                                        >
                                            View Resume
                                        </button>

                                        <a
                                            href={userData.resume_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 text-blue-700 dark:text-blue-400 border border-blue-500 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition duration-300 text-center text-sm sm:text-base"
                                        >
                                            Download Resume
                                        </a>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                </div>
            </div >

            {/* Resume Modal - Mobile Responsive */}
            < Dialog open={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto" >
                <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-3 sm:p-6 z-50">
                        <Dialog.Title className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resume Preview</Dialog.Title>
                        <iframe
                            src={userData.resume_link}
                            title="Resume"
                            className="w-full h-[400px] sm:h-[600px] border rounded"
                        ></iframe>
                        <div className="text-right mt-3 sm:mt-4">
                            <button
                                onClick={() => setIsResumeModalOpen(false)}
                                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog >

            {/* CoverImage Modal - Mobile Responsive */}
            < Dialog
                open={isChangeCoverModalOpen}
                onClose={() => { setIsChangeCoverOpen(false); setSelectedImage(null) }}
                className="fixed z-50 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">

                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[95%] sm:w-[90%] max-w-5xl p-3 sm:p-6 z-50 border border-gray-300 dark:border-gray-700">
                        <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex justify-between items-center">
                            Change Cover
                            <button
                                onClick={() => { setIsChangeCoverOpen(false); setSelectedImage(null) }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                ✕
                            </button>
                        </Dialog.Title>

                        {/* File Upload */}
                        {!selectedImage && (
                            <div className="flex flex-col items-center justify-center h-[200px] sm:h-[300px] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                onClick={() => document.getElementById("coverUpload").click()}>
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center">Click or drag & drop to upload a cover image</p>
                                <input
                                    id="coverUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Cropping & Editing */}
                        {selectedImage && (
                            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 border border-gray-300 dark:border-gray-600 flex justify-center w-full lg:w-[75%] overflow-hidden">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        aspect={16 / 5} // New aspect ratio for cover images
                                        locked // Fixed size crop
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop preview"
                                            src={selectedImage}
                                            onLoad={onImageLoad} // New calculation for correct crop box size
                                            style={{
                                                filter: `brightness(${brightness}%)`,
                                                maxHeight: "300px",
                                                objectFit: "contain"
                                            }}
                                        />
                                    </ReactCrop>

                                </div>

                                {/* Controls */}
                                <div className="w-full lg:w-[25%] flex flex-col gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Brightness: {brightness}%
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={brightness}
                                            onChange={(e) => setBrightness(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setIsChangeCoverOpen(false); setSelectedImage(null) }}
                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog >


            <Dialog
                open={isChangeProfileModalOpen}
                onClose={() => { setIsChangeProfileOpen(false); setSelectedImage(null) }}
                className="fixed z-50 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">

                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[95%] sm:w-[90%] max-w-3xl p-3 sm:p-6 z-50 border border-gray-300 dark:border-gray-700">
                        <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex justify-between items-center">
                            Change Profile Picture
                            <button
                                onClick={() => { setIsChangeProfileOpen(false); setSelectedImage(null) }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                ✕
                            </button>
                        </Dialog.Title>

                        {/* File Upload */}
                        {!selectedImage && (
                            <div
                                className="flex flex-col items-center justify-center h-[150px] sm:h-[250px] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                onClick={() => document.getElementById("profileUpload").click()}
                            >
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center">Click or drag & drop to upload a profile image</p>
                                <input
                                    id="profileUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Cropping & Editing */}
                        {selectedImage && (
                            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 border border-gray-300 dark:border-gray-600 flex justify-center w-full lg:w-[75%] overflow-hidden">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        aspect={1 / 1}  // Square profile picture
                                        locked
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop preview"
                                            src={selectedImage}
                                            onLoad={onProfileImageLoad}
                                            style={{ filter: `brightness(${brightness}%)`, maxHeight: "250px", objectFit: "contain" }}
                                        />
                                    </ReactCrop>
                                </div>

                                {/* Controls */}
                                <div className="w-full lg:w-[25%] flex flex-col gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Brightness: {brightness}%
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={brightness}
                                            onChange={(e) => setBrightness(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={handleProfileSave}
                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setIsChangeProfileOpen(false); setSelectedImage(null) }}
                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={isProfilePreviewOpen}
                onClose={() => setIsProfilePreviewOpen(false)}
                className="fixed z-50 inset-0"
            >
                {/* Background Blur */}
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                {/* Centered Preview */}
                <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
                        <img
                            src={userData.profile || defaultProfile}
                            alt="Profile Preview"
                            className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] object-cover rounded-xl"
                        />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsProfilePreviewOpen(false)}
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </Dialog>

        </>
    );
};

export default UserProfile;
