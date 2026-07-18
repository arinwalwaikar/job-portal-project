import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  PlusCircle,
  FolderOpen,
  Loader2,
} from "lucide-react";

function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Access check
  const isRecruiter = user && user.role === "recruiter";

  // State Management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch only the logged-in recruiter's jobs
  const fetchMyJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/jobs/me");
      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (err) {
      console.error("Error loading recruiter jobs:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your job postings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete a job posting
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting permanently? This action cannot be undone.")) {
      return;
    }

    setDeletingId(jobId);
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      if (response.data?.success) {
        toast.success(response.data.message || "Job posting deleted successfully.");
        // Immediately remove it from UI local state
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error(err.response?.data?.message || "Failed to delete the job posting. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (isRecruiter) {
      fetchMyJobs();
    }
  }, [user]);

  // Salary format utility
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "Not specified";
    return `₹${Number(salary).toLocaleString("en-IN")}`;
  };

  // Date format utility
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading skeleton layout
  const JobRowSkeleton = () => (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-3/4">
          <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
        </div>
      </div>
    </div>
  );

  // 1. Guest / Candidate Access Block
  if (user && !isRecruiter) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Access Denied</h3>
        <p className="text-slate-550 text-sm">
          Only recruiters can access the job management dashboard.
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
          Please log in with a recruiter account to view your posted jobs.
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

  return (
    <div className="space-y-8 py-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            My Job Postings
            {!loading && jobs.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {jobs.length}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage vacancies you have published and view applicant details.
          </p>
        </div>
        {!loading && jobs.length > 0 && (
          <Link
            to="/jobs/post"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Post New Job
          </Link>
        )}
      </div>

      {/* States Handler */}
      {loading ? (
        // Grid Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <JobRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        // Error State Card
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">
            Unable to load job postings
          </h4>
          <p className="text-slate-650 text-sm">{error}</p>
          <button
            onClick={fetchMyJobs}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        // Empty State Card
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
            <FolderOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">
              No Job Postings Yet
            </h4>
            <p className="text-slate-500 text-sm">
              You haven't published any job vacancies under this account.
            </p>
          </div>
          <Link
            to="/jobs/post"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-655 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Publish Your First Job
          </Link>
        </div>
      ) : (
        // Active Recruiter Job Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200/85 hover:border-blue-500/30 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-blue-600 capitalize tracking-wide">
                      {job.position || "Position Open"}
                    </span>
                    <h4 className="text-lg font-bold text-slate-950 hover:text-blue-650 transition-colors line-clamp-1">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1">
                      {job.company?.name || "Independent Posting"}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-650 font-bold rounded-lg flex items-center justify-center shrink-0 uppercase text-xs">
                    {job.company?.name ? job.company.name.slice(0, 2) : "JP"}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {job.jobType || "Full-time"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    {job.experienceLevel || "Entry"} Level
                  </span>
                </div>
              </div>

              {/* Footer Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Details */}
                <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{job.location || "Remote / Anywhere"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Posted {formatDate(job.postedAt || job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <Link
                    to={`/jobs/${job._id}/applicants`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-750 hover:bg-blue-50/40 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Applicants &rarr;
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={deletingId ? "#" : `/jobs/${job._id}/edit`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-xs border border-slate-200 shadow-3xs transition-colors cursor-pointer ${
                        deletingId ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-555" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-semibold rounded-lg text-xs border border-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === job._id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyJobs;
