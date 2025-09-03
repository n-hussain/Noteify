import { useState } from "react";
import "../styles/Corkboard.css";

interface CorkNote {
  id: number;
  content: string;
  x: number;
  y: number;
}

export default function Corkboard() {
  const [notes, setNotes] = useState<CorkNote[]>([]);
  const [counter, setCounter] = useState(1); // simple unique id

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNote: CorkNote = { id: counter, content: "", x, y };
    setNotes([...notes, newNote]);
    setCounter(counter + 1);
  };

  const handleContentChange = (id: number, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
  };

  return (
    <div className="corkboard" onClick={handleCanvasClick}>
      {notes.map(note => (
        <textarea
          key={note.id}
          className="corknote"
          style={{ top: note.y, left: note.x, position: "absolute" }}
          value={note.content}
          onChange={(e) => handleContentChange(note.id, e.target.value)}
        />
      ))}
    </div>
  );
}
