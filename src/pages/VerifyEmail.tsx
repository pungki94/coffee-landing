
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import aboutImg from "../assets/images/about.png"; // Background
import decafImg from "../assets/images/decaf.png"; // Card Image
import { api } from "../config/api";

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const email = searchParams.get("email");
        const token = searchParams.get("token");

        if (!email || !token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        const verify = async () => {
            try {
                const result = await api.auth.verifyEmail(email, token);
                if (result.status === "success") {
                    setStatus("success");
                    setMessage(result.message || "Verification Successful!");
                } else {
                    setStatus("error");
                    setMessage(result.error || "Verification failed.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("An error occurred during verification.");
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center relative w-full p-4">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${aboutImg})` }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            {/* CARD */}
            <div className="relative z-10 w-full max-w-[360px] rounded-2xl overflow-hidden shadow-xl bg-[#6F4E37]">

                {/* IMAGE */}
                <div className="w-full h-[20vh]">
                    <img
                        src={decafImg}
                        alt="Coffee"
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                {/* CONTENT */}
                <div className="p-6 text-white flex flex-col items-center text-center">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="bg-white/10 p-2 rounded-full mb-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4 4Z" />
                                <line x1="6" y1="2" x2="6" y2="4" />
                                <line x1="10" y1="2" x2="10" y2="4" />
                                <line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-semibold">Cafe Beans</h1>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Email Verification</h2>

                    {status === "verifying" && (
                        <div className="flex flex-col items-center space-y-3">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-200 text-sm">Verifying your email...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                            <div className="bg-green-500/20 p-3 rounded-full text-green-300 ring-1 ring-green-500/50">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <p className="text-green-300 font-medium">{message || "Verification Successful!"}</p>
                            <p className="text-gray-200 text-xs">Your account has been activated.</p>

                            <button
                                onClick={() => navigate("/login")}
                                className="mt-4 bg-white text-[#6F4E37] font-bold py-2 px-6 rounded-full text-sm hover:bg-gray-100 transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                            <div className="bg-red-500/20 p-3 rounded-full text-red-300 ring-1 ring-red-500/50">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <p className="text-red-300 font-medium">Verification Failed</p>
                            <p className="text-gray-200 text-xs">{message}</p>

                            <Link to="/contact" className="text-xs text-white underline mt-2">
                                Contact Support
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
