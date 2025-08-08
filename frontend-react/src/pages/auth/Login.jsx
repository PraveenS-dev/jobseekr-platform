import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(form.email, form.password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-500">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-8">
                    Welcome Back
                </h2>

                {error && (
                    <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-blue-600 dark:text-blue-400 transition duration-300 ease-in-out hover:scale-110"
                            >
                                {showPassword ? <FaEyeSlash className="animate-fade-in" /> : <FaEye className="animate-fade-in" />}
                            </button>


                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                        Login
                    </button>
                    <div className="mt-4 text-center">
                        <Link
                            to="/register"
                            className="text-blue-600 dark:text-blue-400 hover:underline">
                            Not have Account ?
                        </Link>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default Login;