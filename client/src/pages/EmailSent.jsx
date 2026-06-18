import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ResetNavbar from "./resetnav";
import "../styles/reset.css";

const EmailSent = ({ openLogin, openSignup }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email || "your email address";

  return (
    <>
      {/* NAVBAR FIX */}
      <ResetNavbar
        openLogin={openLogin}
        openSignup={openSignup}
      />

      <div className="email-sent-container">
        <div className="email-card">
          <h2>Email sent</h2>

          <p>
            We sent an email to <strong>{email}</strong>! If this email is
            connected to a StylePins account, you'll be able to reset your
            password.
          </p>

          <p className="help-text">
            Didn't get the email? Check your spam folder or try again.
          </p>

          <div className="button-row">
            <button
              className="retry-btn"
              onClick={() =>
                navigate("/reset-password", {
                  state: { email },
                })
              }
            >
              Try again
            </button>

            {/* FIXED LOGIN BUTTON */}
            <span
              className="back-link"
              onClick={() => openLogin?.()}
              style={{ cursor: "pointer" }}
            >
              Back to login
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSent;