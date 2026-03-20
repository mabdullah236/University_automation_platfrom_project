# Functional Requirements Document - UVAP

## 1. Introduction
The University Automation System (UVAP) is a comprehensive platform designed to digitize and automate the administrative, academic, and financial operations of a university.

## 2. User Roles
- **Admin**: Full access to all modules.
- **Student**: Access to profile, academics, fees, LMS, and results.
- **Faculty**: Access to courses, attendance, grading, and LMS.
- **Finance**: Manage fees, payments, and payroll.
- **Exam Cell**: Manage exam schedules, grading, and transcripts.
- **HR**: Manage staff, payroll, and leave.

## 3. Core Modules

### 3.1 User Management
- **Registration**: Online admission forms with document upload.
- **Profile Management**: View and edit profile details.
- **Authentication**: Secure login via Email/Password and OTP (SMS).

### 3.2 Academic System
- **Course Management**: Create and manage courses, prerequisites, and credits.
- **Program Management**: Define degree programs and curriculum mapping.
- **Registration**: Student course registration with section selection and clash checking.
- **Timetable**: Automated timetable generation with room allocation.

### 3.3 Examination System
- **Exam Scheduling**: Date sheet generation and seating plans.
- **Grading**: Entry of marks (Quizzes, Assignments, Mids, Finals) and auto-calculation of Grades/GPA.
- **Transcripts**: Auto-generation of student transcripts and degree audits.

### 3.4 Learning Management System (LMS)
- **Assignments**: Upload and submission of assignments.
- **Resources**: Sharing of lecture notes and videos.
- **Announcements**: Course-specific notifications.

### 3.5 Finance Module
- **Fee Management**: Fee structure definition and voucher generation.
- **Payments**: Online payment integration (Stripe) and manual collection.
- **Payroll**: Staff salary processing.

### 3.6 HR & Administration
- **Staff Management**: Employee profiles and attendance.
- **Leave Management**: Leave application and approval workflow.

### 3.7 Facilities
- **Hostel**: Room allocation and mess billing.
- **Transport**: Route management and bus attendance.
- **Library**: Book catalog, borrowing, and fine calculation.

## 4. Advanced Integrations

### 4.1 Machine Learning
- **Teacher Review System**: Sentiment analysis of student reviews (Positive, Neutral, Negative).
- **Performance Analytics**: Aggregated sentiment scores for faculty evaluation.

### 4.2 Communication
- **SMS/Email**: Automated alerts for fees, attendance, and exams.
- **Notifications**: In-app notifications for important updates.

### 4.3 Security
- **Audit Logs**: Tracking of all critical system actions.
- **Data Backup**: Automated backup and restore functionality.
