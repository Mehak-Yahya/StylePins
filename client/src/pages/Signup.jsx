import { useState } from "react";

const Signup = ({ onClose, openLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const handleSignup = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
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
        // ✅ ADDED LOGIC ONLY
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Signup successful!");
        onClose();

        // optional redirect
        window.location.href = "/profile";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.log(err);
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

        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Birthdate</label>
        <input
          type="text"
          placeholder="mm/dd/yyyy"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />

        <button className="signup-btn" onClick={handleSignup}>
          Continue
        </button>

        <div className="divider">OR</div>

        <button className="google-btn">Continue with Google</button>

        <p className="terms">
          By continuing, you agree to Pinterest's <br></br> Terms of Service and
          acknowledge <br></br> you've read our Privacy Policy. Notice at{" "}
          <br></br>collection.
        </p>

        <p className="login-text">
          Already a member?{" "}
          <span
            onClick={openLogin}
            style={{ cursor: "pointer", color: "blue" }}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
