# SprintHub - Team Task Manager (Full Stack)

SprintHub is a production-quality team collaboration and project management platform. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a real-world architecture with role-based access control, real-time updates, and a stunning modern UI.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Secure Auth**: JWT-based authentication with password hashing (bcrypt).
- **Role-Based Access Control (RBAC)**:
  - **Admins**: Can create/edit/delete projects and tasks, manage team members, and view full analytics.
  - **Members**: Can view assigned tasks, update status, and track their own progress.
- **Protected Routes**: Frontend and backend routes secured based on user roles.

### 📊 Dashboard & Analytics
- **Visual Insights**: Interactive charts (Pie & Bar) using Recharts.
- **Key Metrics**: Real-time tracking of project completion, task counts, and overdue items.
- **Activity Feed**: Comprehensive log of team actions for transparency.

### 📋 Project & Task Management
- **Project Tracking**: Create and manage projects with descriptions, due dates, and member assignments.
- **Kanban Board**: Drag-and-drop task management (Todo → In Progress → Completed).
- **Task Details**: Title, description, priority (Low/Medium/High), status, and assignment.

### 🎨 Modern UI/UX
- **Premium Design**: Sleek, professional interface with Tailwind CSS.
- **Dark Mode**: Native support for dark/light themes.
- **Responsive Layout**: Optimized for desktop, tablet, and mobile.
- **Micro-interactions**: Smooth transitions, loading skeletons, and toast notifications.

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, Recharts, @hello-pangea/dnd.
- **Backend**: Node.js, Express.js, JWT, Socket.IO.
- **Database**: MongoDB (Mongoose).

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js installed.
- MongoDB instance (Local or Atlas).

### Installation

1. **Clone the repository**
2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   # Add your MONGO_URI and JWT_SECRET
   ```
3. **Seed the Database (Optional)**
   ```bash
   npm run seed
   ```
4. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```

### Running Locally

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
2. **Start Frontend Client**
   ```bash
   cd client
   npm run dev
   ```

## 📝 Demo Credentials

- **Admin**: `admin@sprinthub.com` / `admin123`
- **Member**: `user@sprinthub.com` / `user123`

---

Built with ❤️ for high-performance teams.
