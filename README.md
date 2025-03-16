# Full Stack RBAC System

A comprehensive system with role-based access control, user management, and admin dashboard analytics.

## Tech Stack

### Frontend
- Next.js 15 (React)
- TypeScript
- TailwindCSS & shadcn/ui
- TanStack Query
- React Hook Form

### Backend
- Node.js & Express
- TypeScript
- TypeORM & PostgreSQL
- JWT Authentication
- Swagger API Documentation

## Features

- **User Authentication** - Secure login, registration, and password reset
- **Role-Based Access Control** - Granular permissions for different user roles
- **User Management** - Admin dashboard for managing users and permissions
- **Responsive UI** - Modern interface optimized for desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Installation

Clone the repository:
```bash
git clone https://github.com/frazbhattiiii/full-stack-rbac.git
cd full-stack-rbac
```

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd server
```

2. Copy environment template:
```bash
cp .env.sample .env
```

3. Update the `.env` file with your configuration:
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=crm_db
SECRET_KEY=your-secret-key
FRONTEND_URL="http://localhost:3000"
```

4. Install dependencies and start the server:
```bash
npm install
npm run dev
```

5. Seed the database with initial data:
```bash
npm run dev:seed
```
This will create an admin user with the following credentials:
- Email: admin@example.com
- Password: admin123

You can modify these default values in the `server/seed.ts` file.

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd client
```

2. Copy environment template:
```bash
cp .env.sample .env
```

3. Update the `.env` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Install dependencies and start the development server:
```bash
npm install
npm run dev
```

### Docker Setup (Backend)

To run the backend using Docker:

```bash
cd backend
docker-compose up -d
```

This will start the backend API and PostgreSQL database in Docker containers.

## API Documentation

API documentation is available at [http://localhost:3001/api-docs](http://localhost:3001/api-docs) when the backend server is running.

## Architecture

The application follows a modern, scalable architecture:

- **Clean Code Architecture** with separation of concerns
- **RESTful API** design principles
- **TypeORM** for database operations
- **React Query** for server-state management
- **JWT** for secure authentication

## Development Approach

- **Atomic Design System** for UI components
- **TypeScript** for type safety across the stack
- **ESLint** and **Prettier** for code quality


*This Full Stack RBAC System was developed as a technical assessment, showcasing full-stack development skills, modern architectural patterns, and best practices in web application development.*