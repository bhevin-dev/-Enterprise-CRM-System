Enterprise-CRM-System
Apex CRM - Enterprise Customer Relationship Management System

Apex CRM is a complete customer relationship management dashboard featuring lead tracking, activity logs, real-time funnel pipelines, sales representative league tables, and Role-Based Access Control (RBAC).

Built on the MERN (MongoDB, Express, React, Node.js)** stack, this codebase is structured to be easily packaged and pushed to a GitHub repository.

---

Key Features

1. Role-Based Access Control (RBAC)**:
   - Admin: Full access. Can create users, delete users, and change user roles. Sees all lead pipelines and dashboard metrics.
   - Manager: Scopes all pipeline leads, changes assignments of leads to sales reps, logs communication activities, and views team dashboard analytics.
   - Sales Representative**: Scopes and edits *only* their assigned leads. Logs calls, emails, meetings, and updates deal values/stages. Restricted from administrative panels.

2. Sales Pipeline Kanban Board:
   - Organized columns by stages: *New*, *Contacted*, *Proposal*, *Negotiation*, *Won*, and *Lost*.
   - Direct click-to-move stage controls on lead cards.
   - Dynamic real-time stage valuation aggregates.
   - Click cards to inspect full profiles, log calls/notes, or review history.

3. Dashboard Analytics & SVG Visualizations**:
   - Revenue indicators: *Active Pipeline Value*, *Closed Won Value*, *Active Deals count*, and *Win Conversion Rate*.
   - Interactive, zero-dependency SVG deal stages funnel.
   - Sales representative league tables sorting teams by closed-won revenue performance.
   - Streamed activity feed displaying chronological updates across all scoped pipeline events.

4. Interaction & Email Activity Logger**:
   - Custom logs for Calls, Emails, Meetings, and Notes.
   - Chronological communication timeline embedded inside each lead profile.

---

 Repository Structure

```
enterprise-crm/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Database Connector
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT verification
│   │   └── roleMiddleware.js # RBAC filter
│   ├── models/
│   │   ├── User.js          # User schema & pre-save bcrypt hash
│   │   └── Lead.js          # Lead & embedded Activities schemas
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leadRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env                 # Local configuration variables
│   ├── .env.example         # Example configuration variables
│   ├── server.js            # Node/Express main application entry point
│   ├── test-db.js           # Local DB connection & schema validator
│   └── package.json         # Backend dependencies list
│
└── frontend/
    ├── index.html           # Main HTML entry loading fonts (Inter & Outfit)
    ├── vite.config.js       # Vite proxy configure
    ├── package.json         # Frontend dependencies list
    └── src/
        ├── App.jsx          # React page router mappings
        ├── index.css        # Global CSS variables & custom dark design system
        ├── main.jsx         # React application bootstrap
        ├── context/
        │   └── AuthContext.jsx # Session contexts & API call helpers
        ├── components/
        │   ├── Auth/
        │   │   ├── ProtectedRoute.jsx
        │   │   └── RoleRoute.jsx
        │   ├── Common/
        │   │   ├── Navbar.jsx
        │   │   └── Sidebar.jsx
        │   └── Leads/
        │       ├── NewLeadModal.jsx
        │       └── LeadDetailsModal.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Leads.jsx
            └── AdminSettings.jsx
```

---

 Getting Started & Local Setup

 Prerequisites
- Node.js** (v18.0.0 or higher recommended)
- MongoDB** running locally (`mongodb://localhost:27017`) or a remote MongoDB Atlas URI.

 1. Set Up the Backend Server
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Configure your environment variables:
Create a `.env` file (one has been automatically pre-configured for your local database):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/enterprise-crm
JWT_SECRET=your_super_secret_jwt_token_key
NODE_ENV=development
```

Run database & schema validator tests:
```bash
node test-db.js
```
*If connection succeeds, you will see a detailed green log validating the DB pipeline and CRUD hooks.*

Start the backend API server:
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

 2. Set Up the Frontend Client
Navigate to the `frontend/` directory in a new terminal window:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend will boot on `http://localhost:3000` (auto-proxied to communicate with the backend server).

---

 Default Testing Profiles

Upon loading the application for the first time, click the  Quick Testing Accounts banner on the Login screen to automatically populate login fields, or register fresh accounts.

1. Admin account**:
   - Email: `admin@crm.com`
   - Password: `admin123`
2. Sales Manager account**:
   - Email: `manager@crm.com`
   - Password: `manager123`
3. Sales Representative account**:
   - Email: `rep1@crm.com`
   - Password: `rep1234`

---


