import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import JobDetails from './pages/JobDetails.jsx';
import PostJob from './pages/PostJob.jsx';
import CreateCompany from './pages/CreateCompany.jsx';
import MyJobs from './pages/MyJobs.jsx';
import Jobs from './pages/Jobs.jsx';
import JobApplicants from './pages/JobApplicants.jsx';
import MyApplications from './pages/MyApplications.jsx';
import Profile from './pages/Profile.jsx';
import EditJob from './pages/EditJob.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications handler */}
        <Toaster position="top-right" reverseOrder={false} />
        
        <Routes>
          {/* MainLayout acts as a wrapper for these routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Renders Home component at path "/" */}
            <Route index element={<Home />} />
            
            {/* Renders Login component at path "/login" */}
            <Route path="login" element={<Login />} />
            
            {/* Renders Register component at path "/register" */}
            <Route path="register" element={<Register />} />

            {/* Renders Jobs component at path "/jobs" */}
            <Route path="jobs" element={<Jobs />} />

            {/* Renders JobDetails component at path "/jobs/:id" */}
            <Route path="jobs/:id" element={<JobDetails />} />

            {/* Renders PostJob component at path "/jobs/post" */}
            <Route path="jobs/post" element={<PostJob />} />

            {/* Renders CreateCompany component at path "/companies/create" */}
            <Route path="companies/create" element={<CreateCompany />} />

            {/* Renders MyJobs component at path "/jobs/me" */}
            <Route path="jobs/me" element={<MyJobs />} />

            {/* Renders JobApplicants component at path "/jobs/:jobId/applicants" */}
            <Route path="jobs/:jobId/applicants" element={<JobApplicants />} />

            {/* Renders MyApplications component at path "/applications" */}
            <Route path="applications" element={<MyApplications />} />

            {/* Renders Profile component at path "/profile" */}
            <Route path="profile" element={<Profile />} />

            {/* Renders EditJob component at path "/jobs/:id/edit" */}
            <Route path="jobs/:id/edit" element={<EditJob />} />
            
            {/* Catch-all route for paths that do not match above */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
