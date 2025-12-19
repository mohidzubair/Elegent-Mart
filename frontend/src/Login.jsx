import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { apiFetch } from "./api";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user, logout, login, loading } = useAuth();

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotStatus, setForgotStatus] = useState(null);

    // Check for redirect message from protected route
    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
        }
    }, [location]);

    // Check if user is already logged in on component mount
    // Don't auto-redirect, let them see they're logged in
    // useEffect(() => {
    //     if (user) {
    //         if (user.role === 'admin') {
    //             navigate('/admin');
    //         } else {
    //             navigate('/');
    //         }
    //     }
    // }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        // Don't navigate, let the page refresh to show login form
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Handle form submit -> call backend /api/auth/login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });

            const json = await res.json();
            if (!res.ok) {
                setError(json.message || 'Login failed');
                setSubmitting(false);
                return;
            }

            // Update AuthContext with user data
            if (json.user) {
                login(json.user); // This updates both context state and localStorage
            }

            // Redirect based on user role
            if (json.user && json.user.role === 'admin') {
                console.log('Admin user detected, redirecting to admin portal...');
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error', err);
            setError('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading state while checking auth
    if (loading) {
        return (
            <main className="flex justify-center items-center min-h-screen px-4 py-12 my-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc3545] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex justify-center items-center min-h-screen px-4 py-12 my-10">
            <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8 pop-out">
                {/* Logo + Heading */}
                <div className="text-center mb-6">
                    <img
                        src="/Images/martlogo.jpg"
                        alt="Elegant Mart Logo"
                        className="w-28 mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-[#dc3545]">
                        {user ? "Already Logged In" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {user ? `You're logged in as ${user.name}` : "Login to continue your shopping"}
                    </p>
                </div>

                {/* Show message if already logged in */}
                {user ? (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">✅</span>
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">You are already logged in!</p>
                                    <p className="text-green-600">Name: <strong>{user.name}</strong></p>
                                    <p className="text-green-600">Email: <strong>{user.email}</strong></p>
                                    <p className="text-green-600">Role: <strong className="uppercase">{user.role}</strong></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/'}
                                className="w-full bg-[#dc3545] text-white py-3 rounded-lg font-medium text-center hover:bg-red-600 transition"
                            >
                                Go to {user.role === 'admin' ? 'Admin Portal' : 'Homepage'}
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                            >
                                Logout
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            Want to switch accounts? Please logout first.
                        </p>
                    </div>
                ) : (
                    /* Login Form - Only show if NOT logged in */
                    <>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="peer w-full px-4 pt-5 pb-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                                    placeholder=" " // keep a single space so peer-placeholder-shown works
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 top-2 text-gray-500 text-sm transition-all 
      peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#dc3545]
      peer-valid:top-0 peer-valid:text-xs peer-valid:text-[#dc3545]"
                                >
                                    Email Address
                                </label>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="peer w-full px-4 pt-5 pb-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-4 top-2 text-gray-500 text-sm transition-all 
      peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#dc3545]
      peer-valid:top-0 peer-valid:text-xs peer-valid:text-[#dc3545]"
                                >
                                    Password
                                </label>
                            </div>

                            {/* Remember Me + Forgot */}
                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="rounded text-[#dc3545] focus:ring-[#dc3545]"
                                    />
                                    <span>Remember Me</span>
                                </label>
                                <button type="button" onClick={() => setShowForgot(true)} className="text-[#dc3545] hover:underline">
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#dc3545] text-white py-3 rounded-lg font-medium hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545] transition disabled:opacity-50"
                            >
                                {submitting ? 'Signing in...' : 'Login'}
                            </button>

                            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="px-2 text-gray-400 text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Social Login */}
                        <div className="flex gap-3 justify-center">
                            {/* <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <img
                            src="https://img.icons8.com/color/24/google-logo.png"
                            alt="Google"
                        />
                        <span className="text-sm">Google</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <img
                            src="https://img.icons8.com/ios-filled/24/1877F2/facebook-new.png"
                            alt="Facebook"
                        />
                        <span className="text-sm">Facebook</span>
                    </button> */}
                        </div>

                        {/* Signup Link */}
                        <p className="text-center text-sm mt-6">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-[#dc3545] hover:underline font-medium"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </>
                )}
            </div>

            {/* Forgot password modal-ish area */}
            {showForgot && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-3">Reset Password</h3>
                        <p className="text-sm text-gray-600 mb-4">Enter your email to receive a password reset link.</p>

                        <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowForgot(false)} className="px-4 py-2 rounded border">Cancel</button>
                            <button
                                onClick={async () => {
                                    setForgotStatus(null);
                                    try {
                                        const res = await fetch('/api/auth/forgot-password', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email: forgotEmail })
                                        });
                                        const json = await res.json();
                                        if (!res.ok) {
                                            setForgotStatus({ ok: false, msg: json.message || 'Failed' });
                                        } else {
                                            setForgotStatus({ ok: true, msg: json.message || 'Email sent' });
                                        }
                                    } catch (err) {
                                        console.error('Forgot password error', err);
                                        setForgotStatus({ ok: false, msg: 'Network error' });
                                    }
                                }}
                                className="px-4 py-2 rounded bg-[#dc3545] text-white"
                            >
                                Send
                            </button>
                        </div>

                        {forgotStatus && (
                            <div className={`mt-3 text-sm ${forgotStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                                {forgotStatus.msg}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
