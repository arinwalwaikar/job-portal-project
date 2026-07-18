import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  Layers,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

function Home() {
  const { user, loading: authLoading } = useAuth();
  
  // Jobs List States
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch job postings from the backend API
  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/jobs");
      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(
        err.response?.data?.message || "Failed to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch jobs if the user is authenticated.
    // The GET /api/v1/jobs endpoint has protect middleware that returns 401 for guests.
    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Utility to format relative date posted
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Helper to format salary display
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "Not specified";
    return `₹${Number(salary).toLocaleString('en-IN')}`;
  };

  // Loading Skeleton Component for premium UX
  const JobCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-full">
          <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-slate-200 rounded-md w-full"></div>
        <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
      </div>
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex gap-1.5">
          <div className="h-5 bg-slate-200 rounded-md w-12"></div>
          <div className="h-5 bg-slate-200 rounded-md w-16"></div>
          <div className="h-5 bg-slate-200 rounded-md w-14"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/5"></div>
        </div>
      </div>
    </div>
  );

  // Render spinner when initial auth state is loading
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Guest (Not Logged In) Landing View
  if (!user) {
    return (
      <div className="space-y-16 py-8">
        <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl shadow-xl px-8 py-16 md:p-20">
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/50 to-slate-950/90 pointer-events-none"></div>
          <div className="relative max-w-3xl mx-auto text-center space-y-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              Empowering Careers Worldwide
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dream Job</span> Today
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
              Connect with top-tier companies offering positions tailored to your expertise. Log in or create an account to discover verified job listings and kickstart your application.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to Explore
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center justify-center cursor-pointer"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Member's Dashboard & Job Listing
  return (
    <div className="space-y-10 py-6">
      {/* Dynamic Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, <span className="text-blue-600">{user.fullname}</span>!
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Browse through our freshly curated list of opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Role:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-100">
            {user.role}
          </span>
        </div>
      </div>

      {/* Main Content Title */}
      <div>
        <h3 className="text-2xl font-bold text-slate-955 tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          Latest Job Openings
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          Explore roles matching your skills and experience level.
        </p>
      </div>

      {/* States Handler */}
      {loading ? (
        // Grid Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        // Error State Card
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">Unable to load jobs</h4>
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            onClick={fetchJobs}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry Fetching
          </button>
        </div>
      ) : jobs.length === 0 ? (
        // Empty State Card
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
            <Layers className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">No Jobs Available</h4>
          <p className="text-slate-500 text-sm">
            There are no jobs posted at this time. Check back later or post a new job if you are a recruiter!
          </p>
        </div>
      ) : (
        // Active Job Cards Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200/85 hover:border-blue-500/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              {/* Job Card Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-blue-600 capitalize tracking-wide">
                      {job.position || "Position Available"}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h4>
                    <p className="text-sm text-slate-505 font-medium line-clamp-1">
                      {job.company?.name || "Independent Poster"}
                    </p>
                  </div>
                  {/* Company Logo initials fallback */}
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center shrink-0 uppercase text-sm">
                    {job.company?.name ? job.company.name.slice(0, 2) : "JP"}
                  </div>
                </div>

                {/* Badges Info */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {job.jobType || "Full-time"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                    {job.experienceLevel || "Entry"} Level
                  </span>
                </div>

                {/* Job Description snippet */}
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Requirements & Footer Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Requirements tags */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize"
                      >
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500">
                        +{job.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Info Fields & Salary Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{job.location || "Remote / Anywhere"}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                </div>

                {/* Posted date & View Details link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-2xs">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    <span>{getRelativeTime(job.postedAt || job.createdAt)}</span>
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-750 transition-colors cursor-pointer"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
