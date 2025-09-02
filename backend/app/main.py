from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import model, schemas, crud
from app.database import SessionLocal
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.auth import authenticate_user, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# User Routes
# -------------------------
@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}", response_model=schemas.UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# -------------------------
# Note Routes
# -------------------------
@app.post("/users/{user_id}/notes/", response_model=schemas.NoteOut)
def create_note_for_user(user_id: int, note: schemas.NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db=db, note=note, user_id=user_id)

@app.get("/notes/", response_model=List[schemas.NoteOut])
def read_notes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_notes(db, skip=skip, limit=limit)

@app.get("/notes/{note_id}", response_model=schemas.NoteOut)
def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.delete_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"detail": "Note deleted successfully"}

@app.put("/notes/{note_id}", response_model=schemas.NoteOut)
def edit_note(note_id: int, note: schemas.NoteUpdate, db: Session = Depends(get_db)):
    updated_note = crud.update_note(db, note_id=note_id, note_data=note)
    if not updated_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated_note

# -------------------------
# Tag Routes
# -------------------------
@app.post("/tags/", response_model=schemas.TagOut)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db=db, tag=tag)

@app.get("/tags/", response_model=List[schemas.TagOut])
def read_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)

# -------------------------
# Auth Routes
# -------------------------

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.UserOut)
def read_users_me(current_user: schemas.UserOut = Depends(get_current_user)):
    return current_user

# -------------------------
# Root Route
# -------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to Noteify API! Go to /docs to test the endpoints."}
