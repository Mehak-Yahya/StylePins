import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles/inboxPanel.css";

export default function InboxPanel({ className = "" }) {
  const [show, setShow] = useState(false);
  const [showInviteActions, setShowInviteActions] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const handleBack = () => {
    setShowCompose(false);
    setShowInviteActions(false);
  };

  React.useEffect(() => {
    const handleOpen = () => setShow(true);
    window.addEventListener("openInbox", handleOpen);
    return () => window.removeEventListener("openInbox", handleOpen);
  }, []);

  if (!show)
    return (
      <button
        className="inbox-reopen"
        aria-label="Open inbox"
        onClick={() => setShow(true)}
      >
        <ChatIcon sx={{ color: "#fff", fontSize: 20 }} />
      </button>
    );

  return (
    <aside className={`inbox-panel ${className}`} aria-label="Inbox panel">
      <div className="inbox-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: '100%' }}>
          {(showInviteActions || showCompose) ? (
            <button
              type="button"
              className="inbox-close left"
              aria-label="Back"
              onClick={handleBack}
            >
              <ArrowBackIcon fontSize="small" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="inbox-close left"
                aria-label="Close inbox"
                onClick={() => setShow(false)}
              >
                <CloseIcon fontSize="small" />
              </button>
              <div className="inbox-title">Inbox</div>
            </>
          )}
          {showCompose ? <div className="inbox-title" style={{ textAlign: 'center', flex: 1 }}>New message</div> : (showInviteActions ? <div style={{ flex: 1 }} /> : null)}
          {showCompose ? (
            <button type="button" className="inbox-next" disabled>
              Next
            </button>
          ) : null}
        </div>
      </div>

      <div className="inbox-body">
        {showInviteActions ? (
          <div className="invite-full">
            <div style={{ fontWeight: 800, textAlign: 'center', padding: '0 0 4px' }}>Find inspiration together</div>

            <div style={{ padding: '0 20px 8px' }}>
              <ol style={{ paddingLeft: 16, margin: 0 }}>
                <li style={{ marginBottom: 12 }}>
                  <strong>Share your link</strong>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    Your friends need to follow you using your link to message you
                  </div>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <strong>Your friends follow you</strong>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    Each link works for a few friends at a time but you can get as many as you need
                  </div>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <strong>Follow back!</strong>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    Once you're following each other, you can share ideas, goals and more via direct messages
                  </div>
                </li>
              </ol>
            </div>

            <div className="share-grid-large">
              <div className="share-item" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <div className="share-circle light">🔗</div>
                <div className="share-label">Copy link</div>
              </div>

              <div className="share-item" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, '_blank')}>
                <div className="share-circle green">WA</div>
                <div className="share-label">WhatsApp</div>
              </div>

              <div className="share-item" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
                <div className="share-circle blue">f</div>
                <div className="share-label">Facebook</div>
              </div>

              <div className="share-item" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(window.location.href)}`, '_blank')}>
                <div className="share-circle dark">x</div>
                <div className="share-label">X</div>
              </div>

              <div className="share-item" onClick={() => { const subject = encodeURIComponent('Join me on StylePins'); const body = encodeURIComponent(`Check this out: ${window.location.href}`); window.location.href = `mailto:?subject=${subject}&body=${body}`; }}>
                <div className="share-circle light">✉️</div>
                <div className="share-label">Email</div>
              </div>
            </div>
          </div>
        ) : showCompose ? (
          <div className="compose-view">
            <div className="compose-search">
              <span className="compose-search-icon">🔎</span>
              <input
                type="text"
                className="compose-input"
                placeholder="Search by name or email"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="new-wrap">
              <button className="inbox-new" type="button" onClick={() => { setShowCompose(true); setShowInviteActions(false); }}>
                <span className="new-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 6.5l3 3L8 19l-3 0 0-3L14.5 6.5z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="new-text">New message</span>
              </button>
            </div>

            <div
              className="inbox-invite"
              role="button"
              tabIndex={0}
              onClick={() => setShowInviteActions(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowInviteActions(true); }}
            >
              <div className="invite-left">
                <div className="invite-circle">
                  <PersonAddIcon sx={{ fontSize: 18 }} />
                </div>
              </div>
              <div className="invite-right">
                <div className="invite-text">Invite your friends</div>
                <div className="invite-sub">Connect to start chatting</div>
              </div>
            </div>

            <div className="inbox-illustration">
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="70" fill="#dff2ff" />
                <g transform="translate(32,36)">
                  <rect x="38" y="6" width="60" height="26" rx="6" fill="#ffffff" transform="rotate(-18 68 19)" opacity="0.9"/>
                  <rect x="70" y="-6" width="18" height="56" rx="4" fill="#ffffff" transform="rotate(-30 79 22)" opacity="0.95"/>
                  <rect x="102" y="-22" width="18" height="22" rx="3" fill="#ff5a75" transform="rotate(-30 111 -11)"/>
                </g>
              </svg>
            </div>

            <div className="inbox-start">
              <h3>Start a conversation</h3>
              <p>
                Use messages to chat with friends, share Pins and boards, and plan
                ideas together. Your conversations will appear here.
              </p>
            </div>

            <div className="inbox-fab">🧠</div>
          </>
        )}
      </div>
    </aside>
  );
}
