# Modern Job Portal

A full-stack, responsive web application designed for job seekers and recruiters. Candidates can browse job listings, search and filter postings, submit applications, upload PDF resumes, and track their application progress. Recruiters can register company profiles, publish/manage job postings, track applicant listings, and review candidate profiles.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework/Library:** React 18 (Vite build tool)
*   **Routing:** React Router DOM v6
*   **Styling:** Tailwind CSS (Responsive utility-first styling)
*   **Icons:** Lucide React
*   **HTTP Client:** Axios (Pre-configured with credentials for session sharing)
*   **Notifications:** React Hot Toast

### Backend
*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT) stored in HTTP-Only cookies
*   **File Handling:** Multer (Local disk storage for uploads)

---

## 📂 Project Structure

```text
job-portal-project/
├── backend/
│   ├── src/
│   │   ├── config/           # Environment and configuration utilities
│   │   ├── controllers/      # Route controllers (user, job, company, application)
│   │   ├── db/               # MongoDB database connection setup
│   │   ├── middlewares/      # JWT authentication and authorization middlewares
│   │   ├── models/           # Mongoose schemas (User, Job, Company, Application)
│   │   ├── routes/           # Express endpoint router files
│   │   ├── utils/            # Helper token generators
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Entry server file
│   └── uploads/              # Local server directory for uploaded candidate files
└── frontend/
    ├── src/
    │   ├── assets/           # Static asset configurations
    │   ├── components/       # Common UI files (Navbar, Footer, Skeleton)
    │   ├── context/          # AuthContext provider (manages session state)
    │   ├── layouts/          # MainLayout view wrapper
    │   ├── pages/            # View pages (Home, Jobs, JobDetails, Profile, etc.)
    │   ├── utils/            # API client configurations (Axios)
    │   ├── App.jsx           # Router setup and page routing mapping
    │   └── main.jsx          # Frontend entry point
```

---

## 🗄️ Database Models

1.  **User Model:** Holds registration details (`fullname`, `email`, `password`, `phoneNumber`, `role`) and a nested `profile` subdocument storing `bio`, `skills` (string array), local `resume` URL, `resumeOriginalName`, and local `profilePhoto` URL.
2.  **Company Model:** Stores registered profiles containing `name`, `description`, `website`, `location`, `logo` path, and a reference to the creator recruiter.
3.  **Job Model:** Stores listings with details (`title`, `description`, `requirements` array, `salary` number, `location`, `jobType`, `experienceLevel`, `position` count) linked to a `company` and the recruiter who published it.
4.  **Application Model:** Maps candidate submissions referencing the target `job` and candidate `applicant`, current status (`pending`, `reviewed`, `accepted`, `rejected`), and timestamps. Implements a compound index `{ applicant: 1, job: 1 }` with a unique constraint to block duplicate applications.

---

## 🚀 Key Features

### Candidate Capabilities
*   **Jobs Board Catalog:** Filter and search open job listings by keyword, location, job type, and experience level.
*   **Decoupled Search Bar:** Controlled keyword and location search inputs with individual clear (×) controls and Enter-key submission support.
*   **Simple Apply Flow:** Candidates submit applications in one click, forwarding their profile resume. Double submissions are locked out.
*   **My Applications Tracker:** Displays candidate application status records (Pending, Reviewed, Accepted, Rejected) in desktop tables and mobile card layouts.
*   **Profile Manager Workspace:** Update contact info, skills lists, profile picture, and upload PDF resumes.
*   **Deleted Post Support:** Historical applications remain fully visible to candidates with fallback placeholders if the parent job is deleted.

### Recruiter Capabilities
*   **Company Registry:** Create and view registered company profiles.
*   **Jobs Management Console:** Publish, edit, and delete job postings, updating the database and local state.
*   **Applicants Board View:** Inspect candidates who applied to posted vacancies, including contact details, profile avatars, and PDF download links.
*   **Application Status Editor:** Update candidate application status (Pending, Reviewed, Accepted, Rejected) via select dropdowns that send updates directly to the database and update local state.

---

## 📋 API Endpoints

### User & Authentication Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/users/register` | Public | Register a new user |
| `POST` | `/api/v1/users/login` | Public | Log in user and set HttpOnly JWT cookie |
| `POST` | `/api/v1/users/logout` | Public | Log out user and clear JWT cookie |
| `GET` | `/api/v1/users/profile` | Private | Retrieve logged-in user profile details |
| `PUT` | `/api/v1/users/profile` | Private | Update user details (name, phone, bio, skills) |
| `POST` | `/api/v1/users/profile/photo` | Private | Upload/Replace candidate profile picture |
| `POST` | `/api/v1/users/profile/resume` | Private | Upload/Replace candidate PDF resume |

### Company Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/companies` | Recruiter | Register a company profile |
| `GET` | `/api/v1/companies/me` | Recruiter | Fetch companies owned by logged-in recruiter |

### Job Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/jobs` | Recruiter | Publish a new job opening |
| `GET` | `/api/v1/jobs` | Public | Fetch all jobs (supports query filters) |
| `GET` | `/api/v1/jobs/me` | Recruiter | Fetch jobs published by logged-in recruiter |
| `GET` | `/api/v1/jobs/:id` | Public | Fetch detailed info for a single job |
| `PUT` | `/api/v1/jobs/:id` | Recruiter | Update details of a published job |
| `DELETE` | `/api/v1/jobs/:id` | Recruiter | Delete a published job posting |

### Application Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/applications/:jobId` | Candidate | Submit job application |
| `GET` | `/api/v1/applications/me` | Candidate | Retrieve candidate's applications list |
| `GET` | `/api/v1/applications/job/:jobId` | Recruiter | Fetch all applicants for specific job posting |
| `PUT` | `/api/v1/applications/:applicationId/status` | Recruiter | Update application status |

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v16.x or higher)
*   MongoDB Atlas cluster

### 1. Repository Installation
```bash
git clone https://github.com/arinwalwaikar/job-portal-project.git
cd job-portal-project
```

### 2. Backend Setup
Navigate to the `backend` folder and create a `.env` file containing:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database
JWT_SECRET=your_jwt_signing_secret_here
NODE_ENV=development
```
Install dependencies and run the server:
```bash
cd backend
npm install
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 3. Frontend Setup
Navigate to the `frontend` folder, install dependencies, and run the developer server:
```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard opens at `http://localhost:5173`.

---

## 🔮 Future Improvements
*   **Real-time Notifications:** Integrate WebSockets (Socket.io) to deliver live notifications to candidates when their application status is updated.
*   **Automated Email alerts:** Integrate Nodemailer or SendGrid to dispatch automated email updates for successful submissions or status reviews.
*   **Smart Recommendation Engine:** Develop a content-based recommendation filter using candidate profiles and skills tags to match open positions automatically.
*   **Cloud Media Hosting:** Transition file uploads from local server disk storage to a cloud object storage service (like AWS S3 or Cloudinary) for enhanced scalability and backup recovery.

---

## 👤 Author
*   **Arin Walwaikar**
    *   GitHub: [arinwalwaikar](https://github.com/arinwalwaikar)
