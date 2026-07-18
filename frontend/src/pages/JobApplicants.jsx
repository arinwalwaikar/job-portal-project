import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Download,
  Calendar,
  Loader2,
} from "lucide-react";

function JobApplicants() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Access check
  const isRecruiter = user && user.role === "recruiter";

  // States
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch job metadata and applicant list
  const fetchApplicantsData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Job details (to render Job Title in header)
      const jobResponse = await api.get(`/jobs/${jobId}`);
      if (jobResponse.data?.success) {
        setJob(jobResponse.data.job);
      }

      // 2. Fetch Job Applications list
      const appResponse = await api.get(`/applications/job/${jobId}`);
      if (appResponse.data?.success) {
        setApplications(appResponse.data.applications || []);
      }
    } catch (err) {
      console.error("Error fetching applicants data:", err);
      setError(
        err.response?.data?.message || "Failed to load applicant records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRecruiter && jobId) {
      fetchApplicantsData();
    }
  }, [jobId, user]);

  // Date format utility
  const formatAppliedDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Status Badge styling helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-105 uppercase tracking-wider">
            Rejected
          </span>
        );
      case "reviewed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
            Reviewed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
            Pending
          </span>
        );
    }
  };

  // Update applicant status
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const response = await api.put(`/applications/${appId}/status`, {
        status: newStatus,
      });

      if (response.data?.success) {
        toast.success(response.data.message || "Status updated successfully!");
        // Optimistically update only the modified application in the local React state for premium UX
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update application status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Skeleton Loader mockup
  const RowSkeleton = () => (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse space-y-4 shadow-sm">
      <div className="flex justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-5 bg-slate-200 rounded-md"></div>
          <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
      <div className="pt-3 border-t border-slate-50 flex gap-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
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
        <p className="text-slate-500 text-sm">
          Only recruiters can access applicant listings.
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
          Please log in with a recruiter account to view job applicants.
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
      {/* Back Link */}
      <div>
        <Link
          to="/jobs/me"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-650 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Jobs
        </Link>
      </div>

      {/* Header Profile Title */}
      <div>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Applicants List
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex flex-wrap items-center gap-1.5">
              <span>Reviewing candidates for</span>
              <span className="font-bold text-slate-800 underline">
                {job?.title || "Active Job Posting"}
              </span>
              <span>at</span>
              <span className="font-semibold text-blue-600">
                {job?.company?.name || "Independent"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* States Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">Failed to load applicants</h4>
          <p className="text-slate-650 text-sm">{error}</p>
          <button
            onClick={fetchApplicantsData}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">No Applicants Yet</h4>
          <p className="text-slate-500 text-sm">
            No candidates have submitted applications for this job opening at this time.
          </p>
        </div>
      ) : (
        /* Candidates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            const candidate = app.applicant;
            const resumeUrl = candidate?.profile?.resume;
            const resumeName = candidate?.profile?.resumeOriginalName;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200/80 hover:border-blue-500/25 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                {/* Header Information */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      {candidate?.profile?.profilePhoto ? (
                        <img
                          src={`http://localhost:5000${candidate.profile.profilePhoto}`}
                          alt={candidate?.fullname || "Avatar"}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-3xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-100 uppercase shrink-0">
                          {candidate?.fullname ? candidate.fullname.slice(0, 2) : "CN"}
                        </div>
                      )}
                      
                      <div className="space-y-0.5">
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {candidate?.fullname || "Anonymous Candidate"}
                        </h4>
                        <p className="text-2xs text-slate-450 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Applied on {formatAppliedDate(app.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  {/* Core Details (Email & Phone) */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      {candidate?.email ? (
                        <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors">
                          {candidate.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No email provided</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <span>{candidate?.phoneNumber || "No phone number available"}</span>
                    </div>

                    {/* Status Select Controller */}
                    <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between gap-4 mt-2">
                      <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                      <div className="flex items-center gap-1.5">
                        {updatingId === app._id && (
                          <Loader2 className="h-3.5 w-3.5 text-blue-650 animate-spin" />
                        )}
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={updatingId === app._id}
                          className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume Download Box */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <FileText className="h-4.5 w-4.5 text-slate-400" />
                    <span>Candidate Resume</span>
                  </div>
                  {resumeUrl ? (
                    <a
                      href={`http://localhost:5000${resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      title={resumeName || "Download Resume"}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{resumeName ? (resumeName.length > 15 ? resumeName.slice(0, 15) + "..." : resumeName) : "Download PDF"}</span>
                    </a>
                  ) : (
                    <span className="text-2xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                      Not uploaded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobApplicants;
