import React, { useState } from "react";
import { Link } from "react-router-dom";
import aboutImg from "../assets/images/about.png";
import decafImg from "../assets/images/decaf.png";
import { authService } from "../services/authService";



const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            const result = await authService.forgotPassword(email);

            if (result.status === 'success') {
                setIsSubmitted(true);
            } else {
                console.error('Error sending email:', result);
                alert(`Failed to send reset email: ${result.error}`);
            }
        } catch (error) {
            console.error("Failed to generate email:", error);
            alert('An unexpected error occurred. Please check if the internet connection is active.');
        } finally {
            setIsLoading(false);
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
                                    Forgot Password?<br />Enter your email to reset it.
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-2.5">

                                    {/* Email Input */}
                                    <div className="space-y-0.5">
                                        <label className="text-[10px] text-gray-400 ml-1">Email address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="jubaer@gmail.com"
                                            className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg border border-transparent focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-600 text-sm"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full font-bold text-base py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 ${isLoading
                                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                                : "bg-white text-black hover:bg-gray-100"
                                                }`}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </span>
                                            ) : (
                                                "Send Reset Link"
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-4 text-center text-xs text-gray-400">
                                    Remember your password? <Link to="/login" className="text-white hover:underline font-medium">Log In</Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-xl font-bold mb-4">Check Your Email</h2>
                                <p className="text-gray-200 mb-6">
                                    We have sent a password reset link to <span className="font-bold">{email}</span>.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block bg-white text-black font-bold text-base py-2.5 px-6 rounded-xl shadow-lg hover:bg-gray-100 transition-transform active:scale-95"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
