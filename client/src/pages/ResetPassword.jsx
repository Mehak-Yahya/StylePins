import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResetNavbar from "./resetnav";

import "../styles/reset.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("ue") || "");

  const handleSend = async () => {
    if (!email) {
      alert("Enter email first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Reset email sent!");
      } else {
        alert(data.message || "Error");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="reset-container">
      <ResetNavbar />

      <div className="reset-card">
        <h2>Reset your password</h2>
        <p>What's your email, name, or username?</p>

        {/* 🔥 input + search in one row */}
        <div className="reset-search">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="reset-input"
          />

          <button className="search-btn" onClick={handleSend}>
            Search
          </button>
        </div>

        {/* ✅ main action button */}
        <button onClick={handleSend} className="reset-btn">
          Send reset email
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;