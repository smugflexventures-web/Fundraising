# CampusFund - Secure Campus Fundraising and Donation Management System

A comprehensive web application for managing student financial assistance requests, fundraising campaigns, and secure donations.

## 🎯 Overview

CampusFund is a secure, production-ready platform that connects students in need with donors who want to make a difference. The system provides role-based access for students, donors, and administrators with full CRUD operations, payment integration, and real-time analytics.

## 🏗️ Tech Stack

### Frontend
- **React.js 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **Axios** - HTTP client
- **React Router DOM 6** - Routing
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Recharts** - Charts & Analytics
- **jwt-decode** - JWT token decoding

### Backend
- **PHP 8+** - Server-side language
- **REST API Architecture** - API design
- **Firebase PHP-JWT** - JWT authentication
- **PHPMailer** - Email notifications
- **vlucas/phpdotenv** - Environment variables
- **Composer** - Dependency management

### Database
- **MySQL** - Relational database

### Server
- **Apache/XAMPP** - Web server

## 📁 Project Structure

```
ppp/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── auth/        # Auth pages
│   │   │   ├── donor/       # Donor pages
│   │   │   └── student/     # Student pages
│   │   ├── routes/          # Route configuration
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                  # PHP backend
│   ├── app/
│   │   ├── Controllers/     # API controllers
│   │   ├── Core/            # Core framework
│   │   ├── Helpers/         # Helper classes
│   │   ├── Middleware/      # Auth & role middleware
│   │   └── Models/          # Database models
│   ├── config/
│   ├── public/
│   │   └── index.php        # Entry point
│   ├── routes/
│   │   └── api.php          # API routes
│   ├── storage/
│   ├── uploads/             # File uploads
│   ├── .env
│   ├── .env.example
│   ├── .htaccess
│   └── composer.json
├── database/
│   └── campus_fund.sql      # Database schema & seed
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- XAMPP (Apache + MySQL) or equivalent
- Node.js 18+ and npm
- PHP 8.0+
- Composer

### 1. Database Setup

1. Start MySQL server (via XAMPP or standalone)
2. Open phpMyAdmin or MySQL CLI
3. Import the database schema:
   ```bash
   mysql -u root -p < database/campus_fund.sql
   ```
   Or import `database/campus_fund.sql` via phpMyAdmin

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database and mail credentials
```

**Start the PHP server:**
```bash
# Option 1: Using PHP built-in server
composer start
# or: php -S localhost:8000 -t public

# Option 2: Using XAMPP
# Place the backend folder in htdocs/
# Configure Apache virtual host to point to backend/public
```

### 3. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
# Server runs at http://localhost:5173

# Build for production
npm run build
```

### 4. Environment Configuration

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=campus_fund
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_secure_random_string_here
JWT_EXPIRATION=86400

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

## 👥 User Roles

### Student
- Register and login
- Submit financial assistance requests
- Upload supporting documents
- Track request status
- Receive notifications
- View approved support

### Donor
- Register and login
- Browse active campaigns
- Donate securely via Paystack
- View donation history
- Track donation impact

### Administrator
- Manage all users
- Verify student accounts
- Approve/reject assistance requests
- Create and manage fundraising campaigns
- Monitor all donations
- Generate reports (CSV export)
- View activity logs
- Manage system settings

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/campaigns/featured` | Featured campaigns |
| GET | `/api/campaigns/{id}` | Campaign details |
| POST | `/api/campaigns` | Create campaign (Admin) |
| PUT | `/api/campaigns/{id}` | Update campaign (Admin) |
| DELETE | `/api/campaigns/{id}` | Delete campaign (Admin) |

### Student Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | List requests |
| GET | `/api/requests/{id}` | Request details |
| POST | `/api/requests` | Create request |
| PUT | `/api/requests/{id}` | Update request |
| PUT | `/api/requests/{id}/status` | Update status (Admin) |
| DELETE | `/api/requests/{id}` | Delete request |
| POST | `/api/requests/{id}/documents` | Upload documents |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | List donations |
| GET | `/api/donations/{id}` | Donation details |
| POST | `/api/donations/initialize` | Initialize payment |
| POST | `/api/donations/verify` | Verify payment |
| GET | `/api/donations/history` | Donor history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/{id}` | Delete notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/{id}/verify` | Verify user |
| PUT | `/api/admin/users/{id}/toggle-status` | Toggle active |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/activity-logs` | Activity logs |
| GET | `/api/admin/reports` | Generate reports |

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth with expiration
- **bcrypt Password Hashing** - Industry-standard password storage
- **SQL Injection Prevention** - PDO prepared statements throughout
- **XSS Protection** - Input sanitization and output encoding
- **CSRF Protection** - Token-based CSRF defense
- **Rate Limiting** - Request throttling middleware
- **File Upload Validation** - Type, size, and MIME verification
- **Role-Based Access Control** - Middleware-protected routes
- **Input Validation** - Server-side validation for all endpoints
- **CORS Configuration** - Controlled cross-origin access
- **Security Headers** - X-Content-Type-Options, X-Frame-Options, etc.

## 💳 Payment Integration

Paystack payment gateway is integrated for secure donation processing:

1. Donor initiates donation
2. Backend initializes Paystack transaction
3. Donor is redirected to Paystack payment page
4. After payment, Paystack callback verifies transaction
5. Donation status is updated and notifications sent

Configure your Paystack keys in `backend/.env`.

## 📧 Email Notifications

The system sends emails for:
- Welcome emails on registration
- Password reset requests
- Donation confirmations
- Request status updates (approved/rejected/funded)

Configure SMTP settings in `backend/.env`.

## 📊 Database Schema

9 tables with proper relationships, foreign keys, indexes, and constraints:
- `users` - User accounts (students, donors, admins)
- `student_requests` - Financial assistance requests
- `request_documents` - Supporting documents
- `campaigns` - Fundraising campaigns
- `donations` - Donation records
- `payments` - Payment transaction records
- `notifications` - User notifications
- `password_resets` - Password reset tokens
- `activity_logs` - System activity audit trail
- `settings` - System configuration

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusfund.edu | password |
| Student | john@student.edu | password |
| Student | jane@student.edu | password |
| Donor | donor1@email.com | password |
| Donor | donor2@email.com | password |

## 📝 License

This project is developed as a Final Year Project for academic purposes.

© 2024 CampusFund. All rights reserved.
