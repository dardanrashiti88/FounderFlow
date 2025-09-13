# Overview

SalesPipe is a comprehensive Customer Relationship Management (CRM) application built with a modern full-stack architecture. The application provides sales teams with tools to manage companies, contacts, deals, and activities through an intuitive dashboard interface. Key features include pipeline visualization, revenue forecasting, activity tracking, and comprehensive reporting with data export capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, implementing a single-page application (SPA) pattern. The architecture follows modern React patterns with functional components and hooks for state management. Key architectural decisions include:

- **Component Library**: Uses shadcn/ui components built on top of Radix UI primitives for consistent, accessible UI components
- **Styling**: Tailwind CSS for utility-first styling with CSS custom properties for theming support
- **State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod for type-safe form validation
- **Charts**: Recharts library for data visualization and analytics

## Backend Architecture
The backend implements a REST API using Express.js with TypeScript, following a modular architecture pattern:

- **API Layer**: Express.js server with middleware for request logging, JSON parsing, and error handling
- **Storage Layer**: Abstracted storage interface allowing for multiple database implementations
- **Route Handlers**: RESTful endpoints for CRUD operations on companies, contacts, deals, and activities
- **Validation**: Zod schemas for request/response validation shared between frontend and backend
- **Development Setup**: Vite integration for hot module replacement in development

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM providing type-safe queries and migrations
- **Schema Design**: Relational schema with proper foreign key relationships between companies, contacts, deals, and activities
- **Migrations**: Drizzle Kit for database schema migrations and version control

## External Dependencies

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: CLI tool for database migrations and schema management

### UI and Styling
- **@radix-ui/***: Collection of accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library providing consistent iconography

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management library for caching and synchronization
- **wouter**: Lightweight routing library for React

### Form Handling and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation library

### Charts and Visualization
- **recharts**: Composable charting library for React
- **date-fns**: Modern date utility library for formatting and manipulation

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific development enhancements