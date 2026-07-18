import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  AlertCircle,
  Globe,
  Mail,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Fetch job details by ID from the backend API
  const fetchJobDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data?.success) {
        setJob(response.data.job);
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError(
        err.response?.data?.message || "Failed to load job details. It might have been removed or does not exist."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if candidate has already applied to this job
  const checkHasApplied = async () => {
    try {
      const response = await api.get("/applications/me");
      if (response.data?.success) {
        const hasApplied = response.data.applications.some(
          (app) => app.job?._id === id
        );
        setAlreadyApplied(hasApplied);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  // Submit job application for the logged-in candidate
  const handleApply = async () => {
    setApplyLoading(true);
    try {
      const response = await api.post(`/applications/${id}`, {
        resume: user?.profile?.resume || "",
      });
      if (response.data?.success) {
        toast.success(response.data.message || "Applied successfully!");
        setAlreadyApplied(true);
      }
    } catch (err) {
      console.error("Error applying to job:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to submit your application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setApplyLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
    // Only check if candidate is logged in
    if (user && user.role === "candidate") {
      checkHasApplied();
    }
  }, [id, user]);

  // Helper to format salary
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "Not specified";
    return `₹${Number(salary).toLocaleString("en-IN")}`;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading skeleton layout for premium UX
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="h-4 bg-slate-200 rounded-md w-28"></div>

        {/* Header Section Skeleton */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-3/4">
              <div className="h-6 bg-slate-200 rounded-md w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded-md w-2/3"></div>
              <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
            </div>
            <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-6 bg-slate-200 rounded-full w-24"></div>
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded-md w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Body Content Skeleton */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded-md w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded-md w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error & Not Found view
  if (error || !job) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Job Details Error</h3>
        <p className="text-slate-650 text-sm">{error || "The requested job was not found."}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Back to Home
          </button>
          {id && (
            <button
              onClick={fetchJobDetails}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success view
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back to Job Listings Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-650 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {job.position || "Open Position"}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="text-lg text-slate-700 font-medium flex items-center gap-2">
              {job.company?.name || "Independent Recruiter"}
              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label={`Visit ${job.company.name} website`}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </p>
          </div>

          {/* Core Info Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {job.jobType || "Full-time"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              {job.experienceLevel || "Entry"} Level
            </span>
          </div>
        </div>

        {/* Company Logo initials fallback */}
        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border border-slate-100 text-slate-700 font-extrabold rounded-2xl flex items-center justify-center shrink-0 uppercase text-xl shadow-2xs">
          {job.company?.name ? job.company.name.slice(0, 2) : "JP"}
        </div>
      </div>

      {/* Meta Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Location Card */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </span>
          <span className="text-sm font-semibold text-slate-850 truncate">{job.location || "Remote / Anywhere"}</span>
        </div>

        {/* Salary Card */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            Salary
          </span>
          <span className="text-sm font-semibold text-slate-850">{formatSalary(job.salary)}</span>
        </div>

        {/* Experience Card */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            Experience
          </span>
          <span className="text-sm font-semibold text-slate-850 capitalize">{job.experienceLevel || "Entry"} Level</span>
        </div>

        {/* Posted Date Card */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Posted Date
          </span>
          <span className="text-sm font-semibold text-slate-850">{formatDate(job.postedAt || job.createdAt)}</span>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs space-y-8">
        {/* Description Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Job Description</h2>
          <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Key Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-650">
              {job.requirements.map((req, index) => (
                <li key={index} className="leading-relaxed">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Poster / Recruiter Info Section */}
        {job.createdBy && (
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Posted By</h2>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>{job.createdBy.fullname}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${job.createdBy.email}`} className="text-blue-600 hover:underline">
                  {job.createdBy.email}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Application Action Button */}
        {(!user || user.role === "candidate") && (
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-705 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center cursor-pointer"
              >
                Login to Apply
              </button>
            ) : alreadyApplied ? (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-xl text-sm cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                Already Applied
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={applyLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {applyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Apply for this Job"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetails;
