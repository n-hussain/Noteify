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
    content: Optional[str] = None   # now optional
    x: Optional[float] = 0
    y: Optional[float] = 0
    width: Optional[float] = 150
    height: Optional[float] = 100

class NoteCreate(NoteBase):
    tags: List[str] = []  # list of tag names when creating a note

class NoteOut(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagOut] = []  # show tags
    owner: Optional[UserOut] = None  # show who created the note

    class Config:
        from_attributes = True

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
