import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./pages/Navbar";
import Hero from "./pages/Hero";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import EmailSent from "./pages/EmailSent";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";

function AppContent() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();

  // hide main navbar on auth/reset pages
  const hideNavbar =
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/email-sent" ||
    location.pathname === "/profile";

  return (
    <>
      {/* MAIN NAVBAR */}
      {!hideNavbar && (
        <Navbar
          openSignup={() => setShowSignup(true)}
          openLogin={() => setShowLogin(true)}
        />
      )}

      {/* MODALS */}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          openLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          openSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <Hero
              openSignup={() => setShowSignup(true)}
              openLogin={() => setShowLogin(true)}
            />
          }
        />

        {/* IMPORTANT: PASS LOGIN/SIGNUP TO RESET FLOW PAGES */}
        <Route
          path="/reset-password"
          element={
            <ResetPassword
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        <Route
          path="/email-sent"
          element={
            <EmailSent
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <SetPassword
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
