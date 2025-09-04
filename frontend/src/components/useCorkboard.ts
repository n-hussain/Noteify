import { useState, useEffect, useMemo } from "react";
import client from "../api/client";

interface CorkNote {
  id: number;
  content: string;
  x: number;
  y: number;
  tags: string[];
}

export function useCorkboard(token: string | null) {
  const [notes, setNotes] = useState<CorkNote[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!token) return;
    client
      .get("/corkboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const normalized = data.map((note: any) => ({
          ...note,
          tags: Array.isArray(note.tags)
            ? note.tags.map((t: any) => t.name)
            : [],
        }));
        setNotes(normalized);
      })
      .catch((err) => console.error("Failed to fetch notes:", err));
  }, [token]);

  const addNote = async (note: Omit<CorkNote, "id">) => {
    if (!token) return;
    const { data } = await client.post("/corkboard", note, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const normalized = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.map((t: any) => t.name) : [],
    };

    setNotes((prev) => [...prev, normalized]);
  };

  const deleteNote = async (id: number) => {
    if (!token) return;
    await client.delete(`/corkboard/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNote = (id: number, updatedFields: Partial<CorkNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updatedFields } : n))
    );
  };

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return notes;
    const lowerQuery = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.content?.toLowerCase().includes(lowerQuery) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [notes, query]);

  return {
    notes,
    filteredNotes,
    query,
    setQuery,
    addNote,
    deleteNote,
    updateNote,
  };
}
