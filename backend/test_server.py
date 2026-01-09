from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, User
from schemas import UserCreate, UserResponse
from auth import get_password_hash
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Test Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Test server is running", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Registration attempt: {user.username}, {user.email}")
    
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        print(f"User already exists: {db_user.username}")
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    try:
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created successfully: {db_user.username}")
        return db_user
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)