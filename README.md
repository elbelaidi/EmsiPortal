# Emsi Portal Web Application

## Project Overview
Emsi Portal is a web application designed to manage student information, courses, absences, and user authentication for an educational institution. It features a React + TypeScript frontend with a rich UI built using Radix UI components and Tailwind CSS, and an Express backend API connected to a PostgreSQL database. The app supports role-based access for students and supervisors, file uploads for absence documents, and real-time data management.

## Technology Stack and Tools
- **Frontend:**
  - React 18 with TypeScript
  - Vite as the build tool and development server
  - Radix UI component library for accessible UI primitives
  - Tailwind CSS for utility-first styling
  - React Router DOM for client-side routing
  - React Hook Form for form management
  - React Query for data fetching and caching
  - Sonner and React Hot Toast for notifications
  - Embla Carousel, Recharts for UI components
- **Backend:**
  - Node.js with Express framework
  - PostgreSQL database accessed via `pg` library
  - Multer for handling file uploads
  - Bcrypt for password hashing
  - CORS enabled for cross-origin requests
- **Other Tools:**
  - ESLint for linting
  - TypeScript for static typing
  - Docker and Docker Compose for containerization
  - PostCSS and Autoprefixer for CSS processing

## Folder Structure
- `src/` - Frontend source code
  - `components/` - Reusable UI components and feature components
  - `context/` - React context providers for auth, data, theme
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `pages/` - Route components organized by user roles (student, supervisor)
  - `types/` - TypeScript type definitions
- `public/` - Static assets like images and robots.txt
- `uploads/` - Uploaded files (absence documents)
- `server.js` - Express backend server entry point
- `schema.sql` - Database schema for PostgreSQL
- `docker-compose.yml` - Docker Compose configuration for containerized deployment
- Configuration files for Vite, ESLint, Tailwind, TypeScript, PostCSS

## Backend API Overview
The backend server runs on port 3001 and exposes RESTful API endpoints for:
- User authentication and management (`/api/login`, `/api/users`)
- Student management (`/api/students`)
- Course management (`/api/courses`)
- Absence claims and status updates (`/api/absences`)
- File uploads for absence documents (stored in `/uploads/absence_documents`)
- Profile picture updates
- Password updates
- Debug endpoints for database structure and sample data

The backend uses PostgreSQL for data persistence and bcrypt for secure password hashing.

## Frontend Overview
- Built with React and TypeScript using Vite for fast development and build
- Uses Radix UI components for accessible and customizable UI elements
- Tailwind CSS for styling with utility classes and animations
- React Router DOM for navigation and protected routes
- React Query for efficient data fetching and caching
- Supports role-based views for students and supervisors
- Includes features like chat bot, absence claim forms, dashboards, and profile management

## Installation and Running the App
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`

## Building for Production
```bash
npm run build
```
The production build will be in the `dist/` folder.

## Linting
Run ESLint to check for linting errors:
```bash
npm run lint
```

## Docker Support
The project includes a `docker-compose.yml` file for containerized deployment of the backend and frontend services.

## Database
- PostgreSQL is used as the database
- Connection details are configured in `server.js`
- Database schema is defined in `schema.sql`

## File Uploads
- Absence documents can be uploaded as PDF, JPG, JPEG, or PNG files
- Files are stored in the `uploads/absence_documents` directory
- Multer middleware handles file uploads with size limits and file type validation

## Available Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run build:dev` - Build frontend in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase

## Additional Notes
- The frontend development server proxies API requests to the backend server on port 3001
- The project uses environment variables and configuration files for customization
- The backend logs incoming requests and errors for debugging

---

This README provides a comprehensive overview of the Emsi Portal project, its tools, architecture, and usage instructions.
