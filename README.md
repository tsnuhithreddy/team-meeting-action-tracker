# Team Meeting & Action Tracker

A full-stack team collaboration app for scheduling meetings, assigning action items, and tracking follow-through. Built with a 3-tier architecture, MySQL, role-based access control, and an automated test suite running in GitHub Actions CI.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Secure multi-tier permissions for **ADMIN**, **MANAGER**, and **EMPLOYEE** roles.
- **Meeting Management**: Schedule meetings with temporal consistency validation (`end_time > start_time`), dynamic participant rosters, and agenda tracking.
- **Task & Action Item State Engine**: Enforce strict lifecycle transitions (`OPEN` → `IN_PROGRESS` → `BLOCKED` / `COMPLETED`), assignment constraints, and priority tracking.
- **Dynamic Overdue Calculations**: Automatic identification and visual highlighting of overdue deliverables.
- **Auditing & Activity Trail**: Immutable activity logs tracking system actions and state transitions.
- **Executive Analytics Dashboard**: Instant metrics on task progress, team bottlenecks, and overdue items.
- **Centralized Error Handling**: Standardized JSON responses with operational error classification.
- **Automated CI/CD**: Continuous Integration pipeline using GitHub Actions validating test suites and build integrity.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES6+), Modern CSS3 (Variables & Modules) |
| **Backend** | Node.js (LTS), Express.js |
| **Database** | MySQL 8.0+ (InnoDB, Parameterized Queries via `mysql2/promise`) |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` (Cost factor 10) |
| **Validation** | `express-validator` |
| **Testing** | Jest, Supertest |
| **API Docs** | Swagger / OpenAPI (`swagger-ui-express`) |
| **CI/CD** | GitHub Actions |

---

## 📂 Project Architecture

```
Team Meeting And Action Tracker/
├── .github/workflows/ci.yml       # GitHub Actions CI pipeline
├── backend/                       # Express.js REST API
│   ├── src/
│   │   ├── config/                # Database pool & Swagger configuration
│   │   ├── controllers/           # HTTP Request/Response handlers
│   │   ├── middleware/            # Auth, RBAC, Validation & Centralized Error Handler
│   │   ├── models/                # Parameterized SQL data access layer
│   │   ├── routes/                # REST API route endpoints
│   │   ├── services/              # Domain business rules & state machine
│   │   ├── utils/                 # AppError, Logger & Async utilities
│   │   ├── validators/            # Request body & query validation schemas
│   │   ├── app.js                 # Express app configuration
│   │   └── server.js              # Server entry point
│   ├── database/                  # SQL Schema (DDL) and Seeds
│   └── tests/                     # Jest + Supertest test suites
├── frontend/                      # React SPA (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI components (Navbar, Sidebar)
│   │   ├── context/                # AuthContext
│   │   ├── pages/                  # Full-page views
│   │   ├── services/               # Fetch-based API client
│   │   └── styles/                 # CSS3 design system & styling
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18+ LTS
- **MySQL**: 8.0+

### 2. Backend Setup
```powershell
cd backend
npm install
cp .env.example .env
# Configure your DB credentials in .env
npm run dev
```

### 3. Frontend Setup
```powershell
cd ../frontend
npm install
npm run dev
```

---

## 📜 License
This project is licensed under the MIT License.
