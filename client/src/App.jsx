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
import CreateCollage from "./pages/CreateCollage";
import ProtectedRoute from "./pages/ProtectedRoute";

function AppContent() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/email-sent" ||
    location.pathname.startsWith("/profile") ||
    location.pathname === "/saved" ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/pin") ||
    location.pathname === "/create-pin" ||
    location.pathname === "/create-board" ||
    location.pathname === "/create-collage";

  const isCreatePage =
    location.pathname === "/create-pin" ||
    location.pathname === "/create-board" ||
    location.pathname === "/create-collage";

  return (
    <>
     
      {!hideNavbar && (
        <Navbar
          openSignup={() => setShowSignup(true)}
          openLogin={() => setShowLogin(true)}
        />
      )}

      {showSignup && !isCreatePage && (
        <Signup
          onClose={() => setShowSignup(false)}
          openLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showLogin && !isCreatePage && (
        <Login
          onClose={() => setShowLogin(false)}
          openSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

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

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavePins />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-pin"
          element={
            <ProtectedRoute>
              <CreatePin />
            </ProtectedRoute>
          }
        />
      
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