import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MicIcon from "@mui/icons-material/Mic";

import logo from "../assets/Slog-removebg-preview.png";

import {
  loadUserProfileMeta,
  savePinForUser,
} from "../utils/userStorage";

import "../styles/profile.css";
import InboxPanel from "../components/InboxPanel";

const demoPins = [
  {
    id: 1,
    title: "Dark caramel",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    category: "Beauty",
  },
  {
    id: 2,
    title: "Healthy living",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    category: "Lifestyle",
  },
  {
    id: 3,
    title: "Groceries",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    category: "Shopping",
  },
  {
    id: 4,
    title: "New chapter",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    category: "Blog",
  },
  {
    id: 5,
    title: "How to create the outline effect",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    category: "Digital Products",
  },
  {
    id: 6,
    title: "Gold details",
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    category: "Jewelry",
  },
  {
    id: 7,
    title: "What if it all works out?",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    category: "Moodboard",
  },
  {
    id: 8,
    title: "Look like my next client",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    category: "Design",
  },
  {
    id: 9,
    title: "Minimal living",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80",
    category: "Home",
  },
  {
    id: 10,
    title: "Soft tones",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    category: "Style",
  },
  {
    id: 11,
    title: "Brand mood",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
    category: "Inspiration",
  },
  {
    id: 12,
    title: "Daily picks",
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    category: "Creative",
  },
];

const recentSearches = [
  {
    id: 1,
    text: "protest",
    meta: "video",
    image:
      "https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    text: "inspiration",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    text: "freaked out song",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    text: "motivational Quotes",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    text: "daily inspiration",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    text: "creative ideas",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 7,
    text: "aesthetic drawings simple colour",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 8,
    text: "minimalist design",
    meta: "",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
  },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      const meta = loadUserProfileMeta(parsedUser);
      setUserMeta(meta);
    } catch (error) {
      console.error("Failed to load user:", error);
      navigate("/");
    }
  }, [navigate]);

  /*
   * SAVE PIN
   *
   * IMPORTANT:
   * Do NOT use localStorage.getItem("savedPins") here.
   *
   * savePinForUser() creates a user-specific storage key:
   *
   * savedPins_user@email.com
   */
  const handleSavePin = (pin) => {
    try {
      savePinForUser(user, pin);

      navigate("/saved");
    } catch (error) {
      console.error("Failed to save pin:", error);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setNotificationsOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
  };

  if (!user || !userMeta) {
    return null;
  }

  /*
   * USER NAME
   *
   * Priority:
   * 1. name
   * 2. username
   * 3. displayName
   * 4. email username
   */
  const displayName =
    user.name ||
    user.username ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";

  const profilePic = userMeta.dp || user.photo || user.dp || "";

  return (
    <Box>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <AppBar
        position="fixed"
        className={`mainAppBar ${searchOpen ? "searchMode" : ""}`}
      >
        <Toolbar className="mainToolbar">
          {!searchOpen ? (
            <>
              <div className="brandSection">
                <img
                  src={logo}
                  alt="StylePins"
                  className="mainLogo"
                />

                <span className="brandName">
                  StylePins
                </span>
              </div>

              <Box className="muiRight">

                {/* USER PILL */}

                <button
                  type="button"
                  className="miniBrand"
                  aria-label="Open saved pins"
                  onClick={() => navigate("/saved")}
                >
                  <div className="miniAvatar">
                    {profilePic ? (
                      <img src={profilePic} alt="profile" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <span>{displayName}</span>

                  <ArrowDropDownIcon className="pillArrow" />
                </button>

                {/* SEARCH */}

                <button
                  type="button"
                  className="headerSearchBtn"
                  aria-label="search"
                  onClick={openSearch}
                >
                  <SearchIcon fontSize="small" />
                </button>

                {/* NOTIFICATIONS */}

                <button
                  type="button"
                  className="headerIconButton notifyBtn"
                  aria-label="notifications"
                  onClick={() =>
                    setNotificationsOpen(true)
                  }
                >
                  <NotificationsIcon fontSize="small" />
                </button>

                {/* MESSAGES */}

                <button
                  type="button"
                  className="headerIconButton messageBtn"
                  aria-label="messages"
                  onClick={() =>
                    window.dispatchEvent(
                      new Event("openInbox")
                    )
                  }
                >
                  <ChatIcon fontSize="small" />
                </button>

                {/* AVATAR */}

                <button
                  type="button"
                  className="muiAvatar"
                  aria-label="Open saved pins"
                  onClick={() => navigate("/saved")}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="profile" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </button>

                <button
                  type="button"
                  className="collapseBtn"
                  aria-label="more options"
                >
                  <ArrowDropDownIcon fontSize="small" />
                </button>
              </Box>
            </>
          ) : (
            <>
              {/* =================================================
                  SEARCH MODE NAVBAR
              ================================================= */}

              <div className="searchNavbar">

                <div className="searchNavLeft">

                  {/* STYLEPINS LOGO */}

                  <div className="searchBrandMark">
                    <img
                      src={logo}
                      alt="StylePins"
                    />
                  </div>

                  {/* HOME FEED */}

                  <button
                    type="button"
                    className="homeFeedButton"
                    onClick={closeSearch}
                  >
                    <span>Home feed</span>

                    <span className="hamburgerIcon">
                      ☰
                    </span>
                  </button>

                  {/* USER */}

                  <button
                    type="button"
                    className="searchProfilePill"
                  >
                    <div className="searchPillAvatar">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="profile"
                        />
                      ) : (
                        displayName
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <span>{displayName}</span>

                    <ArrowDropDownIcon fontSize="small" />
                  </button>
                </div>

                {/* SEARCH BOX */}

                <div className="expandedSearchBox">

                  <SearchIcon className="expandedSearchIcon" />

                  <input
                    type="text"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(event) =>
                      setSearchValue(
                        event.target.value
                      )
                    }
                    autoFocus
                  />

                  <button
                    type="button"
                    className="searchToolBtn"
                    aria-label="visual search"
                  >
                    <CameraAltIcon fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="searchToolBtn"
                    aria-label="voice search"
                  >
                    <MicIcon fontSize="small" />
                  </button>
                </div>

                {/* RIGHT SIDE */}

                <div className="searchNavRight">

                  <button
                    type="button"
                    className="searchNavIcon"
                    onClick={() =>
                      setNotificationsOpen(true)
                    }
                  >
                    <NotificationsIcon fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="searchNavIcon"
                    onClick={() =>
                      window.dispatchEvent(
                        new Event("openInbox")
                      )
                    }
                  >
                    <ChatIcon fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="searchNavIcon"
                  >
                    <MoreHorizIcon fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="searchNavAvatar"
                    onClick={() =>
                      navigate("/saved")
                    }
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="profile"
                      />
                    ) : (
                      displayName
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </button>

                  <button
                    type="button"
                    className="searchCloseBtn"
                    aria-label="close search"
                    onClick={closeSearch}
                  >
                    <ArrowDropDownIcon fontSize="small" />
                  </button>

                </div>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* =====================================================
          SEARCH OVERLAY
      ===================================================== */}

      {searchOpen && (
        <div
          className="searchPageOverlay"
          onClick={closeSearch}
        >
          <div
            className="recentSearchPanel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h3>Recent searches</h3>

            <div className="recentSearchGrid">
              {recentSearches.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="recentSearchItem"
                  onClick={() =>
                    setSearchValue(item.text)
                  }
                >
                  <img
                    src={item.image}
                    alt={item.text}
                  />

                  <div className="recentSearchText">
                    <span>{item.text}</span>

                    {item.meta && (
                      <small>{item.meta}</small>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      {notificationsOpen && (
        <div
          className="notifications-overlay"
          onClick={() =>
            setNotificationsOpen(false)
          }
        >
          <div
            className="notifications-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="notifications-header">

              <div className="notifications-title-wrapper">
                <div className="notifications-dot" />

                <div className="notifications-title">
                  Notifications
                </div>
              </div>

              <button
                type="button"
                className="notifications-close"
                aria-label="close notifications"
                onClick={() =>
                  setNotificationsOpen(false)
                }
              >
                <CloseIcon fontSize="small" />
              </button>

            </div>

            <div className="notifications-updates">
              Updates
            </div>

            <div className="notifications-list">

              {[
                {
                  id: 1,
                  title:
                    "Try searching for more ideas",
                  subtitle:
                    "to get inspired",
                  time: "3h",
                  img: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 2,
                  title: "So you",
                  subtitle:
                    "See fresh inspiration now.",
                  time: "13h",
                  img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 3,
                  title: "Trending searches",
                  subtitle:
                    "Updates from what's popular.",
                  time: "1d",
                  img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 4,
                  title: "Big mood",
                  subtitle:
                    "Ideas that fit your vibe.",
                  time: "1d",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="notification-row"
                >
                  <img
                    src={item.img}
                    alt="notification"
                    className="notification-thumb"
                  />

                  <div className="notification-body">
                    <div className="notification-title">
                      {item.title}
                    </div>

                    <div className="notification-subtitle">
                      {item.subtitle}
                    </div>
                  </div>

                  <div className="notification-meta">
                    <span>{item.time}</span>

                    <MoreHorizIcon fontSize="small" />
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FEED TABS
      ===================================================== */}

      <div
        className={`feedTabs ${
          searchOpen ? "feedDimmed" : ""
        }`}
      >
        <button className="feedTab active">
          All
        </button>
      </div>

      {/* =====================================================
          PIN FEED
      ===================================================== */}

      <div
        className={`muiFeed ${
          searchOpen ? "feedDimmed" : ""
        }`}
      >
        {demoPins.map((pin) => (
          <div
            className="muiPin"
            key={pin.id}
          >
            <img
              src={pin.img}
              alt={pin.title}
            />

            {/* SAVE BUTTON */}

            <button
              type="button"
              className="muiSaveBtn"
              onClick={(event) => {
                event.stopPropagation();
                handleSavePin(pin);
              }}
            >
              Save
            </button>

            <div className="pinMeta">

              <span>{pin.category}</span>

              <button
                type="button"
                className="pinMoreBtn"
                aria-label="more options"
              >
                <MoreHorizIcon fontSize="small" />
              </button>

            </div>
          </div>
        ))}
      </div>

      <InboxPanel />
    </Box>
  );
}