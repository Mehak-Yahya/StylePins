import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ResetNavbar from "./resetnav";
import "../styles/reset.css";

const EmailSent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Email passed from ResetPassword.jsx
  const email = state?.email || "your email address";

  return (
    <>
      <ResetNavbar />

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

            <Link to="/login" className="back-link">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSent;
