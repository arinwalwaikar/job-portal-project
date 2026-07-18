import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  AlertCircle,
  FileText,
  Building,
} from "lucide-react";

function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Access check
  const isCandidate = user && user.role === "candidate";

  // States
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch only the logged-in candidate's applications
  const fetchMyApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/applications/me");
      if (response.data?.success) {
        setApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error("Error loading candidate applications:", err);
      setError(
        err.response?.data?.message || "Failed to load your applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCandidate) {
      fetchMyApplications();
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

  // Status badge styling helper
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

  // Loading skeleton rows layout
  const TableRowSkeleton = () => (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-6 py-4 space-y-2">
        <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-md w-24"></div>
      </td>
    </tr>
  );

  // 1. Guest Access Block
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full border border-red-150">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sign In Required</h3>
        <p className="text-slate-500 text-sm">
          Please log in with a candidate account to view your applications list.
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

  // 2. Recruiter Access Block
  if (user && !isCandidate) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Access Denied</h3>
        <p className="text-slate-500 text-sm">
          Recruiters cannot submit or view candidate applications on this dashboard.
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

  return (
    <div className="space-y-8 py-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-955 tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          My Applications
          {!loading && applications.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {applications.length}
            </span>
          )}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track the recruitment progress and review states of jobs you have applied to.
        </p>
      </div>

      {/* Main Container */}
      {loading ? (
        // Loading Layout
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/70 text-slate-500 text-2xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Job details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Est. Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {[...Array(5)].map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        // Error State Card
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">Failed to load applications</h4>
          <p className="text-slate-650 text-sm">{error}</p>
          <button
            onClick={fetchMyApplications}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        // Empty State Card
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
            <Briefcase className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">No Applications Submitted</h4>
            <p className="text-slate-500 text-sm">
              You haven't submitted any job applications yet.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-655 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Browse Open Jobs
          </Link>
        </div>
      ) : (
        // Applications Desktop Table
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hidden md:block">
          <table className="min-w-full divide-y divide-slate-200/80">
            <thead className="bg-slate-50 text-slate-500 text-2xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Job Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Est. Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-55/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      {app.job ? (
                        <>
                          <h4 className="text-sm font-bold text-slate-950 hover:text-blue-650 transition-colors">
                            <Link to={`/jobs/${app.job._id}`}>{app.job.title}</Link>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            {app.job.company?.name || "Independent Posting"}
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="text-sm font-bold text-red-600">
                            Job Deleted
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">
                            This job posting has been removed by the recruiter.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-650 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{app.job ? (app.job.location || "Remote") : "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-950 font-bold">
                    <div className="flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                      <span>{app.job ? formatSalary(app.job.salary) : "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(app.createdAt)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applications Mobile List Stack */}
      {!loading && !error && applications.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  {app.job ? (
                    <>
                      <h4 className="text-sm font-bold text-slate-955 hover:text-blue-650 transition-colors">
                        <Link to={`/jobs/${app.job._id}`}>{app.job.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-550 font-medium">
                        {app.job.company?.name || "Independent Posting"}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-red-600">
                        Job Deleted
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        This job posting has been removed by the recruiter.
                      </p>
                    </>
                  )}
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-2xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="space-y-0.5">
                  <span className="block font-semibold text-slate-400">LOCATION</span>
                  <span className="text-slate-700 font-medium">{app.job ? (app.job.location || "Remote") : "N/A"}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block font-semibold text-slate-400">SALARY</span>
                  <span className="text-slate-805 font-bold">{app.job ? formatSalary(app.job.salary) : "N/A"}</span>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <span className="block font-semibold text-slate-400">APPLIED ON</span>
                  <span className="text-slate-700 font-medium">{formatDate(app.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications;
