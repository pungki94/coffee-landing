import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import aboutImg from "../assets/images/about.png";
import decafImg from "../assets/images/decaf.png";
import { api } from "../config/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface RegisterProps {
    onLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

    const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
    const [passwordStrengthLabel, setPasswordStrengthLabel] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [googleError, setGoogleError] = useState("");

    const navigate = useNavigate();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    // Initialize Google Sign-In
    useEffect(() => {
        const initGoogle = () => {
            if (typeof google !== 'undefined' && google.accounts && googleBtnRef.current) {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "signup_with",
                    shape: "rectangular",
                    width: 300,
                });
            }
        };

        // Dynamically load the Google Identity Services script
        const loadGoogleScript = () => {
            if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
                // Script already loaded
                initGoogle();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initGoogle();
            document.head.appendChild(script);
        };

        // Check if Google is already available
        if (typeof google !== 'undefined') {
            initGoogle();
        } else {
            loadGoogleScript();
        }
    }, []);

    const handleGoogleResponse = async (response: { credential: string }) => {
        setIsGoogleLoading(true);
        setGoogleError("");

        try {
            const result = await api.auth.googleAuth(response.credential);

            if (result.status === 'success' && result.user) {
                // Save user to localStorage and update auth state
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isAuth', 'true');
                if (onLogin) onLogin();

                // Fetch sheets data
                try {
                    const sheetsResult = await api.sheets.getAll();
                    if (sheetsResult.status === 'success' && sheetsResult.data) {
                        Object.keys(sheetsResult.data).forEach(sheetName => {
                            localStorage.setItem(sheetName, JSON.stringify(sheetsResult.data[sheetName]));
                        });
                    }
                } catch (sheetsError) {
                    console.error("Error fetching sheets data:", sheetsError);
                }

                navigate("/");
            } else {
                setGoogleError(result.error || "Google sign-up failed. Please try again.");
            }
        } catch (error) {
            console.error("Google auth error:", error);
            setGoogleError("An error occurred during Google sign-up.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const calculateStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length > 5) score++;
        if (pwd.length > 7) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        setPasswordStrengthScore(score);

        if (score <= 2) setPasswordStrengthLabel("Weak");
        else if (score <= 4) setPasswordStrengthLabel("Medium");
        else setPasswordStrengthLabel("Strong");
    };

    const validateField = (field: string, value: string) => {
        let error = "";
        switch (field) {
            case "name":
                if (!value.trim()) error = "Name is required";
                break;
            case "email":
                if (!value.trim()) error = "Email is required";
                else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
                break;
            case "password":
                if (value.length < 6) error = "Password must be at least 6 characters";
                else if (!/[a-z]/.test(value)) error = "Password must contain at least one lowercase letter";
                else if (!/[A-Z]/.test(value)) error = "Password must contain at least one uppercase letter";
                else if (!/[0-9]/.test(value)) error = "Password must contain at least one number";
                else if (!/[^A-Za-z0-9]/.test(value)) error = "Password must contain at least one special character";
                break;
            case "confirmPassword":
                if (value !== password) error = "Passwords do not match";
                break;
            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        validateField("name", value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        validateField("email", value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        validateField("password", value);
        calculateStrength(value);
        if (confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: value !== confirmPassword ? "Passwords do not match" : "" }));
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== password) {
            setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
        } else {
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        const nameError = !name.trim() ? "Name is required" : "";
        const emailError = !email.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(email) ? "Invalid email format" : "";

        let passError = "";
        if (password.length < 6) passError = "Password must be at least 6 characters";
        else if (!/[a-z]/.test(password)) passError = "Password must contain at least one lowercase letter";
        else if (!/[A-Z]/.test(password)) passError = "Password must contain at least one uppercase letter";
        else if (!/[0-9]/.test(password)) passError = "Password must contain at least one number";
        else if (!/[^A-Za-z0-9]/.test(password)) passError = "Password must contain at least one special character";

        const confirmPassError = password !== confirmPassword ? "Passwords do not match" : "";

        if (nameError || emailError || passError || confirmPassError) {
            setErrors({
                name: nameError,
                email: emailError,
                password: passError,
                confirmPassword: confirmPassError
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await api.auth.register(name, email, password);

            if (result.status === 'success') {
                setVerificationSent(true);
            } else {
                alert(`Registration failed: ${result.error}`);
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred during registration.");
        } finally {
            setIsLoading(false);
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

                {/* IMAGE */}
                <div className="w-full h-[25vh]">
                    <img
                        src={decafImg}
                        alt="Decaf Coffee"
                        className="w-full h-full object-cover object-top"
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
                                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4 4Z" />
                                <line x1="6" y1="2" x2="6" y2="4" />
                                <line x1="10" y1="2" x2="10" y2="4" />
                                <line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                        </div>
                        <h1 className="text-sm font-semibold">Cafe Beans</h1>
                    </div>

                    {!verificationSent ? (
                        <>
                            <h2 className="text-sm text-gray-200 mb-3">
                                Create your account
                            </h2>

                            {/* Google Sign-Up Button */}
                            <div className="w-full mb-3">
                                <div
                                    ref={googleBtnRef}
                                    className="flex justify-center"
                                    id="google-signup-btn"
                                />
                                {isGoogleLoading && (
                                    <div className="flex items-center justify-center mt-2 gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-xs text-gray-300">Signing up with Google...</span>
                                    </div>
                                )}
                                {googleError && (
                                    <p className="text-red-400 text-[10px] mt-1 text-center">{googleError}</p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center w-full mb-3">
                                <div className="flex-1 h-px bg-white/20"></div>
                                <span className="px-3 text-[11px] text-gray-300">or sign up with email</span>
                                <div className="flex-1 h-px bg-white/20"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full space-y-2">

                                <div>
                                    <label className="text-[10px] text-gray-300 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={handleNameChange}
                                        required
                                        placeholder="John Doe"
                                        className={`w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs ${errors.name ? "border border-red-500" : ""}`}
                                    />
                                    {errors.name && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-300 ml-1">Email address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        placeholder="jubaer@gmail.com"
                                        className={`w-full bg-[#2A2A2A] text-gray-200 px-3 py-1.5 rounded-lg text-xs ${errors.email ? "border border-red-500" : ""}`}
                                    />
                                    {errors.email && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-300 ml-1">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                            className={`w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg text-sm border ${errors.password ? "border-red-500" : "border-gray-700 focus:border-green-500"} outline-none transition-colors`}
                                        />
                                    </div>

                                    {/* Strength Indicator */}
                                    {password && (
                                        <div className="mt-2 ml-1">
                                            {/* Bar */}
                                            <div className="flex h-1 bg-gray-700/50 rounded-full overflow-hidden w-[100px] mb-1">
                                                <div
                                                    className={`h-full transition-all duration-300 ${passwordStrengthScore <= 2 ? "bg-red-500 w-1/3" :
                                                        passwordStrengthScore <= 4 ? "bg-yellow-500 w-2/3" :
                                                            "bg-green-500 w-full"
                                                        }`}
                                                />
                                            </div>
                                            {/* Text */}
                                            <p className={`text-[10px] font-medium ${passwordStrengthScore <= 2 ? "text-red-400" :
                                                passwordStrengthScore <= 4 ? "text-yellow-400" :
                                                    "text-green-500"
                                                }`}>
                                                {passwordStrengthLabel === "Strong" ? "Strong password!" : passwordStrengthLabel}
                                            </p>
                                        </div>
                                    )}
                                    {errors.password && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-300 ml-1">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            required
                                            className={`w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg text-sm border ${errors.confirmPassword ? "border-red-500" : "border-gray-700 focus:border-green-500"} outline-none transition-colors`}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.confirmPassword}</p>}
                                </div>

                                {/* Show Password Checkbox */}
                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <input
                                        type="checkbox"
                                        id="showPassword"
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                        className="w-4 h-4 rounded border-gray-600 bg-[#2A2A2A] text-blue-500 focus:ring-blue-500/20"
                                    />
                                    <label htmlFor="showPassword" className="text-xs text-gray-300 cursor-pointer select-none">
                                        Show Password
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full font-semibold py-2 rounded-xl mt-2 text-sm transition-transform active:scale-95 ${isLoading
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-white text-black"
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing Up...
                                        </span>
                                    ) : (
                                        "Sign Up"
                                    )}
                                </button>
                            </form>

                            <div className="mt-2 text-[11px] text-gray-400">
                                Already have an account?{" "}
                                <Link to="/login" className="text-white font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fadeIn">
                            <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-300 ring-1 ring-yellow-500/50">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Verify Your Email</h3>
                                <p className="text-xs text-gray-300">
                                    We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                Please check your inbox and click the link to activate your account.
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/10 w-full">
                                <p className="text-[10px] text-gray-400 mb-2">Already verified?</p>
                                <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-lg text-xs transition-colors block w-full">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Register;
