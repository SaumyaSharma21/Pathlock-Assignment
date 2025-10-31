# Pathlock Assignment

This repository contains two full-stack applications built for the Pathlock assignment:

- **TaskManager**: A minimal, fast, and user-friendly task tracker.
- **ProjectManager**: A robust project and task management platform with authentication, scheduling, and smart planning features.


---

## Table of Contents
- [Project Structure](#project-structure)
- [TaskManager](#taskmanager)
  - [Features](#features-1)
  - [How to Run Locally](#how-to-run-taskmanager-locally)
  - [Live Demo](#live-demo-1)
- [ProjectManager](#projectmanager)
  - [Features](#features)
  - [How to Run Locally](#how-to-run-projectmanager-locally)
  - [Live Demo](#live-demo)


---

## Project Structure

```
Pathlock-Assignment/
   TaskManager/
    Backend/   # .NET 8 In-memory REST API
    Frontend/  # React + TypeScript SPA
  ProjectManager/
    Backend/   # .NET 8 + EF Core + JWT API
    Frontend/  # React + TypeScript SPA
  
```

---

## TaskManager
A lightweight, single-page task tracker.

### Features
- Add, toggle, and delete tasks
- Task filtering (All / Active / Completed)
- LocalStorage persistence
- Responsive, modern UI (Tailwind CSS)
- Fast in-memory .NET 8 backend

### How to Run TaskManager Locally

#### Backend
1. Navigate to the backend folder:
   ```sh
   cd TaskManager/Backend/TaskManagerApi
   ```
2. Run the API:
   ```sh
   dotnet run
   ```
   The API will be available at `http://localhost:5000`.

#### Frontend
1. Navigate to the frontend folder:
   ```sh
   cd TaskManager/Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the app:
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Live Demo
- Frontend: [https://task-manager-seven-tan.vercel.app/] 
- Backend: not deployed

---

## ProjectManager
A full-featured project and task management system.

### Features
- User authentication (JWT)
- Project CRUD (create, read, update, delete)
- Task CRUD within projects
- Smart Scheduler: API endpoint to auto-plan tasks based on dependencies and estimates
- Responsive, mobile-friendly UI
- Form validation and error handling
- Dashboard and project detail views
- Loading indicators and user feedback
- Secure, scalable backend with SQLite (or in-memory for dev)

### How to Run ProjectManager Locally

#### Backend
1. Navigate to the backend folder:
   ```sh
   cd ProjectManager/Backend/MiniProjectManager.Api
   ```
2. Restore and run:
   ```sh
   dotnet restore
   dotnet run
   ```
   The API will be available at `http://localhost:5118` (or as configured).

#### Frontend
1. Navigate to the frontend folder:
   ```sh
   cd ProjectManager/Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the app:
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Live Demo
>
- Frontend: not deployed
- Backend: not deployed

---

