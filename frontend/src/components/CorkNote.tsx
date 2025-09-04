import { useState, useEffect } from "react";
import client from "../api/client";

interface CorkNoteProps {
  note: { id: number; content?: string; x: number; y: number; tags?: string[] };
  token: string | null;
  erasing: boolean;
  onUpdate: (id: number, updatedFields: Partial<{ content: string; x: number; y: number; tags?: string[] }>) => void;
  onDelete: (id: number) => void;
}

export default function CorkNote({ note, token, erasing, onUpdate, onDelete }: CorkNoteProps) {
  const [showTags, setShowTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState(note.content ?? "");

  useEffect(() => {
    setContent(note.content ?? "");
  }, [note.content]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (content !== note.content) {
        onUpdate(note.id, { content });
        if (token) {
          client.put(`/corkboard/${note.id}`, { content }, { headers: { Authorization: `Bearer ${token}` } })
            .catch(err => console.error("Failed to update content:", err));
        }
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [content, note.content, note.id, onUpdate, token]);

  const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (erasing) return;
    e.stopPropagation();

    const canvasRect = document.querySelector('.corkboard-canvas')?.getBoundingClientRect();
    if (!canvasRect) return;

    const offsetX = e.clientX - canvasRect.left - note.x;
    const offsetY = e.clientY - canvasRect.top - note.y;

    let currentX = note.x;
    let currentY = note.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      currentX = moveEvent.clientX - canvasRect.left - offsetX;
      currentY = moveEvent.clientY - canvasRect.top - offsetY;
      onUpdate(note.id, { x: currentX, y: currentY });
    };

    const handleMouseUp = async () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (!token) return;
      try {
        await client.put(`/corkboard/${note.id}`, { x: currentX, y: currentY }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Failed to update note position:", err);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !token) return;
    const updatedTags = [...(note.tags ?? []), newTag.trim()];
    onUpdate(note.id, { tags: updatedTags });
    try {
      await client.put(`/corkboard/${note.id}`, { tags: updatedTags }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTag("");
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!token) return;
    const updatedTags = (note.tags ?? []).filter((t) => t !== tagToRemove);
    onUpdate(note.id, { tags: updatedTags });
    try {
      await client.put(`/corkboard/${note.id}`, { tags: updatedTags }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Failed to remove tag:", err);
    }
  };

  return (
    <div className="corkboard-note-wrapper" style={{ top: note.y, left: note.x - 75 }}>
      {erasing && <button className="delete-btn" onClick={() => onDelete(note.id)}>✖</button>}

      <textarea
        className="corkboard-note"
        value={content}
        maxLength={250}
        onChange={(e) => setContent(e.target.value)}
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
      />

      <div className="tag-circle" onClick={(e) => { e.stopPropagation(); setShowTags(!showTags); }}>
        Tags
      </div>

      {showTags && (
      <div className="tag-popup" onClick={(e) => e.stopPropagation()}>
        <div className="tags-list">
          {(note.tags ?? []).map((tag) => (
            <span
              key={tag}
              className="tag"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
        />
        <button onClick={handleAddTag}>Add</button>
      </div>
    )}

    </div>
  );
}
