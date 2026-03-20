
# API User Manual & Workflow

This document outlines the API endpoints, authentication flow, and core workflows for the University Automation System backend.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1.  **Login**: Send a `POST` request to `/api/auth/login` with `email` and `password`. The server responds with an `accessToken` and a `refreshToken`.
2.  **Making Authenticated Requests**: Include the `accessToken` in the `Authorization` header of your requests as a Bearer token:
    `Authorization: Bearer <accessToken>`
3.  **Token Expiry**: The `accessToken` is short-lived (1 hour). When it expires, you will receive a 401 Unauthorized error.
4.  **Refreshing Tokens**: Use the `refreshToken` to get a new `accessToken` by sending a `POST` request to `/api/auth/refresh` with the `refreshToken` in the request body.

---

## API Endpoints

### Auth Routes

-   **`POST /api/auth/login`**
    -   **Description**: Authenticates a user and returns JWT tokens.
    -   **Body**: `{ "email": "user@example.com", "password": "password123" }`
    -   **Response**: `{ "accessToken": "...", "refreshToken": "..." }`

-   **`POST /api/auth/refresh`**
    -   **Description**: Issues a new access token using a valid refresh token.
    -   **Body**: `{ "token": "your_refresh_token" }`
    -   **Response**: `{ "accessToken": "..." }`

### Admin Routes

*Authentication Required: Admin Role*

-   **`GET /api/admin/students`**
    -   **Description**: Retrieves a list of all students.
    -   **Response**: `[{ id, name, email, rollNo, portalEnabled, ... }]`

-   **`POST /api/admin/portal-override`**
    -   **Description**: Manually enables or disables a student's portal access.
    -   **Body**: `{ "studentId": "student_id", "isEnabled": true }`
    -   **Response**: `{ "message": "Portal status updated successfully." }`

### Teacher Routes

*Authentication Required: Teacher Role*

-   **`GET /api/teacher/students`**
    -   **Description**: Retrieves students assigned to the logged-in teacher (dummy data for now).
    -   **Response**: `[{ id, name, rollNo, ... }]`

-   **`POST /api/teacher/attendance`**
    -   **Description**: Marks attendance for a student.
    -   **Body**: `{ "studentId": "student_id", "date": "YYYY-MM-DD", "present": true }`
    -   **Response**: `{ "message": "Attendance marked successfully." }`

### Student Routes

*Authentication Required: Student Role*

-   **`GET /api/student/dashboard`**
    -   **Description**: Retrieves the student's dashboard data, including attendance summary and fee status.
    -   **Response**: `{ "attendancePercentage": 85, "feeStatus": "PAID", "portalEnabled": true, ... }`

---

## Automation Workflow

-   **Trigger**: The system runs a scheduled task every night at 2:00 AM.
-   **Process**:
    1.  It identifies all students whose portals are currently disabled.
    2.  For each student, it calculates their attendance over the last 14 business days (Mon-Fri).
    3.  It checks their current fee payment status.
    4.  **Activation Condition**: If attendance is >= 6 days AND their fee status is 'PAID', the student's portal is automatically activated.
-   **Notification**: Upon activation, an email is sent to the student's registered email address with their login credentials and a link to the portal.
-   **Logging**: All automated actions, as well as manual admin overrides, are logged in the `Logs` table for auditing purposes.
