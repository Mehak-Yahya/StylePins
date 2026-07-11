//home screen
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";

import "../styles/profile.css";

const demoPins = [
  { id: 1, img: "https://images.unsplash.com/photo-1520975922284-9e0f1f98c3b4?w=600" },
  { id: 2, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600" },
  { id: 3, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600" },
  { id: 4, img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600" },
  { id: 5, img: "https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600" },
  { id: 6, img: "https://images.unsplash.com/photo-1520974735194-6c3c7d1f7d55?w=600" },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");

    if (!u || u === "undefined") {
      navigate("/");
      return;
    }

    setUser(JSON.parse(u));
  }, [navigate]);

  if (!user) return null;

  return (
    <Box className="profilePage">

      {/* NAVBAR */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar className="muiToolbar">

          <Box className="muiLeft">
            <div className="muiLogo">P</div>

            <Button
              variant="contained"
              sx={{ backgroundColor: "#111", color: "#fff" }}
            >
              Home
            </Button>
          </Box>

          <Box className="muiSearch">
            <SearchIcon />
            <InputBase placeholder="Search ideas" fullWidth />
          </Box>

          <Box className="muiRight">
            <IconButton><NotificationsIcon /></IconButton>
            <IconButton><ChatIcon /></IconButton>

            <div className="muiAvatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <Button color="error" onClick={() => navigate("/")}>
              Logout
            </Button>
          </Box>

        </Toolbar>
      </AppBar>

      {/* FEED */}
      <div className="muiFeed">
        {demoPins.map(pin => (
          <div className="muiPin" key={pin.id}>
            <img src={pin.img} alt="" />
            <button className="muiSaveBtn">Save</button>
          </div>
        ))}
      </div>

    </Box>
  );
}
