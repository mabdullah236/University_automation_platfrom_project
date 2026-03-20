# System Requirements Document - UVAP

## 1. Hardware Requirements

### Server (Production)
- **CPU**: 4+ Cores (Intel Xeon / AMD EPYC)
- **RAM**: 16GB+
- **Storage**: 500GB+ SSD
- **Network**: 1Gbps+ Uplink

### Client (User)
- **Device**: Desktop, Laptop, Tablet, or Smartphone
- **OS**: Windows, macOS, Linux, iOS, Android
- **Browser**: Chrome, Firefox, Safari, Edge (Latest versions)

## 2. Software Requirements

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (v6+)
- **Cache**: Redis (Optional, for session/queue)

### Frontend
- **Framework**: React (v18+)
- **Build Tool**: Vite
- **Styling**: TailwindCSS

### Machine Learning
- **Language**: Python (v3.9+)
- **Framework**: Flask / FastAPI
- **Libraries**: scikit-learn, pandas, numpy, nltk

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Reverse Proxy)
- **OS**: Ubuntu 20.04/22.04 LTS (Recommended for Server)

## 3. External Services
- **Payment Gateway**: Stripe API
- **SMS Gateway**: Twilio API
- **Email Service**: SendGrid / SMTP
- **Cloud Storage**: AWS S3 (for document uploads)
