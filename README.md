# Team Meeting & Action Tracker

A full-stack team collaboration application that turns meeting discussions into trackable action items. It helps teams schedule meetings, assign responsibilities, monitor task progress, and maintain an audit trail of important activities.

Built using React, Node.js, Express.js, and MySQL, with JWT authentication, role-based access control, automated backend testing, GitHub Actions CI, and Docker-based deployment on AWS EC2.

**Live Demo:** http://13.207.117.100

**Repository:** https://github.com/tsnuhithreddy/team-meeting-action-tracker

---

## Key Features

- **Role-Based Access Control (RBAC):** Three roles — ADMIN, MANAGER, and EMPLOYEE — with different permissions enforced on the server.
- **Authentication:** JWT-based authentication with bcrypt password hashing and active-user verification.
- **Meeting Management:** Create, view, edit, and delete meetings with date, time, location, and participant details.
- **Task Management:** Create and assign action items with priorities, due dates, and status tracking.
- **Task Board:** Four-column task board covering Open, In Progress, Blocked, and Completed.
- **My Tasks:** Employees can view and update tasks assigned to them.
- **Task Comments:** Add comments to tasks with access restrictions.
- **Overdue Tracking:** Calculate overdue tasks dynamically using SQL.
- **Dashboard Analytics:** Display task counts, progress, upcoming meetings, overdue work, critical tasks, and recent activity.
- **Activity Logging:** Maintain an audit trail of important actions and state changes.
- **User Management:** Admins can create and deactivate user accounts.
- **Immediate Token Revocation:** Deactivated users lose access on their next API request, even if they have an existing JWT.
- **API Documentation:** Interactive Swagger documentation available at `/api-docs`.
- **Centralized Error Handling:** Consistent JSON error responses with appropriate HTTP status codes.
- **Automated Testing:** Backend integration tests using Jest and Supertest, and frontend component tests using Vitest and React Testing Library.
- **Continuous Integration:** GitHub Actions validates backend tests and frontend build integrity.
- **Docker Deployment:** Three-container application deployment using Docker Compose on AWS EC2, with Nginx serving the frontend and proxying API requests.

---

## Demo Accounts

The application includes four demo accounts for exploring the different roles and permissions.

| Role | Name | Email |
|---|---|---|
| ADMIN | System Admin | admin@tracker.com |
| MANAGER | Project Manager Rahul | rahul@tracker.com |
| EMPLOYEE | Developer Arjun | arjun@tracker.com |
| EMPLOYEE | QA Engineer Rohit | rohit@tracker.com |

The login page provides four quick-login buttons:

- Admin
- Manager - Rahul
- Employee - Arjun
- Employee - Rohit

These buttons automatically fill in the corresponding demo credentials.

---

## Role-Based Permissions

| Capability | Admin | Manager | Employee |
|---|---|---|---|
| View dashboard | Yes | Yes | Yes |
| View meetings | All | All | Meetings they attend |
| Create meetings | Yes | Yes | No |
| Edit meetings | Any | Own meetings | No |
| Delete meetings | Any | Own meetings | No |
| Create and assign tasks | Yes | Yes | No |
| View tasks | All | All | Own tasks and tasks in meetings they attend |
| Update task status | Any task | Any task | Assigned tasks only |
| Reopen completed tasks | Yes | Yes | No |
| Comment on tasks | Yes | Yes | Accessible tasks only |
| View activity log | Yes | Yes | Own entries through the API; page hidden |
| Create and deactivate users | Yes | No | No |
| List users for dropdowns | Yes | Yes | No |

Access restrictions are enforced on the backend rather than relying only on hiding frontend buttons.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript |
| Styling | Custom CSS design system, CSS variables |
| Icons | Lucide React |
| API Client | Fetch API |
| Backend | Node.js, Express.js 4 |
| Database | MySQL 8.0, mysql2 |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Validation | express-validator |
| API Documentation | Swagger UI, OpenAPI 3 |
| Logging | Morgan |
| Backend Testing | Jest, Supertest |
| Frontend Testing | Vitest, React Testing Library, jsdom |
| Containers | Docker, Docker Compose |
| Web Server | Nginx |
| CI | GitHub Actions |
| Cloud Deployment | AWS EC2 |

---

## System Architecture

The application follows a three-tier architecture.

```text
                 USER / BROWSER
                       |
                       v
              NGINX FRONTEND CONTAINER
              React Application
              Serves frontend build
              Proxies /api requests
                       |
                       v
              EXPRESS BACKEND CONTAINER
                       |
             Routes and Middleware
                       |
                  Controllers
                       |
                   Services
                       |
                    Models
                       |
                       v
                MYSQL DATABASE
```

### Architecture Layers

**1. Presentation Layer**
- Built with React and Vite.
- Provides dashboards, meeting management, task boards, user management, and activity views.
- Uses a shared authentication context to manage the current session.

**2. Application Layer**
- Built using Node.js and Express.js.
- Routes handle API endpoints and permissions.
- Middleware handles authentication, authorization, validation, and errors.
- Controllers handle HTTP requests and responses.
- Services contain business rules and application logic.
- Models handle database queries.

**3. Data Layer**
- MySQL stores users, roles, meetings, participants, tasks, comments, and activity logs.
- Foreign keys, indexes, constraints, and transactions maintain data integrity.

---

## Database Design

The application uses seven relational database tables.

| Table | Purpose |
|---|---|
| `roles` | Stores ADMIN, MANAGER, and EMPLOYEE roles. |
| `users` | Stores user information, email, password hash, role, and active status. |
| `meetings` | Stores meeting details, schedule, location, and creator. |
| `meeting_participants` | Maintains the many-to-many relationship between meetings and users. |
| `tasks` | Stores action items, assignees, priorities, statuses, and due dates. |
| `task_comments` | Stores comments associated with tasks and their authors. |
| `activity_logs` | Records user actions and changes to application entities. |

### Database Design Highlights

- Foreign-key relationships maintain referential integrity.
- Unique constraints prevent duplicate meeting participants.
- ENUM fields restrict task priorities and statuses to valid values.
- Indexes support common task filtering operations.
- A task's assignee can be set to NULL without deleting the task.
- User accounts are deactivated instead of permanently deleted, preserving historical records.
- Meeting creation uses a database transaction to save the meeting and participants together.
- Overdue status is calculated dynamically in SQL rather than stored as a potentially outdated value.

---

## Authentication and Security

- Passwords are hashed using bcryptjs.
- JWT tokens are issued after successful authentication.
- Protected routes require a valid Bearer token.
- The authentication middleware checks that the user still exists and is active.
- Role-based middleware restricts privileged operations.
- Employees receive server-side data scoping for meetings, tasks, comments, dashboard information, and activity entries.
- Request data is validated using express-validator.
- SQL queries use parameterized placeholders.
- The backend refuses to start if `JWT_SECRET` is missing.
- Environment variables are used for database credentials and application secrets.

---

## Important Business Rules

- A meeting's end time must be later than its start time.
- Meeting participants must exist and be active.
- The meeting creator is automatically included as a participant.
- Only Admins and Managers can create and assign tasks.
- A task must have an assignee before it can be marked Completed.
- Employees can update only their own assigned tasks.
- Employees cannot reopen completed tasks.
- Only Managers and Admins can reopen completed tasks.
- Deactivated users cannot log in, access protected endpoints, or receive new assignments.
- Employees cannot access tasks or comments outside their permitted scope.

---

## API Documentation

Interactive API documentation is available through Swagger UI.

**Live API Documentation:** http://13.207.117.100/api-docs

**Health Check:** http://13.207.117.100/api/health

The API is organized into route groups for authentication, users, meetings, tasks, comments, activity, and dashboard operations.

---

## Project Structure

```text
Team Meeting And Action Tracker/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── initDb.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18 or later
- MySQL 8.0 or later
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/tsnuhithreddy/team-meeting-action-tracker.git
cd team-meeting-action-tracker
```

### 2. Configure Environment Variables

Create the required environment files using the provided examples.

For the backend:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure the database connection, JWT secret, and other required settings.

Initialize the database using the configured database settings and the provided schema and seed scripts.

### 3. Start the Backend

```bash
npm run dev
```

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs on port `5173` and proxies API requests to the backend on port `5000`.

---

## Docker Setup

The application uses Docker Compose to run three services:

- **db:** MySQL database.
- **backend:** Express.js REST API.
- **frontend:** Nginx server hosting the React build and proxying API requests.

Configure the root `.env` file using `.env.example`, then run:

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Stop the services:

```bash
docker compose down
```

The MySQL database uses a named Docker volume for persistent data.

---

## Testing

### Backend Tests

Backend integration tests use Jest and Supertest against a MySQL database.

```bash
cd backend
npm test
```

The test suites cover:

- Authentication and token handling.
- Meeting creation and role restrictions.
- Meeting time and participant validation.
- Task creation and status rules.
- Employee task access restrictions.
- Task comments and access control.
- Dashboard data.
- User creation and deactivation.
- Immediate revocation of existing tokens.
- Health endpoint.

The project reference records 46 backend integration tests.

### Frontend Tests

Frontend component tests use Vitest, React Testing Library, and jsdom.

```bash
cd frontend
npm test
```

The project reference records 12 frontend component tests.

### Continuous Integration

GitHub Actions runs the backend tests against a MySQL service container and verifies the frontend production build on pushes and pull requests.

The frontend component tests are not currently part of the CI workflow.

---

## AWS Deployment

The application is deployed on an AWS EC2 instance using Docker Compose.

**Live Application:** http://13.207.117.100

Deployment architecture:

1. A browser sends requests to the EC2 public address over HTTP port 80.
2. The Nginx container serves the React production build.
3. Requests beginning with `/api` are forwarded to the Express backend container.
4. The backend communicates with MySQL through the internal Docker network.
5. MySQL data is stored in a persistent Docker volume.

Deployment is currently performed manually. GitHub Actions handles continuous integration, not automatic production deployment.

---

## Known Limitations and Future Improvements

The application is a portfolio project deployed on a single EC2 instance. The following improvements are planned:

| Current Limitation | Possible Improvement |
|---|---|
| Lists are not paginated | Add pagination, filtering, and search. |
| JWT is stored in localStorage | Move authentication to secure HttpOnly cookies. |
| No refresh-token rotation | Introduce short-lived access tokens and refresh-token rotation. |
| Application uses HTTP | Configure HTTPS using a domain and SSL certificate. |
| No rate limiting or security headers | Add express-rate-limit and Helmet. |
| Backend connects to MySQL as root | Create a least-privilege database user. |
| No client-side router | Introduce React Router. |
| Meeting participants cannot be changed after creation | Add participant-management functionality with transactions. |
| Task status rules are not a complete state machine | Define and enforce a complete transition table. |
| Audit-log insertion logic is repeated | Extract a shared logging helper. |
| Some queries can be optimized | Improve joins and reduce repeated database queries. |
| Frontend tests are not in CI | Add a Vitest CI step. |
| Deployment is manual and uses one instance | Automate deployment and consider managed database services and backups. |
| Demo login buttons and shared demo credentials | Remove them or restrict them to a demo environment. |
| No change-password or forgot-password flow | Add password management and token-based password reset. |

---

## Project Status

This project is a working full-stack portfolio application with a live AWS EC2 deployment, role-based permissions, automated backend testing, frontend component tests, and a GitHub Actions CI pipeline.

It is not currently presented as a production-scale or enterprise application. It does not claim real-user statistics, load-testing results, uptime guarantees, HTTPS, or automated production deployment.

---

## License

This project is licensed under the MIT License.
