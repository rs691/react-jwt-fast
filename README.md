Backend (FastAPI + MySQL)

main.py - Complete FastAPI backend with:

User registration endpoint
Login endpoint with JWT generation
Protected route for user profile
Password hashing with bcrypt
MySQL database integration
Extensive console logging showing token flow


test_main.py - Comprehensive backend tests covering:

User registration (success, duplicates, validation)
User login (success, wrong password, non-existent user)
Token validation and claims
Protected routes (valid/invalid/expired tokens)
All with detailed explanations



Frontend (React TypeScript + Vite)

Complete React App with:

AuthContext for state management
Login page with form validation
Register page with password matching
Dashboard showing user info and JWT token
Protected routes with authentication checks
Axios for API calls
Tailwind CSS for styling
Extensive console logging at every step


Frontend Tests covering:

AuthContext (login, register, logout, token restoration)


RetryRSContinue
Login page (form rendering, validation, success/error states)

Register page (password validation, duplicate handling)
ProtectedRoute (authentication checks, redirects)
All with detailed test explanations




Configuration Files:

package.json with all dependencies
vite.config.ts for Vite + Vitest
tsconfig.json for TypeScript
tailwind.config.js for styling
Complete MySQL setup script


Complete Setup Guide with:

Step-by-step installation instructions
Testing the authentication flow
Console log examples
Troubleshooting guide



🔍 Console Logs - What You'll See:
During Registration:
javascript[REGISTER PAGE] Form submitted with username: testuser, email: test@example.com
[AUTH CONTEXT] Registration attempt for username: testuser email: test@example.com
[AUTH CONTEXT] Sending registration request to backend...
[AUTH CONTEXT] Registration successful! User data: {id: 1, username: "testuser"...}
[AUTH CONTEXT] Auto-logging in after registration...
[AUTH CONTEXT] Login successful! Token received: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[AUTH CONTEXT] Full token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[AUTH CONTEXT] Token stored in localStorage
[AUTH CONTEXT] Fetching user data with token: eyJhbGciOiJI...
[AUTH CONTEXT] User data received: {id: 1, username: "testuser", email: "test@example.com"}
Backend Logs:
python[API] Registration attempt for username: testuser, email: test@example.com
[DB] Connection established successfully
[AUTH] Password hashed successfully
[API] User registered successfully with ID: 1
[API] Login attempt for username: testuser
[DB] User lookup for 'testuser': Found
[AUTH] Password verification: True
[JWT] Token created for user: testuser
[JWT] Token expires at: 2025-10-27 15:30:00
[JWT] Generated token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[API] Login successful for user: testuser

🚀 Quick Start:
# Backend
## Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

## Install dependencies
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart mysql-connector-python pytest httpx

## Setup MySQL database
mysql -u root -p
## Run the SQL commands from setup_db.sql

## Update main.py with your MySQL password (line 28)
## Update SECRET_KEY (line 21)

## Run backend
python main.py

# Frontend
## Create Vite project
npm create vite@latest frontend -- --template react-ts
cd frontend

## Install dependencies
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom vitest jsdom

## Initialize Tailwind
npx tailwindcss init -p

## Copy all the files from artifacts
## Then run
npm run dev


🧪 Running Tests:
Backend Tests:
bash# From backend directory
pytest test_main.py -v

# Example output:
# test_main.py::TestRegistration::test_register_new_user_success PASSED
# test_main.py::TestLogin::test_login_success PASSED
# test_main.py::TestProtectedRoutes::test_get_current_user_with_valid_token PASSED
Frontend Tests:
bash# From frontend directory
npm test

# Example output:
# ✓ tests/AuthContext.test.tsx (7 tests)
# ✓ tests/Login.test.tsx (5 tests)
# ✓ tests/Register.test.tsx (5 tests)
# ✓ tests/ProtectedRoute.test.tsx (4 tests)
```

## 📊 Token Flow Visualization:
```
REGISTRATION:
User Form → Frontend → Backend /register → Database
                  ↓
         Auto-login triggered
                  ↓
         Backend /login → JWT Created
                  ↓
         Token → localStorage
                  ↓
         Fetch user data → Dashboard

LOGIN:
Credentials → Backend /login → Validate → Create JWT
                                            ↓
                                    Return to Frontend
                                            ↓
                                    Store in localStorage
                                            ↓
                                    Fetch user data
                                            ↓
                                        Dashboard

PROTECTED ROUTE:
Page Load → Check localStorage → Token found?
                                      ↓
                                    Yes → Validate with backend
                                      ↓
                                  Valid? → Show content
                           
