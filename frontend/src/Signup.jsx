import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { apiFetch } from "./api";

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { user, logout, loading } = useAuth();

    // Check if user is already logged in on component mount
    // Don't auto-redirect, show them they're logged in

    const handleLogout = async () => {
        await logout();
        // Page will refresh to show signup form
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone })
            });

            const json = await res.json();
            if (!res.ok) {
                setError(json.message || 'Signup failed');
                setSubmitting(false);
                return;
            }

            setSuccess('Account created! Please check your email to verify your account.');
            // Redirect to login after 15 seconds to give user time to read and check email
            setTimeout(() => navigate('/login'), 15000);
        } catch (err) {
            console.error('Signup error', err);
            setError('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading state while checking auth
    if (loading) {
        return (
            <main className="flex-grow flex items-center justify-center px-4 py-12 my-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc3545] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-grow flex items-center justify-center px-4 py-12 my-10">
            <div className="bg-white shadow-xl rounded-2xl max-w-5xl w-full grid md:grid-cols-2 overflow-hidden">
                {/* Left: Illustration / Logo */}
                <div className="bg-[#dc3545] hidden md:flex flex-col items-center justify-center text-white p-8">
                    <img
                        src="src/assets/Images/martlogo.jpg"
                        alt="Elegant Mart Logo"
                        className="w-32 mb-6 drop-shadow-lg"
                    />
                    <h2 className="text-3xl font-bold">Join Elegant Mart</h2>
                    <p className="mt-3 text-sm opacity-90">
                        Create your account and start shopping with style 🚀
                    </p>
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY7usPFq-FWuTvtXMpPstBqIdLRSWGlII7vQ&s"
                        alt="Grocery Items Illustration"
                        className="w-72 mt-6 rounded-xl shadow-lg"
                    />
                </div>

                {/* Right: Form */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                    {user ? (
                        <>
                            {/* Already Logged In View */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center mb-4">
                                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-green-800">You're Signed In</h3>
                                </div>
                                <div className="space-y-2 text-gray-700">
                                    <p><span className="font-semibold">Name:</span> {user.name}</p>
                                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                                    <p><span className="font-semibold">Role:</span> <span className="capitalize">{user.role}</span></p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/')}
                                    className="w-full bg-[#dc3545] text-white py-3 rounded-lg font-medium transition hover:bg-gradient-to-r hover:from-[#dc3545] hover:to-[#ff6b6b]"
                                >
                                    {user.role === 'admin' ? 'Go to Admin Portal' : 'Go to Homepage'}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium transition hover:bg-gray-200 border border-gray-300"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Signup Form - Only shown when not logged in */}
                            <h2 className="text-2xl font-bold text-[#dc3545] text-center mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                Sign up to continue your shopping experience
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div className="floating-label">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder=" "
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                                    />
                                    <label htmlFor="name">Full Name</label>
                                </div>

                                {/* Email */}
                                <div className="floating-label">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder=" "
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                                    />
                                    <label htmlFor="email">Email Address</label>
                                </div>

                                {/* Password */}
                                <div className="floating-label">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder=" "
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                                    />
                                    <label htmlFor="password">Password</label>
                                </div>

                                {/* Confirm Password */}
                                <div className="floating-label">
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        name="confirmPassword"
                                        placeholder=" "
                                        required
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                                    />
                                    <label htmlFor="confirm-password">Confirm Password</label>
                                </div>

                                {/* Phone (optional) */}
                                <div className="floating-label">
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        placeholder=" "
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                                    />
                                    <label htmlFor="phone">Phone (optional)</label>
                                </div>

                                {/* Sign Up Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#dc3545] text-white py-3 rounded-lg font-medium transition hover:bg-gradient-to-r hover:from-[#dc3545] hover:to-[#ff6b6b] disabled:opacity-50"
                                >
                                    {submitting ? 'Creating Account...' : 'Sign Up'}
                                </button>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        ❌ {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">✅</span>
                                            <div className="text-sm">
                                                <p className="font-semibold mb-1">Account Created Successfully!</p>
                                                <p className="text-green-600">📧 Please check your email (<strong>{form.email}</strong>) for a verification link.</p>
                                                <p className="text-green-600 mt-1">You must verify your email before logging in.</p>
                                                <p className="text-xs text-green-500 mt-2">⏳ Redirecting to login in 15 seconds...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>

                            {/* Divider */}
                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="px-2 text-gray-400 text-sm">OR</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            {/* Social Signup */}
                            <div className="flex gap-3 justify-center">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
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
                                </button>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-sm mt-6">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-[#dc3545] hover:underline font-medium"
                                >
                                    Login
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
