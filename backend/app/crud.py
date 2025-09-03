from sqlalchemy.orm import Session
from typing import List
from app import model, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# Password utilities
# -------------------------
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------
# User CRUD
# -------------------------
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = model.User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(model.User).filter(model.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(model.User).filter(model.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(model.User).filter(model.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(model.User).offset(skip).limit(limit).all()


# -------------------------
# Note CRUD
# -------------------------
def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    db_note = model.Note(
        content=note.content,
        owner_id=user_id,
        x=note.x,
        y=note.y,
        width=note.width,
        height=note.height,
    )

    # Add tags
    tags = []
    for tag_name in note.tags:
        tag = db.query(model.Tag).filter(model.Tag.name == tag_name).first()
        if not tag:
            tag = model.Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tags.append(tag)
    db_note.tags = tags

    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note_data: schemas.NoteUpdate):
    db_note = db.query(model.Note).filter(model.Note.id == note_id).first()
    if not db_note:
        return None

    # Update simple fields
    for field in ["content", "x", "y", "width", "height"]:
        value = getattr(note_data, field, None)
        if value is not None:
            setattr(db_note, field, value)

    # Update tags
    if note_data.tags is not None:
        db_note.tags.clear()
        for tag_name in note_data.tags:
            tag = db.query(model.Tag).filter(model.Tag.name == tag_name).first()
            if not tag:
                tag = model.Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            db_note.tags.append(tag)

    db.commit()
    db.refresh(db_note)
    return db_note

def get_notes(db: Session, skip: int = 0, limit: int = 10):
    return db.query(model.Note).offset(skip).limit(limit).all()

def get_notes_for_user(db: Session, user_id: int):
    return db.query(model.Note).filter(model.Note.owner_id == user_id).all()

def get_note(db: Session, note_id: int):
    return db.query(model.Note).filter(model.Note.id == note_id).first()

def delete_note(db: Session, note_id: int):
    db_note = db.query(model.Note).filter(model.Note.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return db_note


# -------------------------
# Tag CRUD
# -------------------------
def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = model.Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_tags(db: Session):
    return db.query(model.Tag).all()
