from sqlalchemy import Column, Float, Integer, String, DateTime, func, Boolean, ForeignKey, Table 
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for many-to-many relationship (Note <-> Tag)
note_tag = Table(
    "note_tag",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # hash later, not plaintext!

    notes = relationship("Note", back_populates="owner")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=True)  # now optional
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    owner = relationship("User", back_populates="notes")

    tags = relationship("Tag", secondary=note_tag, back_populates="notes")

    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    width = Column(Float, default=150)
    height = Column(Float, default=150)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    notes = relationship("Note", secondary=note_tag, back_populates="tags")
