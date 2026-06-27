# NyxVault 🔐

**A Cloud-Enabled Secure File Vault with AES-256 Encryption, Secure File Sharing, Integrity Monitoring, JWT Authentication, and Real-Time Security Alerts**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [File Sharing](#file-sharing)
- [Real-Time Alerts](#real-time-alerts)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

NyxVault is an enterprise-grade secure file storage solution designed to provide maximum security, privacy, and ease of use. It combines military-grade AES-256 encryption with modern cloud infrastructure to create a comprehensive file management system with advanced security monitoring and integrity verification.

Whether you're storing sensitive documents, personal files, or confidential business data, NyxVault ensures your files remain encrypted, protected, and accessible only to authorized users.

---

## ✨ Key Features

### 🔒 **Military-Grade Encryption**
- **AES-256 Encryption**: Industry-standard encryption for all stored files
- **End-to-End Encryption**: Files encrypted before transmission
- **Secure Key Management**: HSM-compatible key storage
- **Zero-Knowledge Architecture**: Server cannot access unencrypted file contents

### 🎫 **JWT Authentication**
- **Stateless Authentication**: JWT-based token system for secure API access
- **Token Expiration**: Configurable token TTL for enhanced security
- **Refresh Tokens**: Automatic session renewal capability
- **Multi-Device Support**: Seamless access across multiple devices

### 📤 **Secure File Sharing**
- **Encrypted Share Links**: Share files with expiration dates
- **Password-Protected Shares**: Optional password protection for shared links
- **Access Controls**: Fine-grained permissions (view, download, upload)
- **Audit Trail**: Complete history of who accessed shared files
- **Revoke Access**: Instantly revoke access to shared files

### ✅ **Integrity Monitoring**
- **Checksum Verification**: SHA-256 checksums for file integrity
- **Tamper Detection**: Automatic detection of modified files
- **Version History**: Track and restore previous file versions
- **Integrity Reports**: Detailed reports on file modifications

### 🚨 **Real-Time Security Alerts**
- **Unauthorized Access Detection**: Instant alerts on suspicious activity
- **Failed Login Monitoring**: Track and alert on multiple failed attempts
- **File Modification Alerts**: Real-time notifications of file changes
- **Anomaly Detection**: AI-powered detection of unusual patterns
- **Email & Push Notifications**: Multi-channel alert delivery
- **Security Dashboard**: Comprehensive security overview

### ☁️ **Cloud-Ready Architecture**
- **Scalable Infrastructure**: Built for cloud deployment
- **Multi-Region Support**: Data replication across regions
- **Backup & Recovery**: Automatic backup systems
- **Load Balancing**: Distributed file access
- **High Availability**: 99.9% uptime SLA

### 👥 **User Management**
- **Role-Based Access Control (RBAC)**: Admin, User, Viewer roles
- **Organization Support**: Multiple teams and departments
- **Audit Logs**: Complete user activity tracking
- **Session Management**: Secure session handling

---

## 🛠️ Technology Stack

### Backend
- **Node.js / Express.js** - REST API server
- **Python** - Encryption and data processing
- **MongoDB** - Document database for metadata
- **Redis** - Caching and session management

### Frontend
- **React.js** - Modern UI framework
- **Redux** - State management
- **Axios** - HTTP client
- **TailwindCSS** - Responsive styling

### Security & Encryption
- **crypto-js** - JavaScript encryption library
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **helmet.js** - HTTP security headers

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration (optional)
- **AWS S3 / Azure Blob** - Cloud storage
- **CloudFlare** - CDN and DDoS protection

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   NyxVault Architecture                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Frontend (React.js)                      │  │
│  │  - User Dashboard                               │  │
│  │  - File Manager                                 │  │
│  │  - Security Settings                            │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                    │
│                   ▼                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │    API Gateway (Express.js + JWT Auth)           │  │
│  │  - Authentication                               │  │
│  │  - File Operations                              │  │
│  │  - User Management                              │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                    │
│        ┌──────────┴──────────────┬──────────────┐      │
│        ▼                         ▼              ▼      │
│  ┌──────────────┐   ┌──────────────────┐  ┌─────────┐ │
│  │ MongoDB      │   │ File Processing  │  │ Redis   │ │
│  │ (Metadata)   │   │ (Python)         │  │ (Cache) │ │
│  │              │   │ - Encryption     │  │         │ │
│  │ - Users      │   │ - Compression    │  │ - Keys  │ │
│  │ - Shares     │   │ - Integrity      │  │ - Auth  │ │
│  │ - Logs       │   │   Verification   │  │ - Tmp   │ │
│  └──────────────┘   └──────────────────┘  └─────────┘ │
│        │                                        │      │
│        └────────────────┬─────────────────────────────┘ │
│                         ▼                              │
│        ┌───────────────────────────────────────────┐   │
│        │   Cloud Storage (S3 / Azure Blob)         │   │
│        │   - Encrypted File Storage                │   │
│        │   - Versioning                            │   │
│        │   - Multi-Region Replication              │   │
│        └───────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- Node.js v16.0 or higher
- Python 3.8 or higher
- MongoDB 4.4 or higher
- Redis 6.0 or higher
- Git

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sai-krishna007/NyxVault.git
   cd NyxVault
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install Python Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

5. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start MongoDB & Redis**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   docker run -d -p 6379:6379 --name redis redis
   ```

7. **Run the Application**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

### Docker Setup

```bash
docker-compose up -d
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/nyxvault
MONGODB_USER=admin
MONGODB_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRY=7d

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_ALGORITHM=aes-256-cbc

# Cloud Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=nyxvault-files

# Email Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@nyxvault.com

# Security
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=15m
SESSION_TIMEOUT=30m

# Features
ENABLE_2FA=true
ENABLE_FILE_VERSIONING=true
ENABLE_SHARING=true
MAX_FILE_SIZE=5GB
```

---

## 📖 Usage

### User Registration & Login

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "StrongPassword123!",
    "fullName": "John Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }'
```

### File Upload

```bash
# Upload a file (authenticated)
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "filename=myfile.pdf"
```

### File Download

```bash
# Download a file (authenticated)
curl -X GET http://localhost:5000/api/files/FILEID/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded_file.pdf
```

### Create Secure Share Link

```bash
# Create a share link with expiration
curl -X POST http://localhost:5000/api/shares/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "FILEID",
    "expiresIn": "7d",
    "password": "SharePassword123",
    "permissions": ["download"]
  }'
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/2fa/enable` | Enable 2FA |
| POST | `/api/auth/2fa/verify` | Verify 2FA code |

### File Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List user files |
| POST | `/api/files/upload` | Upload file |
| GET | `/api/files/:id` | Get file metadata |
| GET | `/api/files/:id/download` | Download file |
| DELETE | `/api/files/:id` | Delete file |
| POST | `/api/files/:id/verify` | Verify file integrity |
| GET | `/api/files/:id/versions` | Get file versions |

### Sharing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shares/create` | Create share link |
| GET | `/api/shares/:shareId` | Get share details |
| POST | `/api/shares/:shareId/access` | Access shared file |
| DELETE | `/api/shares/:shareId` | Revoke share |
| GET | `/api/shares/:shareId/logs` | Share access logs |

### Security Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/alerts` | Get security alerts |
| GET | `/api/security/audit-logs` | Get audit logs |
| POST | `/api/security/alert-settings` | Configure alerts |
| GET | `/api/security/dashboard` | Security dashboard |

---

## 🔐 Security Features

### Encryption Standards
- **Algorithm**: AES-256 in CBC mode
- **Key Derivation**: PBKDF2 with SHA-256
- **Random IVs**: Unique initialization vectors for each file
- **Authenticated Encryption**: HMAC-SHA256 for integrity

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Automatic session renewal
- **Two-Factor Authentication**: Optional 2FA via TOTP
- **Role-Based Access Control**: Admin, User, Viewer roles

### Network Security
- **HTTPS/TLS 1.3**: Encrypted data in transit
- **CORS Protection**: Cross-origin request filtering
- **Rate Limiting**: API request throttling
- **CSRF Protection**: Cross-site request forgery prevention
- **Security Headers**: 
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security

### Data Protection
- **File Integrity**: SHA-256 checksums
- **Secure Deletion**: Cryptographic shredding
- **No Plain Text Storage**: All sensitive data hashed
- **Audit Trail**: Complete activity logging

---

## 📤 File Sharing

### Creating a Secure Share

1. Select file from dashboard
2. Click "Share"
3. Configure sharing settings:
   - **Expiration**: Time limit for access
   - **Password Protection**: Optional password
   - **Permissions**: View, Download, or Upload
   - **Max Downloads**: Limit download count
4. Copy and send share link
5. Recipients access with password (if set)

### Share Access Flow

```
User A (Owner)
    ↓
Create Share Link (encrypted token)
    ↓
Send Link to User B
    ↓
User B Accesses Link
    ↓
Verify Password & Permissions
    ↓
Decrypt & Deliver File
    ↓
Log Access in Audit Trail
```

---

## 🚨 Real-Time Alerts

### Alert Types

- **Unauthorized Access**: Failed login attempts
- **File Modifications**: Unauthorized changes detected
- **Permission Changes**: Role or permission updates
- **Share Revocation**: Access to shares removed
- **Quota Exceeded**: Storage limit warnings
- **Device Login**: New device login detected
- **Suspicious Activity**: Anomalous behavior flagged

### Alert Channels

- **Email Notifications**: Immediate email alerts
- **In-App Notifications**: Dashboard alerts
- **Push Notifications**: Mobile app notifications
- **SMS Alerts**: Critical security alerts (premium)

### Configuring Alerts

Navigate to Security Settings → Alert Preferences to customize:
- Alert types
- Notification channels
- Alert frequency
- Recipients

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/NyxVault.git
   cd NyxVault
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: Description of your changes"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide clear description
   - Reference any related issues
   - Ensure tests pass

### Development Guidelines

- **Code Style**: ESLint + Prettier
- **Testing**: Jest for unit tests, Mocha for integration tests
- **Commits**: Follow conventional commit format
- **Documentation**: Update README and inline comments

---

## 📄 License

NyxVault is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation
- [Complete API Documentation](https://nyxvault-docs.example.com)
- [Security Whitepaper](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/Sai-krishna007/NyxVault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sai-krishna007/NyxVault/discussions)
- **Email**: support@nyxvault.com
- **Security Issues**: security@nyxvault.com

### Roadmap

- [ ] Mobile Apps (iOS & Android)
- [ ] End-to-End Encrypted Messaging
- [ ] Blockchain Audit Trail
- [ ] Advanced ML-based Threat Detection
- [ ] Enterprise SAML Integration
- [ ] Compliance: SOC2, ISO 27001, HIPAA

---

## 🎓 Acknowledgments

- Built with security best practices
- Inspired by industry-leading security standards
- Community contributions and feedback
- Open-source security libraries

---

## 🌟 Show Your Support

If you find NyxVault helpful, please:
- ⭐ Star this repository
- 🔗 Share with others
- 🐛 Report bugs and suggest features
- 💬 Participate in discussions
- 🤝 Contribute code or documentation

---

**NyxVault** - Your Files, Your Privacy, Your Vault 🔐

Made with ❤️ by [Sai-krishna007](https://github.com/Sai-krishna007)
