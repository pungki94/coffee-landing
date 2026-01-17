import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import aboutImg from "../assets/images/about.png";
import decafImg from "../assets/images/decaf.png";
import { authService } from "../services/authService";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // Prevent double submission
    setIsLoading(true);

    try {
      // Use the spreadsheet auth service
      const result = await authService.login(email, password);

      if (result.status === 'success' && result.user) {
        console.log("Login successful", result);
        // Persist user in local storage to simulate session if needed for now
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin();
        navigate("/");
      } else {
        alert(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative w-full h-full p-4 lg:p-0">
      {/* Background with Blur - Hero Image (Artisan Roasting) */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${aboutImg})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-[360px] md:max-w-4xl mx-auto flex flex-col md:flex-row rounded-2xl md:rounded-[32px] overflow-hidden shadow-xl">

        {/* Left Side - Image (Decaf Coffee) */}
        {/* Mobile: Top, Auto height, Contain. Desktop: Left, Cover, Full height */}
        <div className="w-full md:w-[45%] relative shrink-0">
          <img
            src={decafImg}
            alt="Coffee Background"
            className="w-full h-auto object-contain md:h-full md:object-cover"
          />
          <div className="title-overlay absolute inset-0 bg-transparent"></div>
          {/* Mobile Overlay remove? Register doesn't have one usually, but let's keep it clean or minimal if needed. Register had none. */}
          <div className="absolute inset-0 bg-black/10 md:hidden"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] bg-[#6F4E37] text-white p-4 md:p-8 flex flex-col justify-center items-center shrink-0">

          {/* Logo Area */}
          <div className="flex flex-col items-center mb-1 md:mb-3 pt-2 md:pt-0">
            <div className="bg-white/10 p-1.5 rounded-full mb-1">
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
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                <line x1="6" y1="2" x2="6" y2="4"></line>
                <line x1="10" y1="2" x2="10" y2="4"></line>
                <line x1="14" y1="2" x2="14" y2="4"></line>
              </svg>
            </div>
            <h1 className="text-base font-bold tracking-wide">Cafe Beans</h1>
          </div>

          <div className="w-full max-w-sm">
            <h2 className="text-lg text-center mb-2 font-light leading-snug text-gray-200">
              Welcome Back, Please login<br />to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-2">

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-300 ml-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jubaer@gmail.com"
                  className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg border border-transparent focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-500 text-sm"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-300 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#2A2A2A] text-gray-200 px-3 py-2 rounded-lg border border-transparent focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Extras */}
              <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1">
                <label className="flex items-center cursor-pointer hover:text-white">
                  <input type="checkbox" className="mr-2 rounded bg-[#2A2A2A] border-gray-600 text-white focus:ring-0 w-3 h-3" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="hover:text-white transition-colors">Forgot password?</Link>
              </div>

              {/* Login Button */}
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
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-2 text-center text-xs text-gray-400">
              Don't have an account? <Link to="/register" className="text-white hover:underline font-bold ml-1">Sign up</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
