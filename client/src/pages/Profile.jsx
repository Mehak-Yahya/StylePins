import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined") {
        navigate("/");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (err) {
      console.log("Invalid user in localStorage:", err);
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Profile</h1>

        {user ? (
          <>
            <p><b>Email:</b> {user.email}</p>
            <p><b>User ID:</b> {user.uid || user._id}</p>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  logoutBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    border: "none",
    background: "red",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer"
  }
};

export default Profile;