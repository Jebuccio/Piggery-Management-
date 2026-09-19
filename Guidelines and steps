Project Directory & File Guide
Here is the complete breakdown of every file in the Pig Tracker full-stack repository, organized by folder with descriptions of their exact roles:

Root Directory
README.md: Project overview, setup instructions, database installation guidelines, and system architecture explanation for developers.

schema.sql: PostgreSQL database initialization file containing table definitions (sows, schedule_events, feed_stores) and initial seed data.

Backend (/BackEnd)
BackEnd/package.json: Node.js configuration file defining backend dependencies (express, pg, cors) and execution scripts (npm start, npm run dev).

BackEnd/server.js: Central Express.js application server. Handles API routes for fetching dashboard metrics, logging breeding cycles, toggling task completions, managing sow records (CRUD), and updating feed store inventory.

Frontend (/FrontEnd)
FrontEnd/package.json: React/Vite configuration file listing dependencies (react, react-dom, tailwindcss).

FrontEnd/vite.config.js: Vite build tool configuration file for hot-module reloading and local port mapping.

FrontEnd/src/main.jsx: JavaScript entry point that mounts the primary React application into the browser DOM.

FrontEnd/src/index.css: Global CSS stylesheet containing custom Tailwind CSS utility classes (neu-light-card, neu-dark-card, neu-light-input, neu-dark-input) to render the Neumorphic (Soft UI) styling and Light/Dark themes.

FrontEnd/src/App.jsx: Main client-side React component featuring state management, the responsive left-sidebar shell, the Light/Dark mode switcher, and all view routes (Public Searchable Home, Admin Dashboard, Sow CRUD modals, and Seller Portal).

How to Setup & Run the Application Locally
Follow these steps to run the application on your computer after cloning it from GitHub.

Prerequisites (Tools to Install)
Make sure you have installed the following software on your machine:

Node.js (v18.0.0 or higher) – Download Node.js

PostgreSQL (v14 or higher) – Download PostgreSQL

Git – Download Git

Step 1: Clone the GitHub Repository
Open your terminal or PowerShell and clone your repository:

Bash
git clone https://github.com/YOUR_USERNAME/pig-tracker.git
cd pig-tracker
Step 2: Set Up the PostgreSQL Database
Open pgAdmin or run psql in your command line to access PostgreSQL.

Create a new database named piggery_db:

SQL
CREATE DATABASE piggery_db;
Execute the SQL script from schema.sql inside piggery_db to set up your tables and initial data:

Bash
psql -U postgres -d piggery_db -f schema.sql
Step 3: Configure & Start the Backend Server
Navigate to the backend directory:

Bash
cd BackEnd
Install the necessary Node dependencies:

Bash
npm install
Open server.js and update your PostgreSQL connection password:

JavaScript
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'piggery_db',
  password: 'YOUR_POSTGRES_PASSWORD', // Replace with your actual password
  port: 5432,
});
Start the Express API server:

Bash
npm run dev
Your backend API will now be running on http://localhost:5000.

Step 4: Configure & Start the Frontend Web App
Open a new terminal tab/window and navigate to the frontend directory:

Bash
cd FrontEnd
Install the frontend dependencies:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
Open the URL shown in your terminal (typically http://localhost:5173) in your web browser.
