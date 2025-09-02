from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# -------------------------
# Tag Schemas
# -------------------------
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# User Schemas
# -------------------------
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str  # will be hashed later

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Note Schemas
# -------------------------
class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    tags: List[str] = []  # list of tag names when creating a note

class NoteOut(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    pinned: bool
    archived: bool
    tags: List[TagOut] = []  # show tags
    owner: Optional[UserOut] = None  # show who created the note

    class Config:
        from_attributes = True

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None
    tags: Optional[List[str]] = None
