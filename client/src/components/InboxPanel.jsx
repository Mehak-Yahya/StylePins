import React, { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import "../styles/inboxPanel.css";
import socket from "../socket";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function InboxPanel({
  className = "",
  currentUserId = "",
}) {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const resolvedCurrentUserId =
    currentUserId ||
    storedUser?._id ||
    storedUser?.id ||
    "";

  const [show, setShow] = useState(false);

  const [showInviteActions, setShowInviteActions] =
    useState(false);

  const [showCompose, setShowCompose] =
    useState(false);

  const [showConversation, setShowConversation] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

 
  const [selectedUser, setSelectedUser] =
    useState(null);


  const [message, setMessage] = useState("");

  const [conversations, setConversations] =
    useState([]);

  const normalizeMessage = (
    message,
    otherUserId
  ) => {
    const senderId =
      message?.sender?._id ||
      message?.sender ||
      "";
    const receiverId =
      message?.receiver?._id ||
      message?.receiver ||
      "";

    const isMine =
      resolvedCurrentUserId &&
      senderId?.toString() ===
        resolvedCurrentUserId.toString();

    return {
      id:
        message?._id ||
        message?.id ||
        `${Date.now()}-${Math.random()}`,
      text: message?.text || "",
      sender: isMine ? "me" : "them",
      createdAt:
        message?.createdAt ||
        new Date().toISOString(),
      senderId: senderId?.toString() || "",
      receiverId:
        receiverId?.toString() ||
        otherUserId?.toString() ||
        "",
      raw: message,
    };
  };

  const upsertConversationMessages = (
    user,
    messages
  ) => {
    if (!user?._id || !Array.isArray(messages)) {
      return;
    }

    setConversations((previous) => {
      const nextConversation = {
        user,
        messages,
      };

      const exists = previous.some(
        (conversation) =>
          conversation.user?._id?.toString() ===
          user._id?.toString()
      );

      if (!exists) {
        return [...previous, nextConversation];
      }

      return previous.map((conversation) =>
        conversation.user?._id?.toString() ===
        user._id?.toString()
          ? nextConversation
          : conversation
      );
    });
  };

  // OPEN INBOX
  useEffect(() => {
    const handleOpen = () => {
      setShow(true);
    };

    window.addEventListener(
      "openInbox",
      handleOpen
    );

    return () => {
      window.removeEventListener(
        "openInbox",
        handleOpen
      );
    };
  }, []);

  // SOCKET + HISTORY
  useEffect(() => {
    if (!resolvedCurrentUserId) {
      return;
    }

    socket.connect();
    socket.emit("joinUser", resolvedCurrentUserId);

    const handleIncomingMessage = (incomingMessage) => {
      const senderId =
        incomingMessage?.sender?._id ||
        incomingMessage?.sender ||
        "";
      const receiverId =
        incomingMessage?.receiver?._id ||
        incomingMessage?.receiver ||
        "";

      const otherUserId =
        senderId?.toString() ===
        resolvedCurrentUserId.toString()
          ? receiverId
          : senderId;

      if (!otherUserId) {
        return;
      }

      const normalizedMessage = normalizeMessage(
        incomingMessage,
        otherUserId
      );

      const conversationUser =
        selectedUser &&
        selectedUser._id?.toString() ===
          otherUserId?.toString()
          ? selectedUser
          : incomingMessage?.sender?._id?.toString() ===
              otherUserId?.toString()
            ? incomingMessage.sender
            : incomingMessage.receiver;

      if (!conversationUser?._id) {
        return;
      }

      setConversations((previous) => {
        const exists = previous.some(
          (conversation) =>
            conversation.user?._id?.toString() ===
            conversationUser._id?.toString()
        );

        if (!exists) {
          return [
            ...previous,
            {
              user: conversationUser,
              messages: [normalizedMessage],
            },
          ];
        }

        return previous.map((conversation) => {
          if (
            conversation.user?._id?.toString() !==
            conversationUser._id?.toString()
          ) {
            return conversation;
          }

          const alreadyExists = (
            conversation.messages || []
          ).some(
            (item) =>
              item.id === normalizedMessage.id ||
              item.raw?._id === normalizedMessage.id
          );

          if (alreadyExists) {
            return conversation;
          }

          return {
            ...conversation,
            messages: [
              ...(conversation.messages || []),
              normalizedMessage,
            ],
          };
        });
      });
    };

    socket.on("newMessage", handleIncomingMessage);
    socket.on("messageSent", handleIncomingMessage);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("messageSent", handleIncomingMessage);
    };
  }, [resolvedCurrentUserId, selectedUser]);

  useEffect(() => {
    if (!showConversation || !selectedUser || !resolvedCurrentUserId) {
      return;
    }

    const controller = new AbortController();

    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/${resolvedCurrentUserId}/${selectedUser._id}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json();
        const normalizedMessages = (data.messages || []).map(
          (item) => normalizeMessage(item, selectedUser._id)
        );

        upsertConversationMessages(
          selectedUser,
          normalizedMessages
        );
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Load messages error:", error);
      }
    };

    loadHistory();

    return () => {
      controller.abort();
    };
  }, [
    showConversation,
    selectedUser,
    resolvedCurrentUserId,
  ]);

  useEffect(() => {
    if (!show || showCompose || showConversation || !resolvedCurrentUserId) {
      return;
    }

    const controller = new AbortController();

    const loadConversationSummaries = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/conversations/${resolvedCurrentUserId}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load conversations");
        }

        const data = await response.json();
        const summaries = data.conversations || [];

        setConversations((previous) => {
          const next = [...previous];

          for (const conversation of summaries) {
            const conversationUser = conversation.user;

            if (!conversationUser?._id) {
              continue;
            }

            const existingIndex = next.findIndex(
              (item) =>
                item.user?._id?.toString() ===
                conversationUser._id?.toString()
            );

            if (existingIndex === -1) {
              next.push({
                user: conversationUser,
                messages: (conversation.messages || []).map(
                  (item) => normalizeMessage(item, conversationUser._id)
                ),
              });
              continue;
            }

            const existingConversation = next[existingIndex];

            if ((existingConversation.messages || []).length > 0) {
              continue;
            }

            next[existingIndex] = {
              ...existingConversation,
              messages: (conversation.messages || []).map(
                (item) => normalizeMessage(item, conversationUser._id)
              ),
            };
          }

          return next;
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Load conversation summaries error:", error);
      }
    };

    loadConversationSummaries();

    return () => {
      controller.abort();
    };
  }, [show, showCompose, showConversation, resolvedCurrentUserId]);

  // SEARCH USERS
  useEffect(() => {
    if (!showCompose || showConversation) {
      return;
    }

    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const response = await fetch(
          `${API_URL}/api/users/search?q=${encodeURIComponent(
            query
          )}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to search users"
          );
        }

        const users = await response.json();

        const filteredUsers = currentUserId
          ? users.filter(
              (user) =>
                user._id?.toString() !==
                currentUserId?.toString()
            )
          : users;

        setSearchResults(filteredUsers);
      } catch (error) {
        if (
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Search users error:",
          error
        );

        setSearchResults([]);

        setSearchError(
          "Unable to search users."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    searchQuery,
    showCompose,
    showConversation,
    currentUserId,
  ]);

  // DISPLAY NAME
  const getDisplayName = (user) => {
    return (
      user?.name?.trim() ||
      user?.username?.trim() ||
      user?.email?.split("@")[0] ||
      "User"
    );
  };

  // AVATAR LETTER
  const getAvatarLetter = (user) => {
    return getDisplayName(user)
      .charAt(0)
      .toUpperCase();
  };

  // CLEAR SEARCH
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  // BACK

  const handleBack = () => {
    if (showConversation) {
      setShowConversation(false);
      setMessage("");
      setSelectedUser(null);

      return;
    }

    setShowCompose(false);
    setShowInviteActions(false);

    clearSearch();

    setSelectedUser(null);
  };

  const handleClose = () => {
    setShow(false);

    setShowCompose(false);
    setShowInviteActions(false);
    setShowConversation(false);

    clearSearch();

    setSelectedUser(null);
    setMessage("");
  };

  // SELECT USER
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };
  // FIND EXISTING CONVERSATION

  const getConversation = (userId) => {
    return conversations.find(
      (conversation) =>
        conversation.user?._id?.toString() ===
        userId?.toString()
    );
  };

  // New Message → Conversation

  const handleNext = () => {
    if (!selectedUser) {
      return;
    }
    setConversations((previous) => {
      const exists = previous.some(
        (conversation) =>
          conversation.user?._id?.toString() ===
          selectedUser?._id?.toString()
      );

      if (exists) {
        return previous;
      }

      return [
        ...previous,
        {
          user: selectedUser,
          messages: [],
        },
      ];
    });

    setShowCompose(false);
    setShowInviteActions(false);

    setShowConversation(true);

    clearSearch();
  };

  // OPEN EXISTING CONVERSATION
  const handleOpenConversation = (
    conversation
  ) => {
    setSelectedUser(
      conversation.user
    );

    setShowConversation(true);

    setShowCompose(false);
    setShowInviteActions(false);

    setMessage("");
  };

  // SEND MESSAGE
  const handleSendMessage = () => {
    const text = message.trim();

    if (!text || !selectedUser || !resolvedCurrentUserId) {
      return;
    }

    const sendMessage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              senderId: resolvedCurrentUserId,
              receiverId: selectedUser._id,
              text,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        const savedMessage = data.message;
        const normalizedMessage = normalizeMessage(
          savedMessage,
          selectedUser._id
        );

        setConversations((previous) => {
          const exists = previous.some(
            (conversation) =>
              conversation.user?._id?.toString() ===
              selectedUser._id?.toString()
          );

          if (!exists) {
            return [
              ...previous,
              {
                user: selectedUser,
                messages: [normalizedMessage],
              },
            ];
          }

          return previous.map((conversation) => {
            if (
              conversation.user?._id?.toString() !==
              selectedUser._id?.toString()
            ) {
              return conversation;
            }

            const alreadyExists = (
              conversation.messages || []
            ).some(
              (item) =>
                item.id === normalizedMessage.id ||
                item.raw?._id === normalizedMessage.id
            );

            if (alreadyExists) {
              return conversation;
            }

            return {
              ...conversation,
              messages: [
                ...(conversation.messages || []),
                normalizedMessage,
              ],
            };
          });
        });

        socket.emit("sendMessage", savedMessage);
        setMessage("");
      } catch (error) {
        console.error("Send message error:", error);
      }
    };

    sendMessage();
  };

  // GET LAST MESSAGE
  const getLastMessage = (
    conversation
  ) => {
    const messages =
      conversation?.messages || [];

    if (!messages.length) {
      return "Start a conversation";
    }

    return messages[
      messages.length - 1
    ].text;
  };

  // GET LAST MESSAGE TIME
  const getLastMessageTime = (
    conversation
  ) => {
    const messages =
      conversation?.messages || [];

    if (!messages.length) {
      return "";
    }

    const lastMessage =
      messages[messages.length - 1];

    return new Date(
      lastMessage.createdAt
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // DON'T RENDER UNTIL OPEN
  if (!show) {
    return null;
  }

  // CURRENT CONVERSATION
  const currentConversation =
    selectedUser
      ? getConversation(
          selectedUser._id
        )
      : null;

  const currentMessages =
    currentConversation?.messages || [];

  // RENDER
  return (
    <aside
      className={`inbox-panel ${className}`}
      aria-label="Inbox panel"
    >
  
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
        }}
      >

        {/* BACK / CLOSE */}

        {showCompose ||
        showInviteActions ||
        showConversation ? (
          <button
            type="button"
            className="inbox-close left"
            aria-label="Go back"
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </button>
        ) : (
          <button
            type="button"
            className="inbox-close left"
            aria-label="Close inbox"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        )}

        <div
          className="inbox-title"
          style={{
            textAlign: "center",
            flex: 1,
          }}
        >

          {showConversation
            ? getDisplayName(
                selectedUser
              )
            : showCompose
            ? "New message"
            : showInviteActions
            ? "Invite friends"
            : "Inbox"}

        </div>

        {showCompose && (
          <button
            type="button"
            className="inbox-next"
            disabled={!selectedUser}
            onClick={handleNext}
          >
            Next
          </button>
        )}


        {showConversation && (
          <button
            type="button"
            className="conversation-more-button"
            aria-label="More options"
          >
            <MoreHorizIcon />
          </button>
        )}

      </div>

    
      <div className="inbox-body">
        {showConversation &&
        selectedUser ? (

          <div className="conversation-view">
            <div className="conversation-content">

              {currentMessages.length === 0 ? (

                <div className="conversation-welcome">

                  <div className="conversation-large-avatar">

                    {selectedUser.photo ? (
                      <img
                        src={
                          selectedUser.photo
                        }
                        alt={getDisplayName(
                          selectedUser
                        )}
                      />
                    ) : (
                      getAvatarLetter(
                        selectedUser
                      )
                    )}

                  </div>

                  <h3>
                    {getDisplayName(
                      selectedUser
                    )}
                  </h3>

                  <p>
                    This could be the beginning
                    <br />
                    of something good
                  </p>

                </div>

              ) : (

                <div className="conversation-messages">

                  {currentMessages.map(
                    (msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${
                          msg.sender ===
                          "me"
                            ? "chat-message-me"
                            : "chat-message-them"
                        }`}
                      >

                        <div className="chat-bubble">
                          {msg.text}
                        </div>

                        <span className="chat-time">
                          {new Date(
                            msg.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>

                      </div>
                    )
                  )}

                </div>

              )}

            </div>

            {/* MESSAGE INPUT */}

            <div className="conversation-input-area">

              <button
                type="button"
                className="conversation-plus"
              >
                +
              </button>

              <div className="conversation-input-wrapper">

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      handleSendMessage();
                    }
                  }}
                />

                <span className="conversation-dot">
                  •
                </span>

              </div>

              <button
                type="button"
                className="conversation-send"
                disabled={!message.trim()}
                onClick={
                  handleSendMessage
                }
              >
                ↑
              </button>

            </div>

          </div>

        ) : showInviteActions ? (

          <div className="invite-full">

            <div
              style={{
                fontWeight: 800,
                textAlign: "center",
                padding:
                  "0 0 4px",
              }}
            >
              Find inspiration together
            </div>

            <div
              style={{
                padding:
                  "0 20px 8px",
              }}
            >
              <ol
                style={{
                  paddingLeft: 16,
                  margin: 0,
                }}
              >

                <li
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <strong>
                    Share your link
                  </strong>

                  <div
                    style={{
                      color: "#666",
                      fontSize: 13,
                    }}
                  >
                    Your friends need
                    to follow you using
                    your link to message
                    you
                  </div>
                </li>

                <li
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <strong>
                    Your friends follow you
                  </strong>

                  <div
                    style={{
                      color: "#666",
                      fontSize: 13,
                    }}
                  >
                    Each link works for
                    a few friends at a time
                    but you can get as many
                    as you need
                  </div>
                </li>

                <li
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <strong>
                    Follow back!
                  </strong>

                  <div
                    style={{
                      color: "#666",
                      fontSize: 13,
                    }}
                  >
                    Once you're following
                    each other, you can share
                    ideas, goals and more via
                    direct messages
                  </div>
                </li>

              </ol>
            </div>

            {/* SHARE */}

            <div className="share-grid-large">

              <div
                className="share-item"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    window.location.href
                  )
                }
              >
                <div className="share-circle light">
                  🔗
                </div>

                <div className="share-label">
                  Copy link
                </div>
              </div>

              <div
                className="share-item"
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
              >
                <div className="share-circle green">
                  WA
                </div>

                <div className="share-label">
                  WhatsApp
                </div>
              </div>

              <div
                className="share-item"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
              >
                <div className="share-circle blue">
                  f
                </div>

                <div className="share-label">
                  Facebook
                </div>
              </div>

              <div
                className="share-item"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
              >
                <div className="share-circle dark">
                  x
                </div>

                <div className="share-label">
                  X
                </div>
              </div>

              <div
                className="share-item"
                onClick={() => {
                  const subject =
                    encodeURIComponent(
                      "Join me on StylePins"
                    );

                  const body =
                    encodeURIComponent(
                      `Check this out: ${window.location.href}`
                    );

                  window.location.href =
                    `mailto:?subject=${subject}&body=${body}`;
                }}
              >
                <div className="share-circle light">
                  ✉️
                </div>

                <div className="share-label">
                  Email
                </div>
              </div>

            </div>

          </div>

        ) : showCompose ? (


          <div className="compose-view">

            {/* SEARCH */}

            <div className="compose-search">

              <SearchIcon
                className="compose-search-icon"
                sx={{
                  fontSize: 20,
                  color: "#777",
                }}
              />

              <input
                type="text"
                className="compose-input"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                autoFocus
              />

              {searchLoading && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#888",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Searching...
                </span>
              )}

            </div>

            {/* ERROR */}

            {searchError && (
              <div
                style={{
                  padding:
                    "12px 4px",
                  color: "#d33",
                  fontSize: 13,
                }}
              >
                {searchError}
              </div>
            )}

            {/* SEARCH RESULTS */}

            {searchQuery.trim() &&
            !searchLoading && (

              <div className="user-search-results">

                {searchResults.length >
                0 ? (

                  searchResults.map(
                    (user) => {

                      const isSelected =
                        selectedUser?._id ===
                        user._id;

                      return (
                        <button
                          key={
                            user._id
                          }
                          type="button"
                          className={`user-search-result ${
                            isSelected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleSelectUser(
                              user
                            )
                          }
                        >

                          {/* AVATAR */}

                          <div className="user-search-avatar">

                            {user.photo ? (
                              <img
                                src={
                                  user.photo
                                }
                                alt={getDisplayName(
                                  user
                                )}
                              />
                            ) : (
                              <div className="user-search-avatar-placeholder">
                                {getAvatarLetter(
                                  user
                                )}
                              </div>
                            )}

                          </div>

                          {/* INFO */}

                          <div className="user-search-info">

                            <div className="user-search-name">
                              {getDisplayName(
                                user
                              )}
                            </div>

                            {user.username && (
                              <div className="user-search-username">
                                @
                                {
                                  user.username
                                }
                              </div>
                            )}

                            <div className="user-search-email">
                              {
                                user.email
                              }
                            </div>

                          </div>

                          {/* CHECK */}

                          {isSelected && (
                            <div className="user-search-check">
                              ✓
                            </div>
                          )}

                        </button>
                      );
                    }
                  )

                ) : (

                  <div className="user-search-empty">

                    <div className="user-search-empty-icon">
                      🔎
                    </div>

                    <div className="user-search-empty-title">
                      No users found
                    </div>

                    <div className="user-search-empty-text">
                      Try searching with
                      another name,
                      username, or email.
                    </div>

                  </div>

                )}

              </div>
            )}

            {/* SELECTED USER */}

            {selectedUser && (
              <div className="selected-message-user">

                <div className="selected-message-user-photo">

                  {selectedUser.photo ? (
                    <img
                      src={
                        selectedUser.photo
                      }
                      alt={getDisplayName(
                        selectedUser
                      )}
                    />
                  ) : (
                    <div className="user-search-avatar-placeholder">
                      {getAvatarLetter(
                        selectedUser
                      )}
                    </div>
                  )}

                </div>

                <div className="selected-message-user-info">

                  <div>
                    Message{" "}
                    <strong>
                      {getDisplayName(
                        selectedUser
                      )}
                    </strong>
                  </div>

                  {selectedUser.username && (
                    <small>
                      @
                      {
                        selectedUser.username
                      }
                    </small>
                  )}

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedUser(
                      null
                    )
                  }
                  aria-label="Remove selected user"
                >
                  <CloseIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </button>

              </div>
            )}

          </div>

        ) : (

          <>

            {/* NEW MESSAGE */}

            <div className="new-wrap">

              <button
                className="inbox-new"
                type="button"
                onClick={() => {

                  setShowCompose(
                    true
                  );

                  setShowInviteActions(
                    false
                  );

                  setShowConversation(
                    false
                  );

                  setSelectedUser(
                    null
                  );

                  clearSearch();

                }}
              >

                <span className="new-icon">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <path
                      d="M3 21h18"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M14.5 6.5l3 3L8 19l-3 0 0-3L14.5 6.5z"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                </span>

                <span className="new-text">
                  New message
                </span>

              </button>

            </div>

            {/* INVITE FRIENDS */}

            <div
              className="inbox-invite"
              role="button"
              tabIndex={0}
              onClick={() =>
                setShowInviteActions(
                  true
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" ||
                  e.key === " "
                ) {
                  setShowInviteActions(
                    true
                  );
                }

              }}
            >

              <div className="invite-left">

                <div className="invite-circle">

                  <PersonAddIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />

                </div>

              </div>

              <div className="invite-right">

                <div className="invite-text">
                  Invite your friends
                </div>

                <div className="invite-sub">
                  Connect to start chatting
                </div>

              </div>

            </div>

            {/* =================================================
                CHAT HISTORY
            ================================================= */}

            {conversations.length ===
            0 ? (

              <>

                <div className="inbox-illustration">

                  <svg
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="#dff2ff"
                    />

                    <g transform="translate(32,36)">

                      <rect
                        x="38"
                        y="6"
                        width="60"
                        height="26"
                        rx="6"
                        fill="#ffffff"
                        transform="rotate(-18 68 19)"
                        opacity="0.9"
                      />

                      <rect
                        x="70"
                        y="-6"
                        width="18"
                        height="56"
                        rx="4"
                        fill="#ffffff"
                        transform="rotate(-30 79 22)"
                        opacity="0.95"
                      />

                      <rect
                        x="102"
                        y="-22"
                        width="18"
                        height="22"
                        rx="3"
                        fill="#ff5a75"
                        transform="rotate(-30 111 -11)"
                      />

                    </g>

                  </svg>

                </div>

                <div className="inbox-start">

                  <h3>
                    Start a conversation
                  </h3>

                  <p>
                    Use messages to chat
                    with friends, share Pins
                    and boards, and plan ideas
                    together. Your conversations
                    will appear here.
                  </p>

                </div>

              </>

            ) : (

              <div className="conversation-history">

                {conversations.map(
                  (conversation) => {

                    const user =
                      conversation.user;

                    return (
                      <button
                        key={
                          user._id
                        }
                        type="button"
                        className="conversation-history-item"
                        onClick={() =>
                          handleOpenConversation(
                            conversation
                          )
                        }
                      >

                        {/* AVATAR */}

                        <div className="conversation-history-avatar">

                          {user.photo ? (
                            <img
                              src={
                                user.photo
                              }
                              alt={getDisplayName(
                                user
                              )}
                            />
                          ) : (
                            getAvatarLetter(
                              user
                            )
                          )}

                        </div>

                        {/* INFO */}

                        <div className="conversation-history-info">

                          <div className="conversation-history-top">

                            <strong>
                              {getDisplayName(
                                user
                              )}
                            </strong>

                            <span>
                              {getLastMessageTime(
                                conversation
                              )}
                            </span>

                          </div>

                          <div className="conversation-history-last">

                            {getLastMessage(
                              conversation
                            )}

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            )}

            <div className="inbox-fab">
              🧠
            </div>

          </>
        )}

      </div>
    </aside>
  );
}