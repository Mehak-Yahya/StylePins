import "../styles/Navbar.css";
import { FiSearch } from "react-icons/fi";
const ResetNavbar = ({ openSignup, openLogin }) => {
  return (
    <nav className="navbar">
      {/* Left */}
      <div className="nav-left">
        <div className="logo">StylePins</div>
        <div className="explore">Explore</div>
      </div>

      <div className="nav-center">
        <div className="search-box">
          <span className="search-icon">
            <FiSearch />
          </span>{" "}
          <input
            type="text"
            className="search"
            placeholder="Search for easy dinners, fashion, etc."
          />
        </div>
      </div>
        <div className="nav-buttons">
          <button className="login" onClick={openLogin}>
            Log in
          </button>
          <button className="signup" onClick={openSignup}>
            Sign Up
          </button>
        </div>
     
    </nav>
  );
};

export default ResetNavbar;
