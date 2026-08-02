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
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import "../styles/profile.css";

const demoPins = [
  {
    id: 1,
    title: "Dark caramel",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    height: 540,
    category: "Beauty",
  },
  {
    id: 2,
    title: "Healthy living",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    height: 420,
    category: "Lifestyle",
  },
  {
    id: 3,
    title: "Groceries",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    height: 470,
    category: "Shopping",
  },
  {
    id: 4,
    title: "New chapter",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    height: 500,
    category: "Blog",
  },
  {
    id: 5,
    title: "How to create the outline effect",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    height: 610,
    category: "Digital Products",
  },
  {
    id: 6,
    title: "Gold details",
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    height: 430,
    category: "Jewelry",
  },
  {
    id: 7,
    title: "What if it all works out?",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    height: 560,
    category: "Moodboard",
  },
  {
    id: 8,
    title: "Look like my next client",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    height: 470,
    category: "Design",
  },
  {
    id: 9,
    title: "Minimal living",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80",
    height: 650,
    category: "Home",
  },
  {
    id: 10,
    title: "Soft tones",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    height: 520,
    category: "Style",
  },
  {
    id: 11,
    title: "Brand mood",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
    height: 430,
    category: "Inspiration",
  },
  {
    id: 12,
    title: "Daily picks",
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    height: 520,
    category: "Creative",
  },
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
      <AppBar position="sticky" color="default" elevation={0} className="profileAppBar">
        <Toolbar className="muiToolbar">
          <Box className="muiLeft">
            <div className="muiLogo">P</div>
            <h2 className="brandName">StylePins</h2>
          </Box>

          <Box className="topCenterPill">
            <div className="miniBrand">
              <div className="miniAvatar">V</div>
              <span>VibeWear</span>
            </div>
            <ArrowDropDownIcon className="pillArrow" />
          </Box>

          <Box className="muiRight">
            <button className="headerSearchBtn" aria-label="search">
              <SearchIcon fontSize="small" />
            </button>
            <button className="headerIconButton messageBtn" aria-label="messages">
              <ChatIcon fontSize="small" />
            </button>
            <button className="headerIconButton notifyBtn" aria-label="notifications">
              <NotificationsIcon fontSize="small" />
              <span className="notifBadge">99+</span>
            </button>
            <div className="muiAvatar">{user.email?.charAt(0).toUpperCase()}</div>
            <button className="collapseBtn" aria-label="more options">
              <ArrowDropDownIcon fontSize="small" />
            </button>
          </Box>
        </Toolbar>
      </AppBar>

      <div className="feedTabs">
        <button className="feedTab active">All</button>
      </div>

      <div className="muiFeed">
        {demoPins.map((pin) => (
          <div className="muiPin" key={pin.id} style={{ height: `${pin.height}px` }}>
            <img src={pin.img} alt={pin.title} />
            <button className="muiSaveBtn">Save</button>
            <div className="pinMeta">
              <span>{pin.category}</span>
              <button className="pinMoreBtn" aria-label="more options">
                <MoreHorizIcon fontSize="small" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
