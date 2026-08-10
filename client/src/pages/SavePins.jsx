import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import PushPinIcon from "@mui/icons-material/PushPin";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MicIcon from "@mui/icons-material/Mic";

import logo from "../assets/Slog-removebg-preview.png";

import InboxPanel from "../components/InboxPanel";

import {
  loadSavedPinsForUser,
  loadUserProfileMeta,
} from "../utils/userStorage";

import "../styles/SavePins.css";

const API_URL = "http://localhost:5000/api";
const IMAGE_BASE_URL = "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| CHANGE THIS ONLY IF YOUR BACKEND SEARCH ROUTE IS DIFFERENT
|--------------------------------------------------------------------------
*/
const USER_SEARCH_URL = `${API_URL}/users/search`;

export default function SavePins() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);

  const [savedPins, setSavedPins] = useState([]);
  const [createdPins, setCreatedPins] = useState([]);

  const [activeTab, setActiveTab] = useState("saved");

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  // =====================================================
  // SEARCH STATE
  // =====================================================

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [userSearchResults, setUserSearchResults] =
    useState([]);

  const [userSearchLoading, setUserSearchLoading] =
    useState(false);

  const [userSearchError, setUserSearchError] =
    useState("");

  // =====================================================
  // CREATE STATE
  // =====================================================

  const [createOpen, setCreateOpen] = useState(false);

  const [loadingCreatedPins, setLoadingCreatedPins] =
    useState(false);

  // =====================================================
  // CREATE BOARD STATE
  // =====================================================

  const [createBoardOpen, setCreateBoardOpen] =
    useState(false);

  const [boardName, setBoardName] = useState("");

  const [boardPrivate, setBoardPrivate] =
    useState(false);

  const [collaboratorSearch, setCollaboratorSearch] =
    useState("");

  const [selectedCollaborators, setSelectedCollaborators] =
    useState([]);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (
      !storedUser ||
      storedUser === "undefined" ||
      storedUser === "null"
    ) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      setSavedPins(
        loadSavedPinsForUser(parsedUser)
      );

      const meta =
        loadUserProfileMeta(parsedUser);

      setUserMeta(meta || {});
    } catch (error) {
      console.error(
        "Failed to load user:",
        error
      );

      navigate("/");
    }
  }, [navigate]);

  // =====================================================
  // LOAD CREATED PINS
  // =====================================================

  useEffect(() => {
    if (!user) return;

    const userId = user._id || user.id;

    if (!userId) {
      console.error("User ID not found.");
      return;
    }

    const loadCreatedPins = async () => {
      try {
        setLoadingCreatedPins(true);

        const response = await fetch(
          `${IMAGE_BASE_URL}/api/pins/user/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load created pins."
          );
        }

        setCreatedPins(data.pins || []);
      } catch (error) {
        console.error(
          "Failed to load created pins:",
          error
        );

        setCreatedPins([]);
      } finally {
        setLoadingCreatedPins(false);
      }
    };

    loadCreatedPins();
  }, [user]);

  // =====================================================
  // REFRESH CREATED PINS WHEN PAGE BECOMES VISIBLE
  // =====================================================

  useEffect(() => {
    const refreshCreatedPins = async () => {
      if (!user) return;

      const userId = user._id || user.id;

      if (!userId) return;

      try {
        const response = await fetch(
          `${IMAGE_BASE_URL}/api/pins/user/${userId}`
        );

        const data = await response.json();

        if (response.ok) {
          setCreatedPins(data.pins || []);
        }
      } catch (error) {
        console.error(
          "Failed to refresh created pins:",
          error
        );
      }
    };

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshCreatedPins();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [user]);

  // =====================================================
  // SEARCH USERS
  // =====================================================

  useEffect(() => {
    const query = searchQuery.trim();

    /*
     * Don't search until at least 2 characters.
     */
    if (query.length < 2) {
      setUserSearchResults([]);
      setUserSearchError("");
      setUserSearchLoading(false);
      return;
    }

    let cancelled = false;

    const searchUsers = async () => {
      try {
        setUserSearchLoading(true);
        setUserSearchError("");

        const response = await fetch(
          `${USER_SEARCH_URL}?q=${encodeURIComponent(
            query
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to search users."
          );
        }

        if (cancelled) return;

        /*
         * Supports:
         * { users: [...] }
         * OR
         * { results: [...] }
         * OR
         * [...] directly
         */
        const users =
          Array.isArray(data)
            ? data
            : data.users ||
              data.results ||
              [];

        setUserSearchResults(users);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "User search failed:",
          error
        );

        setUserSearchResults([]);
        setUserSearchError(
          "Unable to search users."
        );
      } finally {
        if (!cancelled) {
          setUserSearchLoading(false);
        }
      }
    };

    /*
     * Small debounce.
     */
    const timeoutId = setTimeout(
      searchUsers,
      300
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  // =====================================================
  // OPEN CHAT
  // =====================================================

  const openInbox = () => {
    closeAccountMenu();
    window.dispatchEvent(
      new Event("openInbox")
    );
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
  // OPEN SEARCH
  // =====================================================

  const openSearch = () => {
    closeAccountMenu();
    setSearchOpen(true);
    setNotificationsOpen(false);
    setSearchQuery("");
    setUserSearchResults([]);
    setUserSearchError("");
  };

  // =====================================================
  // CLOSE SEARCH
  // =====================================================

  const closeSearch = () => {
    closeAccountMenu();
    setSearchOpen(false);
    setSearchQuery("");
    setUserSearchResults([]);
    setUserSearchError("");
  };

  // =====================================================
  // CLOSE CREATE BOARD
  // =====================================================

  const closeCreateBoard = () => {
    setCreateBoardOpen(false);
    setBoardName("");
    setBoardPrivate(false);
    setCollaboratorSearch("");
    setSelectedCollaborators([]);
  };

  // =====================================================
  // CREATE BOARD
  // =====================================================

  const handleCreateBoard = () => {
    if (!boardName.trim()) {
      return;
    }

    const boardData = {
      name: boardName.trim(),
      isPrivate: boardPrivate,
      collaborators: selectedCollaborators,
    };

    console.log(
      "Creating board:",
      boardData
    );

    closeCreateBoard();
  };

  // =====================================================
  // WAIT FOR USER
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
    if (
      !image ||
      typeof image !== "string"
    ) {
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
  // PROFILE IMAGE
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
  // PROFILE HANDLE
  // =====================================================

  const profileHandle =
    userMeta.username?.trim() ||
    user.username?.trim() ||
    user.email?.split("@")[0] ||
    "";

  // =====================================================
  // BIO
  // =====================================================

  const bioText = (
    userMeta.bio ||
    user.bio ||
    ""
  ).trim();

  // =====================================================
  // CURRENT PINS
  // =====================================================

  const currentPins =
    activeTab === "saved"
      ? savedPins
      : createdPins;

  // =====================================================
  // PIN SEARCH FILTER
  // =====================================================

  const visiblePins =
    currentPins.filter((pin) => {
      const haystack = [
        pin.title,
        pin.category,
        pin.description,
        pin.link,
        ...(pin.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(
        searchQuery.trim().toLowerCase()
      );
    });

  // =====================================================
  // RECENT SEARCHES
  // =====================================================

  const recentSearches = [
    {
      id: 1,
      text: "summer fashion",
      meta: "Style",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      text: "minimal interior",
      meta: "Decor",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      text: "city street style",
      meta: "Outfit",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      text: "aesthetic makeup",
      meta: "Beauty",
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const filteredSuggestions =
    recentSearches.filter((item) =>
      item.text
        .toLowerCase()
        .includes(
          searchQuery.trim().toLowerCase()
        )
    );

  // =====================================================
  // PIN IMAGE
  // =====================================================

  const getPinImageUrl = (image) => {
    return getImageUrl(image);
  };

  // =====================================================
  // GET SEARCH USER ID
  // =====================================================

  const getSearchUserId = (person) => {
    return (
      person?._id ||
      person?.id ||
      person?.userId
    );
  };

  // =====================================================
  // GET SEARCH USER NAME
  // =====================================================

  const getSearchUserName = (person) => {
    return (
      person?.name ||
      person?.displayName ||
      person?.username ||
      person?.email?.split("@")[0] ||
      "User"
    );
  };

  // =====================================================
  // GET SEARCH USERNAME
  // =====================================================

  const getSearchUsername = (person) => {
    return (
      person?.username ||
      person?.userName ||
      person?.handle ||
      person?.email?.split("@")[0] ||
      ""
    );
  };

  // =====================================================
  // GET SEARCH USER IMAGE
  // =====================================================

  const getSearchUserImage = (person) => {
    return getImageUrl(
      person?.dp ||
        person?.photo ||
        person?.photoURL ||
        person?.profilePicture ||
        person?.avatar ||
        person?.image ||
        person?.profileImage ||
        ""
    );
  };

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
          searchOpen
            ? "searchMode"
            : ""
        }`}
      >
        <Toolbar className="mainToolbar">

          {!searchOpen ? (
            <>
              {/* =================================================
                  NORMAL NAVBAR
              ================================================= */}

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
                  onClick={() =>
                    navigate("/saved")
                  }
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

                  <ArrowDropDownIcon
                    className="pillArrow"
                  />

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
                  className="headerIconButton"
                  aria-label="notifications"
                  onClick={() => {
                    setNotificationsOpen(
                      true
                    );
                    setSearchOpen(false);
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </button>

                {/* CHAT */}

                <button
                  type="button"
                  className="headerIconButton"
                  aria-label="messages"
                  onClick={openInbox}
                >
                  <ChatIcon fontSize="small" />
                </button>

                {/* PROFILE */}

                <button
                  type="button"
                  className="muiAvatar"
                  aria-label="profile"
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
                  className="collapseBtn"
                  aria-label="more options"
                  onClick={toggleAccountMenu}
                >
                  <ArrowDropDownIcon
                    fontSize="small"
                  />
                </button>

              </Box>
            </>
          ) : (

            /* =================================================
               SEARCH MODE
            ================================================= */

            <div className="searchNavbar">

              {/* LEFT */}

              <div className="searchNavLeft">

                <div className="searchBrandMark">

                  <img
                    src={logo}
                    alt="StylePins"
                  />

                </div>

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

                <button
                  type="button"
                  className="searchProfilePill"
                  onClick={() =>
                    navigate("/saved")
                  }
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

                <SearchIcon
                  className="expandedSearchIcon"
                />

                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
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

              {/* RIGHT */}

              <div className="searchNavRight">

                <button
                  type="button"
                  className="searchNavIcon"
                  aria-label="notifications"
                  onClick={() => {
                    setNotificationsOpen(
                      true
                    );
                    setSearchOpen(false);
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </button>

                <button
                  type="button"
                  className="searchNavIcon"
                  aria-label="messages"
                  onClick={openInbox}
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
                  aria-label="profile"
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

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => {
                  closeAccountMenu();
                  navigate("/saved");
                }}
              >
                Add Pinterest account
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => {
                  closeAccountMenu();
                  navigate("/saved");
                }}
              >
                Settings
              </button>

              <div className="accountSectionLabel">Content</div>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => {
                  closeAccountMenu();
                  navigate("/saved");
                }}
              >
                Import content
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => {
                  closeAccountMenu();
                  navigate("/saved");
                }}
              >
                Link to Pinterest
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => {
                  closeAccountMenu();
                  navigate("/saved");
                }}
              >
                Reports and violations center
              </button>

              <div className="accountSectionLabel">Help</div>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => window.open("https://help.pinterest.com/", "_blank")}
              >
                Help center
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => window.open("https://help.pinterest.com/", "_blank")}
              >
                Request a feature
              </button>

              <div className="accountSectionLabel">Privacy</div>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => window.open("https://policy.pinterest.com/privacy-policy", "_blank")}
              >
                Privacy policy
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => window.open("https://policy.pinterest.com/privacy-rights", "_blank")}
              >
                Your privacy rights
              </button>

              <button
                type="button"
                className="accountMenuItem"
                onClick={() => window.open("https://policy.pinterest.com/terms-of-service", "_blank")}
              >
                Terms of service
              </button>

              <button
                type="button"
                className="accountMenuItem logoutButton"
                onClick={handleLogout}
              >
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
              {searchQuery.trim()
                ? "Search results"
                : "Recent searches"}
            </h3>

            {/* =================================================
                SEARCH RESULTS
            ================================================= */}

            {searchQuery.trim() ? (

              <div className="userSearchResults">

                {/* ================================
                    USERS
                ================================= */}

                {searchQuery.trim().length >=
                  2 && (

                  <>

                    <div className="searchResultSectionTitle">
                      People
                    </div>

                    {userSearchLoading ? (

                      <div className="userSearchMessage">
                        Searching users...
                      </div>

                    ) : userSearchError ? (

                      <div className="userSearchMessage">
                        {userSearchError}
                      </div>

                    ) : userSearchResults.length >
                      0 ? (

                      userSearchResults.map(
                        (person) => {

                          const personId =
                            getSearchUserId(
                              person
                            );

                          const personName =
                            getSearchUserName(
                              person
                            );

                          const personUsername =
                            getSearchUsername(
                              person
                            );

                          const personImage =
                            getSearchUserImage(
                              person
                            );

                          return (
                            <button
                              type="button"
                              key={
                                personId ||
                                person.email ||
                                personUsername ||
                                personName
                              }
                              className="userSearchItem"
                              onClick={() => {

                                if (
                                  personId
                                ) {
                                  closeSearch();

                                  navigate(
                                    `/profile/${personId}`
                                  );
                                }

                              }}
                            >

                              <div className="userSearchAvatar">

                                {personImage ? (

                                  <img
                                    src={
                                      personImage
                                    }
                                    alt={
                                      personName
                                    }
                                  />

                                ) : (

                                  <div className="searchUserInitial">

                                    {personName
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>

                                )}

                              </div>

                              <div className="userSearchInfo">

                                <div className="userSearchName">
                                  {personName}
                                </div>

                                {personUsername && (

                                  <div className="userSearchUsername">
                                    @{personUsername}
                                  </div>

                                )}

                                {person.bio && (

                                  <div className="userSearchBio">
                                    {person.bio}
                                  </div>

                                )}

                              </div>

                            </button>
                          );
                        }
                      )

                    ) : (

                      <div className="userSearchMessage">
                        No people found.
                      </div>

                    )}

                  </>
                )}

                {/* ================================
                    PINS
                ================================= */}

                <div className="searchResultSectionTitle pinSearchHeading">
                  Pins
                </div>

                {visiblePins.length > 0 ? (

                  visiblePins.map(
                    (pin) => {

                      const pinId =
                        pin._id ||
                        pin.id;

                      return (
                        <button
                          type="button"
                          key={pinId}
                          className="userSearchItem"
                          onClick={() => {
                            if (pinId) {
                              closeSearch();
                              navigate(`/pin/${pinId}`);
                            }
                          }}
                        >

                          <div className="userSearchAvatar">

                            {getPinImageUrl(
                              pin.img ||
                                pin.image ||
                                ""
                            ) ? (

                              <img
                                src={getPinImageUrl(
                                  pin.img ||
                                    pin.image ||
                                    ""
                                )}
                                alt={
                                  pin.title ||
                                  "Pin"
                                }
                              />

                            ) : (

                              <PushPinIcon />

                            )}

                          </div>

                          <div className="userSearchInfo">

                            <div className="userSearchName">
                              {pin.title ||
                                "Untitled pin"}
                            </div>

                            <div className="userSearchUsername">
                              {pin.category ||
                                (activeTab ===
                                "created"
                                  ? "Created"
                                  : "Saved")}
                            </div>

                            {pin.description && (

                              <div className="userSearchBio">
                                {
                                  pin.description
                                }
                              </div>

                            )}

                          </div>

                        </button>
                      );
                    }
                  )

                ) : (

                  <div className="userSearchMessage">
                    No matching pins found.
                  </div>

                )}

              </div>

            ) : (

              /* =================================================
                 RECENT SEARCHES
              ================================================= */

              <div className="recentSearchGrid">

                {filteredSuggestions.map(
                  (item) => (

                    <button
                      type="button"
                      key={item.id}
                      className="recentSearchItem"
                      onClick={() =>
                        setSearchQuery(
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
                  setNotificationsOpen(
                    false
                  )
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
                  title:
                    "Trending searches",
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
          PROFILE
      ===================================================== */}

      <Box
        className={`profile-container ${
          searchOpen
            ? "feedDimmed"
            : ""
        }`}
      >

        {/* PROFILE HEADER */}

        <Box className="profile-header">

          <Box className="profile-main">

            <Box className="profile-avatar">

              {profilePic ? (
                <img
                  src={profilePic}
                  alt="profile avatar"
                />
              ) : (
                <Box className="profile-avatar-placeholder">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </Box>
              )}

            </Box>

            <Box>

              <Box className="profile-name">
                {displayName}
              </Box>

              {profileHandle && (
                <Box className="profile-handle">
                  @{profileHandle}
                </Box>
              )}

            </Box>

          </Box>

          <Box className="profile-actions">

            <Box className="profile-action-icon">
              <UploadIcon
                sx={{
                  fontSize: 24,
                }}
              />
            </Box>

            <Box className="profile-action-icon">
              <AddIcon
                sx={{
                  fontSize: 24,
                }}
              />
            </Box>

          </Box>

        </Box>

        {/* STATS */}

        <Box className="profile-stats">

          <Box className="profile-stat">

            <span className="profile-stat-number">
              {userMeta.followers ??
                0}
            </span>{" "}
            followers

          </Box>

          <Box>·</Box>

          <Box className="profile-stat">
            {userMeta.following ??
              0}{" "}
            following
          </Box>

          <Box>·</Box>

          <Box className="profile-stat">
            {userMeta.monthlyViews ??
              0}{" "}
            monthly views
          </Box>

        </Box>

        {/* BIO */}

        {bioText && (
          <Box className="profile-bio">
            {bioText}
          </Box>
        )}

        {/* EDIT PROFILE */}

        <Box
          component={RouterLink}
          to="/settings/edit-profile"
          className="edit-profile"
        >
          Edit profile
        </Box>

        {/* TAGS */}

        <Box className="profile-tags">

          {(userMeta.tags || []).map(
            (tag, idx) => (

              <Box
                key={idx}
                className="profile-tag"
              >

                {idx === 0 ? (
                  <PushPinIcon
                    sx={{
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    🛍️
                  </Box>
                )}

                <Box>
                  {tag}
                </Box>

              </Box>

            )
          )}

        </Box>

        {/* TABS */}

        <Box className="profile-tabs">

          <Box
            className={`profile-tab ${
              activeTab ===
              "created"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "created"
              )
            }
          >
            Created
          </Box>

          <Box
            className={`profile-tab ${
              activeTab === "saved"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "saved"
              )
            }
          >
            Saved
          </Box>

        </Box>

        {/* PINS */}

        <Box className="saved-pins">

          {/* CREATED */}

          {activeTab ===
            "created" && (

            <>
              {loadingCreatedPins ? (

                <Box className="created-empty">
                  Loading created Pins...
                </Box>

              ) : createdPins.length ===
                0 ? (

                <Box className="created-empty">
                  No created Pins yet.
                </Box>

              ) : visiblePins.length ===
                0 ? (

                <Box className="created-empty">
                  No matching Pins found.
                </Box>

              ) : (

                visiblePins.map(
                  (pin, index) => (

                    <Box
                      key={
                        pin._id ||
                        pin.id
                      }
                      className={`pin-card ${
                        index % 2 === 0
                          ? "tall"
                          : "normal"
                      }`}
                      onClick={() => {
                        const pinId =
                          pin._id || pin.id;

                        if (pinId) {
                          navigate(
                            `/pin/${pinId}`
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          const pinId =
                            pin._id || pin.id;

                          if (pinId) {
                            navigate(
                              `/pin/${pinId}`
                            );
                          }
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >

                      <Box className="pin-duration">
                        0:10
                      </Box>

                      <img
                        src={getPinImageUrl(
                          pin.image ||
                            pin.img ||
                            ""
                        )}
                        alt={
                          pin.title ||
                          "Created pin"
                        }
                        className="pin-card-image"
                      />

                      {pin.title && (
                        <Box className="created-pin-title">
                          {pin.title}
                        </Box>
                      )}

                      <Box className="pin-stats">

                        <Box className="pin-stats-button">
                          See more stats
                        </Box>

                      </Box>

                    </Box>

                  )
                )

              )}
            </>

          )}

          {/* SAVED */}

          {activeTab ===
            "saved" && (

            <>
              {visiblePins.length ===
                0 ? (

                <Box className="created-empty">
                  No saved Pins yet.
                </Box>

              ) : (

                visiblePins.map(
                  (pin) => (

                    <Box
                      key={
                        pin.id ||
                        pin._id
                      }
                      className={`pin-card ${
                        String(
                          pin.id ||
                            pin._id
                        ).length %
                          2 ===
                        0
                          ? "tall"
                          : "normal"
                      }`}
                      onClick={() => {
                        const pinId =
                          pin.id || pin._id;

                        if (pinId) {
                          navigate(
                            `/pin/${pinId}`
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          const pinId =
                            pin.id || pin._id;

                          if (pinId) {
                            navigate(
                              `/pin/${pinId}`
                            );
                          }
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >

                      <Box className="pin-duration">
                        0:10
                      </Box>

                      <img
                        src={getPinImageUrl(
                          pin.img ||
                            pin.image ||
                            ""
                        )}
                        alt={
                          pin.title ||
                          "Saved pin"
                        }
                        className="pin-card-image"
                      />

                      <Box className="pin-stats">

                        <Box className="pin-stats-button">
                          See more stats
                        </Box>

                      </Box>

                    </Box>

                  )
                )

              )}
            </>

          )}

        </Box>

        {/* CREATE MENU */}

        <Box className="create-wrapper">

          {createOpen && (

            <Box className="create-menu">

              <button
                type="button"
                className="create-menu-item"
                onClick={() => {
                  setCreateOpen(false);
                  navigate(
                    "/create-pin"
                  );
                }}
              >
                <Box className="create-menu-title">
                  Pin
                </Box>
              </button>

              <button
                type="button"
                className="create-menu-item"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateBoardOpen(
                    true
                  );
                }}
              >
                <Box className="create-menu-title">
                  Board
                </Box>
              </button>

              <button
                type="button"
                className="create-menu-item"
                onClick={() => {
                  setCreateOpen(false);
                  navigate(
                    "/create-collage"
                  );
                }}
              >
                <Box className="create-menu-title">
                  Collage
                </Box>
              </button>

            </Box>

          )}

          <button
            type="button"
            className="create-button"
            onClick={() =>
              setCreateOpen(
                (previous) =>
                  !previous
              )
            }
          >
            Create
          </button>

        </Box>

      </Box>

      {/* =====================================================
          CREATE BOARD MODAL
      ===================================================== */}

      {createBoardOpen && (

        <Box
          className="create-board-overlay"
          onClick={closeCreateBoard}
        >

          <Box
            className="create-board-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <Box className="create-board-header">

              <Box className="create-board-title">
                Create board
              </Box>

              <IconButton
                className="create-board-close"
                onClick={
                  closeCreateBoard
                }
                aria-label="Close create board"
              >
                <CloseIcon />
              </IconButton>

            </Box>

            <Box className="create-board-content">

              {/* NAME */}

              <Box className="create-board-field">

                <Box className="create-board-label">
                  Name
                </Box>

                <Box
                  component="input"
                  type="text"
                  value={boardName}
                  onChange={(event) =>
                    setBoardName(
                      event.target.value
                    )
                  }
                  placeholder='Like "Places to Go" or "Recipes to Make"'
                  className="create-board-input"
                  autoFocus
                />

              </Box>

              {/* PRIVATE BOARD */}

              <Box className="private-board-section">

                <label className="private-board-label">

                  <input
                    type="checkbox"
                    checked={
                      boardPrivate
                    }
                    onChange={(
                      event
                    ) =>
                      setBoardPrivate(
                        event.target
                          .checked
                      )
                    }
                    className="private-board-checkbox"
                  />

                  <Box className="private-board-text">

                    <Box className="private-board-title">
                      Make this board private
                    </Box>

                    <Box className="private-board-description">

                      Anyone can see public
                      boards. Only
                      collaborators can see
                      private boards.{" "}

                      <span className="privacy-link">
                        Learn more about board
                        privacy
                      </span>

                    </Box>

                  </Box>

                </label>

              </Box>

              {/* COLLABORATORS */}

              <Box className="collaborator-section">

                <Box className="create-board-label">
                  Add collaborators
                </Box>

                <Box className="collaborator-search">

                  <SearchIcon className="collaborator-search-icon" />

                  <Box
                    component="input"
                    type="text"
                    value={
                      collaboratorSearch
                    }
                    onChange={(event) =>
                      setCollaboratorSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search by name or email"
                    className="collaborator-input"
                  />

                </Box>

                {selectedCollaborators.length >
                  0 && (

                  <Box className="selected-collaborators">

                    {selectedCollaborators.map(
                      (person) => (

                        <Box
                          key={
                            person.id
                          }
                          className="selected-collaborator"
                        >

                          <Box className="selected-collaborator-avatar">
                            {person.name
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}
                          </Box>

                          <Box className="selected-collaborator-name">
                            {
                              person.name
                            }
                          </Box>

                          <IconButton
                            className="remove-collaborator"
                            onClick={() =>
                              setSelectedCollaborators(
                                (
                                  previous
                                ) =>
                                  previous.filter(
                                    (
                                      item
                                    ) =>
                                      item.id !==
                                      person.id
                                  )
                              )
                            }
                          >
                            <CloseIcon />
                          </IconButton>

                        </Box>

                      )
                    )}

                  </Box>

                )}

              </Box>

            </Box>

            {/* FOOTER */}

            <Box className="create-board-footer">

              <button
                type="button"
                className={`create-board-submit ${
                  boardName.trim()
                    ? "enabled"
                    : ""
                }`}
                disabled={
                  !boardName.trim()
                }
                onClick={
                  handleCreateBoard
                }
              >
                Create
              </button>

            </Box>

          </Box>

        </Box>

      )}

      {/* =====================================================
          INBOX
      ===================================================== */}

      <InboxPanel />
    </>
  );
}