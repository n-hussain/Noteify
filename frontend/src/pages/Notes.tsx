import { useEffect, useState } from "react";
import client from "../api/client";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";
import SearchBar from "../components/SearchBar";
import "../styles/notes.css";

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  pinned?: boolean;
  archived?: boolean;
  owner_id?: number;
  tags?: Tag[];
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"created" | "updated" | "title">(
    "updated"
  );

  const token = localStorage.getItem("access_token");

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        alert("You must log in first!");
        setLoading(false);
        return;
      }

      try {
        const res = await client.get<Note[]>("/users/me/notes/", {
          headers: authHeaders,
        });
        setNotes(res.data);
      } catch (err) {
        console.error("Error fetching notes:", err);
        alert("Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token]);

  const handleAddNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
  };

  const handleDeleteNote = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await client.delete(`/notes/${id}`, { headers: authHeaders });
      if (res.status === 200 || res.status === 204) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete note: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesText =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        note.tags?.some((t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ?? false;

      return matchesText || matchesTag;
    })
    .sort((a, b) => {
      if (sortOption === "created") {
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
      } else if (sortOption === "updated") {
        return new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  if (loading) return <p className="loading">Loading notes...</p>;

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>My Notes</h1>
        <div className="header-actions">
          <button className="new-note-btn" onClick={() => setShowForm(true)}>
            + New Note
          </button>
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        </div>
      </div>

      {showForm && (
        <NoteForm
          onClose={handleFormClose}
          onSave={editingNote ? handleUpdateNote : handleAddNote}
          note={editingNote || undefined}
          authHeaders={authHeaders} // Pass headers to form
        />
      )}

      {filteredNotes.length === 0 ? (
        <p className="empty">No notes found.</p>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDeleteNote}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
