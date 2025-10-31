# Mini Project Manager API Documentation

This document describes all available endpoints in the Mini Project Manager API, including request/response examples and expected behaviors.

## Authentication Endpoints

### Register User

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Description:** Register a new user in the system
- **Request Body:**
  ```json
  {
  	"username": "testuser",
  	"email": "test@example.com",
  	"password": "Test123!"
  }
  ```
- **Response:**
  - Status: 201 Created
  - No response body
- **Error Response:**
  - Status: 400 Bad Request
  ```json
  {
  	"error": "Username already exists"
  }
  ```

### Login

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Description:** Authenticate a user and receive a JWT token
- **Request Body:**
  ```json
  {
  	"username": "testuser",
  	"email": "test@example.com",
  	"password": "Test123!"
  }
  ```
- **Success Response:**
  - Status: 200 OK
  ```json
  {
  	"token": "eyJhbGci..."
  }
  ```
- **Error Response:**
  - Status: 401 Unauthorized
  ```json
  {
  	"error": "Invalid credentials"
  }
  ```

## Project Endpoints

### Get All Projects

- **URL:** `/api/projects`
- **Method:** `GET`
- **Description:** Retrieve all projects for the authenticated user
- **Authentication:** Required (Bearer Token)
- **Response:**
  - Status: 200 OK
  ```json
  [
  	{
  		"id": "guid",
  		"title": "Project Title",
  		"description": "Project Description",
  		"createdAt": "timestamp",
  		"updatedAt": "timestamp"
  	}
  ]
  ```

### Create Project

- **URL:** `/api/projects`
- **Method:** `POST`
- **Description:** Create a new project
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
  	"title": "Test Project",
  	"description": "This is a test project"
  }
  ```
- **Response:**
  - Status: 201 Created
  ```json
  {
  	"id": "guid",
  	"title": "Test Project",
  	"description": "This is a test project",
  	"createdAt": "timestamp",
  	"updatedAt": null
  }
  ```

### Get Project by ID

- **URL:** `/api/projects/{id}`
- **Method:** `GET`
- **Description:** Retrieve a specific project by ID
- **Authentication:** Required (Bearer Token)
- **Response:**
  - Status: 200 OK
  ```json
  {
  	"id": "guid",
  	"title": "Project Title",
  	"description": "Project Description",
  	"createdAt": "timestamp",
  	"updatedAt": "timestamp"
  }
  ```
- **Error Response:**
  - Status: 404 Not Found

### Delete Project

- **URL:** `/api/projects/{id}`
- **Method:** `DELETE`
- **Description:** Delete a specific project
- **Authentication:** Required (Bearer Token)
- **Response:**
  - Status: 204 No Content
- **Error Response:**
  - Status: 404 Not Found

## Task Endpoints

### Get Tasks for Project

- **URL:** `/api/projects/{projectId}/tasks`
- **Method:** `GET`
- **Description:** Retrieve all tasks for a specific project
- **Authentication:** Required (Bearer Token)
- **Response:**
  - Status: 200 OK
  ```json
  [
  	{
  		"id": "guid",
  		"title": "Task Title",
  		"description": "Task Description",
  		"status": 0,
  		"dueDate": "2025-12-31T23:59:59Z",
  		"estimatedHours": 8,
  		"dependencies": ["Task A", "Task B"],
  		"projectId": "guid",
  		"assignedToUserId": null,
  		"createdAt": "timestamp",
  		"updatedAt": "timestamp"
  	}
  ]
  ```
- **Status Values in Response:**
  - `0` = Todo
  - `1` = InProgress
  - `2` = Done

### Create Task

- **URL:** `/api/projects/{projectId}/tasks`
- **Method:** `POST`
- **Description:** Create a new task in a project with enhanced scheduling support
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
  	"title": "Test Task",
  	"description": "This is a test task",
  	"dueDate": "2025-12-31T23:59:59Z",
  	"estimatedHours": 8,
  	"dependencies": ["Setup Database", "Design API"],
  	"assignedToUserId": null
  }
  ```
- **Request Body Fields:**
  - `title` (required): Task title
  - `description` (optional): Task description
  - `dueDate` (optional): Due date in ISO 8601 format
  - `estimatedHours` (optional): Work estimation in hours (default: 8)
  - `dependencies` (optional): Array of task titles this task depends on
  - `assignedToUserId` (optional): User ID to assign the task to
- **Response:**
  - Status: 201 Created
  ```json
  {
  	"id": "guid",
  	"title": "Test Task",
  	"description": "This is a test task",
  	"status": 0,
  	"dueDate": "2025-12-31T23:59:59Z",
  	"estimatedHours": 8,
  	"dependencies": ["Setup Database", "Design API"],
  	"projectId": "guid",
  	"assignedToUserId": null,
  	"createdAt": "timestamp",
  	"updatedAt": null
  }
  ```

### Update Task

- **URL:** `/api/tasks/{taskId}`
- **Method:** `PUT`
- **Description:** Update an existing task with enhanced scheduling support
- **Authentication:** Required (Bearer Token)
- **Request Body:** _(Note: Properties must be in PascalCase with proper data types)_
  ```json
  {
  	"Title": "Updated Task",
  	"Description": "This task has been updated",
  	"Status": 1,
  	"DueDate": "2025-12-31T23:59:59Z",
  	"EstimatedHours": 12,
  	"Dependencies": ["Setup Database", "Design API"],
  	"AssignedToUserId": null
  }
  ```
- **Request Body Fields:**
  - `Title` (required): Task title
  - `Description` (optional): Task description
  - `Status` (required): Task status as integer
  - `DueDate` (optional): Due date in ISO 8601 format
  - `EstimatedHours` (optional): Work estimation in hours
  - `Dependencies` (optional): Array of task titles this task depends on
  - `AssignedToUserId` (optional): User ID to assign the task to
- **Status Values:**
  - `0` = Todo
  - `1` = InProgress
  - `2` = Done
- **Response:**
  - Status: 204 No Content
- **Error Response:**
  - Status: 404 Not Found
  - Status: 400 Bad Request (if data format is incorrect)

### Delete Task

- **URL:** `/api/tasks/{taskId}`
- **Method:** `DELETE`
- **Description:** Delete a specific task
- **Authentication:** Required (Bearer Token)
- **Response:**
  - Status: 204 No Content
- **Error Response:**
  - Status: 404 Not Found

## Enhanced Scheduler Endpoints

### Schedule Project Tasks

- **URL:** `/api/v1/projects/{projectId}/schedule`
- **Method:** `POST`
- **Description:** Generate an intelligent task schedule with dependency resolution using topological sorting
- **Authentication:** Required (Bearer Token)
- **Request Body (Option 1 - Schedule New Tasks):**
  ```json
  {
  	"startDate": "2025-11-01T00:00:00Z",
  	"tasks": [
  		{
  			"title": "Design API",
  			"estimatedHours": 5,
  			"dueDate": "2025-11-05T00:00:00Z",
  			"dependencies": []
  		},
  		{
  			"title": "Implement Backend",
  			"estimatedHours": 12,
  			"dueDate": "2025-11-10T00:00:00Z",
  			"dependencies": ["Design API"]
  		},
  		{
  			"title": "Build Frontend",
  			"estimatedHours": 10,
  			"dueDate": "2025-11-12T00:00:00Z",
  			"dependencies": ["Design API"]
  		},
  		{
  			"title": "End-to-End Test",
  			"estimatedHours": 8,
  			"dueDate": "2025-11-15T00:00:00Z",
  			"dependencies": ["Implement Backend", "Build Frontend"]
  		}
  	]
  }
  ```
- **Request Body (Option 2 - Schedule Existing Project Tasks):**
  ```json
  {
  	"startDate": "2025-11-01T00:00:00Z"
  }
  ```
  _(Omit tasks array to schedule existing incomplete tasks in the project)_
- **Request Body Fields:**
  - `startDate` (optional): When to start the schedule (default: today)
  - `tasks` (optional): Array of tasks to schedule. If omitted, uses existing project tasks
- **Response:**
  - Status: 200 OK
  ```json
  {
  	"recommendedOrder": [
  		"Design API",
  		"Implement Backend", 
  		"Build Frontend",
  		"End-to-End Test"
  	],
  	"detailedSchedule": [
  		{
  			"taskId": null,
  			"title": "Design API",
  			"scheduledStartDate": "2025-11-01T00:00:00Z",
  			"scheduledEndDate": "2025-11-01T00:00:00Z",
  			"estimatedHours": 5,
  			"dependencies": [],
  			"assignedToUserId": null
  		},
  		{
  			"taskId": null,
  			"title": "Implement Backend",
  			"scheduledStartDate": "2025-11-02T00:00:00Z",
  			"scheduledEndDate": "2025-11-03T00:00:00Z",
  			"estimatedHours": 12,
  			"dependencies": ["Design API"],
  			"assignedToUserId": null
  		},
  		{
  			"taskId": null,
  			"title": "Build Frontend",
  			"scheduledStartDate": "2025-11-04T00:00:00Z",
  			"scheduledEndDate": "2025-11-05T00:00:00Z",
  			"estimatedHours": 10,
  			"dependencies": ["Design API"],
  			"assignedToUserId": null
  		},
  		{
  			"taskId": null,
  			"title": "End-to-End Test",
  			"scheduledStartDate": "2025-11-06T00:00:00Z",
  			"scheduledEndDate": "2025-11-06T00:00:00Z",
  			"estimatedHours": 8,
  			"dependencies": ["Implement Backend", "Build Frontend"],
  			"assignedToUserId": null
  		}
  	]
  }
  ```
- **Algorithm Features:**
  - **Dependency Resolution:** Uses topological sorting to ensure tasks are scheduled after their dependencies
  - **Work-day Calculation:** Assumes 8-hour work days for scheduling
  - **Parallel Processing:** Tasks with no interdependencies can be scheduled in parallel
  - **Circular Dependency Protection:** Detects and handles circular dependencies gracefully
  - **Missing Dependency Handling:** Schedules tasks even if some dependencies are missing
- **Error Response:**
  - Status: 404 Not Found (if project doesn't exist)
  - Status: 400 Bad Request (if request format is invalid)

## Additional Notes

- All authenticated endpoints require a valid JWT token in the Authorization header: `Authorization: Bearer <token>`
- All dates are in ISO 8601 format
- **Task Status Values:**
  - `0` = Todo (default status for new tasks)
  - `1` = InProgress
  - `2` = Done
- **Enhanced Task Features:**
  - **EstimatedHours:** Work estimation in hours (range: 1-1000, default: 8)
  - **Dependencies:** Array of task titles that must be completed first
  - **Dependency Matching:** Dependencies are matched by exact task title comparison
  - **Scheduling Algorithm:** Uses topological sorting for dependency-aware ordering
- **Data Format Requirements:**
  - **Request bodies for PUT/POST operations require PascalCase property names** (Title, Description, Status, EstimatedHours, Dependencies, etc.)
  - **Response bodies use camelCase property names** (title, description, status, estimatedHours, dependencies, etc.)
  - Status must be sent as integer values (0, 1, 2) in requests
  - Status is returned as integer values (0, 1, 2) in responses
  - Dependencies are arrays of strings (task titles)
  - EstimatedHours must be positive integers
- **Scheduler Behavior:**
  - Tasks are scheduled assuming 8-hour work days
  - Dependencies must be completed before dependent tasks can start
  - Tasks without dependencies can be scheduled immediately
  - Parallel tasks (no interdependencies) are scheduled optimally
  - Circular dependencies are detected and handled gracefully
  - Missing dependencies are ignored with warning behavior
- Project and task IDs are GUIDs
- The API uses UTC timestamps for all date/time fields
- The frontend automatically handles the data format conversion between camelCase and PascalCase

## Enhanced Scheduler Usage Examples

### Example 1: Software Development Workflow
```bash
# Create project
curl -X POST "http://localhost:5118/api/projects" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Web App Project","description":"Full-stack web application"}'

# Create tasks with dependencies
curl -X POST "http://localhost:5118/api/projects/{projectId}/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Database Design","estimatedHours":8,"dependencies":[]}'

curl -X POST "http://localhost:5118/api/projects/{projectId}/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"API Development","estimatedHours":16,"dependencies":["Database Design"]}'

# Schedule the project
curl -X POST "http://localhost:5118/api/v1/projects/{projectId}/schedule" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-11-01T00:00:00Z"}'
```

### Example 2: Complex Dependency Chain
The scheduler handles complex workflows like:
```
Database Design (8h) 
    ↓
API Specification (6h)
    ↓
┌─── Backend Implementation (20h)    Frontend Components (16h) ───┐
│                                                                  │
└─── Security Audit (8h)          Integration Testing (12h) ──────┘
                  ↓                           ↓
                  └─────── Deployment (4h) ───┘
```

This complex dependency chain is automatically resolved into the optimal execution order while respecting all constraints.

## Version History

- **v1.1** (October 2025): Enhanced scheduler with dependency resolution, estimated hours, and topological sorting
- **v1.0** (Initial): Basic project and task management with CRUD operations
