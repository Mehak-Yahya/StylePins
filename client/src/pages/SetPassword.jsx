import { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/reset.css";
import ResetNavbar from "./resetnav";

const SetPassword = ({ openLogin, openSignup }) => {
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [showTips, setShowTips] = useState(false);

  const handleReset = async () => {
    const res = await fetch(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Password changed successfully");
    } else {
      alert(data.message || "Error");
    }
  };

  return (
    <>
      <ResetNavbar
        openLogin={openLogin}
        openSignup={openSignup}
      />

      <div className="set-container">
        <div className="set-card">
          <h2>Pick a new password</h2>

          <label className="label">New password</label>

          <div className="input-wrapper">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="set-input"
            />
            <span className="eye-icon">👁</span>
          </div>

          <p className="hint">
            Use 8 or more letters, numbers and symbols
          </p>

          {/* Password Tips Button */}
          <div
            className="tips"
            onClick={() => setShowTips(true)}
            style={{ cursor: "pointer" }}
          >
            <span>Password tips</span>
            <span className="info-icon">ℹ</span>
          </div>

          <button
            onClick={handleReset}
            className="set-btn"
            disabled={newPassword.length < 8}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Password Tips Modal */}
      {showTips && (
        <div
          className="modal-overlay"
          onClick={() => setShowTips(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowTips(false)}
            >
              ✕
            </button>

            <h3>Password tips</h3>

            <p>
              A strong password helps keep your account safe. Use at least 8 letters,
               numbers, and symbols.
            </p>

            <h4>What to avoid</h4>

            <ul>
              <li>Common passwords, words, and names</li>
              <li>Recent dates or dates associated with you</li>
              <li>Simple patterns and repeated text</li>
            </ul>

            <button
              className="set-btn"
              onClick={() => setShowTips(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SetPassword;