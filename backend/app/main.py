from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import model, schemas, crud
from app.database import SessionLocal
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import authenticate_user, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
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

@app.get("/users/me/", response_model=schemas.UserOut)
def read_users_me(current_user: model.User = Depends(get_current_user)):
    return current_user

# -------------------------
# Auth Routes
# -------------------------
@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------
# Note Routes
# -------------------------

# Get all notes of current user
@app.get("/users/me/notes/", response_model=List[schemas.NoteOut])
def read_my_notes(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):
    return db.query(model.Note).filter(model.Note.owner_id == current_user.id).all()

# Create note for current user
@app.post("/notes/", response_model=schemas.NoteOut)
def create_note_for_current_user(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):
    return crud.create_note(db=db, note=note, user_id=current_user.id)

# Read single note
@app.get("/notes/{note_id}", response_model=schemas.NoteOut)
def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

# Update note (must be owner)
@app.put("/notes/{note_id}", response_model=schemas.NoteOut)
def edit_note(
    note_id: int,
    note: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):
    db_note = crud.get_note(db, note_id)
    if not db_note or db_note.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return crud.update_note(db, note_id=note_id, note_data=note)

# Delete note (must be owner)
@app.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):
    db_note = crud.get_note(db, note_id)
    if not db_note or db_note.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    crud.delete_note(db, note_id)
    return {"detail": "Note deleted successfully"}
