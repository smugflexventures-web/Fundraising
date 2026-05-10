# CampusFund — Campus Financial Assistance & Contribution Platform

**A Full-Stack Web Application for Managing Student Financial Aid Requests, Fundraising Campaigns, and Secure Online Contributions**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Aim and Objectives](#3-aim-and-objectives)
4. [Scope of the Project](#4-scope-of-the-project)
5. [Significance of the Study](#5-significance-of-the-study)
6. [Literature Review](#6-literature-review)
7. [System Architecture](#7-system-architecture)
8. [Technology Stack](#8-technology-stack)
9. [System Design](#9-system-design)
10. [Database Design](#10-database-design)
11. [System Implementation](#11-system-implementation)
12. [User Roles and Functionalities](#12-user-roles-and-functionalities)
13. [Application Screens and User Interface](#13-application-screens-and-user-interface)
14. [API Documentation](#14-api-documentation)
15. [Payment Integration](#15-payment-integration)
16. [Security Implementation](#16-security-implementation)
17. [Setup and Installation](#17-setup-and-installation)
18. [Deployment](#18-deployment)
19. [Testing](#19-testing)
20. [Project Structure](#20-project-structure)
21. [Limitations](#21-limitations)
22. [Future Work](#22-future-work)
23. [References](#23-references)

---

## 1. Introduction

CampusFund is a web-based platform designed to bridge the gap between students facing financial hardship and contributors willing to support their education within a university community. The system provides a structured, transparent, and secure mechanism for students to submit financial assistance requests, administrators to review and approve them, and contributors (donors) to fund them through an integrated payment gateway.

Traditional methods of student financial aid management in Nigerian universities rely heavily on manual processes — paper-based applications, physical committee reviews, and cash-based disbursements — which are slow, opaque, and error-prone. CampusFund digitizes the entire lifecycle from request submission through approval to funding, providing real-time tracking, automated notifications, and comprehensive audit trails.

The platform serves three distinct user roles: **Students** who request financial assistance, **Donors** who contribute funds, and **Administrators** who manage the platform, review requests, and oversee operations. Each role has a dedicated dashboard with role-specific functionality and data views.

---

## 2. Problem Statement

In many Nigerian university campuses, students frequently face financial emergencies — tuition shortfalls, medical bills, housing crises, and inability to purchase study materials. The existing support mechanisms suffer from:

- **Lack of Transparency**: Students cannot track the status of their requests or know how much has been raised on their behalf.
- **No Centralized Platform**: Financial aid is managed through disparate channels (departmental bursaries, religious bodies, personal appeals) with no unified system.
- **Manual and Slow Processes**: Paper-based applications require physical submission, manual review, and in-person follow-ups.
- **Absence of Secure Payment Infrastructure**: Cash donations are difficult to track, prone to mismanagement, and lack audit trails.
- **No Accountability**: Donors have no visibility into how their contributions are used, and students have no structured way to demonstrate genuine need.
- **Inefficient Communication**: Students are not proactively notified about the status of their requests, leading to anxiety and repeated inquiries.

---

## 3. Aim and Objectives

### Aim
To design and implement a web-based Campus Financial Assistance and Contribution Platform that provides a transparent, secure, and efficient system for managing student financial aid requests and facilitating online contributions.

### Objectives

1. **To develop a role-based access control system** that differentiates between student, donor, and administrator functionalities with secure JWT-based authentication.
2. **To implement a structured request management workflow** enabling students to submit financial assistance requests with supporting documents, and administrators to review, approve, or reject them with recorded decisions.
3. **To integrate dual secure payment methods** — Paystack (supporting card, bank transfer, bank account, USSD, and mobile money) and Manual Bank Transfer (with proof upload and admin verification) — enabling donors to contribute directly to campaigns or approved student requests with real-time or admin-verified payment confirmation.
4. **To build a comprehensive notification system** that delivers real-time in-app and email notifications to users at critical workflow stages (request approval, funding received, full funding achieved).
5. **To create an administrative dashboard** with operational analytics, user management, activity logging, and reporting capabilities for platform oversight.
6. **To implement a fundraising campaign system** that allows administrators to create targeted campaigns with progress tracking and featured placement.

---

## 4. Scope of the Project

The project covers the following functional areas:

- **User Registration and Authentication**: Multi-role account creation, email verification, password recovery, and JWT session management.
- **Student Financial Request Management**: Request submission with category classification, priority levels, document uploads, and status tracking (pending → approved → funded).
- **Fundraising Campaign Management**: Campaign creation, editing, image uploads, progress tracking, featured campaigns, and category filtering.
- **Online Contribution Processing**: Dual payment methods — Paystack (card, bank transfer, bank account, USSD, mobile money) with inline popup and redirect flows, and Manual Bank Transfer with proof of payment upload and admin verification.
- **Notification System**: In-app notifications with read/unread tracking, and email notifications for critical events.
- **Administrative Operations**: User management, request review, campaign administration, contribution monitoring, activity logging, report generation, and platform settings.
- **Dashboard Analytics**: Role-specific dashboards with statistical summaries, charts, and recent activity displays.

**Out of Scope**: Mobile application, cryptocurrency payments, multi-campus support, automated fund disbursement to bank accounts, and chat/messaging between users.

---

## 5. Significance of the Study

1. **Digital Transformation of Campus Aid**: Replaces manual, paper-based financial aid processes with a streamlined digital workflow.
2. **Transparency and Accountability**: Every action is logged, every donation is tracked, and every request has a clear audit trail from submission to funding.
3. **Financial Inclusion**: Enables students from economically disadvantaged backgrounds to access financial support through a formal, structured channel.
4. **Secure Payment Processing**: Integration with Paystack ensures PCI-DSS compliant payment handling, protecting both donors and the institution.
5. **Real-Time Tracking**: Students can monitor their request progress, donors can see their contribution impact, and administrators have full operational visibility.
6. **Scalable Architecture**: The RESTful API design allows future extension to mobile applications and integration with university systems.
7. **Data-Driven Decision Making**: Administrative dashboards and reports provide actionable insights into funding patterns, request categories, and platform growth.

---

## 6. Literature Review

### 6.1 Existing Systems and Approaches

**GoFundMe** (gofundme.com) is a general-purpose crowdfunding platform that allows individuals to create fundraising campaigns. While it provides payment processing and social sharing, it lacks the institutional context, role-based workflows, and request approval processes needed in a campus environment.

**Ketto** (ketto.org) is an India-based crowdfunding platform focused on medical and educational causes. It provides campaign creation and payment integration but does not offer a structured request-review-approve workflow or administrative oversight.

**University Bursary Systems** in Nigerian universities typically operate as internal accounting tools focused on disbursement tracking rather than request management, donor engagement, or transparent funding progress.

### 6.2 Technology Context

**Single-Page Applications (SPAs)** built with React have become the standard for interactive web applications, offering responsive user experiences without full page reloads.

**RESTful API architecture** using PHP remains a practical choice for deployment on shared hosting environments common in Nigerian institutions, where server configuration control is limited.

**Paystack** provides a Nigerian-focused payment gateway with card, bank transfer, bank account, USSD, and mobile money support, making it suitable for the local context where international payment processors like Stripe have limited coverage. **Manual Bank Transfer** provides an alternative for donors who prefer direct bank deposits, with a verification workflow where administrators review uploaded proof of payment before confirming contributions.

**JWT (JSON Web Tokens)** provide stateless authentication suitable for SPA architectures, eliminating server-side session storage requirements (Jones et al., 2015).

### 6.3 Gap in Existing Solutions

No existing platform combines:
- Institutional role-based access (student/donor/admin)
- Structured request approval workflow
- Direct donation to both campaigns and individual student requests
- Integrated Nigerian payment processing
- Comprehensive administrative oversight with audit trails

CampusFund addresses this gap by providing a purpose-built solution for the campus financial aid context.

---

## 7. System Architecture

The system follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                           │
│                   React SPA (Frontend)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Student   │  │  Donor   │  │  Admin   │  │  Public  │      │
│  │ Dashboard │  │Dashboard │  │Dashboard │  │  Pages   │      │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│        └─────────────┼──────────────┼──────────────┘           │
│                      │  Axios HTTP Client + JWT                │
│                      ▼                                         │
├─────────────────────────────────────────────────────────────────┤
│                      LOGIC TIER                                │
│                  PHP REST API (Backend)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │  Auth     │  │ Campaign │  │ Donation │  │  Admin   │  │Bank Transfer │     │
│  │Controller │  │Controller│  │Controller│  │Controller│  │  Controller  │     │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘     │
│        └─────────────┼──────────────┼──────────────┘          │
│              Middleware (Auth, Role, Rate Limit)                │
│                      │                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │  Models   │  │ Helpers  │  │Validator │                    │
│  │(Data Acc) │  │(Util/Mail)│  │(Input)   │                    │
│  └─────┬────┘  └──────────┘  └──────────┘                    │
│        │                                                       │
├────────┼───────────────────────────────────────────────────────┤
│        ▼              DATA TIER                                │
│                   MySQL Database                               │
│  ┌──────────────────────────────────────────┐                 │
│  │  users | student_requests | campaigns    │                 │
│  │  donations | payments | notifications    │                 │
│  │  bank_transfer_proofs | activity_logs   │                 │
│  │  settings | password_resets | ...       │                 │
│  └──────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. The React SPA sends HTTP requests to the PHP REST API with JWT tokens in the `Authorization` header.
2. The API routes requests through middleware (authentication, role verification, rate limiting).
3. Controllers handle business logic, invoke models for data access, and return JSON responses.
4. The Paystack payment gateway is called server-to-server for transaction initialization and verification.
5. Email notifications are dispatched asynchronously via PHPMailer SMTP.

---

## 8. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | Component-based UI framework |
| Vite | 5.0 | Build tool and dev server |
| Tailwind CSS | 3.3 | Utility-first CSS framework |
| React Router DOM | 6.20 | Client-side routing |
| Axios | 1.6 | HTTP client with interceptors |
| Recharts | 2.10 | Data visualization (charts) |
| Framer Motion | 10.16 | Animations and transitions |
| Lucide React | 0.294 | Icon library |
| React Toastify | 10.0 | Toast notification UI |
| jwt-decode | 4.0 | Client-side JWT token parsing |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| PHP | 8.0+ | Server-side runtime |
| Firebase PHP-JWT | 6.8 | JWT token generation and verification |
| PHPMailer | 6.8 | SMTP email delivery |
| vlucas/phpdotenv | 5.5 | Environment variable management |
| Composer | 2.x | PHP dependency management |

### Database

| Technology | Purpose |
|-----------|---------|
| MySQL 8.0+ | Relational database with InnoDB engine, utf8mb4 charset |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Apache | Web server with mod_rewrite for URL routing |
| cPanel | Production hosting management |
| Paystack | Nigerian payment gateway (card, bank transfer, bank account, USSD, mobile money) |
| Let's Encrypt | SSL/TLS certificate |

---

## 9. System Design

### 9.1 Use Case Diagram

**Student Use Cases:**
- Register account
- Login / Logout
- Submit financial assistance request
- Upload supporting documents
- View request status and funding progress
- Edit pending requests
- View notifications
- Update profile and change password

**Donor Use Cases:**
- Register account
- Login / Logout
- Browse active campaigns
- View campaign details and progress
- Contribute to a campaign (via Paystack or Manual Bank Transfer)
- Contribute directly to a student request
- Upload proof of payment for bank transfer
- View contribution history with payment method and verification status
- View contribution statistics
- Donate anonymously
- View notifications
- Update profile and change password

**Administrator Use Cases:**
- Login / Logout
- View operational dashboard with analytics
- Manage users (list, verify, activate/deactivate, delete)
- Review student requests (approve, reject, mark as funded)
- Copy donation link for approved requests
- Create, edit, and delete fundraising campaigns
- View all contribution records
- Verify or reject bank transfer donations with proof review
- Generate reports
- View activity logs
- Configure platform settings (including bank account details for manual transfers)

### 9.2 Donation Flow Sequence

```
Donor                Frontend              Backend              Paystack         Student
  │                    │                     │                    │                │
  │  Select Amount     │                     │                    │                │
  │───────────────────>│                     │                    │                │
  │                    │  POST /donations/   │                    │                │
  │                    │  initialize         │                    │                │
  │                    │────────────────────>│                    │                │
  │                    │                     │  Create donation   │                │
  │                    │                     │  (status:pending)  │                │
  │                    │                     │  Create payment    │                │
  │                    │                     │  (status:init)     │                │
  │                    │                     │───────────────────>│                │
  │                    │                     │  Initialize        │                │
  │                    │                     │  transaction       │                │
  │                    │                     │<──────────────────│                │
  │                    │  Return auth_url    │                    │                │
  │                    │  + public_key       │                    │                │
  │                    │<────────────────────│                    │                │
  │  Open Paystack     │                     │                    │                │
  │  popup/redirect    │                     │                    │                │
  │──────────────────────────────────────────────────────────────>│                │
  │  Complete payment  │                     │                    │                │
  │<──────────────────────────────────────────────────────────────│                │
  │                    │  POST /donations/   │                    │                │
  │                    │  verify             │                    │                │
  │                    │────────────────────>│                    │                │
  │                    │                     │  Verify with       │                │
  │                    │                     │  Paystack API      │                │
  │                    │                     │───────────────────>│                │
  │                    │                     │<──────────────────│                │
  │                    │                     │  Update donation   │                │
  │                    │                     │  status=completed  │                │
  │                    │                     │  Update campaign   │                │
  │                    │                     │  raised_amount     │                │
  │                    │                     │  Update request    │                │
  │                    │                     │  amount_funded     │                │
  │                    │                     │                    │  Notification   │
  │                    │                     │                    │───────────────>│
  │                    │                     │                    │  Email          │
  │                    │                     │                    │───────────────>│
  │                    │  Return success     │                    │                │
  │                    │<────────────────────│                    │                │
  │  Show confirmation │                     │                    │                │
  │<───────────────────│                     │                    │                │
```

### 9.2b Bank Transfer Donation Flow Sequence

```
Donor                Frontend              Backend              Admin            Student
  │                    │                     │                    │                │
  │  Select Amount     │                     │                    │                │
  │  + Bank Transfer   │                     │                    │                │
  │───────────────────>│                     │                    │                │
  │                    │  POST /bank-transfer│                    │                │
  │                    │  /initialize        │                    │                │
  │                    │────────────────────>│                    │                │
  │                    │                     │  Create donation   │                │
  │                    │                     │  (status:pending_  │                │
  │                    │                     │   verification)    │                │
  │                    │                     │  Create payment    │                │
  │                    │                     │  Create proof rec  │                │
  │                    │  Return bank        │                    │                │
  │                    │  account details    │                    │                │
  │                    │<────────────────────│                    │                │
  │  Show bank details │                     │                    │                │
  │  + proof form      │                     │                    │                │
  │<───────────────────│                     │                    │                │
  │  Make external     │                     │                    │                │
  │  bank transfer     │                     │                    │                │
  │  Upload proof      │                     │                    │                │
  │───────────────────>│                     │                    │                │
  │                    │  POST /bank-transfer│                    │                │
  │                    │  /{id}/submit-proof │                    │                │
  │                    │────────────────────>│                    │                │
  │                    │                     │  Validate + save   │                │
  │                    │                     │  proof file        │                │
  │                    │  Return submitted   │                    │                │
  │                    │<────────────────────│                    │                │
  │  Show "pending     │                     │                    │                │
  │  verification"     │                     │                    │                │
  │<───────────────────│                     │                    │                │
  │                    │                     │                    │                │
  │          ... Admin reviews pending transfer ...               │                │
  │                    │                     │                    │                │
  │                    │                     │  GET /bank-transfer│                │
  │                    │                     │  /pending          │                │
  │                    │                     │<───────────────────│                │
  │                    │                     │  Return pending    │                │
  │                    │                     │  transfers + proof │                │
  │                    │                     │───────────────────>│                │
  │                    │                     │                    │                │
  │                    │                     │  POST /bank-transfer│               │
  │                    │                     │  /{id}/verify      │                │
  │                    │                     │<───────────────────│               │
  │                    │                     │  Update donation   │                │
  │                    │                     │  status=completed  │                │
  │                    │                     │  Update campaign   │                │
  │                    │                     │  raised_amount     │                │
  │                    │                     │  Update request    │                │
  │                    │                     │  amount_funded     │                │
  │                    │                     │                    │  Notification  │
  │                    │                     │                    │───────────────>│
  │                    │                     │                    │  Email         │
  │                    │                     │                    │───────────────>│
```

### 9.3 Request Lifecycle State Machine

```
                    ┌──────────┐
                    │ PENDING  │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ▼          │          ▼
       ┌──────────┐     │    ┌──────────┐
       │ APPROVED │     │    │ REJECTED │
       └────┬─────┘     │    └──────────┘
            │           │
            ▼           │
       ┌──────────┐     │
       │  FUNDED  │<────┘  (Admin marks funded OR
       └──────────┘        donation auto-funds when
                            amount_funded >= amount_needed)
```

### 9.4 Donation Lifecycle State Machine

```
                    ┌──────────┐
         ┌────────>│ PENDING  │<──────────────────────┐
         │         └────┬─────┘                       │
         │              │                             │
         │    ┌─────────┼──────────┐                  │
         │    ▼         │          ▼                  │
         │ ┌──────────────┐   ┌──────────┐           │
         │ │ PENDING_     │   │COMPLETED │           │
         │ │ VERIFICATION │   └──────────┘           │
         │ └──────┬───────┘         ▲                │
         │        │                 │                │
         │   ┌────┼─────┐          │                │
         │   ▼         ▼          │                │
         │ ┌────────┐ ┌────────┐  │                │
         │ │FAILED  │ │REJECTED│  │                │
         │ │(admin  │ │(admin  │  │                │
         │ │ reject)│ │ reject)│  │                │
         │ └────────┘ └────────┘  │                │
         │        │                 │                │
         │        │  (admin verify) │                │
         │        └────────────────┘                │
         │                                          │
         │           (Paystack verify success)      │
         └──────────────────────────────────────────┘

  PENDING ───────────> COMPLETED   (Paystack auto-verify)
  PENDING ───────────> FAILED      (Paystack verify fail)
  PENDING_VERIFICATION > COMPLETED (Admin approve)
  PENDING_VERIFICATION > FAILED    (Admin reject)
```

---

## 10. Database Design

### 10.1 Entity-Relationship Overview

```
users ──1:N── student_requests ──1:N── request_documents
  │                │
  │                │ (via donations.request_id)
  │                │
  ├──1:N── donations ──1:N── payments
  │            │
  │            ├──1:1── bank_transfer_proofs
  │            │
  │            │ (via donations.campaign_id)
  │            │
  ├──1:N── notifications       campaigns ──1:N── donations
  │
  ├──1:N── activity_logs
  │
  └──1:N── password_resets

settings (independent key-value store)
```

### 10.2 Table Definitions

#### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password | VARCHAR(255) | NOT NULL | bcrypt hash |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | NULLABLE | Phone number |
| role | ENUM('student','donor','admin') | NOT NULL, DEFAULT 'student' | User role |
| avatar | VARCHAR(500) | NULLABLE | Profile image path |
| student_id | VARCHAR(50) | NULLABLE | Matriculation number |
| department | VARCHAR(100) | NULLABLE | Department name |
| level | VARCHAR(20) | NULLABLE | Academic level |
| is_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verified |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active |
| email_verified_at | TIMESTAMP | NULLABLE | Verification timestamp |
| last_login | TIMESTAMP | NULLABLE | Last login timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

#### `student_requests`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Request identifier |
| user_id | INT | FK → users(id), NOT NULL | Student who submitted |
| title | VARCHAR(255) | NOT NULL | Request title |
| description | TEXT | NOT NULL | Detailed description |
| amount_needed | DECIMAL(12,2) | NOT NULL | Required amount (NGN) |
| amount_funded | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00 | Amount received so far |
| category | ENUM('tuition','housing','medical','feeding','books','emergency','other') | NOT NULL, DEFAULT 'other' | Request category |
| status | ENUM('pending','approved','rejected','funded') | NOT NULL, DEFAULT 'pending' | Current status |
| priority | ENUM('low','medium','high','critical') | NOT NULL, DEFAULT 'medium' | Priority level |
| admin_notes | TEXT | NULLABLE | Admin review notes |
| reviewed_by | INT | FK → users(id), NULLABLE | Admin who reviewed |
| reviewed_at | TIMESTAMP | NULLABLE | Review timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Submission timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

#### `campaigns`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Campaign identifier |
| title | VARCHAR(255) | NOT NULL | Campaign title |
| description | TEXT | NOT NULL | Full description |
| short_description | VARCHAR(500) | NULLABLE | Summary text |
| target_amount | DECIMAL(12,2) | NOT NULL | Fundraising goal (NGN) |
| raised_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00 | Amount raised so far |
| image | VARCHAR(500) | NULLABLE | Campaign image path |
| category | ENUM('tuition','housing','medical','feeding','books','emergency','general') | NOT NULL, DEFAULT 'general' | Campaign category |
| status | ENUM('draft','active','paused','completed','closed') | NOT NULL, DEFAULT 'active' | Campaign status |
| start_date | DATE | NULLABLE | Campaign start |
| end_date | DATE | NULLABLE | Campaign end |
| created_by | INT | FK → users(id), NOT NULL | Admin who created |
| is_featured | BOOLEAN | NOT NULL, DEFAULT FALSE | Featured on homepage |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

#### `donations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Donation identifier |
| donor_id | INT | FK → users(id), NOT NULL | Donor who contributed |
| campaign_id | INT | FK → campaigns(id), NULLABLE | Campaign (if applicable) |
| request_id | INT | FK → student_requests(id), NULLABLE | Student request (if applicable) |
| amount | DECIMAL(12,2) | NOT NULL | Contribution amount (NGN) |
| reference | VARCHAR(100) | UNIQUE, NULLABLE | Payment reference |
| message | TEXT | NULLABLE | Donor message |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT FALSE | Anonymous donation |
| status | ENUM('pending','pending_verification','completed','failed','refunded') | NOT NULL, DEFAULT 'pending' | Payment status |
| payment_method | VARCHAR(50) | NULLABLE | Payment method ('paystack' or 'bank_transfer') |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

#### `payments`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Payment identifier |
| donation_id | INT | FK → donations(id), NOT NULL | Associated donation |
| transaction_id | VARCHAR(255) | NULLABLE | Gateway transaction ID |
| provider | VARCHAR(50) | NOT NULL, DEFAULT 'paystack' | Payment provider |
| amount | DECIMAL(12,2) | NOT NULL | Amount in kobo/cents |
| currency | VARCHAR(10) | NOT NULL, DEFAULT 'NGN' | Currency code |
| status | ENUM('initialized','processing','pending_verification','success','failed') | NOT NULL, DEFAULT 'initialized' | Payment status |
| gateway_response | TEXT | NULLABLE | Raw gateway response |
| paid_at | TIMESTAMP | NULLABLE | Successful payment time |
| verified_by | INT | FK → users(id), NULLABLE | Admin who verified bank transfer |
| verified_at | TIMESTAMP | NULLABLE | Verification timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

#### `bank_transfer_proofs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Proof identifier |
| donation_id | INT | FK → donations(id), ON DELETE CASCADE | Associated donation |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_path | VARCHAR(500) | NOT NULL | Server storage path |
| file_type | VARCHAR(50) | NOT NULL | MIME type (PDF, JPG, PNG) |
| file_size | INT | NOT NULL | Size in bytes |
| bank_name | VARCHAR(100) | NULLABLE | Donor's bank name |
| account_name | VARCHAR(200) | NULLABLE | Donor's account name |
| transaction_reference | VARCHAR(100) | NULLABLE | Bank transaction reference |
| notes | TEXT | NULLABLE | Additional notes from donor |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |

#### `notifications`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Notification identifier |
| user_id | INT | FK → users(id), NOT NULL | Recipient user |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification body |
| type | ENUM('info','success','warning','error') | NOT NULL, DEFAULT 'info' | Notification type |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| link | VARCHAR(500) | NULLABLE | Navigation link |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

#### `request_documents`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Document identifier |
| request_id | INT | FK → student_requests(id), ON DELETE CASCADE | Parent request |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_path | VARCHAR(500) | NOT NULL | Server storage path |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size | INT | NOT NULL | Size in bytes |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |

#### `password_resets`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Token identifier |
| email | VARCHAR(255) | NOT NULL | User email |
| token | VARCHAR(255) | NOT NULL | Reset token hash |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Request timestamp |
| expires_at | TIMESTAMP | NOT NULL | Expiry timestamp |

#### `activity_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Log identifier |
| user_id | INT | FK → users(id), ON DELETE SET NULL | Acting user |
| action | VARCHAR(100) | NOT NULL | Action type |
| description | TEXT | NULLABLE | Action details |
| ip_address | VARCHAR(45) | NULLABLE | Client IP address |
| user_agent | VARCHAR(500) | NULLABLE | Client browser agent |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

#### `settings`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Setting identifier |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Configuration key |
| setting_value | TEXT | NULLABLE | Configuration value |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

### 10.3 Indexes

Performance indexes are defined on all foreign keys, frequently queried columns (status, role, email, created_at), and unique constraints (email, reference, setting_key).

---

## 11. System Implementation

### 11.1 Authentication Implementation

Authentication uses **JSON Web Tokens (JWT)** with the following flow:

1. User submits credentials to `POST /api/auth/login`
2. Backend verifies email/password against bcrypt hash in the database
3. On success, a JWT containing `user_id`, `email`, `role`, `is_active`, and `is_verified` is generated with a configurable expiration (default 24 hours)
4. The token is returned to the frontend and stored in `localStorage`
5. All subsequent API requests include the token in the `Authorization: Bearer <token>` header
6. The `AuthMiddleware` intercepts protected routes, verifies the token, and populates `$GLOBALS['auth_user']` with the decoded payload
7. On token expiration or 401 response, the frontend automatically redirects to the login page

### 11.2 Request Body Handling

The backend uses a centralized request body parsing mechanism:

- `php://input` is read once during bootstrap and stored in `$GLOBALS['request_body']`
- All controllers access `$GLOBALS['request_body']` instead of reading `php://input` directly, preventing the issue of stream consumption on multiple reads
- The `X-HTTP-Method-Override` header is supported for PUT/DELETE requests through POST, enabling compatibility with shared hosting environments (cPanel/Apache) that may block non-POST methods

### 11.3 Error Handling

All external service calls (email sending, activity logging, notification creation) are wrapped in `try/catch` blocks to prevent 500 errors from propagating to the user when non-critical services fail. Errors are logged via `error_log()` for debugging.

### 11.4 Frontend Architecture

The React SPA uses:
- **Context API** (`AuthContext`) for global authentication state management
- **Axios interceptors** for automatic token injection and 401 response handling
- **Lazy loading** (`React.lazy` + `Suspense`) for code-splitting and faster initial load
- **Protected routes** with role-based guards (`ProtectedRoute` component)
- **Method override headers** sent automatically for PUT/DELETE requests via the Axios request interceptor

### 11.5 Notification and Email System

The platform implements a dual notification system:

**In-App Notifications**: Stored in the `notifications` table and displayed in real-time on each user's notification panel. Each notification includes a type (info, success, warning, error), a link for navigation, and a read/unread status.

**Email Notifications**: Sent via PHPMailer SMTP for critical events:
- Account registration confirmation
- Password reset requests
- Contribution receipts (to donors)
- Request status updates (to students — approved, rejected, funded)
- Funding received notifications (to students)
- Request fully funded notifications (to students)

---

## 12. User Roles and Functionalities

### 12.1 Student

| Feature | Description |
|---------|-------------|
| Dashboard | View request statistics (total, pending, approved, funded, total requested, total funded) |
| Submit Request | Create financial assistance request with title, description, amount, category, priority, and supporting documents |
| Track Requests | View all submitted requests with status indicators and pagination |
| Request Details | View detailed request information, funding progress bar, admin notes, and uploaded documents |
| Notifications | Receive in-app and email notifications for request status changes and funding received |
| Profile | Update personal information and change password |

### 12.2 Donor

| Feature | Description |
|---------|-------------|
| Dashboard | View contribution statistics (total donated, number of donations, campaigns supported, pending amount), recent donations, and featured campaigns |
| Browse Campaigns | View all active campaigns with category filters, progress bars, and pagination |
| Campaign Details | View campaign description, progress, and recent donations |
| Donate to Campaign | Contribute to a specific campaign via Paystack (card, bank, USSD, mobile money) or Manual Bank Transfer, with preset or custom amounts, optional message, and anonymous option |
| Donate to Request | Contribute directly to an approved student request via Paystack or Manual Bank Transfer |
| Bank Transfer Flow | Select bank transfer method, view official bank account details, upload proof of payment (PDF/JPG/PNG), submit transaction reference, and track verification status |
| Contribution History | View all past contributions with payment method, status indicators (including "Pending Verification" for bank transfers), amounts, and dates |
| Payment Verification | Automatic verification after Paystack payment (inline popup or redirect callback); admin verification for manual bank transfers |
| Notifications | Receive in-app and email notifications for contribution confirmations |

### 12.3 Administrator

| Feature | Description |
|---------|-------------|
| Dashboard | View platform-wide analytics: user counts, donation totals, request statistics, monthly donation charts, category breakdown, recent transactions |
| User Management | List all users with role/status filters, verify user accounts, activate/deactivate, delete accounts |
| Request Review | Review student requests with status/priority filters, approve/reject/mark as funded with admin notes, copy donation link for approved requests |
| Campaign Management | Create, edit, delete campaigns with image uploads, set featured status, manage campaign status |
| Donation Monitoring | View all contribution records with donor info, campaign, amount, payment method, status, reference, and date |
| Bank Transfer Verification | View pending bank transfer submissions, preview uploaded proof documents, approve or reject with reason, update campaign totals upon approval |
| Reports | Generate and export platform reports |
| Activity Logs | Review all administrative actions with user, action type, IP address, and timestamp |
| Settings | Configure platform settings (site name, currency, donation limits, registration toggle, maintenance mode, bank account details for manual transfers) |

---

## 13. Application Screens and User Interface

This section describes every page in the application, its purpose, key UI elements, and how it functions. Screenshots should be inserted at the `![Screenshot](...)` placeholders.

---

### 13.1 Public Pages

#### 13.1.1 Landing Page (`/`)
**File**: `pages/LandingPage.jsx`

The homepage is the first page visitors see. It provides an overview of the platform and encourages registration.

**Key UI Elements:**
- **Hero Section**: Gradient background with platform tagline "Structured Student Financial Support", two call-to-action buttons — "Create Account" (links to `/register`) and "View Campaigns" (links to `/campaigns`)
- **Statistics Bar**: Three glass-morphism stat cards showing "Students Assisted", "Verified Contributions", and "Total Disbursed" — fetched from `GET /api/stats/public`
- **How It Works Section**: Three-step process cards (Create Account → Submit or Browse → Receive or Fund) with icons and descriptions
- **Featured Campaigns Section**: Grid of featured campaign cards with progress bars, category labels, and "Contribute" buttons — fetched from `GET /api/campaigns/featured`

**How It Functions**: On mount, the page fetches public statistics and featured campaigns in parallel. No authentication is required. Clicking "Contribute" on a campaign redirects donors to the donate page, students to register, and unauthenticated users to login.

![Landing Page Screenshot]()

---

#### 13.1.2 About Page (`/about`)
**File**: `pages/AboutPage.jsx`

Provides institutional information about the platform's purpose, integrity, and capabilities.

**Key UI Elements:**
- **Header Section**: Gradient banner with "About CampusFund" title and platform description
- **Purpose Section**: Two-column layout with descriptive text on the left and four feature cards (Secure, Verified, Accountable, Reviewed) on the right with animated entrance
- **Platform Capabilities Section**: Three cards — "For Students" (submit requests, track status, receive funds), "For Contributors" (review campaigns, contribute securely, track history), "Platform Integrity" (token auth, encrypted payments, audit logs)

**How It Functions**: This is a static informational page with no API calls. All content is hardcoded with Framer Motion animations for scroll-triggered reveals.

![About Page Screenshot]()

---

#### 13.1.3 Campaigns Page (`/campaigns`)
**File**: `pages/CampaignsPage.jsx`

Public listing of all active fundraising campaigns. Accessible without authentication.

**Key UI Elements:**
- **Page Header**: "Active Campaigns" title with subtitle
- **Category Filter Bar**: Horizontal button row for filtering by category (All, Tuition, Housing, Medical, Feeding, Books, Emergency, General) — each button triggers `fetchCampaigns()` with the selected category
- **Campaigns Grid**: 3-column responsive grid of campaign cards, each showing:
  - Campaign image (or gradient placeholder with heart icon)
  - "Featured" badge for featured campaigns
  - Category label pill
  - Campaign title (single line clamped)
  - Short description (two lines clamped)
  - Progress bar with raised/target amounts and percentage
  - "View Details" link to `/campaigns/{id}`
- **Pagination Component**: Page navigation at the bottom
- **Empty State**: Heart icon with "No active fundraising campaigns" message

**How It Functions**: On mount and when category/page changes, fetches `GET /api/campaigns?page={page}&per_page=9&category={category}`. Results are rendered as animated cards with staggered entrance. Clicking a card navigates to the campaign detail page.

![Campaigns Page Screenshot]()

---

#### 13.1.4 Campaign Detail Page (`/campaigns/:id`)
**File**: `pages/CampaignDetailPage.jsx`

Detailed view of a single campaign with full description, progress, and contribution button.

**Key UI Elements:**
- **Back Link**: "Back to Campaigns" navigation
- **Two-Column Layout**:
  - **Left Column (2/3 width)**: Campaign image, category pill, title, full description, and "Recent Contributions" list showing donor avatars (initials or "?" for anonymous), names, messages, and amounts
  - **Right Column (1/3 width, sticky sidebar)**: Progress bar with raised/target amounts and percentage, campaign metadata (goal, contributor count, end date), and "Contribute" button
- **Not Found State**: "This campaign could not be found" message

**How It Functions**: Fetches `GET /api/campaigns/{id}` on mount. The "Contribute" button checks authentication: unauthenticated users go to `/login`, donors go to `/donor/donate/{campaignId}`, other roles go to `/register`. The recent contributions list shows the last 5 donations for this campaign.

![Campaign Detail Page Screenshot]()

---

### 13.2 Authentication Pages

#### 13.2.1 Login Page (`/login`)
**File**: `pages/auth/LoginPage.jsx`

Secure sign-in page for all user roles.

**Key UI Elements:**
- **Centered Card**: Glass-morphism card with CampusFund logo, "Sign In" heading
- **Email Field**: Input with mail icon and placeholder "you@example.com"
- **Password Field**: Input with lock icon, show/hide toggle (eye/eye-off icons)
- **Reset Password Link**: Links to `/forgot-password`
- **Sign In Button**: Submits form, shows "Signing in..." while loading
- **Register Link**: "Need an account? Register" links to `/register`

**How It Functions**: On submit, calls `AuthContext.login({ email, password })` which sends `POST /api/auth/login`. On success, the JWT token is stored in localStorage, user data is set in context, and the user is redirected to their role-specific dashboard (`/admin`, `/student`, or `/donor`). On failure, a toast error is shown.

![Login Page Screenshot]()

---

#### 13.2.2 Register Page (`/register`)
**File**: `pages/auth/RegisterPage.jsx`

Account creation page with role-specific fields.

**Key UI Elements:**
- **Centered Card**: Glass-morphism card with "Create Account" heading
- **Role Toggle**: Two buttons — "Student" and "Contributor" — that switch the form context
- **Common Fields**: First name, last name, email (with mail icon), phone (optional, with phone icon)
- **Student-Specific Fields** (shown only when role is "student"): Student ID, Department, Level (dropdown 100–500) — displayed in a highlighted primary-50 background section
- **Password Fields**: Password (with show/hide toggle) and confirm password
- **Create Account Button**: Submits form, shows "Creating account..." while loading
- **Sign In Link**: "Already have an account? Sign in"

**How It Functions**: On submit, validates passwords match, then calls `AuthContext.register(formData)` which sends `POST /api/auth/register`. On success, the user is auto-logged-in and redirected to their dashboard. On validation failure, individual field errors are shown as toast messages.

![Register Page Screenshot]()

---

#### 13.2.3 Forgot Password Page (`/forgot-password`)
**File**: `pages/auth/ForgotPasswordPage.jsx`

Password reset request page.

**Key UI Elements:**
- **Email Input**: Single field with mail icon for entering registered email
- **Send Reset Link Button**: Submits the request
- **Success State**: After submission, shows green mail icon with message "A password reset link has been dispatched" and "Return to Sign In" link
- **Back Link**: "Return to Sign In" at the bottom

**How It Functions**: Calls `AuthContext.forgotPassword(email)` which sends `POST /api/auth/forgot-password`. The backend generates a token, stores it in `password_resets`, and sends an email with a reset link. The success message is shown regardless of whether the email exists (to prevent email enumeration).

![Forgot Password Page Screenshot]()

---

#### 13.2.4 Reset Password Page (`/reset-password?token=xxx`)
**File**: `pages/auth/ResetPasswordPage.jsx`

Password reset completion page accessed via email link.

**Key UI Elements:**
- **Invalid Token State**: If no token in URL, shows "Invalid Reset Link" with "Request New Link" button
- **New Password Field**: With show/hide toggle
- **Confirm Password Field**: Standard password confirmation
- **Reset Password Button**: Submits the new password
- **Success State**: "Your password has been reset successfully" with "Sign In" link

**How It Functions**: Reads `token` from URL query params. On submit, validates passwords match, then calls `AuthContext.resetPassword(token, password, confirmPassword)` which sends `POST /api/auth/reset-password`. On success, shows the success state with a link to login.

![Reset Password Page Screenshot]()

---

### 13.3 Student Pages

#### 13.3.1 Student Dashboard (`/student`)
**File**: `pages/student/StudentDashboard.jsx`

Personalized overview of the student's financial assistance activity.

**Key UI Elements:**
- **Welcome Header**: Shows student's first name with "Assistance Overview" title
- **Statistics Cards** (4-column grid):
  - Submitted Requests (total count)
  - Pending Review (pending count)
  - Approved (approved count)
  - Disbursed Funds (total funded amount in NGN)
- **Recent Submissions Section**: Header with "New Request" button (links to `/student/requests/new`)
- **Request List**: Animated cards showing each recent request's title, amount, category, and status badge (color-coded: yellow=pending, green=approved, blue=funded, red=rejected), with arrow link to detail page
- **Empty State**: FileText icon with "No requests submitted" and "Submit Request" link

**How It Functions**: On mount, fetches `GET /api/requests/stats` and `GET /api/requests?per_page=5` in parallel. Statistics are displayed in `StatCard` components. Recent requests are rendered as motion-animated list items.

![Student Dashboard Screenshot]()

---

#### 13.3.2 Student Requests List (`/student/requests`)
**File**: `pages/student/StudentRequests.jsx`

Complete list of the student's submitted assistance requests.

**Key UI Elements:**
- **Page Header**: "Submitted Requests" title with "New Request" button
- **Status Filter Bar**: Horizontal buttons for All, Pending, Approved, Rejected, Funded — filters the list
- **Request Cards**: Each card shows:
  - Request title, category label, and amount needed
  - Submission date
  - Status badge (color-coded)
  - Funding progress bar (shown only if `amount_funded > 0`) with funded amount and percentage
- **Pagination**: Page navigation
- **Empty State**: "No assistance requests on file"

**How It Functions**: Fetches `GET /api/requests?page={page}&per_page=10&status={statusFilter}`. Students only see their own requests (enforced by backend). Each card links to `/student/requests/{id}`.

![Student Requests List Screenshot]()

---

#### 13.3.3 New Request Page (`/student/requests/new`)
**File**: `pages/student/NewRequestPage.jsx`

Form for submitting a new financial assistance request.

**Key UI Elements:**
- **Request Information Card**:
  - Title input (required)
  - Description textarea (required, minimum 20 characters)
  - Three-column grid: Amount Needed (number input, min ₦1,000), Category (dropdown: Tuition, Housing, Medical, Feeding, Books, Emergency, Other), Priority (dropdown: Low, Medium, High, Critical)
- **Supporting Documents Card**:
  - Drag-and-drop upload area with upload icon
  - File type validation (PDF, JPG, PNG only, max 5MB each)
  - List of selected files with name, size, and remove button
- **Action Buttons**: "Submit Request" (primary) and "Cancel" (secondary)

**How It Functions**: Builds a `FormData` object with all text fields and attached files, then sends `POST /api/requests` with `multipart/form-data` content type. On success, navigates to the newly created request's detail page. On validation error, individual error messages are shown as toasts.

![New Request Page Screenshot]()

---

#### 13.3.4 Request Detail Page (`/student/requests/:id`)
**File**: `pages/student/RequestDetailPage.jsx`

Detailed view of a single assistance request with funding progress.

**Key UI Elements:**
- **Back Link**: "Back to Requests"
- **Request Information Card**:
  - Title with status icon (Clock=pending, CheckCircle=approved, XCircle=rejected, DollarSign=funded)
  - Status badge and priority badge and category label
  - Full description (whitespace-preserved)
  - Four-column statistics grid: Amount Needed, Amount Funded (highlighted in accent color), Submitted Date, Progress Percentage
  - Funding progress bar (gradient accent, shown only if `amount_funded > 0`)
  - Admin Notes section (blue background, shown only if `admin_notes` exists)
- **Supporting Documents Section**: List of uploaded documents with file icon, name, size, and download link

**How It Functions**: Fetches `GET /api/requests/{id}` which returns the request with its documents. The progress bar and percentage are calculated client-side from `amount_funded / amount_needed`.

![Request Detail Page Screenshot]()

---

### 13.4 Donor Pages

#### 13.4.1 Donor Dashboard (`/donor`)
**File**: `pages/donor/DonorDashboard.jsx`

Personalized overview of the donor's contribution activity.

**Key UI Elements:**
- **Welcome Header**: Shows donor's first name with "Contributor Overview" title
- **Statistics Cards** (4-column grid):
  - Total Contributed (sum of completed donations)
  - Contributions Made (count of completed donations)
  - Campaigns Supported (distinct campaigns count)
  - Pending Amount (sum of pending donations)
- **Recent Contributions Section**: Table showing recent donations with campaign name, amount, status, and date
- **Featured Campaigns Section**: Grid of featured campaign cards with progress bars and "Contribute" links

**How It Functions**: On mount, fetches `GET /api/donations/stats`, `GET /api/donations/history?per_page=5`, and `GET /api/campaigns/featured` in parallel. Statistics are displayed in `StatCard` components.

![Donor Dashboard Screenshot]()

---

#### 13.4.2 Donor Donations History (`/donor/donations`)
**File**: `pages/donor/DonorDonations.jsx`

Complete contribution history for the donor.

**Key UI Elements:**
- **Page Header**: "Contribution History" title
- **Donations Table**: Columns — Campaign, Amount (accent-colored, bold), Method (Paystack/Bank Transfer badge), Status (color-coded badge, including "Pending Verification" for bank transfers), Date, Reference (monospace)
- **Pagination**: Page navigation
- **Empty State**: "No contributions on record"

**How It Functions**: Fetches `GET /api/donations/history?page={page}&per_page=10`. Each row shows the campaign title (or "General" if no campaign), formatted amount, payment method badge (purple for Paystack, blue for Bank Transfer), status badge, formatted date, and payment reference code.

![Donor Donations History Screenshot]()

---

#### 13.4.3 Donate Page (`/donor/donate/:campaignId?` and `/donor/donate-request/:requestId`)
**File**: `pages/donor/DonatePage.jsx`

Payment form for making a contribution to a campaign or student request, supporting both Paystack and Manual Bank Transfer.

**Key UI Elements:**
- **Campaign Info Card** (if donating to a campaign): Shows campaign title and "raised of target" progress
- **Student Request Info Card** (if donating to a request): Shows request title, "funded of needed" progress with progress bar
- **Payment Method Selection Card**: Two selectable cards — "Pay Online" (CreditCard icon, supports Card, Bank, USSD, Mobile) and "Bank Transfer" (Building2 icon, manual transfer + proof upload). Active method is highlighted with primary border and background.
- **Donation Form Card** (shared for both methods):
  - Preset Amount Buttons: ₦5,000 / ₦10,000 / ₦25,000 / ₦50,000 / ₦100,000 — clicking fills the amount field
  - Custom Amount Input: Number field with ₦1,000 minimum
  - Message Textarea: Optional message of encouragement
  - Anonymous Toggle: Switch to donate anonymously
  - Submit Button: Shows "Pay {amount} Online" (Paystack) or "Initiate Bank Transfer" based on selected method
- **Security/Method Notice**: Contextual text explaining the selected payment method

**Bank Transfer Flow** (after clicking "Initiate Bank Transfer"):
1. Backend creates donation with `status=pending_verification` and `payment_method=bank_transfer`
2. **Bank Details View**: Shows official bank account details (bank name, account number with copy button, account name, sort code) fetched from admin-configured settings
3. **Proof Upload Form**: Transaction reference (required), bank name, account name, proof document upload (PDF/JPG/PNG, max 5MB), additional notes
4. **Submitted View**: Success confirmation with reference number and message that admin will verify

**How It Functions**: Supports two URL patterns — `/donor/donate/{campaignId}` for campaign donations and `/donor/donate-request/{requestId}` for direct request donations.

**Paystack Flow**: On submit, sends `POST /api/donations/initialize` with amount, campaign_id or request_id, message, and is_anonymous. If `window.PaystackPop` is available, opens the inline payment popup. On popup success callback, calls `POST /api/donations/verify` and navigates to `/donor/donations`. If popup is closed, shows a warning toast. If PaystackPop is unavailable, redirects to the Paystack authorization URL.

**Bank Transfer Flow**: On submit, sends `POST /api/bank-transfer/initialize` which creates a pending donation and returns bank details. After the donor makes the transfer, they fill in the proof form and submit via `POST /api/bank-transfer/{id}/submit-proof` (multipart/form-data). The donation remains in `pending_verification` status until an admin approves or rejects it.

![Donate Page Screenshot]()

---

#### 13.4.4 Donation Verification Page (`/donation/verify`)
**File**: `pages/donor/DonationVerifyPage.jsx`

Handles Paystack redirect callback after payment completion.

**Key UI Elements:**
- **Verifying State**: Spinning loader with "Verifying Payment" heading and "Please wait..." message
- **Success State**: Green checkmark icon, "Contribution Confirmed" heading, success message, and "View Contribution History" button (navigates to `/donor/donations`)
- **Error State**: Red X icon, "Verification Issue" heading, error message, and "Go to Contributions" button

**How It Functions**: Reads `reference` or `ref` from URL query params. Sends `POST /api/donations/verify` with the reference. Displays the appropriate state based on the API response. This page is reached when Paystack redirects the donor back after payment on the hosted payment page (fallback flow).

![Donation Verification Page Screenshot]()

---

### 13.5 Admin Pages

#### 13.5.1 Admin Dashboard (`/admin`)
**File**: `pages/admin/AdminDashboard.jsx`

Platform-wide operational analytics and overview.

**Key UI Elements:**
- **Page Header**: "Operations Overview" with subtitle
- **First Statistics Row** (4 cards): Registered Students, Registered Contributors, Verified Contributions (total amount), Pending Review
- **Second Statistics Row** (4 cards): Approved Requests, Funded Requests, Active Campaigns, Campaign Revenue
- **Monthly Contribution Volume Chart**: Area chart (Recharts) showing donation amounts per month
- **Requests by Category Chart**: Pie chart showing distribution of requests across categories
- **Recent Transactions Table**: Last 5 donations showing contributor name (or "Anonymous"), amount, date, and status badge

**How It Functions**: Fetches `GET /api/admin/stats` which returns comprehensive platform data including user counts, donation totals, request statistics, monthly donation breakdown, category distribution, and recent donations. Charts are rendered using Recharts with formatted currency tooltips.

![Admin Dashboard Screenshot]()

---

#### 13.5.2 Admin Users Page (`/admin/users`)
**File**: `pages/admin/AdminUsers.jsx`

User account management with search, filtering, and actions.

**Key UI Elements:**
- **Search Bar**: Input with search icon for searching by name, email, or student ID
- **Role Filter Buttons**: All, Student, Donor, Admin
- **Users Table**: Columns — User (name + email), Role (color-coded badge), Student ID, Verified (check/x icons), Status (Active/Inactive badge), Joined date, Actions
- **Action Buttons per Row**:
  - Verify (UserCheck icon, shown only for unverified users)
  - Toggle Status (activate/deactivate with check/x icons)
  - Delete (trash icon with confirmation dialog)
- **Pagination**: Page navigation

**How It Functions**: Fetches `GET /api/admin/users?page={page}&per_page=10&role={role}&search={search}`. Verify calls `POST /api/admin/users/{id}/verify`, toggle calls `POST /api/admin/users/{id}/toggle-status`, delete calls `POST /api/admin/users/{id}/delete` with a browser confirmation dialog. All actions refresh the user list on success.

![Admin Users Page Screenshot]()

---

#### 13.5.3 Admin Requests Page (`/admin/requests`)
**File**: `pages/admin/AdminRequests.jsx`

Student assistance request review and status management.

**Key UI Elements:**
- **Status Filter Buttons**: All, Pending, Approved, Rejected, Funded
- **Requests Table**: Columns — Student (name + email), Request (title + category), Amount Needed, Priority (color-coded: low=gray, medium=blue, high=orange, critical=red), Status (color-coded badge), Submitted date, Actions (View button)
- **Detail Modal** (opened by clicking View):
  - Full request details: title, description, amount needed, amount funded, category, priority, status, admin notes
  - Action buttons based on current status:
    - **Pending**: "Approve" and "Reject" buttons
    - **Approved**: "Mark as Funded" and "Copy Donation Link" buttons
  - Admin Notes textarea for adding review comments
  - Close button
- **Pagination**: Page navigation

**How It Functions**: Fetches `GET /api/requests?page={page}&per_page=10&status={statusFilter}` (admin sees all requests). Status updates call `POST /api/requests/{id}/status` with `{ status, notes }`. "Copy Donation Link" copies `/donor/donate-request/{id}` to clipboard for sharing with donors. When admin marks as funded, the backend sets `amount_funded = amount_needed` and notifies the student.

![Admin Requests Page Screenshot]()

---

#### 13.5.4 Admin Campaigns Page (`/admin/campaigns`)
**File**: `pages/admin/AdminCampaigns.jsx`

Fundraising campaign creation and management.

**Key UI Elements:**
- **Page Header**: "Campaign Management" with "Create Campaign" button
- **Campaigns Table**: Columns — Image (thumbnail), Title, Category, Target Amount, Raised Amount, Status (color-coded), End Date, Actions (Edit/Delete buttons)
- **Create/Edit Form Modal**:
  - Title input
  - Short Description input
  - Full Description textarea
  - Target Amount number input
  - Category dropdown
  - Status dropdown (Draft, Active, Paused, Completed, Closed)
  - Start Date and End Date date inputs
  - Featured toggle switch
  - Campaign Image upload area
- **Delete Confirmation**: Browser confirm dialog before deletion
- **Pagination**: Page navigation

**How It Functions**: Fetches `GET /api/campaigns?page={page}&per_page=10`. Create sends `POST /api/campaigns` with FormData (including image). Edit sends `POST /api/campaigns/{id}/edit` for text-only updates or `POST /api/campaigns/{id}/update` for updates with a new image. Delete sends `POST /api/campaigns/{id}/delete`. All actions refresh the campaign list on success.

![Admin Campaigns Page Screenshot]()

---

#### 13.5.5 Admin Donations Page (`/admin/donations`)
**File**: `pages/admin/AdminDonations.jsx`

Platform-wide contribution monitoring and bank transfer verification.

**Key UI Elements:**
- **Tab Switcher**: "All Contributions" and "Pending Transfers" tabs
- **All Contributions Tab**:
  - Donations Table: Columns — Contributor (name + email, or "Anonymous"), Campaign, Amount (accent-colored), Method (Paystack/Bank Transfer badge), Status (color-coded badge, including "Pending Verification" for bank transfers), Reference (monospace), Date
  - Pagination: Page navigation
- **Pending Transfers Tab**:
  - Transfer Cards: Each card shows:
    - "Awaiting Verification" status indicator (amber clock icon)
    - Donor name, amount, campaign, and reference
    - Proof Details section (transaction reference, bank name, notes, "View Proof Document" link)
    - Approve (green) and Reject (red) action buttons
  - Empty State: "No pending bank transfers to verify" with green checkmark
- **Reject Modal**: Confirmation dialog with reason textarea; donor is notified of rejection with the reason

**How It Functions**: Fetches `GET /api/donations?page={page}&per_page=10` for all contributions (includes payment method and proof data via JOIN). Pending transfers fetched via `GET /api/bank-transfer/pending`. Approve calls `POST /api/bank-transfer/{id}/verify` which updates donation status to `completed`, increments campaign/request amounts, and sends confirmation notifications. Reject calls `POST /api/bank-transfer/{id}/reject` with a reason, updating donation status to `failed` and notifying the donor.

![Admin Donations Page Screenshot]()

---

#### 13.5.6 Admin Reports Page (`/admin/reports`)
**File**: `pages/admin/AdminReports.jsx`

Financial report generation and export.

**Key UI Elements:**
- **Report Configuration Card**:
  - Report Type dropdown: Donations, Student Requests, Campaigns
  - Format dropdown: View Online (JSON), Export CSV
  - Start Date and End Date date pickers
  - Generate/Export button
- **Report Results Table** (shown for "View Online" format): Dynamic columns based on report data, with currency formatting for amounts over ₦1,000

**How It Functions**: Calls `GET /api/admin/reports?type={type}&format={format}&start_date={start}&end_date={end}`. For CSV format, the response is converted to a Blob and downloaded as a file. For JSON format, the data is rendered in a dynamic table with auto-generated column headers.

![Admin Reports Page Screenshot]()

---

#### 13.5.7 Admin Activity Logs Page (`/admin/activity-logs`)
**File**: `pages/admin/AdminActivityLogs.jsx`

Audit trail of all administrative actions.

**Key UI Elements:**
- **Page Header**: "Administrative Action Log"
- **Log Entries**: Each entry shows:
  - Action type badge (color-coded: green=create, blue=update, red=delete, purple=login, gray=other)
  - Timestamp
  - Description text
  - User name and IP address
- **Pagination**: Page navigation
- **Empty State**: "No administrative actions recorded"

**How It Functions**: Fetches `GET /api/admin/activity-logs?page={page}&per_page=20`. Displays a chronological list of all admin actions recorded by the `Helpers::logActivity()` backend helper. Each log entry includes who performed the action, what they did, and from where (IP address).

![Admin Activity Logs Page Screenshot]()

---

#### 13.5.8 Admin Settings Page (`/admin/settings`)
**File**: `pages/admin/AdminSettings.jsx`

Platform configuration management.

**Key UI Elements:**
- **Site Identity Card**: Site Name input, Site Description textarea
- **Currency & Contribution Limits Card**: Currency Code, Currency Symbol, Min Donation Amount, Max Donation Amount (2x2 grid)
- **Feature Controls Card**: Three toggle switches:
  - Enable Registration (allow new users to register)
  - Email Verification (require email verification)
  - Maintenance Mode (put site in maintenance)
- **Bank Account for Manual Transfers Card**: Bank Name, Account Number (monospace), Sort Code (monospace), Account Name — these details are shown to donors who select the bank transfer payment method
- **Save Settings Button**: Persists all changes

**How It Functions**: On mount, fetches `GET /api/admin/settings` and populates the form. On save, sends `PUT /api/admin/settings` with all setting values. Toggle switches alternate between "true" and "false" string values. Settings are stored in the `settings` database table as key-value pairs.

![Admin Settings Page Screenshot]()

---

### 13.6 Shared Pages

#### 13.6.1 Profile Page (`/student/profile`, `/donor/profile`)
**File**: `pages/ProfilePage.jsx`

Account settings page shared by students and donors.

**Key UI Elements:**
- **Profile Header Card**: Avatar circle with initials, full name, email, role badge. For students: additional row showing Student ID, Department, and Level
- **Tab Switcher**: "Edit Profile" and "Change Password" tabs
- **Edit Profile Tab**: First name, last name, phone inputs with "Save Changes" button
- **Change Password Tab**: Current password, new password, confirm new password inputs with "Change Password" button

**How It Functions**: Profile data is loaded from `AuthContext.user`. Profile updates call `POST /api/auth/profile` via `AuthContext.updateProfile()`. Password changes call `POST /api/auth/change-password` via `AuthContext.changePassword()`. Both validate on the client side before submission, and show success/error toasts.

![Profile Page Screenshot]()

---

#### 13.6.2 Notifications Page (`/student/notifications`, `/donor/notifications`)
**File**: `pages/NotificationsPage.jsx`

In-app notification center shared by students and donors.

**Key UI Elements:**
- **Page Header**: "Notifications" with "Mark All Read" button
- **Notification Cards**: Each shows:
  - Type icon (Info=blue, CheckCircle=green, AlertTriangle=yellow, AlertCircle=red) in a colored background circle
  - Title (bold if unread) and message text
  - Timestamp
  - Unread indicator: Blue left border on the card
  - Action buttons: Mark as read (check icon, shown only for unread) and Delete (trash icon)
- **Pagination**: Page navigation
- **Empty State**: Bell icon with "No notifications at this time"

**How It Functions**: Fetches `GET /api/notifications?page={page}&per_page=10`. Mark as read calls `POST /api/notifications/{id}/read` and updates the local state. Mark all read calls `POST /api/notifications/read-all`. Delete calls `POST /api/notifications/{id}/delete` and removes the item from the list.

![Notifications Page Screenshot]()

---

#### 13.6.3 Not Found Page (404)
**File**: `pages/NotFoundPage.jsx`

Displayed when the user navigates to a non-existent route.

**Key UI Elements**: Error illustration, "Page Not Found" heading, description text, and "Go Home" button linking to `/`.

![Not Found Page Screenshot]()

---

#### 13.6.4 Unauthorized Page (403)
**File**: `pages/UnauthorizedPage.jsx`

Displayed when a user tries to access a route they don't have permission for.

**Key UI Elements**: Shield icon, "Access Restricted" heading, explanation text, and "Go Home" button.

![Unauthorized Page Screenshot]()

---

## 14. API Documentation

### 14.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new account (rate limited) |
| POST | `/api/auth/login` | No | Sign in and receive JWT (rate limited) |
| POST | `/api/auth/logout` | Yes | Invalidate current session |
| POST | `/api/auth/forgot-password` | No | Request password reset email (rate limited) |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| GET | `/api/auth/me` | Yes | Get current authenticated user |
| PUT | `/api/auth/profile` | Yes | Update profile information |
| PUT | `/api/auth/change-password` | Yes | Change password |

### 14.2 Campaigns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/campaigns` | No | List campaigns with pagination and filters |
| GET | `/api/campaigns/featured` | No | Get featured campaigns |
| GET | `/api/campaigns/{id}` | No | Campaign details with donations |
| POST | `/api/campaigns` | Admin | Create new campaign (with image) |
| PUT | `/api/campaigns/{id}` | Admin | Update campaign details |
| POST | `/api/campaigns/{id}/update` | Admin | Update campaign with new image |
| DELETE | `/api/campaigns/{id}` | Admin | Delete campaign |

### 14.3 Student Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/requests` | Yes | List requests (students see own; admins see all) |
| GET | `/api/requests/stats` | Student | Get student-specific statistics |
| GET | `/api/requests/{id}` | Yes | Request details with documents |
| POST | `/api/requests` | Student | Submit new request (with documents) |
| PUT | `/api/requests/{id}` | Yes | Update request details |
| PUT | `/api/requests/{id}/status` | Admin | Update request status (approve/reject/fund) |
| DELETE | `/api/requests/{id}` | Yes | Withdraw/delete request |
| POST | `/api/requests/{id}/documents` | Student | Upload supporting documents |

### 14.4 Donations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/donations` | Admin | List all donations |
| GET | `/api/donations/stats` | Donor | Get donor-specific statistics |
| GET | `/api/donations/history` | Donor | Get donor contribution history |
| GET | `/api/donations/{id}` | Yes | Donation details |
| POST | `/api/donations/initialize` | Donor | Initialize Paystack payment |
| POST | `/api/donations/verify` | Donor | Verify Paystack payment |

### 14.5 Bank Transfer

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bank-transfer/details` | No | Get admin-configured bank account details |
| POST | `/api/bank-transfer/initialize` | Donor | Initialize bank transfer donation (creates pending_verification record) |
| POST | `/api/bank-transfer/{id}/submit-proof` | Donor | Upload proof of payment (multipart/form-data) |
| GET | `/api/bank-transfer/pending` | Admin | List pending bank transfer verifications |
| POST | `/api/bank-transfer/{id}/verify` | Admin | Approve bank transfer (updates campaign totals, sends notifications) |
| POST | `/api/bank-transfer/{id}/reject` | Admin | Reject bank transfer with reason (notifies donor) |

### 14.6 Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | List user notifications |
| GET | `/api/notifications/unread-count` | Yes | Get unread notification count |
| PUT | `/api/notifications/{id}/read` | Yes | Mark notification as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all notifications as read |
| DELETE | `/api/notifications/{id}` | Yes | Delete notification |

### 14.7 Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | List users with filters |
| PUT | `/api/admin/users/{id}/verify` | Admin | Verify user account |
| PUT | `/api/admin/users/{id}/toggle-status` | Admin | Activate/deactivate user |
| DELETE | `/api/admin/users/{id}` | Admin | Delete user account |
| GET | `/api/admin/activity-logs` | Admin | View action audit trail |
| GET | `/api/admin/reports` | Admin | Generate reports |
| GET | `/api/admin/settings` | Admin | Get platform settings |
| PUT | `/api/admin/settings` | Admin | Update platform settings |

### 14.8 Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/public` | No | Public platform statistics |

---

## 15. Payment Integration

### 15.1 Paystack Integration

The platform integrates with **Paystack**, a Nigerian payment gateway that supports card payments, bank transfers, bank account payments, USSD, and mobile money. The integration follows a two-step process:

**Step 1 — Transaction Initialization** (`POST /api/donations/initialize`):
1. Backend creates a `donation` record with status `pending`
2. Backend creates a `payment` record with status `initialized`
3. Backend calls Paystack's `POST /transaction/initialize` API with the amount (in kobo), donor email, a generated reference, and explicit `channels` array: `['card', 'bank', 'bank_transfer', 'ussd', 'mobile_money']`
4. Paystack returns an `authorization_url` and `public_key`
5. Frontend receives these and opens the Paystack payment interface

**Step 2 — Transaction Verification** (`POST /api/donations/verify`):
1. After payment completion, the frontend sends the reference to the backend
2. Backend calls Paystack's `GET /transaction/verify/{reference}` API
3. If payment is successful:
   - Donation status updated to `completed`
   - Payment status updated to `success` with gateway response
   - Campaign `raised_amount` incremented (if campaign donation)
   - Student request `amount_funded` incremented (if request donation)
   - If request is fully funded, status auto-changed to `funded`
   - Donor receives confirmation email and notification
   - Student receives funding notification (and "fully funded" notification + email if applicable)

### 15.2 Payment Flows

**Inline Popup Flow** (preferred):
- Uses `PaystackPop.setup()` JavaScript SDK
- Opens a modal overlay on the current page
- Donor completes payment without leaving the site
- On success, frontend calls verify endpoint directly
- On close, donor is informed the payment was not completed

**Redirect Flow** (fallback):
- Donor is redirected to Paystack's hosted payment page
- After payment, Paystack redirects to `/donation/verify?reference=xxx`
- The `DonationVerifyPage` component handles the verification
- Shows loading → success/error states with navigation options

### 15.3 Configuration

Paystack keys are configured in `backend/.env`:
```env
PAYSTACK_SECRET_KEY=sk_test_xxx    # Server-side API calls
PAYSTACK_PUBLIC_KEY=pk_test_xxx    # Client-side popup
```

### 15.4 Manual Bank Transfer Integration

The platform supports a **Manual Bank Transfer** payment method for donors who prefer direct bank deposits. This method uses an admin-verification workflow rather than automated gateway verification.

**Step 1 — Transfer Initialization** (`POST /api/bank-transfer/initialize`):
1. Backend validates the amount (minimum ₦1,000) and checks for duplicate pending transfers
2. Backend creates a `donation` record with status `pending_verification` and `payment_method=bank_transfer`
3. Backend creates a `payment` record with status `pending_verification` and `provider=bank_transfer`
4. Backend returns admin-configured bank account details (bank name, account number, account name, sort code) from the `settings` table

**Step 2 — Proof Submission** (`POST /api/bank-transfer/{id}/submit-proof`):
1. Donor makes the transfer to the displayed bank account externally
2. Donor uploads proof of payment (PDF, JPG, or PNG, max 5MB) along with their transaction reference, bank name, and account name
3. Backend validates file type and size, saves the file to `uploads/proofs/`, and creates a `bank_transfer_proofs` record
4. Backend sends an in-app notification to the donor confirming submission
5. Donation remains in `pending_verification` status

**Step 3 — Admin Verification** (`POST /api/bank-transfer/{id}/verify`):
1. Admin reviews the pending transfer in the Admin Donations page ("Pending Transfers" tab)
2. Admin previews the uploaded proof document and reviews the transaction details
3. If approved:
   - Donation status updated to `completed`
   - Payment status updated to `success` with verification details and admin ID
   - Campaign `raised_amount` incremented (if campaign donation)
   - Student request `amount_funded` incremented (if request donation)
   - If request is fully funded, status auto-changed to `funded`
   - Donor receives confirmation email and notification
   - Student receives funding notification (and "fully funded" notification + email if applicable)
4. If rejected (`POST /api/bank-transfer/{id}/reject`):
   - Donation status updated to `failed`
   - Payment status updated to `failed` with rejection reason
   - Donor receives notification with the rejection reason

**Security Measures**:
- Only the donation's owner can submit proof (enforced by donor_id check)
- Proof can only be submitted once per donation (duplicate check)
- File uploads are validated for type (PDF, JPG, PNG only) and size (5MB max)
- MIME type is verified against file extension
- Upload directory has `.htaccess` blocking PHP execution
- Duplicate pending transfers are prevented (same donor + amount within 10 minutes)
- All verification actions are logged in `activity_logs`
- All bank transfer routes are JWT-protected; admin routes require `AdminMiddleware`

**Bank Account Configuration**:
Administrators configure the bank account details via the Settings page (`/admin/settings`). The following settings are stored in the `settings` database table:
- `bank_name` — Name of the receiving bank
- `bank_account_number` — Account number displayed to donors
- `bank_account_name` — Account name displayed to donors
- `bank_sort_code` — Bank sort code

---

## 16. Security Implementation

### 16.1 Authentication Security
- **JWT Tokens**: Stateless authentication with configurable expiration (default 24 hours)
- **bcrypt Password Hashing**: Passwords stored using PHP's `password_hash()` with `PASSWORD_BCRYPT` (cost factor 10)
- **Token Validation**: Every protected route validates the JWT signature, expiration, and user active status

### 16.2 Input Security
- **SQL Injection Prevention**: All database queries use PDO prepared statements with parameterized bindings
- **XSS Protection**: Input sanitization via `Helpers::sanitize()` (htmlspecialchars with ENT_QUOTES), output encoding in React JSX
- **Input Validation**: Server-side validation on all endpoints using a custom `Validator` class with rules (required, min, max, numeric, email, in, min_value)
- **File Upload Validation**: Type verification (jpg, jpeg, png, pdf), size limits (5MB default), MIME type checking, and `.htaccess` protection in upload directories blocking PHP execution

### 16.3 Access Control
- **Role-Based Access Control (RBAC)**: Three middleware layers — `AuthMiddleware` (authenticated), `AdminMiddleware` (admin role), `RateLimitMiddleware` (throttling)
- **Route Protection**: Each API route explicitly declares required middleware
- **Frontend Route Guards**: `ProtectedRoute` component checks user role before rendering protected pages
- **Automatic 401 Handling**: Axios response interceptor clears token and redirects to login on unauthorized responses

### 16.4 Infrastructure Security
- **CORS Configuration**: Controlled cross-origin access with explicit allowed origins
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`
- **HTTPS Enforcement**: `.htaccess` forces HTTPS redirect in production
- **Environment Isolation**: Sensitive credentials stored in `.env` file excluded from version control
- **Error Suppression**: Production mode hides detailed error messages; all external call failures are caught and logged internally

### 16.5 Payment Security
- **Backend-Only Verification**: Donations are only marked as completed after server-side Paystack API verification or admin manual verification — frontend payment success is never trusted
- **Duplicate Prevention**: Paystack transactions are verified against existing references; bank transfers are checked for duplicate pending submissions (same donor + amount within 10 minutes)
- **Ownership Enforcement**: Proof of payment can only be submitted by the donation's owner (donor_id check)
- **One-Time Proof Submission**: Each bank transfer donation accepts only one proof upload
- **Admin Audit Trail**: All bank transfer verifications and rejections are logged with the admin's user ID and timestamp in the `payments` table (`verified_by`, `verified_at`) and `activity_logs` table

---

## 17. Setup and Installation

### 17.1 Prerequisites

- **XAMPP** (Apache + MySQL) or equivalent local server
- **Node.js** 18+ and **npm**
- **PHP** 8.0+
- **Composer** (PHP dependency manager)

### 17.2 Database Setup

1. Start MySQL server
2. Open phpMyAdmin or MySQL CLI
3. Create a database named `campus_fund`
4. Import the schema:
   ```bash
   mysql -u root -p campus_fund < database/campus_fund.sql
   ```

### 17.3 Backend Setup

```bash
cd backend
composer install
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=campus_fund
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_secure_random_string_at_least_32_characters
JWT_EXPIRATION=86400

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_ADDRESS=noreply@campusfund.edu
MAIL_FROM_NAME=CampusFund

PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=uploads
ALLOWED_TYPES=jpg,jpeg,png,pdf
```

Start the PHP server:
```bash
cd backend
php -S localhost:8000 -t public
```

Or place in XAMPP htdocs and configure an Apache virtual host.

### 17.4 Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Development server at http://localhost:5173
```

For production build:
```bash
npm run build      # Output to dist/
```

### 17.5 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusfund.edu | Password@123 |
| Student | john@student.edu | Password@123 |
| Student | jane@student.edu | Password@123 |
| Student | ade@student.edu | Password@123 |
| Donor | donor1@email.com | Password@123 |
| Donor | donor2@email.com | Password@123 |

---

## 18. Deployment

See `DEPLOYMENT.md` for full cPanel deployment instructions.

**Production Domain**: `https://anns.com.gracelandroyalacademy.com.ng`

### Deployment Summary

1. Build frontend: `npm run build`
2. Copy `frontend/dist/` contents to `public_html/`
3. Copy `backend/` contents to `public_html/api/`
4. Import `database/campus_fund.sql` into MySQL via phpMyAdmin
5. Import `database/migration_bank_transfer.sql` into MySQL via phpMyAdmin (adds bank transfer support)
6. Configure `public_html/api/.env` with production credentials
7. Configure bank account details via Admin → Settings → Bank Account for Manual Transfers
8. Install Composer dependencies: `composer install --no-dev --optimize-autoloader`
9. Set folder permissions (755 for directories, 644 for files)
10. Enable SSL certificate via cPanel → Let's Encrypt
11. Verify deployment by testing login with seed accounts

---

## 19. Testing

### 19.1 Manual Test Scenarios

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Student registration | Register with student role, valid data | Account created, redirected to dashboard |
| 2 | Student submits request | Fill request form with title, description, amount, category, upload document | Request created with "pending" status |
| 3 | Admin approves request | Navigate to admin requests, click approve on pending request | Request status changes to "approved", student receives notification and email |
| 4 | Donor contributes to campaign | Navigate to campaign, click donate, enter amount, complete Paystack payment | Donation recorded as "completed", campaign raised_amount updated |
| 5 | Donor contributes to request | Open donation link for approved request, complete payment | Donation recorded, request amount_funded updated, student notified |
| 6 | Request auto-funded | Multiple donations total >= amount_needed | Request status auto-changes to "funded", student receives "fully funded" notification and email |
| 7 | Admin marks request funded | Admin clicks "Mark as Funded" on approved request | amount_funded set to amount_needed, status = "funded", student notified |
| 8 | Password reset | Click forgot password, enter email, check email, reset with token | Password updated, can login with new password |
| 9 | Anonymous donation | Toggle anonymous switch, complete payment | Donation recorded as anonymous, donor name hidden in public views |
| 10 | Admin copies donation link | Click "Copy Donation Link" on approved request | Link copied to clipboard, when opened by donor, shows request details |
| 11 | Bank transfer initialization | Select "Bank Transfer" method, enter amount, click "Initiate Bank Transfer" | Donation created with status "pending_verification", bank details displayed |
| 12 | Upload proof of payment | After bank transfer init, fill transaction reference, upload PDF/JPG proof, submit | Proof saved, donation remains "pending_verification", donor notified |
| 13 | Admin approves bank transfer | Navigate to Admin Donations → Pending Transfers, click Approve | Donation status → "completed", campaign/request totals updated, donor and student notified |
| 14 | Admin rejects bank transfer | Click Reject on pending transfer, enter reason, confirm | Donation status → "failed", donor notified with rejection reason |
| 15 | Duplicate bank transfer prevention | Submit same amount bank transfer twice within 10 minutes | Second attempt rejected with "similar pending transfer exists" error |
| 16 | Invalid proof upload | Try uploading .exe or 10MB file as proof | Upload rejected with appropriate error message |
| 17 | Paystack multi-channel | Select "Pay Online", complete payment via USSD or bank transfer on Paystack | Payment verified and donation completed successfully |

### 19.2 API Testing

API endpoints can be tested using tools like Postman or cURL:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campusfund.edu","password":"Password@123"}'

# Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token>"

# List campaigns
curl http://localhost:8000/api/campaigns

# Initialize donation
curl -X POST http://localhost:8000/api/donations/initialize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"campaign_id":1}'

# Initialize bank transfer
curl -X POST http://localhost:8000/api/bank-transfer/initialize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":10000,"campaign_id":1}'

# Submit proof of payment
curl -X POST http://localhost:8000/api/bank-transfer/1/submit-proof \
  -H "Authorization: Bearer <token>" \
  -F "proof=@receipt.pdf" \
  -F "transaction_reference=TXN123456" \
  -F "bank_name=First Bank" \
  -F "account_name=John Doe" \
  -F "notes=Transferred on May 9"

# Get pending bank transfers (admin)
curl http://localhost:8000/api/bank-transfer/pending \
  -H "Authorization: Bearer <admin_token>"

# Approve bank transfer (admin)
curl -X POST http://localhost:8000/api/bank-transfer/1/verify \
  -H "Authorization: Bearer <admin_token>"

# Reject bank transfer (admin)
curl -X POST http://localhost:8000/api/bank-transfer/1/reject \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Proof document is unclear"}'
```

---

## 20. Project Structure

```
ppp/
├── frontend/                    # React Single-Page Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state, token mgmt, role helpers
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminCampaigns.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminDonations.jsx      # Donations + bank transfer verification
│   │   │   │   ├── AdminRequests.jsx
│   │   │   │   ├── AdminSettings.jsx       # Includes bank account config
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminActivityLogs.jsx
│   │   │   │   └── AdminReports.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   └── ResetPasswordPage.jsx
│   │   │   ├── donor/
│   │   │   │   ├── DonorDashboard.jsx
│   │   │   │   ├── DonorDonations.jsx   # Shows payment method + transfer status
│   │   │   │   ├── DonatePage.jsx       # Dual payment: Paystack + Bank Transfer
│   │   │   │   └── DonationVerifyPage.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── StudentRequests.jsx
│   │   │   │   ├── RequestDetailPage.jsx
│   │   │   │   └── NewRequestPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── CampaignsPage.jsx
│   │   │   ├── CampaignDetailPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx     # All route definitions
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + API service layer
│   │   ├── utils/
│   │   │   └── helpers.js        # Format currency, dates, status colors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                     # PHP REST API (development copy)
│   ├── app/
│   │   ├── Controllers/
│   │   │   ├── AdminController.php
│   │   │   ├── AuthController.php
│   │   │   ├── BankTransferController.php  # Manual bank transfer workflow
│   │   │   ├── CampaignController.php
│   │   │   ├── DonationController.php
│   │   │   ├── NotificationController.php
│   │   │   └── StudentRequestController.php
│   │   ├── Core/
│   │   │   ├── App.php           # Bootstrap, CORS, routing
│   │   │   ├── Database.php      # PDO singleton connection
│   │   │   ├── Request.php       # Request body parsing
│   │   │   ├── Response.php      # JSON response helpers
│   │   │   └── Router.php        # URL routing engine
│   │   ├── Helpers/
│   │   │   ├── FileUpload.php    # Multi-file upload handler
│   │   │   ├── Helpers.php       # Sanitize, notify, log, generate ref
│   │   │   ├── JWTHandler.php    # Token create/verify
│   │   │   ├── Mailer.php        # SMTP email templates
│   │   │   └── Validator.php    # Input validation rules
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   ├── AuthMiddleware.php
│   │   │   └── RateLimitMiddleware.php
│   │   └── Models/
│   │       ├── ActivityLog.php
│   │       ├── Campaign.php
│   │       ├── Donation.php
│   │       ├── Notification.php
│   │       ├── Payment.php
│   │       ├── PaymentProof.php      # Bank transfer proof records
│   │       ├── Setting.php
│   │       ├── StudentRequest.php
│   │       └── User.php
│   ├── public/
│   │   └── index.php            # API entry point
│   ├── routes/
│   │   └── api.php              # Route definitions
│   ├── uploads/                 # User-uploaded files
│   ├── .env.example
│   ├── .htaccess
│   └── composer.json
│
├── database/
│   ├── campus_fund.sql               # Full schema + seed data
│   └── migration_bank_transfer.sql   # Bank transfer schema migration
│
├── deploy/                      # Production deployment bundle
│   └── public_html/
│       ├── api/                 # Backend (production copy)
│       ├── assets/              # Frontend build assets
│       ├── index.html           # Frontend build entry
│       └── .htaccess            # Root routing rules
│
├── scripts/                     # Utility scripts
├── .gitignore
├── DEPLOYMENT.md                # cPanel deployment guide
└── README.md                    # This file
```

---

## 21. Limitations

1. **No Mobile Application**: The platform is web-only; a dedicated mobile app would improve accessibility for students who primarily use smartphones.
2. **Single Currency**: Only Nigerian Naira (NGN) is supported; multi-currency would be needed for international donors.
3. **No Automated Disbursement**: When a request is funded, the actual transfer of funds to the student's bank account is manual; automated bank transfer integration is not implemented.
4. **No Real-Time Updates**: The frontend uses polling for notifications rather than WebSocket-based real-time push.
5. **Shared Hosting Constraints**: The deployment on cPanel shared hosting limits server configuration and requires POST-based method overrides for PUT/DELETE.
6. **No Multi-Campus Support**: The platform is designed for a single institution; multi-campus would require additional data isolation and administrative hierarchies.
7. **File Storage**: Uploaded files are stored on the server filesystem rather than cloud storage (e.g., AWS S3), which may present scalability challenges.

---

## 22. Future Work

1. **Mobile Application**: Develop a React Native mobile app for iOS and Android to improve accessibility.
2. **Automated Fund Disbursement**: Integrate with Nigerian banking APIs (e.g., Paystack Transfer, Flutterwave) to automatically disburse funds to student bank accounts.
3. **Multi-Campus Support**: Add campus-level data isolation, cross-campus campaigns, and hierarchical admin roles.
4. **Real-Time Notifications**: Implement WebSocket (Socket.IO) for instant notification delivery.
5. **Recurring Donations**: Allow donors to set up monthly/weekly automatic contributions.
6. **AI-Powered Request Verification**: Use document analysis and pattern matching to flag potentially fraudulent requests.
7. **Donor Impact Reports**: Generate personalized annual impact reports showing each donor's total contributions and students helped.
8. **Social Sharing**: Add social media sharing for campaigns and requests to increase visibility.
9. **Cloud Storage Migration**: Move file uploads to AWS S3 or similar for better scalability and CDN delivery.
10. **Multi-Currency Support**: Add support for USD, GBP, and other currencies with automatic conversion.

---

## 23. References

1. Jones, M., Bradley, B., & Sakimura, N. (2015). *JSON Web Token (JWT)*. RFC 7519. Internet Engineering Task Force (IETF).
2. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.
3. Rodriguez, A. (2022). *RESTful Web Services: Principles and Patterns*. O'Reilly Media.
4. Graziotin, D. (2023). *Single-Page Applications: Architecture, Performance, and User Experience*. ACM Computing Surveys.
5. Paystack. (2024). *Paystack API Documentation*. https://paystack.com/docs/api
6. React. (2024). *React Documentation*. https://react.dev
7. PHP. (2024). *PHP Manual*. https://www.php.net/docs.php
8. MySQL. (2024). *MySQL Reference Manual*. https://dev.mysql.com/doc/refman/8.0/en/
9. Tailwind Labs. (2024). *Tailwind CSS Documentation*. https://tailwindcss.com/docs
10. Vite. (2024). *Vite Documentation*. https://vitejs.dev/guide

---

© 2024 CampusFund. All rights reserved.
