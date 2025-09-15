# Ananka Fasteners CRM System

A comprehensive Customer Relationship Management system built with Next.js, Express.js, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: Role-based access control (Admin, Sales, Marketing)
- **Lead Management**: Complete CRUD operations with real-time updates
- **Dashboard Analytics**: Interactive charts and statistics
- **Real-time Updates**: Socket.IO integration for live data sync
- **Advanced Filtering**: Search, filter, and pagination for leads
- **Export Capabilities**: CSV export functionality
- **User Management**: Admin can manage system users
- **Company Branding**: Customizable colors and branding

## 🛠 Tech Stack

### Frontend
- **Next.js 13** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** components
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates

### Backend
- **Express.js** with TypeScript
- **Socket.IO** for real-time communication
- **Prisma ORM** with PostgreSQL
- **JWT Authentication**
- **bcryptjs** for password hashing

### Database
- **PostgreSQL** with Prisma ORM
- Comprehensive schema with relationships
- Activity logging and audit trails

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ananka-fasteners-crm
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials and JWT secret.

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Users
- **Admin**: admin@ananka.com / password123
- **Sales**: sales@ananka.com / password123

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

This will start:
- PostgreSQL database on port 5432
- Application on ports 3000 and 5000

### Production Deployment

1. **Build Docker image**
   ```bash
   docker build -t ananka-crm .
   ```

2. **Run with environment variables**
   ```bash
   docker run -e DATABASE_URL="your-db-url" -e JWT_SECRET="your-secret" -p 3000:3000 -p 5000:5000 ananka-crm
   ```

## 📊 Database Schema

### Core Tables
- **Users**: System users with role-based access
- **Leads**: Customer leads with comprehensive tracking
- **ActivityLog**: Audit trail for lead activities  
- **Company**: Branding and configuration settings

### Key Features
- UUID primary keys for security
- Comprehensive lead tracking with status workflows
- Activity logging for audit trails
- Enum types for status consistency

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Leads
- `GET /api/leads` - List leads (with pagination/filtering)
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/analytics/export` - Export leads to CSV

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 UI/UX Features

### Design System
- **Colors**: Steel Blue (#4682B4), Dark Gray (#333333), Accent Yellow (#FFD700)
- **Components**: shadcn/ui with custom Ananka branding
- **Typography**: Clean, professional fonts with proper hierarchy
- **Responsive**: Mobile-first design with breakpoints

### Interactive Elements
- Real-time notifications via Socket.IO
- Loading states and skeleton screens
- Form validation and error handling
- Hover states and micro-interactions

## 🔐 Security Features

- JWT-based authentication with secure tokens
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS configuration for API security

## 🚀 Performance Optimizations

- Server-side pagination for large datasets
- Efficient database queries with Prisma
- Real-time updates to minimize data refetching
- Optimized bundle size with Next.js
- Docker multi-stage builds for production

## 📝 Development Scripts

```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run start        # Start production servers
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (dev only)
npm run setup        # Install all dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints and schema

---

Built with ❤️ for Ananka Fasteners