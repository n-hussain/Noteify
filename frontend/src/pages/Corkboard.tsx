import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import CorkNote from "../components/CorkNote";
import { useCorkboard } from "../components/UseCorkboard";
import "../styles/Corkboard.css";

export default function Corkboard() {
  const [adding, setAdding] = useState(false);
  const [erasing, setErasing] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const { notes, addNote, deleteNote, updateNote } = useCorkboard(token);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!adding || erasing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addNote({ content: "", x: e.clientX - rect.left, y: e.clientY - rect.top });
    setAdding(false);
  };
  

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  return (
    <div className="corkboard-page">
      <div className="corkboard-canvas-container">
        <div className={`corkboard-canvas ${adding ? "adding" : ""}`} onClick={handleCanvasClick}>
          {notes.map(note => (
            <CorkNote
              key={note.id}
              note={note}
              token={token}
              erasing={erasing}
              onDelete={deleteNote}
              onUpdate={updateNote}
            />
          ))}
        </div>

        <button className="toggle-add-btn floating" onClick={() => { setAdding(!adding); setErasing(false); }}>
          {adding ? "Stop Adding Notes" : "Add Note"}
        </button>

        <button className="eraser-btn" onClick={() => { setErasing(!erasing); setAdding(false); }}>
          {erasing ? "Stop Erasing" : "Eraser"}
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("access_token");
            navigate("/");
          }}
        >
          Logout
        </button>

      </div>
    </div>
  );
}
