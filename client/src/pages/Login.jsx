import "../styles/hero.css";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth"; // ✅ FIX ADDED

const Login = ({ onClose, openSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onClose();

        navigate("/profile");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  // ✅ FIXED: moved INSIDE component
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const payload = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };

      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("Backend response:", data);

      if (res.ok) {
        // store auth data
        localStorage.setItem("token", data.token || "google-login");
        localStorage.setItem("user", JSON.stringify(data.user || payload));

        // close modal FIRST (prevents flicker)
        onClose();

        setTimeout(() => {
          navigate("/profile");
        }, 50);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log("Google login error:", err);
    }
  };
  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2 className="login-title">Welcome to StylePins</h2>

        <div className="login-container">
          <div className="login-left">
            <div className="input-box">
              <span className="label">Email</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-box">
              <span className="label">Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <p
              className="forgot"
              onClick={() =>
                (window.location.href = "/reset-password?ue=" + email)
              }
            >
              Forgot password?
            </p>

            <button className="login-btn" onClick={handleLogin}>
              Log in
            </button>

            <div className="divider">OR</div>

            <button className="google-btn" onClick={handleGoogleLogin}>
              Continue with Google
            </button>

            <p className="meta-text">
              Facebook login is no longer available. Update login method
            </p>

            <p className="meta-text">
              New to Pinterest?{" "}
              <span
                className="link"
                onClick={() => {
                  if (onClose) onClose(); // close login
                  if (openSignup) openSignup(); // open signup
                }}
                style={{ cursor: "pointer", color: "blue" }}
              >
                Sign up
              </span>
            </p>

            <p className="meta-text">
              Are you a business? <span className="link">Get started here</span>
            </p>

            <p className="terms">
              By continuing, you agree to Pinterest's Terms of Service and
              acknowledge you've read our Privacy Policy. Notice at collection.
            </p>
          </div>

          {/* RIGHT SIDE QR */}
          <div className="login-right">
            <div className="qr-box">
              <QRCodeCanvas
                value="https://your-app-login-link.com"
                size={130}
              />

              <h4 className="qr-title">Log in instantly</h4>

              <p className="qr-subtext">
                Scan QR code with your phone and confirm login in the Pinterest
                app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
