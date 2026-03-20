# API Documentation - UVAP

## Base URL
- Local: `http://localhost:5000/api/v1`
- Live: `https://api.yourdomain.com/api/v1`

## Authentication
### POST /auth/login
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "token": "jwt_token", "user": { ... } }`

### POST /auth/verify-otp
- **Body**: `{ "phone": "...", "otp": "..." }`

## User Management
### GET /users/profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile details.

## Academics
### GET /courses
- **Query**: `?program=CS&semester=1`
- **Response**: List of courses.

### POST /registration/register
- **Body**: `{ "courseIds": ["..."] }`

## ML Service
### POST /ml/predict-sentiment
- **Body**: `{ "review": "Great teacher!" }`
- **Response**: `{ "sentiment": "Positive", "score": 0.95 }`

## Faculty & Attendance
### GET /faculty
- **Response**: List of faculty profiles.

### POST /attendance
- **Body**: `{ "courseId": "...", "date": "...", "students": [...] }`

## Facilities
### GET /facilities/hostels
- **Response**: List of hostels and availability.

### GET /facilities/transport
- **Response**: List of transport routes.

### GET /library/books
- **Response**: List of books.

## Advanced Features
### GET /advanced/alumni
- **Response**: List of alumni.

### GET /advanced/events
- **Response**: List of upcoming events.

*(Full Swagger documentation will be available at /api-docs endpoint)*
