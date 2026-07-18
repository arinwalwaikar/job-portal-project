import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  PlusCircle,
  AlertCircle,
  FileText,
  Tag,
  Loader2,
} from "lucide-react";

function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect check if guest or candidate
  const isRecruiter = user && user.role === "recruiter";

  // Form Field States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "", // stores comma-separated text from form input
    salary: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "Entry",
    position: "",
    company: "", // stores chosen Company ID
  });

  // State Management for async events
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Fetch recruiter's registered companies on mount
  const fetchRecruiterCompanies = async () => {
    setCompaniesLoading(true);
    setFetchError("");
    try {
      const response = await api.get("/companies/me");
      if (response.data?.success) {
        setCompanies(response.data.companies || []);
        // Pre-select first company if available
        if (response.data.companies && response.data.companies.length > 0) {
          setFormData((prev) => ({
            ...prev,
            company: response.data.companies[0]._id,
          }));
        }
      }
    } catch (err) {
      console.error("Error loading recruiter companies:", err);
      setFetchError(
        err.response?.data?.message || "Failed to load your registered companies. Please try again."
      );
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    if (isRecruiter) {
      fetchRecruiterCompanies();
    }
  }, [user]);

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
    setSubmitError("");
    setSubmitLoading(true);

    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      company,
    } = formData;

    // Client-side Validation Checks
    if (!title || !description || !company) {
      setSubmitError("Job Title, Description, and Company selection are mandatory fields.");
      setSubmitLoading(false);
      return;
    }

    // Process requirements string into array of strings (trimmed & non-empty)
    const requirementsArray = requirements
      ? requirements
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];

    try {
      const response = await api.post("/jobs", {
        title,
        description,
        requirements: requirementsArray,
        salary: salary ? Number(salary) : undefined,
        location: location || undefined,
        jobType,
        experienceLevel,
        position: position || undefined,
        company,
      });

      if (response.data?.success) {
        toast.success(response.data.message || "Job posted successfully!");
        // Redirect to Home Page so they can see the job listing
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to post the job. Please verify input fields.";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
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
          Only users registered with the **Recruiter** role are permitted to create new job listings.
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
          Please log in with a recruiter account to create and manage job postings.
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
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
          <PlusCircle className="h-8 w-8 text-blue-600 animate-pulse" />
          Create Job Opening
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Provide requirements and job details to attract the best talent.
        </p>
      </div>

      {/* Fetch Error or No Company warning */}
      {fetchError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-sm text-red-700">
          {fetchError}
        </div>
      ) : !companiesLoading && companies.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4 text-center">
          <div className="inline-flex p-3 bg-amber-100 text-amber-700 rounded-full">
            <Building className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No Associated Companies Found</h4>
          <p className="text-slate-650 text-sm max-w-md mx-auto">
            You must register your company under your account profile before you can post job listings.
          </p>
          {/* Since Company Creation is out of scope in this module, we show advice */}
          <p className="text-xs text-slate-400">
            (Company registration features will be integrated in future phases)
          </p>
        </div>
      ) : (
        /* Posting Form */
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  disabled={submitLoading || companiesLoading}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Department / Position */}
            <div className="space-y-1">
              <label htmlFor="position" className="block text-sm font-semibold text-slate-700">
                Department / Position
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="position"
                  name="position"
                  type="text"
                  disabled={submitLoading || companiesLoading}
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Company Selection Dropdown */}
            <div className="space-y-1">
              <label htmlFor="company" className="block text-sm font-semibold text-slate-700">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <select
                  id="company"
                  name="company"
                  required
                  disabled={submitLoading || companiesLoading}
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50 cursor-pointer"
                >
                  {companiesLoading ? (
                    <option value="">Loading your companies...</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Job Location */}
            <div className="space-y-1">
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                Location
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  disabled={submitLoading || companiesLoading}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Maharashtra (or Remote)"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Job Salary in ₹ */}
            <div className="space-y-1">
              <label htmlFor="salary" className="block text-sm font-semibold text-slate-700">
                Annual Salary (₹ INR)
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  disabled={submitLoading || companiesLoading}
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 1200000"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Job Type Dropdown */}
            <div className="space-y-1">
              <label htmlFor="jobType" className="block text-sm font-semibold text-slate-700">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                disabled={submitLoading || companiesLoading}
                value={formData.jobType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div className="space-y-1">
              <label htmlFor="experienceLevel" className="block text-sm font-semibold text-slate-700">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                disabled={submitLoading || companiesLoading}
                value={formData.experienceLevel}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50 cursor-pointer"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Director">Director Level</option>
                <option value="Executive">Executive Level</option>
              </select>
            </div>

            {/* Requirements / Key Skills tags */}
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-semibold text-slate-700">
                Key Skills / Requirements
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="requirements"
                  name="requirements"
                  type="text"
                  disabled={submitLoading || companiesLoading}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="e.g. ReactJS, NodeJS, MongoDB, TailwindCSS (comma-separated)"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
              <p className="text-2xs text-slate-400 mt-1">
                Enter multiple requirements separated by commas. They will be displayed as pill badges in cards.
              </p>
            </div>

            {/* Job Description (Full width textarea) */}
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Job Description <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                  <FileText className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  required
                  disabled={submitLoading || companiesLoading}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide an in-depth explanation of roles, responsibilities, and tasks..."
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button"
              disabled={submitLoading}
              onClick={() => navigate("/")}
              className="px-6 py-2.5 border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading || companiesLoading || companies.length === 0}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Job Opening"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PostJob;
