import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import aboutImg from "../assets/images/about.png";
import decafImg from "../assets/images/decaf.png";
import { authService } from "../services/authService";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const validatePassword = (pwd: string) => {
        if (pwd.length < 6) return "Password must be at least 6 characters";
        if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
        if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
        if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
        if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        const passError = validatePassword(password);
        if (passError) {
            setError(passError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const token = searchParams.get("token");
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        try {
            const result = await authService.resetPassword(email, token, password);

            if (result.status === 'success') {
                setIsSubmitted(true);
            } else {
                setError(result.error || "Failed to reset password");
            }
        } catch (error) {
            console.error("Failed to reset password:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative w-full h-full p-4">
            {/* Background with Blur - Hero Image (Artisan Roasting) */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${aboutImg})` }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 max-w-5xl w-full mx-4 h-auto md:min-h-[600px] flex flex-col md:flex-row rounded-[32px] overflow-hidden shadow-2xl">

                {/* Left Side - Image (Decaf Coffee) - Top Banner on Mobile, Left Panel on Desktop */}
                <div className="block w-full md:w-[45%] h-auto relative">
                    <img
                        src={decafImg}
                        alt="Coffee Background"
                        className="w-full h-auto md:h-full md:object-cover"
                    />
                    {/* Overlay to match tone if needed */}
                    <div className="absolute inset-0 bg-black/10 md:bg-transparent"></div>
                </div>

                {/* Right Side - Form - Full width on Mobile */}
                <div className="w-full md:w-[55%] bg-[#6F4E37] text-white p-5 flex flex-col justify-center items-center">

                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="bg-white/10 p-1.5 rounded-full mb-1.5">
                            {/* Simple Logo Placeholder */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4 4Z"></path>
                                <line x1="6" y1="2" x2="6" y2="4"></line>
                                <line x1="10" y1="2" x2="10" y2="4"></line>
                                <line x1="14" y1="2" x2="14" y2="4"></line>
                            </svg>
                        </div>
                        <h1 className="text-base font-bold tracking-wide">Cafe Beans</h1>
                    </div>

                    <div className="w-full max-w-sm">
                        {!isSubmitted ? (
                            <>
                                <h2 className="text-lg text-center mb-4 font-light leading-snug text-gray-200">
                                    Reset Your Password<br />Enter your new password below.
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-2.5">

                                    {/* Email Input (Read-only) */}
                                    <div className="space-y-0.5">
                                        <label className="text-[10px] text-gray-400 ml-1">Email address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="w-full bg-[#2A2A2A] text-gray-400 px-3 py-2 rounded-lg border border-transparent cursor-not-allowed text-sm"
                                        />
                                    </div>

                                    {/* New Password Input */}
                                    <div className="space-y-0.5">
                                        <label className="text-[10px] text-gray-400 ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="Enter new password"
                                                className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg border border-transparent focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-600 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Input */}
                                    <div className="space-y-0.5">
                                        <label className="text-[10px] text-gray-400 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                placeholder="Confirm new password"
                                                className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg border border-transparent focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-600 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="text-red-300 text-xs text-center bg-red-900/30 py-2 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full bg-white text-black font-bold text-base py-2.5 rounded-xl shadow-lg hover:bg-gray-100 transition-transform active:scale-95"
                                        >
                                            Reset Password
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-4 text-center text-xs text-gray-400">
                                    Remember your password? <Link to="/login" className="text-white hover:underline font-medium">Log In</Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-xl font-bold mb-4">Password Reset Successful!</h2>
                                <p className="text-gray-200 mb-6">
                                    Your password has been successfully reset. You can now log in with your new password.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block bg-white text-black font-bold text-base py-2.5 px-6 rounded-xl shadow-lg hover:bg-gray-100 transition-transform active:scale-95"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;
