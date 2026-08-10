import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import LockIcon from "@mui/icons-material/Lock";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MicIcon from "@mui/icons-material/Mic";

import logo from "../assets/Slog-removebg-preview.png";

import {
  loadSavedPinsForUser,
  loadUserProfileMeta,
} from "../utils/userStorage";

import "../styles/CreateCollage.css";
import InboxPanel from "../components/InboxPanel";

const IMAGE_BASE_URL = "http://localhost:5000";

function CreateCollage() {
  const navigate = useNavigate();

  // USER
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);

  // NAVBAR
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // COLLAGE
  const [searchQuery, setSearchQuery] = useState("");
  const [collageItems, setCollageItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // AVAILABLE PINS
  const [availablePins, setAvailablePins] = useState([]);

  // SEARCH USERS
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // LOAD USER
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

  // IMAGE URL
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

  // PROFILE IMAGE
  const profilePic =
    userMeta?.dp ||
    userMeta?.photo ||
    user?.photo ||
    user?.profilePicture ||
    user?.avatar ||
    "";

  // DISPLAY NAME
  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  // AVAILABLE SAVED PINS
  useEffect(() => {
    if (!user) return;

    try {
      const saved = loadSavedPinsForUser(user);

      if (Array.isArray(saved)) {
        setAvailablePins(saved);
      }
    } catch (error) {
      console.error(
        "Failed to load saved pins:",
        error
      );

      setAvailablePins([]);
    }
  }, [user]);

  // BACKEND CREATED PINS
  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    if (!userId) return;
    const loadCreatedPins = async () => {
      try {
        const response = await fetch(
          `${IMAGE_BASE_URL}/api/pins/user/${userId}`
        );

        const data = await response.json();

        if (
          response.ok &&
          Array.isArray(data.pins)
        ) {
          setAvailablePins((previous) => {
            const combined = [
              ...previous,
              ...data.pins,
            ];

            const unique = combined.filter(
              (pin, index, array) => {
                const id =
                  pin._id ||
                  pin.id ||
                  `${pin.title}-${index}`;

                return (
                  array.findIndex(
                    (item) =>
                      (item._id ||
                        item.id ||
                        `${item.title}-${index}`) ===
                      id
                  ) === index
                );
              }
            );

            return unique;
          });
        }
      } catch (error) {
        console.error(
          "Failed to load created pins:",
          error
        );
      }
    };

    loadCreatedPins();
  }, [user]);

  // PIN IMAGE
  const getPinImage = (pin) => {
    if (!pin) return "";

    return getImageUrl(
      pin.image ||
        pin.img ||
        pin.imageUrl ||
        pin.photo ||
        pin.thumbnail ||
        ""
    );
  };
  // FILTER PINS
  const filteredPins = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return availablePins;
    }

    return availablePins.filter((pin) => {
      const text = [
        pin.title,
        pin.description,
        pin.category,
        pin.link,
        ...(Array.isArray(pin.tags)
          ? pin.tags
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [availablePins, searchQuery]);

  // SAVE HISTORY
  const saveHistory = (items) => {
    setHistory((previous) => [
      ...previous,
      collageItems,
    ]);

    setFuture([]);
    setCollageItems(items);
  };

  // ADD PIN
  const addPinToCollage = (pin) => {
    const image = getPinImage(pin);

    if (!image) return;

    const id =
      pin._id ||
      pin.id ||
      `${Date.now()}-${Math.random()}`;

    const alreadyAdded =
      collageItems.some(
        (item) => item.sourceId === id
      );

    if (alreadyAdded) {
      const existing =
        collageItems.find(
          (item) =>
            item.sourceId === id
        );
      if (existing) {
        setSelectedItemId(existing.id);
      }
      return;
    }

    const newItem = {
      id: `collage-${Date.now()}-${Math.random()}`,
      sourceId: id,
      image,
      title: pin.title || "Pin",
      x: 50,
      y: 50,
      width: 170,
      rotation: 0,
    };

    const newItems = [
      ...collageItems,
      newItem,
    ];

    saveHistory(newItems);

    setSelectedItemId(newItem.id);
  };

  // DELETE
  const deleteSelected = () => {
    if (!selectedItemId) return;

    const newItems =
      collageItems.filter(
        (item) =>
          item.id !== selectedItemId
      );

    saveHistory(newItems);

    setSelectedItemId(null);
  };

  // DUPLICATE
  const duplicateSelected = () => {
    const selected =
      collageItems.find(
        (item) =>
          item.id === selectedItemId
      );

    if (!selected) return;

    const duplicate = {
      ...selected,
      id: `collage-${Date.now()}-${Math.random()}`,
      x: Math.min(
        selected.x + 8,
        85
      ),
      y: Math.min(
        selected.y + 8,
        85
      ),
    };

    const newItems = [
      ...collageItems,
      duplicate,
    ];

    saveHistory(newItems);

    setSelectedItemId(
      duplicate.id
    );
  };
  // UNDO
  const handleUndo = () => {
    if (history.length === 0) return;

    const previous =
      history[history.length - 1];

    setFuture((items) => [
      collageItems,
      ...items,
    ]);

    setHistory((items) =>
      items.slice(0, -1)
    );

    setCollageItems(previous);

    setSelectedItemId(null);
  };

  // REDO
  const handleRedo = () => {
    if (future.length === 0) return;

    const next = future[0];

    setHistory((items) => [
      ...items,
      collageItems,
    ]);

    setFuture((items) =>
      items.slice(1)
    );

    setCollageItems(next);

    setSelectedItemId(null);
  };

  // ADD TEXT
  const addText = () => {
    const textItem = {
      id: `text-${Date.now()}`,
      type: "text",
      text: "Add text",
      x: 50,
      y: 50,
    };

    const newItems = [
      ...collageItems,
      textItem,
    ];
    saveHistory(newItems);
    setSelectedItemId(
      textItem.id
    );
  };

  // SAVE COLLAGE
  const handleNext = () => {
    if (collageItems.length === 0) {
      return;
    }

    localStorage.setItem(
      "stylepins_collage_draft",
      JSON.stringify({
        items: collageItems,
        createdAt:
          new Date().toISOString(),
      })
    );

    navigate(
      "/create-collage/save"
    );
  };

  // CLOSE
  const handleClose = () => {
    navigate(-1);
  };

  // NAVBAR ACTIONS
  const openSearch = () => {
    setMoreOpen(false);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchUsers([]);
  };

  const openNotifications = () => {
    setMoreOpen(false);
    setNotificationsOpen(true);
  };

  const openInbox = () => {
    setMoreOpen(false);

    window.dispatchEvent(
      new Event("openInbox")
    );
  };

  const openSavedPins = () => {
    setMoreOpen(false);

    navigate("/saved");
  };

  const toggleMore = () => {
    setMoreOpen(
      (previous) => !previous
    );
  };

  // SEARCH USERS
  useEffect(() => {
    const query =
      searchValue.trim();

    if (!searchOpen || !query) {
      setSearchUsers([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const searchPeople = async () => {
      setSearchLoading(true);

      try {
        const response =
          await fetch(
            `${IMAGE_BASE_URL}/api/users/search?q=${encodeURIComponent(
              query
            )}`
          );

        if (!response.ok) {
          throw new Error(
            "Search request failed"
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          const users =
            Array.isArray(data)
              ? data
              : Array.isArray(
                    data.users
                  )
                ? data.users
                : [];

          setSearchUsers(users);
        }
      } catch (error) {
        console.error(
          "User search failed:",
          error
        );

        if (!cancelled) {
          setSearchUsers([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(
      searchPeople,
      300
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchValue, searchOpen]);

  // OPEN USER PROFILE
  const openUserProfile = (userId) => {
    if (!userId) return;

    closeSearch();

    navigate(
      `/profile/${userId}`
    );
  };

  // WAIT USER
  if (!user || !userMeta) {
    return null;
  }

  // RENDER
  return (
    <div className="createCollagePage">
      <header className="collage-navbar">

        {/* LEFT */}

        <div className="collage-navbar-left">

          <button
            type="button"
            className="collage-logo"
            onClick={() =>
              navigate("/")
            }
          >
            <img
              src={logo}
              alt="StylePins"
            />

            <span>
              StylePins
            </span>

            <span className="collage-brand-menu">
              ≡
            </span>
          </button>

        </div>

        {/* RIGHT */}

        <div className="collage-navbar-right">

          {/* PROFILE PILL */}

          <button
            type="button"
            className="collage-profile-pill"
            onClick={
              openSavedPins
            }
          >

            <div className="collage-profile-avatar">

              {profilePic ? (
                <img
                  src={getImageUrl(
                    profilePic
                  )}
                  alt="profile"
                />
              ) : (
                displayName
                  .charAt(0)
                  .toUpperCase()
              )}

            </div>

            <div className="collage-profile-text">

              <span>
                {displayName}
              </span>

              <strong>
                {displayName}'s profile
              </strong>

            </div>

            <ArrowDropDownIcon />

          </button>

          {/* SEARCH */}

          <button
            type="button"
            className="collage-nav-icon"
            aria-label="Search"
            onClick={
              openSearch
            }
          >
            <SearchIcon />
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="collage-nav-icon notification-icon"
            aria-label="Notifications"
            onClick={
              openNotifications
            }
          >
            <NotificationsIcon />

            <span className="notification-number">
              3
            </span>
          </button>

          {/* CHAT */}

          <button
            type="button"
            className="collage-nav-icon"
            aria-label="Messages"
            onClick={
              openInbox
            }
          >
            <ChatIcon />
          </button>

          {/* MORE */}

          <button
            type="button"
            className="collage-nav-icon"
            aria-label="More options"
            onClick={
              toggleMore
            }
          >
            <MoreHorizIcon />
          </button>

          {/* AVATAR */}

          <button
            type="button"
            className="collage-small-avatar"
            aria-label="Open profile"
            onClick={
              openSavedPins
            }
          >
            {profilePic ? (
              <img
                src={getImageUrl(
                  profilePic
                )}
                alt="profile"
              />
            ) : (
              displayName
                .charAt(0)
                .toUpperCase()
            )}
          </button>

          {/* DROPDOWN */}

          <button
            type="button"
            className="collage-nav-icon"
            aria-label="Menu"
            onClick={
              toggleMore
            }
          >
            <ArrowDropDownIcon />
          </button>

          {moreOpen && (
            <div className="collage-more-menu">

              <button
                type="button"
                onClick={
                  openSavedPins
                }
              >
                My profile
              </button>

              <button
                type="button"
                onClick={
                  openInbox
                }
              >
                Messages
              </button>

              <button
                type="button"
                onClick={
                  openNotifications
                }
              >
                Notifications
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
              >
                Home
              </button>

            </div>
          )}

        </div>

      </header>

      {/* =================================================
 //         SEARCH OVERLAY
      ================================================= */}

      {searchOpen && (
        <div
          className="collage-search-overlay"
          onClick={
            closeSearch
          }
        >

          <div
            className="collage-search-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="collage-expanded-search">

              <SearchIcon />

              <input
                autoFocus
                type="text"
                placeholder="Search people"
                value={
                  searchValue
                }
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchValue("")
                  }
                >
                  <CloseIcon />
                </button>
              )}

              <button
                type="button"
                title="Visual search"
              >
                <CameraAltIcon />
              </button>

              <button
                type="button"
                title="Voice search"
              >
                <MicIcon />
              </button>

            </div>

            <div className="collage-search-results">

              <h3>
                {searchValue.trim()
                  ? "Search results"
                  : "Search people"}
              </h3>

              {searchValue.trim() ? (

                searchLoading ? (

                  <div className="collage-search-message">
                    Searching...
                  </div>

                ) : searchUsers.length ===
                  0 ? (

                  <div className="collage-search-message">
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
                          key={
                            searchedId
                          }
                          className="collage-search-user"
                          onClick={() =>
                            openUserProfile(
                              searchedId
                            )
                          }
                        >

                          <div className="collage-search-user-avatar">

                            {searchedPhoto ? (
                              <img
                                src={getImageUrl(
                                  searchedPhoto
                                )}
                                alt={
                                  searchedName
                                }
                              />
                            ) : (
                              searchedName
                                .charAt(
                                  0
                                )
                                .toUpperCase()
                            )}

                          </div>

                          <div>
                            <strong>
                              {
                                searchedName
                              }
                            </strong>

                            {searchedUsername && (
                              <span>
                                @
                                {
                                  searchedUsername
                                }
                              </span>
                            )}

                            {searchedUser.bio && (
                              <small>
                                {
                                  searchedUser.bio
                                }
                              </small>
                            )}
                          </div>

                        </button>
                      );
                    }
                  )

                )

              ) : (

                <div className="collage-search-empty">
                  Search for people on StylePins.
                </div>

              )}

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      {notificationsOpen && (
        <div
          className="notifications-overlay"
          onClick={() =>
            setNotificationsOpen(
              false
            )
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
              ].map(
                (item) => (

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
                        {
                          item.title
                        }
                      </div>

                      <div className="notification-subtitle">
                        {
                          item.subtitle
                        }
                      </div>

                    </div>

                    <div className="notification-meta">

                      <span>
                        {item.time}
                      </span>

                      <MoreHorizIcon fontSize="small" />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          MAIN TOOLBAR
      ================================================= */}

      <div className="collage-toolbar">

        <div className="collage-toolbar-left">

          <button
            type="button"
            className="collage-close-button"
            onClick={
              handleClose
            }
          >
            <CloseIcon />
          </button>

          <h1>
            Create Collage
          </h1>

        </div>

        <div className="collage-toolbar-center">

          <button
            type="button"
            className="toolbar-icon-button"
            disabled={
              history.length === 0
            }
            onClick={
              handleUndo
            }
          >
            <UndoIcon />
          </button>

          <button
            type="button"
            className="toolbar-icon-button"
            disabled={
              future.length === 0
            }
            onClick={
              handleRedo
            }
          >
            <RedoIcon />
          </button>

          <button
            type="button"
            className="toolbar-icon-button"
          >
            <MoreHorizIcon />
          </button>

        </div>

        <button
          type="button"
          className={`next-button ${
            collageItems.length ===
            0
              ? "disabled"
              : ""
          }`}
          disabled={
            collageItems.length === 0
          }
          onClick={
            handleNext
          }
        >
          Next
          <ArrowForwardIcon />
        </button>

      </div>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <main className="collage-workspace">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <aside className="collage-left-panel">

          <div className="cutouts-heading">

            <h2>
              Cutouts
            </h2>

            <p>
              Select a cutout to edit or drag to
              reorder
            </p>

          </div>

          <div className="cutouts-list">

            <div className="background-row">

              <LockIcon />

              <div className="background-preview">
                <span />
              </div>

              <span>
                Background
              </span>

            </div>

            {collageItems
              .filter(
                (item) =>
                  item.type !==
                  "text"
              )
              .map(
                (item) => (

                  <div
                    key={
                      item.id
                    }
                    className={`cutout-row ${
                      selectedItemId ===
                      item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedItemId(
                        item.id
                      )
                    }
                  >

                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.title
                      }
                    />

                    <span>
                      {
                        item.title ||
                        "Cutout"
                      }
                    </span>

                  </div>

                )
              )}

          </div>

        </aside>

        {/* =================================================
            CENTER EDITOR
        ================================================= */}

        <section className="collage-editor">

          <div className="collage-canvas-wrapper">

            <div
              className="collage-canvas"
              onClick={() =>
                setSelectedItemId(
                  null
                )
              }
            >

              {collageItems.length ===
                0 && (
                <div className="empty-canvas-hint">

                  <AddPhotoAlternateIcon />

                  <span>
                    Select Pins from the right
                    to add them to your
                    collage
                  </span>

                </div>
              )}

              {collageItems.map(
                (item) => {

                  if (
                    item.type ===
                    "text"
                  ) {
                    return (
                      <div
                        key={
                          item.id
                        }
                        className={`collage-text-item ${
                          selectedItemId ===
                          item.id
                            ? "selected"
                            : ""
                        }`}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                        }}
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelectedItemId(
                            item.id
                          );
                        }}
                      >
                        {
                          item.text
                        }
                      </div>
                    );
                  }

                  return (
                    <div
                      key={
                        item.id
                      }
                      className={`collage-image-item ${
                        selectedItemId ===
                        item.id
                          ? "selected"
                          : ""
                      }`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.width}px`,
                        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      }}
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedItemId(
                          item.id
                        );
                      }}
                    >

                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.title
                        }
                      />

                      {selectedItemId ===
                        item.id && (
                        <div className="selection-outline">

                          <span className="resize-handle top-left" />

                          <span className="resize-handle top-right" />

                          <span className="resize-handle bottom-left" />

                          <span className="resize-handle bottom-right" />

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* BOTTOM TOOLS */}

          <div className="collage-bottom-tools">

            <button
              type="button"
              className="editor-tool"
              onClick={
                addText
              }
              title="Add text"
            >
              <TextFieldsIcon />
            </button>

            <button
              type="button"
              className="editor-tool"
              title="Add image"
            >
              <ImageIcon />
            </button>

            <button
              type="button"
              className="editor-tool"
              disabled={
                !selectedItemId
              }
              onClick={
                duplicateSelected
              }
              title="Duplicate"
            >
              <ContentCopyIcon />
            </button>

            <button
              type="button"
              className="editor-tool delete-tool"
              disabled={
                !selectedItemId
              }
              onClick={
                deleteSelected
              }
              title="Delete"
            >
              <DeleteIcon />
            </button>

            <button
              type="button"
              className="editor-tool"
              disabled={
                !selectedItemId
              }
              title="Cut"
            >
              <ContentCutIcon />
            </button>

          </div>

        </section>

        {/* =================================================
            RIGHT PIN PANEL
        ================================================= */}

        <aside className="collage-right-panel">

          {/* SEARCH */}

          <div className="collage-search-box">

            <SearchIcon />

            <input
              type="text"
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search by keyword or Pin ID"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
              >
                <CloseIcon />
              </button>
            )}

          </div>

          {/* TABS */}

          <div className="collage-tabs">

            <button
              type="button"
              className={
                activeTab ===
                "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "all"
                )
              }
            >
              All Pins
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "boards"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "boards"
                )
              }
            >
              Your boards
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "brand"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "brand"
                )
              }
            >
              Brand kit
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "drafts"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "drafts"
                )
              }
            >
              Drafts
            </button>

          </div>

          {/* PIN GRID */}

          {activeTab ===
            "all" && (
            <div className="collage-pin-grid">

              {filteredPins.length ===
              0 ? (

                <div className="no-collage-pins">

                  <ImageIcon />

                  <p>
                    No Pins found
                  </p>

                  <span>
                    Save or create Pins to
                    use them in your
                    collage.
                  </span>

                </div>

              ) : (

                filteredPins.map(
                  (
                    pin,
                    index
                  ) => {

                    const image =
                      getPinImage(
                        pin
                      );

                    if (!image) {
                      return null;
                    }

                    return (
                      <button
                        type="button"
                        key={
                          pin._id ||
                          pin.id ||
                          index
                        }
                        className="collage-pin"
                        onClick={() =>
                          addPinToCollage(
                            pin
                          )
                        }
                      >

                        <img
                          src={
                            image
                          }
                          alt={
                            pin.title ||
                            "Pin"
                          }
                        />

                        <div className="pin-add-overlay">

                          <span>
                            +
                          </span>

                        </div>

                      </button>
                    );
                  }
                )

              )}

            </div>
          )}

          {activeTab !==
            "all" && (
            <div className="empty-side-tab">

              <ImageIcon />

              <strong>
                {activeTab ===
                "boards"
                  ? "Your boards"
                  : activeTab ===
                      "brand"
                    ? "Brand kit"
                    : "Drafts"}
              </strong>

              <span>
                Nothing here yet.
              </span>

            </div>
          )}

        </aside>

      </main>

      {/* =================================================
          EXISTING CHAT PANEL
      ================================================= */}

      <InboxPanel />

    </div>
  );
}

export default CreateCollage;