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
  		"projectId": "guid",
  		"assignedToUserId": null
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
- **Description:** Create a new task in a project
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
  	"title": "Test Task",
  	"description": "This is a test task",
  	"dueDate": "2025-12-31T23:59:59Z",
  	"assignedToUserId": null
  }
  ```
- **Response:**
  - Status: 201 Created
  ```json
  {
  	"id": "guid",
  	"title": "Test Task",
  	"description": "This is a test task",
  	"status": 0,
  	"dueDate": "2025-12-31T23:59:59Z",
  	"projectId": "guid",
  	"assignedToUserId": null
  }
  ```

### Update Task

- **URL:** `/api/tasks/{taskId}`
- **Method:** `PUT`
- **Description:** Update an existing task
- **Authentication:** Required (Bearer Token)
- **Request Body:** *(Note: Properties must be in PascalCase with proper data types)*
  ```json
  {
  	"Title": "Updated Task",
  	"Description": "This task has been updated",
  	"Status": 1,
  	"DueDate": "2025-12-31T23:59:59Z",
  	"AssignedToUserId": null
  }
  ```
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

## Additional Notes

- All authenticated endpoints require a valid JWT token in the Authorization header: `Authorization: Bearer <token>`
- All dates are in ISO 8601 format
- **Task Status Values:**
  - `0` = Todo (default status for new tasks)
  - `1` = InProgress 
  - `2` = Done
- **Data Format Requirements:**
  - **Request bodies for PUT/POST operations require PascalCase property names** (Title, Description, Status, etc.)
  - **Response bodies use camelCase property names** (title, description, status, etc.)
  - Status must be sent as integer values (0, 1, 2) in requests
  - Status is returned as integer values (0, 1, 2) in responses
- Project and task IDs are GUIDs
- The API uses UTC timestamps for all date/time fields
- The frontend automatically handles the data format conversion between camelCase and PascalCase
