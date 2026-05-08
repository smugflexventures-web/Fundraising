# CampusFund — Campus Financial Assistance & Contribution Platform

A structured web platform for managing student financial assistance requests, fundraising campaigns, and secure contributions within a university community.

## Overview

CampusFund connects students facing financial hardship with contributors who want to support their education. The platform provides role-based access for students, contributors, and administrators — with full request management, Paystack payment integration, email notifications, and operational analytics.

## Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite 5** — Build tooling
- **Tailwind CSS 3** — Utility-first styling
- **Axios** — HTTP client
- **React Router DOM 6** — Client-side routing
- **React Toastify** — Toast notifications
- **Framer Motion** — Motion and transitions
- **Lucide React** — Icon library
- **Recharts** — Data visualization
- **jwt-decode** — Client-side JWT parsing

### Backend
- **PHP 8+** — Server-side runtime
- **REST API** — Stateless endpoint architecture
- **Firebase PHP-JWT** — Token-based authentication
- **PHPMailer** — Transactional email delivery
- **vlucas/phpdotenv** — Environment configuration
- **Composer** — Dependency management

### Database
- **MySQL** — Relational data storage

### Server
- **Apache** — Production web server (cPanel deployment)

## Project Structure

```
ppp/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # Shared UI components
│   │   ├── context/         # Auth context provider
│   │   ├── layouts/         # Dashboard, Admin, Main layouts
│   │   ├── pages/
│   │   │   ├── admin/       # Admin panel pages
│   │   │   ├── Auth/        # Login, Register, Password Reset
│   │   │   ├── donor/       # Contributor dashboard & pages
│   │   │   └── student/     # Student dashboard & pages
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # API service modules
│   │   ├── utils/           # Helpers, formatters, validators
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                  # PHP REST API
│   ├── app/
│   │   ├── Controllers/     # Request handlers
│   │   ├── Core/            # App bootstrap, Database, Response
│   │   ├── Helpers/         # Mailer, Validator, JWT, Helpers
│   │   ├── Middleware/      # Auth, Role-based guards
│   │   └── Models/          # Data access layer
│   ├── public/
│   │   └── index.php        # API entry point
│   ├── routes/
│   │   └── api.php          # Route definitions
│   ├── uploads/             # User-uploaded files
│   ├── .env.example
│   ├── .htaccess
│   └── composer.json
├── database/
│   └── campus_fund.sql      # Schema and seed data
├── deploy/                   # Production deployment bundle
│   └── public_html/
└── README.md
```

## Setup Instructions

### Prerequisites
- XAMPP (Apache + MySQL) or equivalent
- Node.js 18+ and npm
- PHP 8.0+
- Composer

### 1. Database Setup

1. Start MySQL server
2. Open phpMyAdmin or MySQL CLI
3. Import the schema:
   ```bash
   mysql -u root -p < database/campus_fund.sql
   ```

### 2. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database, mail, and Paystack credentials
```

**Start the PHP server:**
```bash
# Using PHP built-in server
php -S localhost:8000 -t public

# Or place in XAMPP htdocs and configure Apache virtual host
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build to dist/
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

## User Roles

### Student
- Register and sign in
- Submit financial assistance requests
- Upload supporting documents
- Track request status through review stages
- Receive status update notifications

### Contributor
- Register and sign in
- Browse active fundraising campaigns
- Contribute securely via Paystack
- View contribution history
- Track contribution impact

### Administrator
- Manage user accounts and verification
- Review and process assistance requests
- Create and manage fundraising campaigns
- Monitor all contributions and payments
- Generate and export reports
- Review system activity logs
- Configure platform settings

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current account |
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
| DELETE | `/api/campaigns/{id}` | Remove campaign (Admin) |

### Student Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | List assistance requests |
| GET | `/api/requests/{id}` | Request details |
| POST | `/api/requests` | Submit request |
| PUT | `/api/requests/{id}` | Update request |
| PUT | `/api/requests/{id}/status` | Update status (Admin) |
| DELETE | `/api/requests/{id}` | Withdraw request |
| POST | `/api/requests/{id}/documents` | Upload documents |

### Contributions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | List contributions |
| GET | `/api/donations/{id}` | Contribution details |
| POST | `/api/donations/initialize` | Initialize payment |
| POST | `/api/donations/verify` | Verify payment |
| GET | `/api/donations/history` | Contributor history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/{id}` | Remove notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List accounts |
| PUT | `/api/admin/users/{id}/verify` | Verify account |
| PUT | `/api/admin/users/{id}/toggle-status` | Toggle active status |
| DELETE | `/api/admin/users/{id}` | Remove account |
| GET | `/api/admin/activity-logs` | Action log |
| GET | `/api/admin/reports` | Generate reports |

## Security

- **JWT Authentication** — Token-based session management with expiration
- **bcrypt Password Hashing** — Secure password storage
- **SQL Injection Prevention** — PDO prepared statements
- **XSS Protection** — Input sanitization and output encoding
- **File Upload Validation** — Type, size, and MIME verification
- **Role-Based Access Control** — Middleware-protected routes
- **Input Validation** — Server-side validation on all endpoints
- **CORS Configuration** — Controlled cross-origin access
- **Security Headers** — X-Content-Type-Options, X-Frame-Options

## Payment Integration

Paystack payment gateway handles contribution processing:

1. Contributor selects amount and initiates payment
2. Backend initializes Paystack transaction
3. Contributor completes payment on Paystack
4. Paystack callback verifies transaction
5. Contribution is recorded and notifications dispatched

Configure Paystack keys in `backend/.env`.

## Email Notifications

Transactional emails are sent for:
- Account registration confirmation
- Password reset requests
- Contribution receipts
- Request status updates (approved, rejected, funded)

Configure SMTP settings in `backend/.env`.

## Database Schema

10 tables with relationships, foreign keys, indexes, and constraints:
- `users` — Account records (students, contributors, admins)
- `student_requests` — Financial assistance requests
- `request_documents` — Supporting document attachments
- `campaigns` — Fundraising campaigns
- `donations` — Contribution records
- `payments` — Payment transaction logs
- `notifications` — In-app notification records
- `password_resets` — Password reset tokens
- `activity_logs` — Administrative action audit trail
- `settings` — Platform configuration values

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusfund.edu | password |
| Student | john@student.edu | password |
| Student | jane@student.edu | password |
| Contributor | donor1@email.com | password |
| Contributor | donor2@email.com | password |

## Deployment

See `DEPLOYMENT.md` for full cPanel deployment instructions.

Domain: `anns.com.gracelandroyalacademy.com.ng`

## License

© 2024 CampusFund. All rights reserved.
