import { useState, useEffect } from "react";
import client from "../api/client";

interface CorkNote {
  id: number;
  content: string;
  x: number;
  y: number;
}

export function useCorkboard(token: string | null) {
  const [notes, setNotes] = useState<CorkNote[]>([]);

  useEffect(() => {
    if (!token) return;
    client.get("/corkboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setNotes(data))
      .catch(err => console.error("Failed to fetch notes:", err));
  }, [token]);

  const addNote = async (note: Omit<CorkNote, "id">) => {
    if (!token) return;
    const { data } = await client.post("/corkboard", note, { headers: { Authorization: `Bearer ${token}` } });
    setNotes(prev => [...prev, data]);
  };

  const deleteNote = async (id: number) => {
    if (!token) return;
    await client.delete(`/corkboard/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const updateNote = (id: number, updatedFields: Partial<CorkNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedFields } : n));
  };

  return { notes, addNote, deleteNote, updateNote };
}
