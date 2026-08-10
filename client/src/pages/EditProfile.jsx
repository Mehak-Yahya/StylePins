import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {
  loadUserProfileMeta,
  saveUserProfileMeta,
  saveUserInfo,
} from "../utils/userStorage";
import "../styles/EditProfile.css";

const API_URL = "http://localhost:5000/api";

const sections = [
  "Edit profile",
  "Account management",
  "Profile visibility",
  "Refine your recommendations",
  "Import content",
  "Link to Pinterest",
  "Social permissions",
  "Notifications",
  "Privacy and data",
  "Security",
];

const emptyForm = {
  name: "",
  photo: "",
  bio: "",
  pronoun1: "",
  pronoun2: "",
  website: "",
  username: "",
  email: "",
  countryCode: "+92",
  phone: "",
  includeRetail: false,
  address1: "",
  address2: "",
  city: "",
  region: "",
  postal: "",
  country: "",
};

const countryOptions = [
  { value: "+92", label: "Pakistan (+92)" },
  { value: "+93", label: "Afghanistan (+93)" },
  { value: "+358", label: "Aland Islands (+358)" },
  { value: "+355", label: "Albania (+355)" },
  { value: "+213", label: "Algeria (+213)" },
  { value: "+1", label: "American Samoa (+1)" },
  { value: "+376", label: "Andorra (+376)" },
  { value: "+244", label: "Angola (+244)" },
  { value: "+297", label: "Aruba (+297)" },
  { value: "+61", label: "Australia (+61)" },
  { value: "+43", label: "Austria (+43)" },
  { value: "+994", label: "Azerbaijan (+994)" },
  { value: "+1", label: "Bahamas (+1)" },
  { value: "+973", label: "Bahrain (+973)" },
  { value: "+880", label: "Bangladesh (+880)" },
  { value: "+1", label: "Barbados (+1)" },
  { value: "+375", label: "Belarus (+375)" },
  { value: "+32", label: "Belgium (+32)" },
  { value: "+501", label: "Belize (+501)" },
  { value: "+229", label: "Benin (+229)" },
  { value: "+1", label: "Bermuda (+1)" },
  { value: "+975", label: "Bhutan (+975)" },
  { value: "+591", label: "Bolivia, Plurinational State of (+591)" },
  { value: "+599", label: "Bonaire, Sint Eustatius and Saba (+599)" },
  { value: "+387", label: "Bosnia and Herzegovina (+387)" },
  { value: "+267", label: "Botswana (+267)" },
  { value: "+55", label: "Brazil (+55)" },
  { value: "+246", label: "British Indian Ocean Territory (+246)" },
  { value: "+673", label: "Brunei Darussalam (+673)" },
  { value: "+359", label: "Bulgaria (+359)" },
  { value: "+226", label: "Burkina Faso (+226)" },
  { value: "+257", label: "Burundi (+257)" },
  { value: "+855", label: "Cambodia (+855)" },
  { value: "+237", label: "Cameroon (+237)" },
  { value: "+1", label: "Canada (+1)" },
  { value: "+238", label: "Cape Verde (+238)" },
  { value: "+1", label: "Cayman Islands (+1)" },
  { value: "+236", label: "Central African Republic (+236)" },
  { value: "+235", label: "Chad (+235)" },
  { value: "+56", label: "Chile (+56)" },
  { value: "+86", label: "China (+86)" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(storedUser);

    setUser(parsed);

    const meta = loadUserProfileMeta(parsed);
    setUserMeta(meta);

    setForm({
      name: parsed.name || "",
      photo: meta.photoSet ? meta.dp : "",
      bio: meta.bio || "",
      pronoun1: meta.pronoun1 || "",
      pronoun2: meta.pronoun2 || "",
      website: meta.website || "",
      username:
        meta.username || parsed.username || parsed.name || "",
      email: parsed.email || "",
      countryCode: meta.countryCode || "+92",
      phone: meta.phone || "",
      includeRetail: meta.includeRetail || false,
      address1: meta.address1 || "",
      address2: meta.address2 || "",
      city: meta.city || "",
      region: meta.region || "",
      postal: meta.postal || "",
      country: meta.country || "",
    });
  }, [navigate]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !userMeta) return;

    const updatedMeta = {
      ...userMeta,
      dp: form.photo,
      photoSet: !!form.photo,
      bio: form.bio,
      pronoun1: form.pronoun1,
      pronoun2: form.pronoun2,
      website: form.website,
      username: form.username,
      countryCode: form.countryCode,
      phone: form.phone,
      includeRetail: form.includeRetail,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      region: form.region,
      postal: form.postal,
      country: form.country,
    };

    const updatedUser = {
      ...user,
      name: form.name,
      photo: form.photo,
      username: form.username,
      email: form.email,
    };

    saveUserProfileMeta(user, updatedMeta);

    saveUserInfo({
      name: form.name,
      photo: form.photo,
      username: form.username,
      email: form.email,
    });

    try {
      const userId = user._id || user.id;

      if (userId) {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            photo: form.photo,
            username: form.username,
            bio: form.bio,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to save profile picture");
        }
      }
    } catch (error) {
      console.error("Failed to sync profile picture to server:", error);
    }

    setUser(updatedUser);
    setUserMeta(updatedMeta);

    navigate("/saved");
  };

  const handleReset = () => {
    if (!user || !userMeta) return;

    setForm({
      name: user.name || "",
      photo: userMeta.photoSet ? userMeta.dp : "",
      bio: userMeta.bio || "",
      pronoun1: userMeta.pronoun1 || "",
      pronoun2: userMeta.pronoun2 || "",
      website: userMeta.website || "",
      username:
        userMeta.username || user.username || user.name || "",
      email: user.email || "",
      countryCode: userMeta.countryCode || "+92",
      phone: userMeta.phone || "",
      includeRetail: userMeta.includeRetail || false,
      address1: userMeta.address1 || "",
      address2: userMeta.address2 || "",
      city: userMeta.city || "",
      region: userMeta.region || "",
      postal: userMeta.postal || "",
      country: userMeta.country || "",
    });
  };

  if (!user || !userMeta) return null;

  const displayName =
    user.name || user.email?.split("@")[0] || "Creator";

  return (
    <Box className="edit-profile-page">
      <Box className="edit-profile-layout">

        {/* Sidebar */}
        <Box className="settings-sidebar">
          <Typography className="settings-title">
            Settings
          </Typography>

          {sections.map((section) => {
            const active = section === "Edit profile";

            return (
              <Box
                key={section}
                className={`settings-section ${
                  active ? "settings-section-active" : ""
                }`}
              >
                {section}
              </Box>
            );
          })}
        </Box>

        {/* Main Content */}
        <Box className="edit-profile-content">

          <Box className="profile-header">
            <Typography className="profile-title">
              Edit profile
            </Typography>

            <Typography className="profile-description">
              Keep your personal details private. Information you add
              here is visible to anyone who can view your profile.
            </Typography>
          </Box>

          {/* Photo */}
          <Box className="photo-section">
            <Typography className="field-label">
              Photo
            </Typography>

            <Box className="photo-container">
              <Avatar
                src={form.photo}
                alt={displayName}
                className="profile-avatar"
              >
                {!form.photo &&
                  displayName.charAt(0).toUpperCase()}
              </Avatar>

              <Button
                variant="outlined"
                className="change-photo-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  const reader = new FileReader();

                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setForm((prev) => ({
                        ...prev,
                        photo: reader.result,
                      }));
                    }
                  };

                  reader.readAsDataURL(file);
                }}
              />
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="profile-form"
          >

            {/* Public Profile */}
            <Box className="form-section-heading">
              <Typography className="form-section-title">
                Public profile
              </Typography>

              <Typography className="form-section-description">
                Update the profile details people see when they visit
                your page.
              </Typography>
            </Box>

            {/* Photo URL */}
            <Box>
              <Typography className="field-label">
                Photo URL
              </Typography>

              <TextField
                fullWidth
                value={form.photo}
                onChange={handleChange("photo")}
                placeholder="https://..."
                size="small"
                variant="outlined"
                className="profile-text-field"
              />
            </Box>

            {/* Name + Username */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  Name
                </Typography>

                <TextField
                  fullWidth
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Name"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>

              <Box>
                <Typography className="field-label">
                  Username
                </Typography>

                <TextField
                  fullWidth
                  value={form.username}
                  onChange={handleChange("username")}
                  placeholder="mehak"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* About */}
            <Box>
              <Typography className="field-label">
                About
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                value={form.bio}
                onChange={handleChange("bio")}
                placeholder="Tell people about yourself"
                size="small"
                variant="outlined"
                className="profile-text-field"
              />
            </Box>

            {/* Pronouns */}
            <Box>
              <Typography className="field-label">
                Pronouns
              </Typography>

              <Typography className="helper-text">
                Choose up to 2 pronoun sets to display on your profile.
              </Typography>

              <Box className="two-column-grid">
                <TextField
                  fullWidth
                  value={form.pronoun1}
                  onChange={handleChange("pronoun1")}
                  placeholder="Pronouns"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />

                <TextField
                  fullWidth
                  value={form.pronoun2}
                  onChange={handleChange("pronoun2")}
                  placeholder="Pronouns"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* Website + Email */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  Website
                </Typography>

                <TextField
                  fullWidth
                  value={form.website}
                  onChange={handleChange("website")}
                  placeholder="Add a link to drive traffic to your site"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>

              <Box>
                <Typography className="field-label">
                  Email address
                </Typography>

                <TextField
                  fullWidth
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="mehak22@gmail.com"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* Country Code + Phone */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  Country Code
                </Typography>

                <TextField
                  fullWidth
                  select
                  value={form.countryCode}
                  onChange={handleChange("countryCode")}
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                >
                  {countryOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography className="field-label">
                  Phone (public)
                </Typography>

                <TextField
                  fullWidth
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="3132067589"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* Retail Location */}
            <Box className="retail-location">
              <Typography className="retail-title">
                Retail location
              </Typography>

              <Typography className="helper-text retail-description">
                Allow people to find your store location on Pinterest.
              </Typography>

              <Button
                variant="outlined"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    includeRetail: !prev.includeRetail,
                  }))
                }
                className={`retail-button ${
                  form.includeRetail
                    ? "retail-button-enabled"
                    : "retail-button-off"
                }`}
              >
                {form.includeRetail ? "Enabled" : "Off"}
              </Button>
            </Box>

            {/* Address Line 1 + 2 */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  Address Line 1
                </Typography>

                <TextField
                  fullWidth
                  value={form.address1}
                  onChange={handleChange("address1")}
                  placeholder="D 441 kasab Muhallah Sukkur"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>

              <Box>
                <Typography className="field-label">
                  Address Line 2
                </Typography>

                <TextField
                  fullWidth
                  value={form.address2}
                  onChange={handleChange("address2")}
                  placeholder="Address Line 2"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* City + Region */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  City
                </Typography>

                <TextField
                  fullWidth
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="Khairpur"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>

              <Box>
                <Typography className="field-label">
                  State/Province/Region
                </Typography>

                <TextField
                  fullWidth
                  value={form.region}
                  onChange={handleChange("region")}
                  placeholder="State/Province/Region"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* Postal + Country */}
            <Box className="two-column-grid">
              <Box>
                <Typography className="field-label">
                  Postal code
                </Typography>

                <TextField
                  fullWidth
                  value={form.postal}
                  onChange={handleChange("postal")}
                  placeholder="Postal code"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>

              <Box>
                <Typography className="field-label">
                  Country
                </Typography>

                <TextField
                  fullWidth
                  value={form.country}
                  onChange={handleChange("country")}
                  placeholder="Pakistan"
                  size="small"
                  variant="outlined"
                  className="profile-text-field"
                />
              </Box>
            </Box>

            {/* Buttons */}
            <Box className="form-buttons">
              <Button
                variant="outlined"
                onClick={handleReset}
                className="reset-button"
              >
                Reset
              </Button>

              <Button
                type="submit"
                variant="contained"
                className="save-button"
              >
                Save
              </Button>
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  );
}