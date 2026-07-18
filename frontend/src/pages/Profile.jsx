import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Loader2,
  Download,
  AlertCircle,
  Camera,
} from "lucide-react";

function Profile() {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  // File Inputs Refs
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Form Fields State
  const [detailsForm, setDetailsForm] = useState({
    fullname: "",
    phoneNumber: "",
    bio: "",
    skills: "",
  });

  // UI Loaders
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Sync Form State with Global User state
  useEffect(() => {
    if (user) {
      setDetailsForm({
        fullname: user.fullname || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills ? user.profile.skills.join(", ") : "",
      });
    }
  }, [user]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetailsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 1. Submit Profile Details updates
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setDetailsLoading(true);

    if (!detailsForm.fullname.trim()) {
      toast.error("Full Name is required.");
      setDetailsLoading(false);
      return;
    }

    if (!detailsForm.phoneNumber.trim()) {
      toast.error("Phone Number is required.");
      setDetailsLoading(false);
      return;
    }

    try {
      const skillsArray = detailsForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const response = await api.put("/users/profile", {
        fullname: detailsForm.fullname.trim(),
        phoneNumber: detailsForm.phoneNumber.trim(),
        bio: detailsForm.bio.trim(),
        skills: skillsArray,
      });

      if (response.data?.success) {
        toast.success("Profile details updated successfully!");
        await fetchCurrentUser(); // Refresh global auth state
      }
    } catch (err) {
      console.error("Error updating details:", err);
      toast.error(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // 2. Upload/Replace Profile Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid image format. Please select a JPG, PNG or WebP file.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setPhotoLoading(true);
    try {
      const response = await api.post("/users/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        toast.success("Profile picture updated!");
        await fetchCurrentUser(); // Refresh global auth state
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // 3. Upload/Replace PDF Resume (Candidates Only)
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.type !== "application/pdf") {
      toast.error("Invalid file format. Only PDF resumes are accepted.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setResumeLoading(true);
    try {
      const response = await api.post("/users/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        toast.success("Resume updated successfully!");
        await fetchCurrentUser(); // Refresh global auth state
      }
    } catch (err) {
      console.error("Error uploading resume:", err);
      toast.error(err.response?.data?.message || "Failed to upload resume document.");
    } finally {
      setResumeLoading(false);
    }
  };

  // Guest Redirect Block
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full border border-red-150">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sign In Required</h3>
        <p className="text-slate-500 text-sm">
          Please log in to view and manage your profile details.
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

  const isCandidate = user.role === "candidate";

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-955 tracking-tight flex items-center gap-2">
          <User className="h-8 w-8 text-blue-600" />
          My Profile Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Keep your contact information, credentials, and resume documents up to date.
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Media Upload Panels */}
        <div className="space-y-8">
          
          {/* Profile Photo Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs text-center space-y-6">
            <div className="relative inline-block mx-auto">
              {/* Photo Display */}
              {user.profile?.profilePhoto ? (
                <img
                  src={`http://localhost:5000${user.profile.profilePhoto}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-700 mx-auto uppercase">
                  {user.fullname.slice(0, 2)}
                </div>
              )}

              {/* Upload trigger overlay button */}
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoLoading}
                className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all cursor-pointer disabled:bg-blue-400"
                title="Change Photo"
              >
                {photoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{user.fullname}</h3>
              <p className="text-xs text-slate-400 capitalize font-semibold tracking-wide">
                Role: {user.role}
              </p>
            </div>
          </div>

          {/* Resume Upload Card (Candidates Only) */}
          {isCandidate && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <FileText className="h-4.5 w-4.5 text-slate-450" />
                Resume Attachment
              </h3>

              {user.profile?.resume ? (
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <span className="block text-2xs font-semibold text-slate-400">CURRENT RESUME</span>
                    <span className="block text-xs font-bold text-blue-900 truncate">
                      {user.profile?.resumeOriginalName || "Resume.pdf"}
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5000${user.profile.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                    title="Download Current PDF"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-250 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">No resume document uploaded yet.</p>
                </div>
              )}

              {/* Upload trigger button */}
              <div>
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {resumeLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading Resume...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {user.profile?.resume ? "Replace Resume (PDF)" : "Upload Resume (PDF)"}
                    </>
                  )}
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Profile details Update Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleUpdateDetails}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
          >
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Account Information
            </h3>

            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullname" className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    required
                    disabled={detailsLoading}
                    value={detailsForm.fullname}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address (Read-only) */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email Address <span className="text-xs text-slate-400 font-normal">(Read-only)</span>
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      disabled
                      value={user.email}
                      className="pl-10 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-550 bg-slate-50 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      disabled={detailsLoading}
                      value={detailsForm.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98765 43210"
                      className="pl-10 block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Comma Separated (Candidate Only) */}
              {isCandidate && (
                <div className="space-y-1">
                  <label htmlFor="skills" className="block text-sm font-semibold text-slate-700">
                    Key Skills <span className="text-xs text-slate-400 font-normal">(separated by commas)</span>
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    disabled={detailsLoading}
                    value={detailsForm.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, Express, MongoDB"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              )}

              {/* Bio */}
              <div className="space-y-1">
                <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">
                  Bio / Summary
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  disabled={detailsLoading}
                  value={detailsForm.bio}
                  onChange={handleInputChange}
                  placeholder="Give a short overview about your work profile, experience, and interests..."
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-slate-50"
                ></textarea>
              </div>
            </div>

            {/* Form Footer Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={detailsLoading}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400"
              >
                {detailsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Details...
                  </>
                ) : (
                  "Update Info"
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;
