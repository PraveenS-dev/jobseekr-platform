import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { Pencil } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
import { FiMail, FiPhone, FiUser, FiMapPin, FiBriefcase, FiCalendar, FiTag, FiType, FiEye } from "react-icons/fi";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { XMarkIcon } from "@heroicons/react/24/solid";


const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [id, setId] = useState('');
    const [viewCount, setViewCount] = useState(null);
    const [userExpData, setUserExpData] = useState([]);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isChangeCoverModalOpen, setIsChangeCoverOpen] = useState(false);
    const [isChangeProfileModalOpen, setIsChangeProfileOpen] = useState(false);
    const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
    const [isProfileViewersOpen, setIsProfileViewersOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState();
    const [brightness, setBrightness] = useState(100);
    const imgRef = useRef();

    const [profileViewerIds, setProfileViewerIds] = useState([]);
    const [profileViewerDetails, setProfileViewerDetails] = useState([]);
    const [loading, setLoading] = useState(true);


    const GetUserData = async () => {
        try {
            const res = await api.get('/users/profile');
            const details = res.data.data?.userDetails;

            if (details) {
                setUserData(details);
                setId(details.enc_id);
            }
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

    const Viewprofile = useCallback((id) => {
        navigate(`/users/view/${id}`, { state: { from: location.pathname } });
    }, [navigate]);

    const GetViewerIds = async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_NODE_BASE_URL}/profileViewCount/getViewerIds/${id}`);
            const viewerIds = res.data?.viewer_ids || [];
            setProfileViewerIds(viewerIds);

            if (viewerIds.length > 0) {
                const viewersData = await Promise.all(
                    viewerIds.map(async (viewerId) => {
                        try {
                            const res = await api.get('/users/view', { params: { id: viewerId } });
                            return res.data.data?.userDetails;
                        } catch (err) {
                            console.error("Failed to fetch user", err);
                            return null;
                        }
                    })
                );

                setProfileViewerDetails(viewersData.filter(Boolean));
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to fetch viewer IDs", err);
        }
    };

    useEffect(() => {
        GetUserData();
        GetUserExpData(id);
    }, [id]);

    useEffect(() => {
        if (userData) {
            GetViewCount(userData.id);
            GetViewerIds(userData.id);
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

    const defaultProfile = `https://ui-avatars.com/api/?name=${user.name}&size=40`;
    const defaultCover = "https://www.dummyimage.com/1200x375/000/5a57ab&text=COVER";

    const changeCoverImage = async (blob) => {
        const formData = new FormData();
        formData.append("id", userData.enc_id);
        formData.append("image", blob, "cover.jpg");

        await api.post("/users/changeCoverimage", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        GetUserData();
    };

    const changeProfileImage = async (blob) => {
        const formData = new FormData();
        formData.append("id", userData.enc_id);
        formData.append("image", blob, "cover.jpg");

        await api.post("/users/changeProfileimage", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        GetUserData();
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

    const OpenProfileViewers = () => {
        setIsProfileViewersOpen(true);
    }

    if (!userData) return <p className="text-center mt-10 text-gray-500 dark:text-gray-300"></p>;

    return (
        <>
            <div className="flex justify-between items-center bg-blue-600 dark:bg-blue-800 mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-md">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Profile</h2>
            </div>

            {/* Profile Card */}
            <div className="max-w-full mx-auto mt-4 sm:mt-6 rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

                {/* Cover Image */}
                <div className="relative aspect-[16/6] sm:aspect-[16/5] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-600 group">
                    <img
                        src={userData.cover_image || defaultCover}
                        alt="Cover"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <button
                        onClick={() => setIsChangeCoverOpen(true)}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Change cover image"
                    >
                        <Pencil size={18} />
                    </button>
                </div>

                {/* Profile & Info */}
                <div className="relative px-4 sm:px-6 pb-8 pt-20">
                    <button
                        onClick={handleEditProfile}
                        className="absolute top-4 sm:top-6 right-4 sm:right-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm sm:text-base"
                    >
                        Update Profile
                    </button>

                    {/* Profile Image */}
                    <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6">
                        <div className="relative group">
                            <img
                                src={userData.profile || defaultProfile}
                                alt="Profile"
                                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                onClick={() => setIsProfilePreviewOpen(true)}
                            />
                            <button
                                onClick={() => setIsChangeProfileOpen(true)}
                                className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black/60 hover:bg-black/80 text-white p-1 sm:p-2 rounded-full shadow-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                title="Change profile picture"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Name & Headline */}
                    <div className="ml-0 sm:ml-4 mt-16 sm:mt-4 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-bold">{userData.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {userData.headline}
                        </p>

                        {/* Profile Completion */}
                        <div className="mt-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-xl p-4 shadow-md border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Profile Completion
                                </span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {progress}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-md"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </div>
                        </div>

                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-700 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300"
                        >
                            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-5 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                🧾 About
                            </h2>
                            <div className="space-y-3 sm:space-y-4 text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                                <div className="flex flex-wrap items-center gap-2">
                                    <FiUser className="text-blue-500" /> <span className="font-semibold">Name:</span> {userData.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <FiType className="text-blue-500" /> <span className="font-semibold">Headline:</span> {userData.headline}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <FiBriefcase className="text-blue-500" /> <span className="font-semibold">Preferred Job Type:</span> {userData.preferred_job_type}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <FiMapPin className="text-blue-500" /> <span className="font-semibold">Location:</span> {userData.location}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <FiTag className="text-blue-500" /> <span className="font-semibold">Skills:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {userData.skills?.split(",").map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 px-3 py-1 text-xs sm:text-sm rounded-lg shadow-sm"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <FiCalendar className="text-blue-500" /> <span className="font-semibold">Joined:</span> {userData.created_at}
                                </div>
                            </div>
                        </motion.div>

                        {/* Experience Section */}
                        {userExpData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mt-6"
                            >
                                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-700 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300">
                                    <h2 className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 sm:mb-8">
                                        🧑‍💼 Experience
                                    </h2>
                                    <div className="space-y-4 sm:space-y-6">
                                        {userExpData.map((exp, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                                className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md transition-all hover:shadow-2xl hover:scale-[1.015] duration-300"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between gap-3 sm:gap-4">
                                                    <div>
                                                        <h4 className="text-base sm:text-xl font-semibold text-blue-700 dark:text-blue-300">
                                                            {exp.job_title}
                                                        </h4>
                                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                                            {exp.company_name}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">{exp.start_date}</span>
                                                        <span>-</span>
                                                        <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">{exp.end_date}</span>
                                                    </div>
                                                </div>
                                                {exp.description && (
                                                    <p className="mt-3 sm:mt-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                        {exp.description}
                                                    </p>
                                                )}
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
                            className="mt-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-md p-4 sm:p-6 border border-blue-200 dark:border-blue-700 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300"
                        >
                            <h2 className="text-lg sm:text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">
                                📞 Contact
                            </h2>
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p className="flex items-center gap-2 sm:gap-3">
                                    <FiMail className="text-blue-700 dark:text-blue-400" /> <span className="font-medium">Email:</span> {userData.email}
                                </p>
                                <p className="flex items-center gap-2 sm:gap-3">
                                    <FiPhone className="text-blue-700 dark:text-blue-400" /> <span className="font-medium">Phone:</span> {userData.phone}
                                </p>
                            </div>
                        </motion.div>

                        {/* Activity Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mt-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-700 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300 cursor-pointer"
                            onClick={() => OpenProfileViewers()}>
                            <h2 className="text-lg sm:text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                🧠 Activity
                            </h2>
                            <p className="flex items-center gap-2 text-sm sm:text-base">
                                <FiEye className="text-blue-700 dark:text-blue-400" /> <span className="font-semibold">Count:</span> {viewCount} Profile Views
                            </p>
                            <p className="text-xs sm:text-sm italic text-gray-600 dark:text-gray-400">
                                Discover who's viewed your profile recently.
                            </p>
                        </motion.div>

                        {/* Resume Section */}
                        {userData.resume_link && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="mt-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-700 transition-all hover:shadow-2xl hover:scale-[1.015] duration-300"
                            >
                                <h2 className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3 sm:mb-4">
                                    📄 Resume
                                </h2>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <button
                                        onClick={() => setIsResumeModalOpen(true)}
                                        className=" hidden px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm sm:text-base cursor-pointer"
                                    >
                                        View Resume
                                    </button>
                                    <a
                                        href={userData.resume_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-blue-700 border border-blue-500 rounded-md hover:bg-blue-50 transition text-sm sm:text-base"
                                    >
                                        Download Resume
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog
                open={isProfileViewersOpen}
                onClose={() => setIsProfileViewersOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

                {/* Modal */}
                <div
                    className="relative w-full max-w-4xl rounded-2xl z-50
                    bg-white/50 dark:bg-gray-900/50
                    backdrop-blur-xl border border-white/20 dark:border-gray-700/30
                    bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30
                    shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsProfileViewersOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/70 dark:bg-gray-800/70 
                        hover:bg-white/90 dark:hover:bg-gray-700/90 transition z-10"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Title */}
                    <Dialog.Title className="text-2xl font-bold mb-4 px-6 pt-6 text-gray-900 dark:text-white">
                        Profile Viewers
                    </Dialog.Title>

                    {/* Scrollable Content */}
                    <div className="max-h-[600px] overflow-y-auto px-6 pb-6 space-y-4 pt-10">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            profileViewerDetails.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    onClick={() => Viewprofile(user.id)}
                                    className="group flex items-center p-4 rounded-xl cursor-pointer
                                        bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950
                                        border border-blue-200 dark:border-blue-700
                                        shadow-md hover:shadow-2xl hover:scale-[1.015]
                                        transition-all duration-300 ease-out"
                                >
                                    {/* Avatar */}
                                    <img
                                        src={user.profile_url || `https://ui-avatars.com/api/?name=${user.name}&size=80`}
                                        alt={user.name}
                                        className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-500"
                                    />

                                    {/* Info */}
                                    <div className="ml-4">
                                        <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            @{user.username}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                            {user.email}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </Dialog>



            {/* Resume Modal */}
            < Dialog open={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto" >
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 z-50">
                        <Dialog.Title className="text-xl font-semibold mb-4">Resume Preview</Dialog.Title>
                        <iframe
                            src={userData.resume_link}
                            title="Resume"
                            className="w-full h-[600px] border rounded"
                        ></iframe>
                        <div className="text-right mt-4">
                            <button
                                onClick={() => setIsResumeModalOpen(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog >

            {/* CoverImage Modal */}
            <Dialog
                open={isChangeCoverModalOpen}
                onClose={() => { setIsChangeCoverOpen(false); setSelectedImage(null) }}
                className="fixed z-50 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-4">

                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90%] max-w-5xl p-6 z-50 border border-gray-300 dark:border-gray-700">
                        <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
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
                            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                onClick={() => document.getElementById("coverUpload").click()}>
                                <p className="text-gray-500 dark:text-gray-300">Click or drag & drop to upload a cover image</p>
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
                            <div className="flex flex-col lg:flex-row gap-4 items-center">
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
                                                maxHeight: "400px",
                                                objectFit: "contain"
                                            }}
                                        />
                                    </ReactCrop>

                                </div>

                                {/* Controls */}
                                <div className="w-full lg:w-[25%] flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setIsChangeCoverOpen(false); setSelectedImage(null) }}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
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
                open={isChangeProfileModalOpen}
                onClose={() => { setIsChangeProfileOpen(false); setSelectedImage(null) }}
                className="fixed z-50 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-4">

                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90%] max-w-3xl p-6 z-50 border border-gray-300 dark:border-gray-700">
                        <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
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
                                className="flex flex-col items-center justify-center h-[250px] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                onClick={() => document.getElementById("profileUpload").click()}
                            >
                                <p className="text-gray-500 dark:text-gray-300">Click or drag & drop to upload a profile image</p>
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
                            <div className="flex flex-col lg:flex-row gap-4 items-center">
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
                                            style={{ filter: `brightness(${brightness}%)`, maxHeight: "350px", objectFit: "contain" }}
                                        />
                                    </ReactCrop>
                                </div>

                                {/* Controls */}
                                <div className="w-full lg:w-[25%] flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setIsChangeProfileOpen(false); setSelectedImage(null) }}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
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
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
                        <img
                            src={userData.profile || defaultProfile}
                            alt="Profile Preview"
                            className="w-[350px] h-[350px] object-cover rounded-xl"
                        />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsProfilePreviewOpen(false)}
                            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </Dialog>

        </>
    );
};

export default Profile;
