import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  Building,
  MapPin,
  Globe,
  FileText,
  AlertCircle,
  PlusCircle,
  Loader2,
} from "lucide-react";

function CreateCompany() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect check if guest or candidate
  const isRecruiter = user && user.role === "recruiter";

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Controlled Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name.trim()) {
      setError("Company Name is a mandatory field.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/companies", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        website: formData.website.trim(),
      });

      if (response.data?.success) {
        toast.success(response.data.message || "Company registered successfully!");
        // Redirect directly to Post Job page so they can immediately post a job for this company
        navigate("/jobs/post");
      }
    } catch (err) {
      console.error("Error registering company:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to register company. Please verify input fields.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 1. Guest / Candidate Access Block
  if (user && !isRecruiter) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Access Denied</h3>
        <p className="text-slate-500 text-sm">
          Only users registered with the **Recruiter** role are permitted to register new companies.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  // 2. Unauthenticated View
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full border border-red-150">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sign In Required</h3>
        <p className="text-slate-500 text-sm">
          Please log in with a recruiter account to register new companies.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  // 3. Main Form View
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-955 tracking-tight flex items-center gap-2">
          <PlusCircle className="h-8 w-8 text-blue-600 animate-pulse" />
          Register Company
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Register your company profile to start posting job vacancies.
        </p>
      </div>

      {/* Posting Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
      >
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Company Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-1">
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                HQ Location
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  disabled={loading}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, Karnataka"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label htmlFor="website" className="block text-sm font-semibold text-slate-700">
                Website Link
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="website"
                  name="website"
                  type="url"
                  disabled={loading}
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="e.g. https://acme.org"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-55"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
              Company Bio / Description
            </label>
            <div className="relative rounded-md shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <FileText className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <textarea
                id="description"
                name="description"
                rows="5"
                disabled={loading}
                value={formData.description}
                onChange={handleChange}
                placeholder="Give a short overview of what your company does, core products/services, and work culture..."
                className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/")}
            className="px-6 py-2.5 border border-slate-350 hover:bg-slate-55 text-slate-700 font-semibold rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Create Company"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCompany;
