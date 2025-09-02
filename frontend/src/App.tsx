import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Notes from "./pages/Notes";

function Home() {
  return (
    <div>
      <h1>Welcome to Noteify</h1>
      <Link to="/notes">Go to Notes</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </BrowserRouter>
  );
}
