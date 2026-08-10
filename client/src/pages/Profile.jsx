import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  saveUserProfileMeta,
} from "../utils/userStorage";

import "../styles/profile.css";
import InboxPanel from "../components/InboxPanel";

const API_URL = "http://localhost:5000/api";
const IMAGE_BASE_URL = "http://localhost:5000";

// =====================================================
// DEMO PINS
// =====================================================

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
 
];

// =====================================================
// RECENT SEARCHES
// =====================================================

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
  const navigate = useNavigate();
  const { userId } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // ALL CREATED PINS FROM ALL USERS
  const [createdPins, setCreatedPins] = useState([]);

  const profileUserId = userId || user?._id || user?.id;

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        // =================================================
        // VIEWING ANOTHER USER
        // /profile/:userId
        // =================================================

        if (userId) {
          const response = await fetch(
            `${API_URL}/users/${userId}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to load profile"
            );
          }

          if (cancelled) return;

          const publicUser = data.user || data;

          setUser(publicUser);

          setUserMeta({
            dp:
              publicUser.photo ||
              publicUser.profilePicture ||
              publicUser.avatar ||
              "",
            username: publicUser.username || "",
            bio: publicUser.bio || "",
            followers: data.followersCount || 0,
            following: data.followingCount || 0,
            monthlyViews: data.profileViews || 0,
            tags: [],
          });

          return;
        }

        // =================================================
        // LOGGED-IN USER
        // /profile
        // =================================================

        const storedUser = localStorage.getItem("user");

        if (
          !storedUser ||
          storedUser === "undefined" ||
          storedUser === "null"
        ) {
          navigate("/");
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser) {
          navigate("/");
          return;
        }

        if (cancelled) return;

        setUser(parsedUser);

        const meta = loadUserProfileMeta(parsedUser);

        let syncedMeta = meta || {};

        try {
          const loggedUserId =
            parsedUser._id || parsedUser.id;

          if (loggedUserId) {
            const response = await fetch(
              `${API_URL}/users/${loggedUserId}`
            );

            if (response.ok) {
              const data = await response.json();

              syncedMeta = {
                ...meta,
                followers:
                  data.followersCount || 0,
                following:
                  data.followingCount || 0,
                monthlyViews:
                  data.profileViews || 0,
              };
            }
          }
        } catch (countError) {
          console.error(
            "Failed to refresh profile counts:",
            countError
          );
        }

        saveUserProfileMeta(
          parsedUser,
          syncedMeta
        );

        setUserMeta(syncedMeta);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        if (!cancelled) {
          if (userId) {
            navigate("/profile");
          } else {
            navigate("/");
          }
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate, userId]);

  // =====================================================
  // LOAD ALL CREATED PINS
  //
  // IMPORTANT:
  // We use /api/pins
  // NOT /api/pins/user/:userId
  //
  // This means EVERY HOME can see EVERYONE'S pins.
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadAllCreatedPins = async () => {
      try {
        const response = await fetch(
          `${API_URL}/pins`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load pins"
          );
        }

        const loadedPins = Array.isArray(data)
          ? data
          : Array.isArray(data.pins)
          ? data.pins
          : [];

        if (!cancelled) {
          setCreatedPins(loadedPins);
        }
      } catch (error) {
        console.error(
          "Failed to load all created pins:",
          error
        );

        if (!cancelled) {
          setCreatedPins([]);
        }
      }
    };

    loadAllCreatedPins();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // RECORD PROFILE VIEW
  // =====================================================

  useEffect(() => {
    if (!userId) return;

    const storedUser =
      localStorage.getItem("user");

    let viewerId = null;

    try {
      if (
        storedUser &&
        storedUser !== "undefined" &&
        storedUser !== "null"
      ) {
        const loggedUser =
          JSON.parse(storedUser);

        viewerId =
          loggedUser?._id ||
          loggedUser?.id ||
          null;
      }
    } catch (error) {
      console.error(
        "Failed to read viewer:",
        error
      );
    }

    fetch(
      `${API_URL}/users/${userId}/view`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerId,
        }),
      }
    ).catch((error) => {
      console.error(
        "Failed to record profile view:",
        error
      );
    });
  }, [userId]);

  // =====================================================
  // SEARCH USERS
  // =====================================================

  const searchRealUsers = async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchUsers([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await fetch(
        `${API_URL}/users/search?q=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to search users"
        );
      }

      let users = [];

      if (Array.isArray(data)) {
        users = data;
      } else if (Array.isArray(data.users)) {
        users = data.users;
      } else if (Array.isArray(data.data)) {
        users = data.data;
      }

      setSearchUsers(users);
    } catch (error) {
      console.error(
        "User search error:",
        error
      );

      setSearchUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    if (!searchOpen) return;

    const timer = setTimeout(() => {
      searchRealUsers(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchOpen]);

  // =====================================================
  // SAVE PIN
  // =====================================================

  const handleSavePin = (pin) => {
    try {
      savePinForUser(user, pin);
      navigate("/saved");
    } catch (error) {
      console.error(
        "Failed to save pin:",
        error
      );
    }
  };

  // =====================================================
  // OPEN SEARCH
  // =====================================================

  const openSearch = () => {
    setSearchOpen(true);
    setNotificationsOpen(false);
    closeAccountMenu();
    setSearchValue("");
    setSearchUsers([]);
  };

  // =====================================================
  // CLOSE SEARCH
  // =====================================================

  const closeSearch = () => {
    setSearchOpen(false);
    closeAccountMenu();
    setSearchValue("");
    setSearchUsers([]);
  };

  // =====================================================
  // OPEN SEARCHED USER
  // =====================================================

  const openUserProfile = (searchedUserId) => {
    if (!searchedUserId) return;

    setSearchOpen(false);
    setSearchValue("");
    setSearchUsers([]);

    navigate(`/profile/${searchedUserId}`);
  };

  // =====================================================
  // OPEN SAVED PINS
  // =====================================================

  const openSavedPins = () => {
    setSearchOpen(false);
    closeAccountMenu();
    setSearchValue("");
    setSearchUsers([]);

    navigate("/saved");
  };

  // =====================================================
  // ACCOUNT MENU
  // =====================================================

  const toggleAccountMenu = () => {
    setAccountMenuOpen((previous) => !previous);
  };

  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeAccountMenu();
    navigate("/");
  };

  // =====================================================
  // WAIT FOR PROFILE
  // =====================================================

  if (!user || !userMeta) {
    return null;
  }

  // =====================================================
  // USER DATA
  // =====================================================

  const displayName =
    user.name ||
    user.username ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return "";
    }

    const trimmed = image.trim();

    if (!trimmed) {
      return "";
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    if (trimmed.startsWith("/")) {
      return `${IMAGE_BASE_URL}${trimmed}`;
    }

    if (
      trimmed.startsWith("uploads/") ||
      trimmed.startsWith("images/")
    ) {
      return `${IMAGE_BASE_URL}/${trimmed}`;
    }

    return trimmed;
  };

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const profilePic = getImageUrl(
    userMeta?.dp ||
      userMeta?.photo ||
      user.photo ||
      user.photoURL ||
      user.profilePicture ||
      user.avatar ||
      user.dp ||
      ""
  );

  // =====================================================
  // NORMALIZE ALL CREATED PINS
  // =====================================================

  const normalizedCreatedPins =
    createdPins.map((pin) => ({
      ...pin,

      id: pin._id || pin.id,

      title:
        pin.title || "Untitled pin",

      img:
        pin.image ||
        pin.img ||
        "",

      category:
        pin.category ||
        "Created",

      // Creator information
      creator:
        pin.user || null,
    }));

  // =====================================================
  // SEARCH PINS
  // =====================================================

  const searchablePins = [
    ...normalizedCreatedPins,
    ...demoPins,
  ];

  const filteredPins = searchablePins.filter((pin) => {
    const haystack = [
      pin.title,
      pin.category,
      pin.description,
      pin.link,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(
      searchValue.trim().toLowerCase()
    );
  });

  // =====================================================
  // MIX DEMO PINS + ALL CREATED PINS
  //
  // DEMO PINS ARE NOT REMOVED.
  // =====================================================

  const mixedPins = [];

  const maxLength = Math.max(
    demoPins.length,
    normalizedCreatedPins.length
  );

  for (
    let index = 0;
    index < maxLength;
    index += 1
  ) {
    // CREATED PIN
    if (normalizedCreatedPins[index]) {
      mixedPins.push(
        normalizedCreatedPins[index]
      );
    }

    // DEMO PIN
    if (demoPins[index]) {
      mixedPins.push(demoPins[index]);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <AppBar
        position="fixed"
        className={`mainAppBar ${
          searchOpen ? "searchMode" : ""
        }`}
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
                  onClick={openSavedPins}
                >
                  <div className="miniAvatar">

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

                  <span>
                    {displayName}
                  </span>

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

                {/* PROFILE CIRCLE */}

                <button
                  type="button"
                  className="muiAvatar"
                  aria-label="Open saved pins"
                  onClick={openSavedPins}
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
                  className="collapseBtn"
                  aria-label="more options"
                  onClick={toggleAccountMenu}
                >
                  <ArrowDropDownIcon fontSize="small" />
                </button>

              </Box>
            </>
          ) : (

            /* =================================================
               SEARCH MODE
            ================================================= */

            <div className="searchNavbar">

              <div className="searchNavLeft">

                {/* LOGO */}

                <div className="searchBrandMark">

                  <img
                    src={logo}
                    alt="StylePins"
                  />

                </div>

                {/* HOME */}

                <button
                  type="button"
                  className="homeFeedButton"
                  onClick={closeSearch}
                >
                  <span>
                    Home feed
                  </span>

                  <span className="hamburgerIcon">
                    ☰
                  </span>

                </button>

                {/* PROFILE */}

                <button
                  type="button"
                  className="searchProfilePill"
                  onClick={openSavedPins}
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

                  <span>
                    {displayName}
                  </span>

                  <ArrowDropDownIcon fontSize="small" />

                </button>

              </div>

              {/* SEARCH BOX */}

              <div className="expandedSearchBox">

                <SearchIcon className="expandedSearchIcon" />

                <input
                  type="text"
                  placeholder="Search people"
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
                  aria-label="more options"
                >
                  <MoreHorizIcon fontSize="small" />
                </button>

                <button
                  type="button"
                  className="searchNavAvatar"
                  aria-label="Open saved pins"
                  onClick={openSavedPins}
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
          )}

          {accountMenuOpen && (
            <div className="accountMenu" role="menu" aria-label="Account menu">
              <div className="accountHeader">
                <div className="accountAvatar">
                  {profilePic ? (
                    <img src={profilePic} alt="profile" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="accountHeaderInfo">
                  <div className="accountHeaderName">{displayName}</div>
                  <div className="accountHeaderMeta">Business</div>
                  <div className="accountHeaderEmail">{user.email}</div>
                </div>
              </div>

              <div className="accountSectionLabel">Your accounts</div>

              <button type="button" className="accountMenuItem" onClick={() => navigate("/saved") }>
                Add Pinterest account
              </button>

              <button type="button" className="accountMenuItem" onClick={() => navigate("/settings") }>
                Settings
              </button>

              <div className="accountSectionLabel">Content</div>

              <button type="button" className="accountMenuItem" onClick={() => navigate("/saved") }>
                Import content
              </button>

              <button type="button" className="accountMenuItem" onClick={() => navigate("/saved") }>
                Link to Pinterest
              </button>

              <button type="button" className="accountMenuItem" onClick={() => navigate("/saved") }>
                Reports and violations center
              </button>

              <div className="accountSectionLabel">Help</div>

              <button type="button" className="accountMenuItem" onClick={() => window.open("https://help.pinterest.com/", "_blank") }>
                Help center
              </button>

              <button type="button" className="accountMenuItem" onClick={() => window.open("https://help.pinterest.com/", "_blank") }>
                Request a feature
              </button>

              <div className="accountSectionLabel">Privacy</div>

              <button type="button" className="accountMenuItem" onClick={() => window.open("https://policy.pinterest.com/privacy-policy", "_blank") }>
                Privacy policy
              </button>

              <button type="button" className="accountMenuItem" onClick={() => window.open("https://policy.pinterest.com/privacy-rights", "_blank") }>
                Your privacy rights
              </button>

              <button type="button" className="accountMenuItem" onClick={() => window.open("https://policy.pinterest.com/terms-of-service", "_blank") }>
                Terms of service
              </button>

              <button type="button" className="accountMenuItem logoutButton" onClick={handleLogout}>
                Log out
              </button>
            </div>
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

            <h3>
              {searchValue.trim()
                ? "Search results"
                : "Recent searches"}
            </h3>

            {searchValue.trim() ? (

              <div className="searchResultsStack">

                <div className="searchResultSectionTitle">
                  People
                </div>

                {searchLoading ? (

                  <div className="userSearchMessage">
                    Searching...
                  </div>

                ) : searchUsers.length === 0 ? (

                  <div className="userSearchMessage">
                    No users found.
                  </div>

                ) : (

                  searchUsers.map(
                    (searchedUser) => {

                      const searchedName =
                        searchedUser.name ||
                        searchedUser.username ||
                        searchedUser.displayName ||
                        searchedUser.email?.split(
                          "@"
                        )[0] ||
                        "User";

                      const searchedUsername =
                        searchedUser.username ||
                        searchedUser.email?.split(
                          "@"
                        )[0] ||
                        "";

                      const searchedPhoto =
                        searchedUser.photo ||
                        searchedUser.profilePicture ||
                        searchedUser.avatar ||
                        "";

                      const searchedId =
                        searchedUser._id ||
                        searchedUser.id;

                      return (
                        <button
                          type="button"
                          key={searchedId}
                          className="userSearchItem"
                          onClick={() =>
                            openUserProfile(
                              searchedId
                            )
                          }
                        >

                          <div className="userSearchAvatar">

                            {searchedPhoto ? (
                              <img
                                src={searchedPhoto}
                                alt={searchedName}
                              />
                            ) : (
                              searchedName
                                .charAt(0)
                                .toUpperCase()
                            )}

                          </div>

                          <div className="userSearchInfo">

                            <div className="userSearchName">
                              {searchedName}
                            </div>

                            {searchedUsername && (
                              <div className="userSearchUsername">
                                @{searchedUsername}
                              </div>
                            )}

                            {searchedUser.bio && (
                              <div className="userSearchBio">
                                {searchedUser.bio}
                              </div>
                            )}

                          </div>

                        </button>
                      );
                    }
                  )

                )}

                <div className="searchResultSectionTitle pinSearchHeading">
                  Pins
                </div>

                {filteredPins.length > 0 ? (

                  <div className="pinSearchList">

                    {filteredPins.map((pin) => {
                      const pinId = pin._id || pin.id;
                      const pinTitle =
                        pin.title || "Untitled pin";
                      const pinCategory =
                        pin.category || "Created";

                      return (
                        <button
                          type="button"
                          key={pinId}
                          className="pinSearchListItem"
                          onClick={() => {
                            if (pinId) {
                              closeSearch();
                              navigate(`/pin/${pinId}`);
                            }
                          }}
                        >

                          <div className="pinSearchIconWrap">
                            <SearchIcon fontSize="small" />
                          </div>

                          <div className="pinSearchMeta">
                            <div className="pinSearchTitle">
                              {pinTitle}
                            </div>

                            <div className="pinSearchCategory">
                              {pinCategory}
                            </div>
                          </div>

                        </button>
                      );
                    })}

                  </div>

                ) : (

                  <div className="userSearchMessage">
                    No pins found.
                  </div>

                )}

              </div>

            ) : (

              <div className="recentSearchGrid">

                {recentSearches.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="recentSearchItem"
                      onClick={() =>
                        setSearchValue(
                          item.text
                        )
                      }
                    >

                      <img
                        src={item.image}
                        alt={item.text}
                      />

                      <div className="recentSearchText">

                        <span>
                          {item.text}
                        </span>

                        {item.meta && (
                          <small>
                            {item.meta}
                          </small>
                        )}

                      </div>

                    </button>
                  )
                )}

              </div>

            )}

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
                  img:
                    "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 2,
                  title: "So you",
                  subtitle:
                    "See fresh inspiration now.",
                  time: "13h",
                  img:
                    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 3,
                  title: "Trending searches",
                  subtitle:
                    "Updates from what's popular.",
                  time: "1d",
                  img:
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=120&q=80",
                },
                {
                  id: 4,
                  title: "Big mood",
                  subtitle:
                    "Ideas that fit your vibe.",
                  time: "1d",
                  img:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
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

                    <span>
                      {item.time}
                    </span>

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
          ALL CREATED PINS + DEMO PINS
      ===================================================== */}

      <div
        className={`muiFeed ${
          searchOpen ? "feedDimmed" : ""
        }`}
      >

        {mixedPins.map((pin) => {

          const pinImage = getImageUrl(
            pin.img ||
              pin.image ||
              ""
          );

          const pinTitle =
            pin.title ||
            "Untitled pin";

          const pinCategory =
            pin.category ||
            "Created";

          const pinKey =
            pin._id ||
            pin.id;

          return (
            <div
              className="muiPin"
              key={pinKey}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (pinKey) {
                  navigate(`/pin/${pinKey}`);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();

                  if (pinKey) {
                    navigate(`/pin/${pinKey}`);
                  }
                }
              }}
            >

              {pinImage ? (
                <img
                  src={pinImage}
                  alt={pinTitle}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No image
                </div>
              )}

              {/* SAVE */}

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

              {/* PIN META */}

              <div className="pinMeta">

                <span>
                  {pinCategory}
                </span>

                <button
                  type="button"
                  className="pinMoreBtn"
                  aria-label="more options"
                >
                  <MoreHorizIcon fontSize="small" />
                </button>

              </div>

            </div>
          );
        })}

      </div>

      {/* =====================================================
          INBOX
      ===================================================== */}

      <InboxPanel
        currentUserId={
          user?._id ||
          user?.id ||
          ""
        }
      />
    </>
  );
}