import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";

import "../styles/publicProfile.css";
import {
  loadUserProfileMeta,
  saveUserProfileMeta,
} from "../utils/userStorage";

const API_URL = "http://localhost:5000";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [pins, setPins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pinsLoading, setPinsLoading] = useState(true);

  const [error, setError] = useState("");

  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (
        !storedUser ||
        storedUser === "undefined" ||
        storedUser === "null"
      ) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to read logged-in user:", error);
      return null;
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getFallbackAvatar = (name = "") => {
    const initials = (name || "U")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

    const safeInitials = initials || "U";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <rect width="240" height="240" rx="120" fill="#1f2937" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="86" fill="white">${safeInitials}</text>
      </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

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
      return `${API_URL}${trimmed}`;
    }

    if (
      trimmed.startsWith("uploads/") ||
      trimmed.startsWith("images/")
    ) {
      return `${API_URL}/${trimmed}`;
    }

    return trimmed;
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError("User not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const loggedUser = getLoggedInUser();

        const loggedUserId =
          loggedUser?._id ||
          loggedUser?.id ||
          "";

        let url = `${API_URL}/api/users/${userId}`;

        if (loggedUserId) {
          url += `?viewerId=${encodeURIComponent(loggedUserId)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "User not found"
          );
        }

        const loadedUser = data.user || data;

        setUser(loadedUser);

        const followers =
          data.followersCount ??
          loadedUser.followersCount ??
          (Array.isArray(loadedUser.followers)
            ? loadedUser.followers.length
            : 0);

        setFollowersCount(Number(followers) || 0);

        const following =
          loadedUser.followingCount ??
          (Array.isArray(loadedUser.following)
            ? loadedUser.following.length
            : 0);

        setFollowingCount(Number(following) || 0);

        const followingStatus =
          data.isFollowing ??
          loadedUser.isFollowing ??
          false;

        setIsFollowing(Boolean(followingStatus));

        if (loggedUserId) {
          try {
            const followStatusResponse = await fetch(
              `${API_URL}/api/users/${userId}/follow-status/${loggedUserId}`
            );

            if (followStatusResponse.ok) {
              const followStatusData = await followStatusResponse.json();
              setIsFollowing(Boolean(followStatusData.following));
            }
          } catch (followStatusError) {
            console.error(
              "Failed to load follow status:",
              followStatusError
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load public profile:",
          err
        );

        setError(
          err.message || "User not found"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // =====================================================
  // LOAD CREATED PINS
  // =====================================================

  useEffect(() => {
    const loadCreatedPins = async () => {
      if (!userId) return;

      try {
        setPinsLoading(true);

        const response = await fetch(
          `${API_URL}/api/pins/user/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load Pins"
          );
        }

        const loadedPins = Array.isArray(data)
          ? data
          : Array.isArray(data.pins)
          ? data.pins
          : Array.isArray(data.posts)
          ? data.posts
          : [];

        console.log(
          "PUBLIC PROFILE PINS:",
          loadedPins
        );

        setPins(loadedPins);
      } catch (err) {
        console.error(
          "Failed to load created Pins:",
          err
        );

        setPins([]);
      } finally {
        setPinsLoading(false);
      }
    };

    loadCreatedPins();
  }, [userId]);

  // =====================================================
  // FOLLOW / UNFOLLOW
  // =====================================================

  const handleFollow = async () => {
    if (!userId || followLoading) return;

    const loggedUser = getLoggedInUser();

    const loggedUserId =
      loggedUser?._id ||
      loggedUser?.id ||
      null;

    if (!loggedUserId) {
      navigate("/");
      return;
    }

    if (String(loggedUserId) === String(userId)) {
      return;
    }

    try {
      setFollowLoading(true);

      const method = isFollowing
        ? "DELETE"
        : "POST";

      const response = await fetch(
        `${API_URL}/api/users/${userId}/follow`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            followerId: loggedUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              isFollowing ? "unfollow" : "follow"
            } user`
        );
      }

      const newFollowingState =
        data.isFollowing ??
        data.following ??
        !isFollowing;

      setIsFollowing(
        Boolean(newFollowingState)
      );

      const nextFollowersCount =
        typeof data.followersCount === "number"
          ? data.followersCount
          : newFollowingState
          ? followersCount + 1
          : Math.max(0, followersCount - 1);

      setFollowersCount(nextFollowersCount);
      setFollowingCount((current) => current);

      if (loggedUserId) {
        const currentMeta = loadUserProfileMeta(
          loggedUser
        );
        const nextLoggedFollowingCount =
          typeof data.followingCount === "number"
            ? data.followingCount
            : Math.max(
                0,
                (currentMeta.following || 0) +
                  (newFollowingState ? 1 : -1)
              );

        saveUserProfileMeta(loggedUser, {
          ...currentMeta,
          following: nextLoggedFollowingCount,
        });

        if (loggedUser) {
          const updatedLoggedUser = {
            ...loggedUser,
            followingCount: nextLoggedFollowingCount,
          };
          localStorage.setItem(
            "user",
            JSON.stringify(updatedLoggedUser)
          );
        }
      }
    } catch (err) {
      console.error(
        "Follow error:",
        err
      );

      alert(
        err.message ||
          "Unable to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="publicProfileLoading">
        Loading profile...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !user) {
    return (
      <div className="publicProfilePage">

        <div className="publicProfileTopbar">

          <button
            type="button"
            className="publicBackButton"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </button>

        </div>

        <div className="publicProfileError">

          <h2>User not found</h2>

          <p>
            This profile may have been removed
            or does not exist.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="backToProfileButton"
          >
            Go to my profile
          </button>

        </div>

      </div>
    );
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

  const username =
    user.username ||
    user.email?.split("@")[0] ||
    "";

  const localMeta =
    loadUserProfileMeta(user);

  const profilePic = getImageUrl(
    user.photo ||
      user.photoURL ||
      localMeta?.dp ||
      localMeta?.photo ||
      user.dp ||
      user.profilePicture ||
      user.avatar ||
      getFallbackAvatar(displayName)
  );

  const bio = user.bio || "";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="publicProfilePage">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="publicProfileTopbar">

        <button
          type="button"
          className="publicBackButton"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </button>

        <div className="publicProfileTopTitle">
          {username
            ? `@${username}`
            : displayName}
        </div>

        <button
          type="button"
          className="publicMoreButton"
        >
          <MoreHorizIcon />
        </button>

      </div>

      {/* =================================================
          PROFILE CONTENT
      ================================================= */}

      <main className="publicProfileContent">

        <section className="publicProfileHeader">

          {/* PROFILE IMAGE */}

          <div className="publicProfileAvatar">

            {profilePic ? (
              <img
                src={profilePic}
                alt={displayName}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <span>
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

          </div>

          {/* NAME */}

          <h1 className="publicProfileName">
            {displayName}
          </h1>

          {/* USERNAME */}

          {username && (
            <div className="publicProfileUsername">
              @{username}
            </div>
          )}

          {/* BIO */}

          {bio && (
            <p className="publicProfileBio">
              {bio}
            </p>
          )}

          {/* STATS */}

          <div className="publicProfileStats">

            <div className="publicStat">
              <strong>
                {followersCount}
              </strong>

              <span>
                followers
              </span>
            </div>

            <div className="publicStat">
              <strong>
                {followingCount}
              </strong>

              <span>
                following
              </span>
            </div>

          </div>

          {/* ACTIONS */}

          <div className="publicProfileActions">

            <button
              type="button"
              className={`followButton ${
                isFollowing
                  ? "following"
                  : ""
              }`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {isFollowing ? (
                <>
                  <PersonIcon fontSize="small" />
                  {followLoading
                    ? "Updating..."
                    : "Following"}
                </>
              ) : (
                <>
                  <PersonAddIcon fontSize="small" />
                  {followLoading
                    ? "Following..."
                    : "Follow"}
                </>
              )}
            </button>

            <button
              type="button"
              className="messageButton"
              onClick={() => {
                window.dispatchEvent(
                  new Event("openInbox")
                );
              }}
            >
              Message
            </button>

          </div>

        </section>

        {/* =================================================
            CREATED TAB
        ================================================= */}

        <div className="publicProfileTabs">

          <button
            type="button"
            className="publicProfileTab active"
          >
            Created
          </button>

        </div>

        {/* =================================================
            CREATED PINS
        ================================================= */}

        <section className="publicProfilePins">

          {pinsLoading ? (

            <div className="publicProfileEmpty">
              <h3>
                Loading Pins...
              </h3>
            </div>

          ) : pins.length === 0 ? (

            <div className="publicProfileEmpty">

              <h3>
                {displayName} hasn't created
                any Pins yet
              </h3>

              <p>
                When they create Pins,
                you'll see them here.
              </p>

            </div>

          ) : (

            <div className="publicPinsGrid">

              {pins.map((pin, index) => {

                const pinId =
                  pin._id ||
                  pin.id ||
                  index;

                const image =
                  getImageUrl(
                    pin.image ||
                    pin.img ||
                    pin.imageUrl ||
                    pin.imageURL ||
                    ""
                  );

                const title =
                  pin.title ||
                  pin.name ||
                  "";

                return (
                  <article
                    key={pinId}
                    className="publicPinCard"
                    onClick={() => {
                      if (pin._id) {
                        navigate(
                          `/pin/${pin._id}`
                        );
                      }
                    }}
                  >

                    {image ? (
                      <img
                        src={image}
                        alt={
                          title ||
                          "Pin"
                        }
                        className="publicPinImage"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          const noImage =
                            document.createElement(
                              "div"
                            );

                          noImage.className =
                            "publicPinNoImage";

                          noImage.innerText =
                            "Image unavailable";

                          event.currentTarget.parentElement.appendChild(
                            noImage
                          );
                        }}
                      />
                    ) : (
                      <div className="publicPinNoImage">
                        No image
                      </div>
                    )}

                    {title && (
                      <div className="publicPinTitle">
                        {title}
                      </div>
                    )}

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}