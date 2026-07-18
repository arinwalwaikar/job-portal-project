import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Briefcase, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // useState holds the open/closed state of the mobile menu
  const [isOpen, setIsOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Toggle function for mobile hamburger menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("An error occurred during logout.");
    } finally {
      setLogoutLoading(false);
      setIsOpen(false);
    }
  };

  // Dynamic Navigation Links based on authentication status and user role
  const visibleLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
  ];

  if (!user) {
    visibleLinks.push({ name: "Login", path: "/login" });
    visibleLinks.push({ name: "Register", path: "/register" });
  } else {
    if (user.role === "recruiter") {
      visibleLinks.push({ name: "My Jobs", path: "/jobs/me" });
      visibleLinks.push({ name: "Post Job", path: "/jobs/post" });
      visibleLinks.push({ name: "Create Company", path: "/companies/create" });
    } else if (user.role === "candidate") {
      visibleLinks.push({ name: "My Applications", path: "/applications" });
    }
    visibleLinks.push({ name: "Profile", path: "/profile" });
  }

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-blue-600 font-bold text-xl"
            >
              <Briefcase className="h-6 w-6" />
              <span>JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Desktop User Badge */}
            {user && (
              <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-700 font-medium">
                    Hi, <span className="text-blue-600 font-semibold">{user.fullname}</span>
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize shadow-3xs">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-205 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  title="Sign Out"
                >
                  {logoutLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-600 hover:text-blue-600 p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown menu for mobile screens */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile User Profile info */}
            {user && (
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-800">{user.fullname}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            )}
            {visibleLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)} // Close the menu when link is clicked
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-md text-base font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {logoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
