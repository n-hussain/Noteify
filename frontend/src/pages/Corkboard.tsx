import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CorkNote from "../components/CorkNote";
import SearchBar from "../components/SearchBar";
import { useCorkboard } from "../components/useCorkboard";
import "../styles/Corkboard.css";

export default function Corkboard() {
  const [adding, setAdding] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [highlightedTags, setHighlightedTags] = useState<string[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const { filteredNotes, query, setQuery, addNote, deleteNote, updateNote } = useCorkboard(token);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setHighlightedTags([]);
    if (!adding || erasing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addNote({ content: "", x: e.clientX - rect.left, y: e.clientY - rect.top, tags: [] });
    setAdding(false);
  };

  return (
    <div className="corkboard-page">
      <SearchBar query={query} onQueryChange={setQuery} />

      <div className="corkboard-canvas-container">
        <div
          className={`corkboard-canvas ${adding ? "adding" : ""}`}
          onClick={handleCanvasClick}
        >
          {filteredNotes.map((note) => (
            <CorkNote
              key={note.id}
              note={note}
              token={token}
              erasing={erasing}
              onDelete={deleteNote}
              onUpdate={updateNote}
              highlightedTags={highlightedTags}
              setHighlightedTags={setHighlightedTags}
            />
          ))}
        </div>

        <button
          className="toggle-add-btn floating"
          onClick={() => {
            setAdding(!adding);
            setErasing(false);
          }}
        >
          +
        </button>

        <button
          className="eraser-btn"
          onClick={() => {
            setErasing(!erasing);
            setAdding(false);
          }}
        >
          <img src="/assets/eraser.png" alt="Eraser" width={30} height={30} />
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("access_token");
            navigate("/");
          }}
        >
          <img src="/assets/logout.png" alt="Logout" width={30} height={30} />
        </button>
      </div>
    </div>
  );
}
