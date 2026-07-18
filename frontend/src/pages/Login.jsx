import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI States for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation check
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // 1. Issue POST request to login endpoint
      const response = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      // 2. Handle successful login
      if (response.data?.success) {
        toast.success(response.data.message || "LoggedIn successfully!");
        setUser(response.data.user);

        // Temporarily redirecting to Home page as requested
        navigate("/");
      }
    } catch (err) {
      // 3. Handle failure states (extracting backend-defined errors)
      const errorMessage =
        err.response?.data?.message || "Invalid email or password.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        {/* Title & Subtitle */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Log in to manage your jobs and applications
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
            </span>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Link to Register page */}
        <div className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
