"""
FastAPI JWT Authentication Backend
Install dependencies: pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart mysql-connector-python pydantic-settings pytest httpx
"""

import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import mysql
import mysql.connector
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from mysql.connector import Error
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

# JWT Configuration
SECRET_KEY = "4567"  # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Change this!
    "database": "auth_db"
}

# Initialize FastAPI
app = FastAPI(title="JWT Auth API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Database Functions
def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print(f"[DB] Connection established successfully")
        return connection
    except Error as e:
        print(f"[DB] Error connecting to database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )

def create_tables():
    """Create users table if not exists"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    create_table_query = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    try:
        cursor.execute(create_table_query)
        connection.commit()
        print("[DB] Users table created/verified successfully")
    except Error as e:
        print(f"[DB] Error creating table: {e}")
    finally:
        cursor.close()
        connection.close()

# Authentication Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    result = pwd_context.verify(plain_password, hashed_password)
    print(f"[AUTH] Password verification: {result}")
    return result

def get_password_hash(password: str) -> str:
    """Hash password"""
    password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"[JWT] Token created for user: {data.get('sub')}")
    print(f"[JWT] Token expires at: {expire}")
    print(f"[JWT] Generated token: {encoded_jwt[:20]}...")
    return encoded_jwt

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user from database by username"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        # Ensure we return a plain dict to satisfy static type checkers
        if user is None:
            print(f"[DB] User lookup for '{username}': Not found")
            return None
        if isinstance(user, dict):
            print(f"[DB] User lookup for '{username}': Found")
            return user
        # Fallback: convert a sequence row to a dict using column names provided by the cursor
        column_names = getattr(cursor, "column_names", None) or []
        if column_names and len(column_names) == len(user):
            user_dict = dict(zip(column_names, user))
            print(f"[DB] User lookup for '{username}': Found (converted to dict)")
            return user_dict
        # If we cannot map columns to values, log and return None
        print(f"[DB] Unexpected row format for user '{username}': could not convert to dict")
        return None
    finally:
        cursor.close()
        connection.close()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT token and return current user"""
    print(f"[JWT] Validating token: {token[:20]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        print(f"[JWT] Token decoded successfully for user: {username}")
        
        if username is None:
            print("[JWT] No username in token payload")
            raise credentials_exception
            
        token_data = TokenData(username=username)
    except JWTError as e:
        print(f"[JWT] Token validation error: {e}")
        raise credentials_exception

    # Ensure username is a concrete str before calling DB function
    username = token_data.username
    if username is None:
        print("[JWT] Token contained no username after decoding")
        raise credentials_exception

    user = get_user_by_username(username=username)
    if user is None:
        print(f"[JWT] User not found in database")
        raise credentials_exception
    
    print(f"[AUTH] User authenticated successfully: {username}")
    return user

# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("[APP] Starting application...")
    create_tables()


@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register new user"""
    print(f"[API] Registration attempt for username: {user.username}, email: {user.email}")
    
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", 
                      (user.username, user.email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"[API] Registration failed: User already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Hash password and insert user
        hashed_password = get_password_hash(user.password)
        insert_query = """
        INSERT INTO users (username, email, hashed_password) 
        VALUES (%s, %s, %s)
        """
        cursor.execute(insert_query, (user.username, user.email, hashed_password))
        connection.commit()
        
        user_id = cursor.lastrowid
        # Ensure we have a concrete integer id (cursor.lastrowid can be None or non-int)
        if user_id is None:
            print(f"[API] Failed to retrieve inserted user ID")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed: could not determine user id"
            )
        user_id = int(user_id)
        print(f"[API] User registered successfully with ID: {user_id}")
        
        return UserResponse(id=user_id, username=user.username, email=user.email)
        
    except Error as e:
        print(f"[API] Database error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )
    finally:
        cursor.close()
        connection.close()


@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return JWT token"""
    print(f"[API] Login attempt for username: {form_data.username}")
    
    user = get_user_by_username(form_data.username)
    
    # Ensure user exists and has a hashed password before attempting to index or verify
    if user is None:
        print(f"[API] Login failed: User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    hashed_password = user.get("hashed_password")
    if hashed_password is None:
        print(f"[API] Login failed: Missing stored password for user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed",
        )
    
    # Verify password (coerce to str to be safe)
    if not verify_password(form_data.password, str(hashed_password)):
        print(f"[API] Login failed: Invalid password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    print(f"[API] Login successful for user: {form_data.username}")
    print(f"[API] Returning token: {access_token[:20]}...")
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    print(f"[API] Fetching current user info for: {current_user['username']}")
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"]
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "JWT Authentication API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    print("[APP] Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)