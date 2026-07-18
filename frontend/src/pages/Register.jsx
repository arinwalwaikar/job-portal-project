import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Briefcase, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api.js";

function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "candidate",
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

    const { fullname, email, phoneNumber, password, role } = formData;

    // Basic Front-End Validation
    if (!fullname || !email || !phoneNumber || !password || !role) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      // 1. Issue POST request to register endpoint with request body
      const response = await api.post("/users/register", {
        fullname,
        email,
        phoneNumber,
        password,
        role,
      });

      // 2. Handle successful registration
      if (response.data?.success) {
        toast.success(response.data.message || "Account created successfully!");
        // Redirect to Login Page
        navigate("/login");
      }
    } catch (err) {
      // 3. Handle failure states (extracting backend-defined errors)
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign up to find jobs or hire talent
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-md">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                disabled={loading}
                value={formData.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Email Address */}
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
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-slate-700"
            >
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                disabled={loading}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="98765 43210"
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
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
                required
                disabled={loading}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Role Selection (Radio Cards) */}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">
              Join as a
            </span>
            <div className="grid grid-cols-2 gap-4">
              {/* Candidate Option */}
              <label
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.role === "candidate"
                    ? "border-blue-500 bg-blue-50/55 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                } ${loading ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Candidate</span>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  disabled={loading}
                  checked={formData.role === "candidate"}
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>

              {/* Recruiter Option */}
              <label
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.role === "recruiter"
                    ? "border-blue-500 bg-blue-50/55 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                } ${loading ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm font-medium">Recruiter</span>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  disabled={loading}
                  checked={formData.role === "recruiter"}
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
            </span>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        {/* Link to login page */}
        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
