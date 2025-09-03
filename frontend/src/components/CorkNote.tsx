import client from "../api/client";

interface CorkNoteProps {
  note: { id: number; content: string; x: number; y: number };
  token: string | null;
  erasing: boolean;
  onUpdate: (id: number, updatedFields: Partial<{ content: string; x: number; y: number }>) => void;
  onDelete: (id: number) => void;
}

export default function CorkNote({ note, token, erasing, onUpdate, onDelete }: CorkNoteProps) {

  const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (erasing) return;
    e.stopPropagation();

    const canvasRect = document.querySelector('.corkboard-canvas')!.getBoundingClientRect();
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

      try {
        await client.put(`/corkboard/${note.id}`, { x: currentX, y: currentY }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to update note position:", err);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    onUpdate(note.id, { content });
    try {
      await client.put(`/corkboard/${note.id}`, { content }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Failed to update content:", err);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.fontSize = "1rem"; // reset
    while (el.scrollHeight > el.clientHeight && parseFloat(el.style.fontSize) > 0.5) {
      el.style.fontSize = (parseFloat(el.style.fontSize) - 0.05) + "rem";
    }
  };

  return (
    <div className="corkboard-note-wrapper" style={{ top: note.y, left: note.x - 75 }}>
      {erasing && (
        <button className="delete-btn" onClick={() => onDelete(note.id)}>✖</button>
      )}
      <textarea
        className="corkboard-note"
        value={note.content}
        maxLength={250}
        onChange={handleContentChange}
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onInput={handleInput}
      />
    </div>
  );
}
