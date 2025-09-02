import type { Note } from "../pages/Notes";
import "../styles/notes.css";

interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => void;
  onEdit?: (note: Note) => void; 
}

export default function NoteCard({ note, onDelete, onEdit }: NoteCardProps) {
  return (
    <div className={`note-card ${note.archived ? "archived" : ""}`}>
      <div className="note-header">
        <h2>
          {note.title} {note.pinned && <span className="pinned">📌</span>}
        </h2>
      </div>

      <p>{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span key={tag.id} className="tag">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="note-footer">
        {onEdit && (
          <button className="edit-btn" onClick={() => onEdit(note)}>
            Edit
          </button>
        )}
        <button className="delete-btn" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
