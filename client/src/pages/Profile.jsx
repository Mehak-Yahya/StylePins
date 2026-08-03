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

import logo from "../assets/Slog-removebg-preview.png";
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

const recentSearches = [
  { id: 1, text: "protest", meta: "video", image: "https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=400&q=80" },
  { id: 2, text: "inspiration", meta: "", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80" },
  { id: 3, text: "freaked out song", meta: "", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80" },
  { id: 4, text: "motivational Quotes", meta: "", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" },
  { id: 5, text: "daily inspiration", meta: "", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { id: 6, text: "creative ideas", meta: "", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { id: 7, text: "aesthetic drawings simple colour", meta: "", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { id: 8, text: "minimalist design", meta: "", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80" },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
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
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        className="profileAppBar"
      >
        <Toolbar className="muiToolbar">
          <Box className="muiLeft">
            <div className="logo">
              <img src={logo} alt="StylePins Logo" className="logo-image" />
              <span>StylePins</span>
            </div>
          </Box>

          <Box className="muiRight">
            <div className="miniBrand">
              <div className="miniAvatar">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span>{user.name || user.email?.split("@")[0] || "User"}</span>
              <ArrowDropDownIcon className="pillArrow" />
            </div>
            <button
              type="button"
              className="headerSearchBtn"
              aria-label="search"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <SearchIcon fontSize="small" />
            </button>
            <button
              className="headerIconButton notifyBtn"
              aria-label="notifications"
            >
              <NotificationsIcon fontSize="small" />
              <span className="notifBadge">99+</span>
            </button>
            <button
              className="headerIconButton messageBtn"
              aria-label="messages"
            >
              <ChatIcon fontSize="small" />
            </button>

            <div className="muiAvatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <button className="collapseBtn" aria-label="more options">
              <ArrowDropDownIcon fontSize="small" />
            </button>
          </Box>
        </Toolbar>
      </AppBar>

      {searchOpen && (
        <div className="searchModalBackdrop" onClick={() => setSearchOpen(false)}>
          <div className="searchModal" onClick={(event) => event.stopPropagation()}>
            <div className="searchModalHeader">
              <div className="searchLeftBrand">
                <div className="searchLogoMark">P</div>
                <span className="searchBrandName">Pinterest</span>
                <button type="button" className="searchHeaderToggle">
                  <span>VibeWear</span>
                  <ArrowDropDownIcon fontSize="small" />
                </button>
              </div>

              <div className="searchInputWrap">
                <SearchIcon className="searchInputIcon" fontSize="small" />
                <input type="text" placeholder="Search" readOnly />
              </div>

              <div className="searchActionIcons">
                <button type="button" className="miniHeaderBtn" aria-label="notifications">
                  <NotificationsIcon fontSize="small" />
                </button>
                <button type="button" className="miniHeaderBtn" aria-label="messages">
                  <ChatIcon fontSize="small" />
                </button>
                <button type="button" className="miniHeaderBtn" aria-label="more options">
                  <MoreHorizIcon fontSize="small" />
                </button>
                <div className="searchMiniAvatar">M</div>
              </div>
            </div>

            <div className="searchModalBody">
              <h3>Recent searches</h3>
              <div className="recentSearchGrid">
                {recentSearches.map((item) => (
                  <button type="button" key={item.id} className="recentSearchItem">
                    <img src={item.image} alt={item.text} />
                    <div className="recentSearchText">
                      <span>{item.text}</span>
                      {item.meta ? <small>{item.meta}</small> : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="feedTabs">
        <button className="feedTab active">All</button>
      </div>

      <div className="muiFeed">
        {demoPins.map((pin) => (
          <div className="muiPin" key={pin.id}>
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
