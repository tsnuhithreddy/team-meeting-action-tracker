const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Team Meeting & Action Tracker REST API',
    version: '1.0.0',
    description: 'Interactive API documentation for Team Meeting and Action Tracker with JWT Auth and RBAC.'
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from POST /auth/login'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue JWT token',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'alice@tracker.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT token and user info' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get currently authenticated user profile',
        tags: ['Authentication'],
        responses: {
          200: { description: 'User profile retrieved successfully' },
          401: { description: 'Unauthorized / Missing token' }
        }
      }
    },
    '/meetings': {
      get: {
        summary: 'List meetings accessible to user',
        tags: ['Meetings'],
        responses: {
          200: { description: 'List of meetings' }
        }
      },
      post: {
        summary: 'Schedule a new meeting (Admin & Manager only)',
        tags: ['Meetings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'meetingDate', 'startTime', 'endTime'],
                properties: {
                  title: { type: 'string', example: 'Sprint 3 Architecture Review' },
                  description: { type: 'string', example: 'Review backend state machines' },
                  meetingDate: { type: 'string', example: '2026-11-10' },
                  startTime: { type: 'string', example: '10:00:00' },
                  endTime: { type: 'string', example: '11:30:00' },
                  locationOrLink: { type: 'string', example: 'Zoom Room 204' },
                  participantIds: { type: 'array', items: { type: 'integer' }, example: [2, 3, 4] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Meeting created successfully' },
          400: { description: 'End time must be after start time' },
          403: { description: 'Forbidden for Employees' }
        }
      }
    },
    '/tasks': {
      get: {
        summary: 'Get all tasks with optional filters',
        tags: ['Tasks'],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
          { name: 'overdue', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'List of tasks' }
        }
      },
      post: {
        summary: 'Create a new action item (Admin & Manager only)',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['meetingId', 'title', 'dueDate'],
                properties: {
                  meetingId: { type: 'integer', example: 1 },
                  title: { type: 'string', example: 'Write unit tests for state machine' },
                  description: { type: 'string', example: 'Ensure 100% test coverage' },
                  assigneeId: { type: 'integer', example: 3 },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
                  dueDate: { type: 'string', example: '2026-11-15' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Task created successfully' },
          403: { description: 'Forbidden for Employees' }
        }
      }
    },
    '/tasks/my-tasks': {
      get: {
        summary: 'Get tasks assigned to currently authenticated user',
        tags: ['Tasks'],
        responses: {
          200: { description: 'List of assigned tasks' }
        }
      }
    },
    '/tasks/{id}/status': {
      patch: {
        summary: 'Update task status (Assigned Employee or Manager/Admin)',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'], example: 'IN_PROGRESS' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status updated successfully' },
          400: { description: 'Cannot complete task without assignee' },
          403: { description: 'Cannot update other employee tasks' }
        }
      }
    },
    '/tasks/{id}/comments': {
      get: {
        summary: 'Get discussion comments for a task',
        tags: ['Comments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Comments list' } }
      },
      post: {
        summary: 'Post a comment on a task',
        tags: ['Comments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['commentText'],
                properties: {
                  commentText: { type: 'string', example: 'Finished the schema constraints.' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Comment added' } }
      }
    },
    '/activity': {
      get: {
        summary: 'Get system audit & activity trail',
        tags: ['Audit Logs'],
        responses: { 200: { description: 'Activity logs' } }
      }
    },
    '/dashboard': {
      get: {
        summary: 'Get aggregated dashboard metrics and overdue alerts',
        tags: ['Dashboard'],
        responses: { 200: { description: 'Metrics summary' } }
      }
    }
  }
};

const swaggerUiOptions = {
  customSiteTitle: 'Team Meeting Tracker API Docs'
};

module.exports = {
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup(swaggerDocument, swaggerUiOptions)
};