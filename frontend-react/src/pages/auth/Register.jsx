import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({ mode: "onChange" });

    const password = watch("password");

    /** Form submit handler */
    const onSubmit = async (data) => {
        try {
            const res = await api.post("/register", data);
            localStorage.setItem("token", res.data.access_token);
            navigate("/dashboard");
            setUser(res.data.user);
        } catch (err) {
            if (err.response && err.response.data?.errors) {
                const messages = Object.values(err.response.data.errors).flat().join(", ");
                setError("apiError", { message: messages });
            } else {
                setError("apiError", { message: err });

            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Register</h2>

            {errors.apiError && (
                <p className="text-red-500 text-sm text-left mb-4">{errors.apiError.message}</p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div className="space-y-1 text-left">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200">Name</label>
                    <input
                        type="text"
                        placeholder="Name"
                        {...register("name", { required: "Name is required" })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

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


                {/* Email */}
                <div className="space-y-1 text-left">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200">Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email is required",
                            validate: async (value) => {
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
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>


                {/* Password */}
                <div className="space-y-1 text-left">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            {...register("password", { required: "Password is required" })}
                            className="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-blue-600 dark:text-blue-400 hover:scale-110 transition"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 text-left">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            {...register("password_confirmation", {
                                required: "Confirm password is required",
                                validate: (value) => value === password || "Passwords do not match"
                            })}
                            className="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-blue-600 dark:text-blue-400 hover:scale-110 transition"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </button>
            </form>

            <div className="mt-4 text-end space-y-2">
                <Link
                    to="/employerRegister"
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Employer Registration
                </Link>
                <Link
                    to="/login"
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Already have an account?
                </Link>
            </div>
        </div>
    );
}

export default Register;
