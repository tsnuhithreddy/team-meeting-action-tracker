-- Insert Default Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'System administrator with full access'),
(2, 'MANAGER', 'Project manager who can create meetings and assign tasks'),
(3, 'EMPLOYEE', 'Team member who attends meetings and executes tasks')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Demo Users (Password for all users is: password123)
INSERT INTO users (id, full_name, email, password_hash, role_id) VALUES
(1, 'System Admin', 'admin@tracker.com', '$2a$10$HiIzyo3/cf7nssc.zr2UWe.VoFVK9bjDBAL0trR2YbenWLALjImy.', 1),
(2, 'Project Manager Alice', 'alice@tracker.com', '$2a$10$HiIzyo3/cf7nssc.zr2UWe.VoFVK9bjDBAL0trR2YbenWLALjImy.', 2),
(3, 'Developer Bob', 'bob@tracker.com', '$2a$10$HiIzyo3/cf7nssc.zr2UWe.VoFVK9bjDBAL0trR2YbenWLALjImy.', 3),
(4, 'QA Engineer Charlie', 'charlie@tracker.com', '$2a$10$HiIzyo3/cf7nssc.zr2UWe.VoFVK9bjDBAL0trR2YbenWLALjImy.', 3)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), full_name=VALUES(full_name);

-- Insert Sample Meeting
INSERT INTO meetings (id, title, description, meeting_date, start_time, end_time, location_or_link, created_by) VALUES
(1, 'Sprint 1 Planning & Architecture', 'Discuss system architecture, database schema, and task allocation for Sprint 1.', CURDATE(), '10:00:00', '11:30:00', 'Conference Room A / Zoom', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Add Meeting Participants
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
(1, 2),
(1, 3),
(1, 4)
ON DUPLICATE KEY UPDATE meeting_id=VALUES(meeting_id);

-- Insert Sample Tasks
INSERT INTO tasks (id, meeting_id, title, description, assignee_id, priority, status, due_date, created_by) VALUES
(1, 1, 'Design MySQL Database Schema', 'Write DDL script with foreign keys, indexes, and constraints.', 3, 'HIGH', 'COMPLETED', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2),
(2, 1, 'Implement JWT Authentication API', 'Create login endpoint, bcrypt password verification, and auth middleware.', 3, 'CRITICAL', 'IN_PROGRESS', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2),
(3, 1, 'Write API Integration Test Suite', 'Create Supertest test cases for RBAC and meeting endpoints.', 4, 'MEDIUM', 'OPEN', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Second meeting used to test access-control scoping: Charlie is deliberately
-- NOT a participant here and NOT assigned task 4.
INSERT INTO meetings (id, title, description, meeting_date, start_time, end_time, location_or_link, created_by) VALUES
(2, 'Client Escalation Review', 'Private discussion on the Acme Corp support escalation.', CURDATE(), '14:00:00', '15:00:00', 'Zoom', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO meeting_participants (meeting_id, user_id) VALUES
(2, 2),
(2, 3)
ON DUPLICATE KEY UPDATE meeting_id=VALUES(meeting_id);

INSERT INTO tasks (id, meeting_id, title, description, assignee_id, priority, status, due_date, created_by) VALUES
(4, 2, 'Prepare Acme Corp Incident Report', 'Summarize root cause and remediation steps for the client.', 3, 'HIGH', 'OPEN', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Sample Comment
INSERT INTO task_comments (id, task_id, user_id, comment_text) VALUES
(1, 2, 3, 'Working on the JWT signing payload and token expiration config.')
ON DUPLICATE KEY UPDATE comment_text=VALUES(comment_text);

-- Insert Sample Activity Log
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
(2, 'CREATE_MEETING', 'MEETING', 1, 'Created Sprint 1 Planning meeting'),
(2, 'CREATE_TASK', 'TASK', 1, 'Assigned schema task to Bob'),
(2, 'CREATE_TASK', 'TASK', 2, 'Assigned JWT auth task to Bob'),
(3, 'UPDATE_STATUS', 'TASK', 2, 'Changed status to IN_PROGRESS');