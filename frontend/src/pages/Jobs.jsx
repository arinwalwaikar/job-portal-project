import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";
import {
  Search,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  AlertCircle,
  Tag,
  Building,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  X,
} from "lucide-react";

function Jobs() {
  // Controlled Search Inputs (local state before submit)
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    location: "",
  });

  // Active Query Filters (submitting these triggers database fetch)
  const [activeFilters, setActiveFilters] = useState({
    keyword: "",
    location: "",
    jobType: "",
    experienceLevel: "",
  });

  // Async States
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch job listings from standard backend API
  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeFilters.keyword.trim()) params.keyword = activeFilters.keyword.trim();
      if (activeFilters.location.trim()) params.location = activeFilters.location.trim();
      if (activeFilters.jobType) params.jobType = activeFilters.jobType;
      if (activeFilters.experienceLevel) params.experienceLevel = activeFilters.experienceLevel;

      const response = await api.get("/jobs", { params });
      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (err) {
      console.error("Error loading job postings:", err);
      setError(
        err.response?.data?.message || "Failed to fetch job postings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch jobs whenever query parameters update
  useEffect(() => {
    fetchJobs();
  }, [activeFilters]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilters((prev) => ({
      ...prev,
      keyword: searchParams.keyword,
      location: searchParams.location,
    }));
  };

  // Handle sidebar checkbox/radio filter changes
  const handleFilterChange = (name, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [name]: prev[name] === value ? "" : value, // Toggle filters
    }));
  };

  // Clear single search input field and trigger re-fetch
  const handleClearField = (field) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: "",
    }));
    setActiveFilters((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // Clear all search queries and active filters
  const handleClearFilters = () => {
    setSearchParams({ keyword: "", location: "" });
    setActiveFilters({
      keyword: "",
      location: "",
      jobType: "",
      experienceLevel: "",
    });
  };

  // Indian Rupee salary formatter
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "Not specified";
    return `₹${Number(salary).toLocaleString("en-IN")}`;
  };

  // Relative / Absolute Date parser
  const formatPostedDate = (dateString) => {
    if (!dateString) return "";
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return posted.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // High fidelity shimmer skeleton loader
  const CardSkeleton = () => (
    <div className="bg-white border border-slate-200/60 p-6 rounded-3xl animate-pulse space-y-5 shadow-3xs">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
        <div className="space-y-2 w-full pt-1">
          <div className="h-4.5 bg-slate-200 rounded-md w-2/3"></div>
          <div className="h-3.5 bg-slate-200 rounded-md w-1/3"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-slate-100/50">
        <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded-md w-3/4"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      
      {/* Search Header Banner */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keyword Search */}
          <div className="relative rounded-2xl shadow-2xs w-full flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
              placeholder="React, Node.js, Frontend Developer..."
              className="pl-11 pr-10 block w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            />
            {searchParams.keyword && (
              <button
                type="button"
                onClick={() => handleClearField("keyword")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear keyword"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Location Search */}
          <div className="relative rounded-2xl shadow-2xs w-full flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchParams.location}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Mumbai, Bangalore, Remote..."
              className="pl-11 pr-10 block w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            />
            {searchParams.location && (
              <button
                type="button"
                onClick={() => handleClearField("location")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear location"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="h-4.5 w-4.5" />
          Find Jobs
        </button>
      </form>

      {/* Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-6 self-start lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-slate-500" />
              Filter Results
            </h2>
            {(activeFilters.keyword ||
              activeFilters.location ||
              activeFilters.jobType ||
              activeFilters.experienceLevel) && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Job Type Radio Filters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Type</h3>
            <div className="space-y-2">
              {["Full-time", "Part-time", "Internship", "Contract"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 text-sm text-slate-600 font-medium cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.jobType === type}
                    onChange={() => handleFilterChange("jobType", type)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience level Radio Filters */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience Level</h3>
            <div className="space-y-2">
              {[
                { label: "Entry Level", value: "Entry" },
                { label: "Mid Level", value: "Mid" },
                { label: "Senior Level", value: "Senior" },
                { label: "Lead / Director", value: "Lead/Director" },
              ].map((lvl) => (
                <label
                  key={lvl.value}
                  className="flex items-center gap-2.5 text-sm text-slate-600 font-medium cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.experienceLevel === lvl.value}
                    onChange={() => handleFilterChange("experienceLevel", lvl.value)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Content catalog Column */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            /* Loading Shimmer State */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            /* Error State card */
            <div className="bg-red-50 border border-red-200/80 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto">
              <div className="inline-flex p-3 bg-red-100 text-red-650 rounded-full">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Failed to load listings</h4>
              <p className="text-slate-600 text-sm">{error}</p>
              <button
                onClick={fetchJobs}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State Card */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 shadow-2xs">
              <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">No Job Postings Found</h4>
                <p className="text-slate-500 text-sm">
                  We couldn't find any job openings matching your search keywords or filter criteria.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Jobs list grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-slate-200/80 hover:border-blue-500/25 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between space-y-5"
                >
                  {/* Top info and company logo */}
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      {/* Logo fallback */}
                      {job.company?.logo ? (
                        <img
                          src={`http://localhost:5000${job.company.logo}`}
                          alt={job.company.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-3xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold text-lg flex items-center justify-center border border-blue-100 uppercase shrink-0">
                          {job.company?.name ? job.company.name.slice(0, 2) : "JB"}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.company?.name || "Independent"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {job.jobType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {job.experienceLevel} Level
                      </span>
                    </div>

                    {/* Requirements Tags */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-3xs font-semibold tracking-wide uppercase"
                          >
                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="text-3xs font-bold text-slate-400 pt-0.5 pl-0.5">
                            +{job.requirements.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer section (CTC, Location, Details Link) */}
                  <div className="pt-4 border-t border-slate-100/60 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      {/* Location & Salary Info */}
                      <div className="flex items-center gap-3 text-2xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-0.5 font-bold text-slate-900">
                          <IndianRupee className="h-3 w-3 text-slate-400" />
                          {formatSalary(job.salary)}
                        </span>
                      </div>
                      {/* Posted Timestamp */}
                      <p className="text-3xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Posted {formatPostedDate(job.postedAt || job.createdAt)}</span>
                      </p>
                    </div>

                    {/* Navigation Link */}
                    <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-3xs transition-all cursor-pointer hover:gap-1.5"
                    >
                      <span>Apply</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Jobs;
