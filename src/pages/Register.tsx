import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import aboutImg from "../assets/images/about.png";
import decafImg from "../assets/images/decaf.png";
import { authService } from "../services/authService";

const Register: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const validatePassword = (pwd: string) => {
        if (pwd.length < 6) return "Password must be at least 6 characters";
        if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
        if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
        if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
        if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const passError = validatePassword(password);
        if (passError) {
            alert(passError);
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const result = await authService.register(name, email, password);

            if (result.status === 'success') {
                alert("Registration successful! Please login.");
                navigate("/login");
            } else {
                alert(`Registration failed: ${result.error}`);
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred during registration.");
        }
    };

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
            <div className="relative z-10 w-full max-w-[360px] rounded-2xl overflow-hidden shadow-xl">

                {/* IMAGE — SAME AS LOGIN MOBILE (NO CROP) */}
                <div className="w-full">
                    <img
                        src={decafImg}
                        alt="Decaf Coffee"
                        className="w-full h-auto object-contain"
                    />
                </div>

                {/* FORM */}
                <div className="bg-[#6F4E37] text-white px-5 py-4 flex flex-col items-center">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-2">
                        <div className="bg-white/10 p-1.5 rounded-full mb-1">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                                <line x1="6" y1="2" x2="6" y2="4" />
                                <line x1="10" y1="2" x2="10" y2="4" />
                                <line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                        </div>
                        <h1 className="text-sm font-semibold">Cafe Beans</h1>
                    </div>

                    <h2 className="text-sm text-gray-200 mb-3">
                        Create your account
                    </h2>

                    <form onSubmit={handleSubmit} className="w-full space-y-2">

                        <div>
                            <label className="text-[10px] text-gray-300 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="John Doe"
                                className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-300 ml-1">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="jubaer@gmail.com"
                                className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                                >
                                    👁
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                                >
                                    👁
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-semibold py-2 rounded-xl mt-2 text-sm"
                        >
                            Sign Up
                        </button>
                    </form>

                    <div className="relative my-3 w-full">
                        <div className="border-t border-gray-700" />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2 bg-[#6F4E37] text-[10px] text-gray-400">
                            Or
                        </span>
                    </div>

                    <button className="text-[11px] text-gray-300">
                        Sign up with Google
                    </button>

                    <div className="mt-2 text-[11px] text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-white font-medium">
                            Sign in
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Register;
