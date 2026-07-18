import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  AlertCircle,
  FileText,
  Tag,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function EditJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect check if guest or candidate
  const isRecruiter = user && user.role === "recruiter";

  // Form Field States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "", // comma-separated string
    salary: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "Entry",
    position: "",
    company: "",
  });

  // UI Loaders & States
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Fetch registered companies & selected job details
  const fetchEditJobData = async () => {
    setLoading(true);
    setFetchError("");
    try {
      // 1. Fetch Recruiter's companies
      const companiesResponse = await api.get("/companies/me");
      let loadedCompanies = [];
      if (companiesResponse.data?.success) {
        loadedCompanies = companiesResponse.data.companies || [];
        setCompanies(loadedCompanies);
      }

      // 2. Fetch Selected Job posting details
      const jobResponse = await api.get(`/jobs/${id}`);
      if (jobResponse.data?.success) {
        const job = jobResponse.data.job;

        // Verify Owner Recruiter check
        if (job.createdBy?._id !== user?._id && job.createdBy !== user?._id) {
          setFetchError("You are not authorized to edit this job posting.");
          return;
        }

        setFormData({
          title: job.title || "",
          description: job.description || "",
          requirements: job.requirements ? job.requirements.join(", ") : "",
          salary: job.salary || "",
          location: job.location || "",
          jobType: job.jobType || "Full-time",
          experienceLevel: job.experienceLevel || "Entry",
          position: job.position || "",
          company: job.company?._id || job.company || "",
        });
      }
    } catch (err) {
      console.error("Error loading edit job details:", err);
      setFetchError(
        err.response?.data?.message || "Failed to load job details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRecruiter && id) {
      fetchEditJobData();
    }
  }, [id, user]);

  // Handle Input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);

    // Basic Input Validations
    if (!formData.title.trim()) {
      setSubmitError("Job Title is a mandatory field.");
      setSubmitLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setSubmitError("Job Description is a mandatory field.");
      setSubmitLoading(false);
      return;
    }
    if (!formData.company) {
      setSubmitError("You must select a company to publish a job posting.");
      setSubmitLoading(false);
      return;
    }

    try {
      // Process comma-separated requirements into array
      const requirementsArray = formData.requirements
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req !== "");

      const response = await api.put(`/jobs/${id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: requirementsArray,
        salary: formData.salary ? Number(formData.salary) : undefined,
        location: formData.location.trim(),
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        position: formData.position.trim(),
        company: formData.company,
      });

      if (response.data?.success) {
        toast.success("Job posting updated successfully!");
        navigate("/jobs/me"); // Redirect to My Jobs list dashboard
      }
    } catch (err) {
      console.error("Error updating job posting:", err);
      setSubmitError(
        err.response?.data?.message || "Failed to update job posting. Please verify inputs."
      );
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
          Only recruiters can view, create or edit job listings.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
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
          Please log in with a recruiter account to update your job listings.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back to list dashboard */}
      <div>
        <Link
          to="/jobs/me"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Jobs
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-955 tracking-tight flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-blue-600" />
          Edit Job Posting
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Modify the coordinates, requirements or conditions of your job opening.
        </p>
      </div>

      {/* Main Container */}
      {loading ? (
        // Loading Spinner Layout
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Fetching job details from servers...</p>
        </div>
      ) : fetchError ? (
        // Fetch Error State Card
        <div className="bg-red-50 border border-red-200/85 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Failed to load details</h4>
          <p className="text-slate-650 text-sm">{fetchError}</p>
          <button
            onClick={fetchEditJobData}
            className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        /* Edit Job Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
        >
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-sm text-red-750 font-medium">
              {submitError}
            </div>
          )}

          {/* Form fields Grid */}
          <div className="space-y-6">
            
            {/* Job Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                disabled={submitLoading}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer (React)"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
              />
            </div>

            {/* Recruiter Company Selection */}
            <div className="space-y-1">
              <label htmlFor="company" className="block text-sm font-semibold text-slate-700">
                Associated Company <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4.5 w-4.5 text-slate-450" />
                </div>
                <select
                  id="company"
                  name="company"
                  required
                  disabled={submitLoading}
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer disabled:bg-slate-50"
                >
                  <option value="">Select registered company...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    disabled={submitLoading}
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, Karnataka (or Remote)"
                    className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Salary Amount */}
              <div className="space-y-1">
                <label htmlFor="salary" className="block text-sm font-semibold text-slate-700">
                  Annual CTC (Salary in ₹)
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4.5 w-4.5 text-slate-405" />
                  </div>
                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    disabled={submitLoading}
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 1200000"
                    className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Job Type (Full-time, Part-time, etc.) */}
              <div className="space-y-1">
                <label htmlFor="jobType" className="block text-sm font-semibold text-slate-700">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  disabled={submitLoading}
                  value={formData.jobType}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer disabled:bg-slate-50"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="space-y-1">
                <label htmlFor="experienceLevel" className="block text-sm font-semibold text-slate-700">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  disabled={submitLoading}
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer disabled:bg-slate-50"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead/Director">Lead / Director</option>
                </select>
              </div>

              {/* Number of Open Positions */}
              <div className="space-y-1">
                <label htmlFor="position" className="block text-sm font-semibold text-slate-700">
                  Open Positions
                </label>
                <input
                  id="position"
                  name="position"
                  type="number"
                  disabled={submitLoading}
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Key Requirements tags */}
            <div className="space-y-1">
              <label htmlFor="requirements" className="block text-sm font-semibold text-slate-700">
                Key Requirements <span className="text-xs text-slate-400 font-normal">(separated by commas)</span>
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="requirements"
                  name="requirements"
                  type="text"
                  disabled={submitLoading}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="e.g. ReactJS, Redux, Node.js, Javascript"
                  className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Job Description
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
                  disabled={submitLoading}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Review the job's roles, responsibilities, daily work, and employee benefits..."
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
              onClick={() => navigate("/jobs/me")}
              className="px-6 py-2.5 border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Updates"
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}

export default EditJob;
