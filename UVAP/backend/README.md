
# University Automation System - Backend

This is the secure Node.js (Express.js) backend for the University Automation Platform. It provides a RESTful API for managing users, attendance, fees, and automated student portal access.

## Features

-   **Secure Authentication**: JWT-based authentication with access and refresh tokens.
-   **Role-Based Access Control (RBAC)**: Differentiated access for Admin, Teacher, and Student roles.
-   **Database**: PostgreSQL with Prisma ORM for type-safe database access.
-   **Security**: `helmet` for securing HTTP headers, `express-rate-limit` to prevent brute-force attacks, and `bcrypt` for password hashing.
-   **Automation**: A nightly cron job to automatically enable/disable student portals based on attendance and fee payment status.
-   **Email Notifications**: Sends email notifications upon student portal activation.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **ORM**: Prisma
-   **Database**: PostgreSQL
-   **Authentication**: JSON Web Tokens (JWT)
-   **Security**: Helmet, Express Rate Limiter, Bcrypt
-   **Scheduling**: node-cron
-   **Emailing**: Nodemailer

---

## Installation & Setup

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [PostgreSQL](https://www.postgresql.org/download/) running locally or on a server.
-   A package manager like `npm` or `yarn`.

### 2. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment Variables

Create a `.env` file in the `backend` root directory by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and update the variables with your configuration:

-   `DATABASE_URL`: Your PostgreSQL connection string.
-   `PORT`: The port for the server to run on (e.g., 5000).
-   `JWT_SECRET` & `JWT_REFRESH_SECRET`: Strong, unique secret keys for signing tokens.
-   `EMAIL_*`: Your SMTP server details for sending emails. You can use a service like [Ethereal](https://ethereal.email/) for testing.

### 5. Database Migration

Run the Prisma migration to set up your database schema:

```bash
npm run prisma:migrate
```

This will create all the necessary tables in your PostgreSQL database.

### 6. Seed the Database (Optional but Recommended)

To populate the database with initial dummy data (an admin, teacher, and student), run the seed script:

```bash
npm run prisma:seed
```

The credentials for the seeded users will be printed in the console.

### 7. Start the Server

-   **For development (with auto-reloading):**
    ```bash
    npm run dev
    ```
-   **For production:**
    ```bash
    npm start
    ```

The server will be running on the port specified in your `.env` file (e.g., `http://localhost:5000`).
