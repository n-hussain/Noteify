import { useState } from "react";
import type { FormEvent } from "react";
import client from "../api/client";
import type { Note } from "../pages/Notes";

interface NoteFormProps {
  onClose: () => void;
  onSave: (note: Note) => void;
  note?: Note;
  authHeaders?: { Authorization?: string };
}

export default function NoteForm({ onClose, onSave, note, authHeaders}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(
    note?.tags?.map((tag) => tag.name).join(", ") || ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    setSaving(true);
    try {
      const payload = { title, content, tags: tagList };
      let res;

      if (note) {
        // Edit existing note
        res = await client.put<Note>(`/notes/${note.id}/`, payload,
          {headers: authHeaders}
        );
      } else {
        // Create new note for current user
        res = await client.post<Note>(`/notes/`, payload,
          {headers: authHeaders,}
        );
      }

      onSave(res.data);
      onClose();
      setTitle("");
      setContent("");
      setTags("");
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="note-modal-overlay active" onClick={onClose}>
      <div className="note-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{note ? "Edit Note" : "New Note"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="note-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
