const getUserStorageKey = (user, suffix) => {
  const identifier = user?.email || user?.uid;
  if (!identifier) return null;
  return `${suffix}_${identifier}`;
};

const defaultProfileMeta = (user) => ({
  followers: 0,
  following: 0,
  monthlyViews: 0,
  bio: "",
  tags: [],
  dp: "",
  photoSet: false,
});

const legacyGeneratedTags = new Set([
  "Daily Amazon Picks You'll Love",
  "Stylish Printify Designs Made for You",
  "Creative boards for modern trends",
  "Editor's picks for home and style",
  "Made for you with good taste",
]);

const isLegacyDummyMeta = (meta) => {
  if (!meta || typeof meta !== "object") return false;
  const hasGeneratedBio = typeof meta.bio === "string" && meta.bio.startsWith("Curating fresh StylePins ideas");
  const hasGeneratedTag = Array.isArray(meta.tags) && meta.tags.some((tag) => legacyGeneratedTags.has(tag));
  const hasGeneratedCounts = meta.followers > 0 || meta.following > 0 || meta.monthlyViews > 0;

  return hasGeneratedCounts && (hasGeneratedBio || hasGeneratedTag);
};

export const loadUserProfileMeta = (user) => {
  const key = getUserStorageKey(user, "profileMeta");
  if (!key) return defaultProfileMeta(user);

  try {
    const storedMeta = JSON.parse(localStorage.getItem(key) || "null");
    if (storedMeta && !isLegacyDummyMeta(storedMeta)) {
      if (!storedMeta.photoSet) {
        return { ...defaultProfileMeta(user), ...storedMeta, dp: "", photoSet: false };
      }
      return { ...defaultProfileMeta(user), ...storedMeta };
    }
  } catch (error) {
    console.error("Failed to parse profile meta", error);
  }

  const defaultMeta = defaultProfileMeta(user);
  localStorage.setItem(key, JSON.stringify(defaultMeta));
  return defaultMeta;
};

export const saveUserProfileMeta = (user, profileMeta) => {
  const key = getUserStorageKey(user, "profileMeta");
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(profileMeta));
};

export const saveUserInfo = (updates) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const merged = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error("Failed to save user info", error);
    return null;
  }
};

export const getSavedPinsKey = (user) => {
  const key = getUserStorageKey(user, "savedPins");
  return key;
};

export const loadSavedPinsForUser = (user) => {
  const key = getSavedPinsKey(user);
  if (!key) return [];
  try {
    const savedPins = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(savedPins) ? savedPins : [];
  } catch (error) {
    console.error("Failed to load saved pins", error);
    return [];
  }
};

export const savePinForUser = (user, pin) => {
  const key = getSavedPinsKey(user);
  if (!key) return;

  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const savedArray = Array.isArray(existing) ? existing : [];
    const alreadySaved = savedArray.some((item) => item.id === pin.id);
    if (alreadySaved) return;

    const savedPin = {
      ...pin,
      description: pin.description || `Explore this ${pin.category} idea`,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify([...savedArray, savedPin]));
  } catch (error) {
    console.error("Failed to save pin for user", error);
  }
};
