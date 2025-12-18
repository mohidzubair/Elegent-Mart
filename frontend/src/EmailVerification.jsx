import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function EmailVerification() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("");
    const hasVerified = useRef(false); // Track if verification already attempted

    useEffect(() => {
        // Prevent double API calls in React 18 Strict Mode
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email/${token}`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");
                    // Redirect to login after 4 seconds
                    setTimeout(() => {
                        navigate("/login");
                    }, 4000);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed. Invalid or expired token.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
                console.error("Verification error:", error);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Verifying State */}
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#dc3545] mx-auto"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
                        <p className="text-gray-600">Please wait while we verify your email address...</p>
                    </div>
                )}

                {/* Success State */}
                {status === "success" && (
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg
                                    className="w-10 h-10 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Email Verified!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Redirecting to login in 4 seconds...
                        </p>
                        <Link
                            to="/login"
                            className="inline-block bg-[#dc3545] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Go to Login Now
                        </Link>
                    </div>
                )}

                {/* Error State */}
                {status === "error" && (
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <svg
                                    className="w-10 h-10 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">❌ Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                to="/signup"
                                className="block bg-[#dc3545] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Create New Account
                            </Link>
                            <Link
                                to="/login"
                                className="block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmailVerification;
