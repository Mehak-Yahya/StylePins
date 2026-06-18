import "../styles/Navbar.css";
import { FiSearch } from "react-icons/fi";
import logo from "../assets/Slog-removebg-preview.png";

const ResetNavbar = ({ openSignup, openLogin }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="StylePins Logo" className="logo-image" />
          <span>StylePins</span>
        </div>
        <div className="explore">Explore</div>
      </div>

      <div className="nav-center">
        <div className="search-box">
          <span className="search-icon">
            <FiSearch />
          </span>
          <input
            type="text"
            className="search"
            placeholder="Search for easy dinners, fashion, etc."
          />
        </div>
      </div>

      {/* ✅ FIX IS HERE */}
      <div className="nav-right">
        <div className="nav-buttons">
          <button className="login" onClick={openLogin}>
            Log in
          </button>
          <button className="signup" onClick={openSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ResetNavbar;