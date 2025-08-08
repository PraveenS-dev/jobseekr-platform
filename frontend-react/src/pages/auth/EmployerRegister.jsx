import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function EmployerRegister() {
    const { register, handleSubmit, formState: { errors }, trigger, watch, setError, clearErrors } = useForm({ mode: 'onChange' });
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState({ step1: 'default', step2: 'default' });
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const nextStep = async () => {
        const valid = await trigger(['comp_name', 'comp_email', 'comp_ph', 'comp_reg_no', 'comp_address']);
        if (valid) {
            setStatus(prev => ({ ...prev, step1: 'valid' }));
            setStep(2);
        } else {
            setStatus(prev => ({ ...prev, step1: 'invalid' }));
        }
    };

    const prevStep = () => setStep(1);

    const onSubmit = async (data) => {
        try {
            setStatus(prev => ({ ...prev, step2: 'valid' }));

            const formData = new FormData();
            formData.append('comp_name', data.comp_name);
            formData.append('comp_email', data.comp_email);
            formData.append('comp_ph', data.comp_ph);
            formData.append('comp_reg_no', data.comp_reg_no);
            formData.append('comp_address', data.comp_address);

            const company = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/company/store`, formData);

            const res = await api.post("/register", {
                name: data.name,
                email: data.email,
                username: data.username,
                password: data.password,
                comp_id: company.data.data._id,
                role: "3"
            });

            localStorage.setItem("token", res.data.access_token);
            setUser(res.data.user);
            navigate("/dashboard");

        } catch (err) {
            console.error(err);

            if (err.response?.data?.field && err.response?.data?.message) {
                setError(err.response.data.field, { type: 'manual', message: err.response.data.message });
            }

            setStatus(prev => ({ ...prev, step2: 'invalid' }));
        }
    };

    const indicatorColor = (targetStep) => {
        const key = `step${targetStep}`;
        if (step === Number(targetStep)) return 'bg-gray-400';
        if (status[key] === 'valid') return 'bg-green-500';
        if (status[key] === 'invalid') return 'bg-red-500';
        return 'bg-gray-300';
    };

    const variants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.4 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Company Details</h2>

                            {[
                                {
                                    label: "Company Name",
                                    name: "comp_name"
                                },
                                {
                                    label: "Company Email",
                                    name: "comp_email",
                                    type: "email",
                                    validate: async (value) => {
                                        try {
                                            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/company/emailUnique`, { comp_email: value });
                                            if (res.data?.data?.existValue === true) {
                                                return "Email already exists";
                                            }
                                            return true;
                                        } catch {
                                            return "Error validating email";
                                        }
                                    }
                                },
                                {
                                    label: "Company Contact No",
                                    name: "comp_ph",
                                    validate: async (value) => {
                                        try {
                                            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/company/phUnique`, { comp_ph: value });
                                            if (res.data?.data?.existValue === true) {
                                                return "Phone number already exists";
                                            }
                                            return true;
                                        } catch {
                                            return "Error validating phone number";
                                        }
                                    }
                                },
                                {
                                    label: "Company Reg No",
                                    name: "comp_reg_no",
                                    validate: async (value) => {
                                        try {
                                            const res = await axios.post(`${import.meta.env.VITE_NODE_BASE_URL}/company/regNoUnique`, { comp_reg_no: value });

                                            if (res.data?.existValue === true) {
                                                return "Register number already exists";
                                            }
                                            return true;
                                        } catch {
                                            return "Error validating registration number";
                                        }
                                    }
                                }
                            ].map(field => (
                                <div key={field.name} className="space-y-1 text-left">
                                    <label className="block font-semibold text-gray-700 dark:text-gray-200">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        placeholder={field.label}
                                        {...register(field.name, {
                                            required: `${field.label} is required!`,
                                            ...(field.validate && { validate: field.validate })
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                    />
                                    {errors[field.name] && <p className="text-red-400 text-sm">{errors[field.name].message}</p>}
                                </div>
                            ))}

                            <div className="space-y-1 text-left">
                                <label className="block font-semibold text-gray-700 dark:text-gray-200">Company Address</label>
                                <textarea
                                    placeholder="Company Address"
                                    {...register('comp_address', { required: "Company address is required!" })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                />
                                {errors.comp_address && <p className="text-red-400 text-sm">{errors.comp_address.message}</p>}
                            </div>

                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}


                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.4 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Details</h2>

                            {[
                                { label: "Name", name: "name" },
                                {
                                    label: "Email", name: "email", type: "email", validate: async (value) => {
                                        try {
                                            const res = await api.post("/users/emailUnique", { email: value });
                                            if (res.data.data.existValue === false) {
                                                return "Email already taken";
                                            }
                                            return true;
                                        } catch (err) {
                                            return "Error checking email";
                                        }
                                    }
                                },
                            ].map(field => (
                                <div key={field.name} className="space-y-1 text-left">
                                    <label className="block font-semibold text-gray-700 dark:text-gray-200">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        placeholder={field.label}
                                        {...register(field.name, {
                                            required: `${field.label} is required!`,
                                            ...(field.validate && { validate: field.validate })
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                    />
                                    {errors[field.name] && <p className="text-red-400 text-sm">{errors[field.name].message}</p>}
                                </div>
                            ))}

                            {/* Username */}
                            <div className="space-y-1 text-left">
                                <label className="block font-semibold text-gray-700 dark:text-gray-200">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    {...register("username", {
                                        required: "Username is required",
                                        validate: async (value) => {
                                            try {
                                                const res = await api.post("/users/userNameUnique", { username: value });
                                                if (res.data.data.existValue === false) {
                                                    return "Username already taken";
                                                }
                                                return true;
                                            } catch (err) {
                                                return "Error checking username";
                                            }
                                        }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                />
                                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1 text-left">
                                <label className="block font-semibold text-gray-700 dark:text-gray-200">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        {...register('password', {
                                            required: "Password is required!",
                                            minLength: { value: 6, message: "Minimum 6 characters required" }
                                        })}
                                        className="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-blue-600 dark:text-blue-400 hover:scale-110 transition duration-300 ease-in-out"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1 text-left">
                                <label className="block font-semibold text-gray-700 dark:text-gray-200">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        {...register('password_confirmation', {
                                            required: "Confirm Password is required!",
                                            validate: value => value === watch('password') || "Passwords do not match"
                                        })}
                                        className="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-blue-600 dark:text-blue-400 hover:scale-110 transition duration-300 ease-in-out"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="text-red-400 text-sm">{errors.password_confirmation.message}</p>}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition duration-300 cursor-pointer"
                                >
                                    Register
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-4 text-end space-y-2">
                    <Link to="/register" className="block text-blue-600 dark:text-blue-400 hover:underline">
                        Employee Registration
                    </Link>
                    <Link to="/login" className="block text-blue-600 dark:text-blue-400 hover:underline">
                        Already have an account?
                    </Link>
                </div>
            </form>
        </div >
    );
}

export default EmployerRegister;
