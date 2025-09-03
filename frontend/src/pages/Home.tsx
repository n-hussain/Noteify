import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <div className="home-content">
        <h1>Welcome to Noteify</h1>
        <p>Your personal note-taking app to keep everything organized.</p>
        <div className="home-buttons">
          <Link to="/login" className="btn">
            Login
          </Link>
          <Link to="/register" className="btn register">
            Register
          </Link>
          <Link to="/corkboard" className="btn register">
            Corkboard
          </Link>
        </div>
      </div>
    </div>
  );
}
