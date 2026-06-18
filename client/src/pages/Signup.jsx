import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import "../styles/hero.css";

const Signup = ({ onClose, openLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const navigate = useNavigate();

  // ✅ NORMAL SIGNUP
  const handleSignup = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          birthdate
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onClose();

        setTimeout(() => {
          navigate("/profile");
        }, 80);
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ GOOGLE SIGNUP / LOGIN
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const payload = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      };

      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token || "google-auth");
        localStorage.setItem("user", JSON.stringify(data.user || payload));

        onClose();

        setTimeout(() => {
          navigate("/profile");
        }, 80);
      } else {
        alert(data.message || "Google signup failed");
      }
    } catch (err) {
      console.log("Google signup error:", err);
    }
  };

  return (
    <div className="signup-overlay-join" onClick={onClose}>
      <div className="signup-modal" onClick={(e) => e.stopPropagation()}>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>Welcome to StylePins</h2>
        <p>Find new ideas to try</p>

        {/* EMAIL */}
        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BIRTHDATE */}
        <label>Birthdate</label>
        <input
          type="text"
          placeholder="mm/dd/yyyy"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />

        {/* SIGNUP BUTTON */}
        <button className="signup-btn" onClick={handleSignup}>
          Continue
        </button>

        <div className="divider">OR</div>

        {/* GOOGLE BUTTON */}
        <button className="google-btn" onClick={handleGoogleSignup}>
          Continue with Google
        </button>

        <p className="terms">
          By continuing, you agree to Pinterest's Terms of Service and Privacy Policy.
        </p>

        <p className="login-text">
          Already a member?{" "}
          <span onClick={openLogin} style={{ cursor: "pointer", color: "blue" }}>
            Log in
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;