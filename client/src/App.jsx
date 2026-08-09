import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./pages/Navbar";
import Hero from "./pages/Hero";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import EmailSent from "./pages/EmailSent";

import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

import SavePins from "./pages/SavePins";
import EditProfile from "./pages/EditProfile";
import CreatePin from "./pages/CreatePin";
import CreateBoard from "./pages/CreateBoard";
import CreateCollage from "./pages/CreateCollage";

import ProtectedRoute from "./pages/ProtectedRoute";

function AppContent() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();

  // =====================================================
  // HIDE MAIN NAVBAR
  // =====================================================

  const hideNavbar =
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/email-sent" ||
    location.pathname.startsWith("/profile") ||
    location.pathname === "/saved" ||
    location.pathname.startsWith("/settings");

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      {!hideNavbar && (
        <Navbar
          openSignup={() => setShowSignup(true)}
          openLogin={() => setShowLogin(true)}
        />
      )}

      {/* =====================================================
          SIGNUP MODAL
      ===================================================== */}

      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          openLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* =====================================================
          LOGIN MODAL
      ===================================================== */}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          openSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {/* =====================================================
          ROUTES
      ===================================================== */}

      <Routes>
        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={
            <Hero
              openSignup={() => setShowSignup(true)}
              openLogin={() => setShowLogin(true)}
            />
          }
        />

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        <Route
          path="/reset-password"
          element={
            <ResetPassword
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        {/* =================================================
            EMAIL SENT
        ================================================= */}

        <Route
          path="/email-sent"
          element={
            <EmailSent
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        {/* =================================================
            SET PASSWORD
        ================================================= */}

        <Route
          path="/reset-password/:token"
          element={
            <SetPassword
              openLogin={() => setShowLogin(true)}
              openSignup={() => setShowSignup(true)}
            />
          }
        />

        {/* =================================================
            MY PROFILE

            /profile
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            OTHER USER PUBLIC PROFILE

            /profile/:userId

            Example:
            /profile/6a737601af4c2e30c0a73cd4
        ================================================= */}

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SAVED PINS
        ================================================= */}

        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavePins />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            EDIT PROFILE
        ================================================= */}

        <Route
          path="/settings/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CREATE PIN
        ================================================= */}

        <Route
          path="/create-pin"
          element={
            <ProtectedRoute>
              <CreatePin />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CREATE BOARD
        ================================================= */}

        <Route
          path="/create-board"
          element={
            <ProtectedRoute>
              <CreateBoard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CREATE COLLAGE
        ================================================= */}

        <Route
          path="/create-collage"
          element={
            <ProtectedRoute>
              <CreateCollage />
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