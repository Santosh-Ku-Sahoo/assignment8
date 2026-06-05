# Assignment 8: Integrated Full-Stack To-Do List App

**Name:** Santosh Kumar Sahoo  
**Class:** MERN Stack Web Development  

---

## Project Overview
This project is a fully functional, full-stack To-Do List application. It integrates a **Node.js/Express.js backend** with a **MongoDB database** and a **React (Vite) frontend**. The app supports full CRUD operations (Create, Read, Update, Delete) along with real-time status toggling, searching, filtering (by status and priority), and sorting.

---

## Project Structure
The repository is split into two directories:
```
assignment8/
├── backend/
│   ├── config/db.js          # MongoDB connection via Mongoose
│   ├── controllers/          # API endpoint logic handlers
│   ├── models/Task.js        # Mongoose Schema for Task
│   ├── routes/taskRoutes.js  # API routing definitions
│   ├── .env                  # Environment configurations
│   ├── package.json          # Node dependencies
│   └── server.js             # Main server entry file
└── frontend/
    ├── src/
    │   ├── components/       # Reusable React components (TaskForm, TaskItem)
    │   ├── App.jsx           # Main Dashboard & state manager
    │   ├── index.css         # Styling directives (Tailwind CSS v4)
    │   └── main.jsx          # React app entry point
    ├── index.html            # Main HTML structure
    ├── vite.config.js        # Vite config with dev server proxy
    └── package.json          # React dependencies
```

---

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017`)

### 1. Backend Setup
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create or check the `.env` file in the root of the `backend` directory. It should contain:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/todo-db
   ```
4. Start the backend server:
   - In production mode:
     ```bash
     npm start
     ```
   - In development mode (restarts automatically on file changes using nodemon):
     ```bash
     npm run dev
     ```
   The backend will connect to MongoDB and run at `http://localhost:5000`.

### 2. Frontend Setup
1. Open another terminal window and navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`. Any API calls made to `/api/*` will automatically be proxied to `http://localhost:5000`.

---

## Features Implemented
- **Create Task:** Add a task with a title (min 3 characters), description, priority (low, medium, high), and an optional due date.
- **Read Tasks:** View all tasks dynamically, displaying due date badges and priority highlights.
- **Update Task:** 
  - Inline editing of a task's title, description, priority, and due date.
  - Quick checkbox status toggle to check/uncheck tasks.
- **Delete Task:** Remove tasks from the dashboard and database with a confirmation dialog.
- **Filters & Searching:** 
  - Search tasks by title or description keyword.
  - Filter tasks by status (All, Active, Completed) or by priority level.
- **Sorting:** Sort tasks by creation date (newest first) or by upcoming due date.
- **Responsive Premium Design:** Sleek dark-mode interface styled using Tailwind CSS v4 and custom glassmorphism panels.

---

## Challenges I Faced & How I Addressed Them

### 1. CORS Errors during Development
* **Challenge:** The frontend ran on port `5173` and the backend ran on port `5000`. The browser blocked requests because of CORS policies.
* **Solution:** I resolved this in two ways: I added the `cors` package middleware to Express, and I configured a `proxy` in the `vite.config.js` file. The proxy routes `/api` calls from the React dev server directly to the backend Express server, which prevents CORS issues and keeps URL paths clean.

### 2. Form Validation & Graceful Error Handling
* **Challenge:** If a user attempted to submit an empty task title, the server would return a 400 error, which could crash or break the UI state if not caught.
* **Solution:** I implemented both frontend and backend validation. In the frontend, the form validates the title length (must be at least 3 characters) and blocks submission with a warning label. In the backend, Mongoose schema validations return clear JSON error messages which the frontend displays using toast notifications.

### 3. Synchronizing State and Optimistic UI Updates
* **Challenge:** Making network requests for checking/unchecking or deleting a task takes a fraction of a second, which makes the UI feel slow or laggy if we wait for the database response.
* **Solution:** I implemented **optimistic rendering** for checking/unchecking and deleting tasks. When the user toggles a task, the frontend immediately updates the state to show the checkbox checked/unchecked or removes the card. If the backend API call succeeds, it stays; if it fails, the catch block restores the previous task state and shows a warning toast.

### 4. Handling Overdue Tasks
* **Challenge:** I wanted tasks that are past their due dates to be visually distinct so the user knows they are overdue.
* **Solution:** I wrote a helper function in `TaskItem.jsx` that compares the task's due date with today's date. If the date is in the past and the task is incomplete, the badge turns red and displays "Overdue (X days ago)".

---

## Vercel Multi-Service Deployment (Monorepo)
The root of the `assignment8` folder contains a `vercel.json` file designed to build and deploy both the React frontend and Express backend services in a single Vercel project:

1. Import the `assignment8` root folder into Vercel.
2. Vercel will detect the `experimentalServices` config:
   - **Frontend**: Served from the `frontend` folder at the root path (`/`).
   - **Backend**: Served from the `backend` folder under the `/_/backend` route prefix.
3. Configure the following environment variables:
   - **Backend Service Variables**: Add `MONGODB_URI` containing your MongoDB Atlas connection string.
   - **Frontend Service Variables**: Add `VITE_API_URL` with the value `/_/backend` to tell Axios to route all production API requests through the Vercel monorepo proxy.

