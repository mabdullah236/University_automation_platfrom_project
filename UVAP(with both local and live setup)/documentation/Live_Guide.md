# Live Version Guide - UVAP

## Prerequisites
- Docker & Docker Compose installed.
- A MongoDB Atlas account (Connection String).
- Stripe API Keys.
- Twilio API Keys.

## Setup Instructions

### 1. Environment Configuration
1. Navigate to `live_version_uvap`.
2. Create a `.env` file in the root (or separate .env files as per docker-compose config):
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/uvap_live
   JWT_SECRET=production_secret_key_complex
   STRIPE_KEY=sk_live_...
   TWILIO_SID=...
   TWILIO_TOKEN=...
   ```

### 2. Docker Deployment
1. Open a terminal in `live_version_uvap`.
2. Run `docker-compose up --build -d`.
3. This will spin up:
   - Backend Container
   - Frontend Container (Nginx)
   - ML Service Container
   - Redis Container

### 3. Accessing the Application
- The application will be available at `http://localhost` (or your domain if configured).
- Nginx handles the routing:
  - `/api` -> Backend
  - `/` -> Frontend

## CI/CD
- The project includes a GitHub Actions workflow in `.github/workflows/deploy.yml` (to be added) for automated deployment.
