import { BrowserRouter, Routes, Route } from "react-router-dom";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Corkboard from "./pages/CorkBoard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/corkboard" element={<Corkboard />} />
      </Routes>
    </BrowserRouter>
  );
}
