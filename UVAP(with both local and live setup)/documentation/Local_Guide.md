# Local Version Guide - UVAP

## Prerequisites
- Node.js installed.
- MongoDB installed locally and running on port 27017.
- Python 3.9+ installed.

## Setup Instructions

### 1. Backend Setup
1. Navigate to `local_version_uvap/backend`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/uvap_local
   JWT_SECRET=local_dev_secret
   ```
4. Run `npm run dev` to start the server.

### 2. Frontend Setup
1. Navigate to `local_version_uvap/frontend`.
2. Run `npm install`.
3. Run `npm run dev` to start the Vite development server.

### 3. ML Service Setup
1. Navigate to `local_version_uvap/ml_service`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `venv\Scripts\activate` (Windows).
4. Install requirements: `pip install -r requirements.txt`.
5. Run the service: `python app.py`.

## Testing
- Visit `http://localhost:5173` to access the UI.
- The backend runs on `http://localhost:5000`.
- The ML service runs on `http://localhost:5001`.
