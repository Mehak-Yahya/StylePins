
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import LinkIcon from "@mui/icons-material/Link";

import "../styles/CreatePin.css";

export default function CreatePin() {
  const navigate = useNavigate();

  const categoryOptions = [
    "Created",
    "Beauty",
    "Lifestyle",
    "Shopping",
    "Blog",
    "Digital Products",
    "Jewelry",
    "Moodboard",
    "Design",
    "Home",
    "Style",
    "Inspiration",
    "Creative",
  ];

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("Created");
  const [selectedFile, setSelectedFile] = useState(null);

  const [publishing, setPublishing] = useState(false);

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    setImage(null);
    setSelectedFile(null);
  };

  // =====================================================
  // CREATE / PUBLISH PIN
  // =====================================================

  const handleCreatePin = async () => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    if (!title.trim()) {
      alert("Please add a title.");
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined") {
      alert("Please login first.");
      navigate("/");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      alert("Your login session is invalid. Please login again.");
      navigate("/");
      return;
    }

    // Support both MongoDB _id and normal id
    const userId = user._id || user.id;

    if (!userId) {
      alert("User ID not found. Please login again.");
      return;
    }

    try {
      setPublishing(true);

      const response = await fetch(
        "http://localhost:5000/api/pins",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: userId,

            title: title.trim(),

            description: description.trim(),

            link: link.trim(),

            image: image,

              category: category.trim() || "Created",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to publish Pin."
        );
      }

      console.log("Created Pin:", data.pin);

      alert("Pin published successfully!");

      // Go back to profile
      navigate("/profile");

    } catch (error) {
      console.error("Publish Pin error:", error);

      alert(
        error.message ||
          "Something went wrong while publishing the Pin."
      );

    } finally {
      setPublishing(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Box className="create-pin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box className="create-pin-header">

        <Box className="create-pin-header-left">

          <IconButton
            onClick={() => navigate(-1)}
            className="create-pin-back"
          >
            <ArrowBackIcon />
          </IconButton>

          <Box className="create-pin-heading">
            Create Pin
          </Box>

        </Box>


        <Box className="create-pin-header-actions">

          {/* CANCEL */}

          <Box
            className="create-pin-cancel"
            onClick={() => {
              if (!publishing) {
                navigate(-1);
              }
            }}
          >
            Cancel
          </Box>


          {/* PUBLISH */}

          <Box
            className={`create-pin-publish ${
              publishing ? "publishing" : ""
            }`}
            onClick={
              publishing
                ? undefined
                : handleCreatePin
            }
          >
            {publishing
              ? "Publishing..."
              : "Publish"}
          </Box>

        </Box>

      </Box>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <Box className="create-pin-content">


        {/* =====================================================
            LEFT — IMAGE UPLOAD
        ===================================================== */}

        <Box className="create-pin-upload-section">

          {!image ? (

            <label
              htmlFor="pin-image-upload"
              className="create-pin-upload-box"
            >

              <input
                id="pin-image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />


              <Box className="create-pin-upload-icon">
                <UploadIcon />
              </Box>


              <Box className="create-pin-upload-title">
                Choose a file
              </Box>


              <Box className="create-pin-upload-text">
                Upload an image from your device
              </Box>


              <Box className="create-pin-upload-button">
                Upload
              </Box>

            </label>

          ) : (

            <Box className="create-pin-preview">

              <img
                src={image}
                alt={
                  selectedFile?.name ||
                  "Pin preview"
                }
              />


              <IconButton
                className="create-pin-remove"
                onClick={removeImage}
                disabled={publishing}
              >
                <CloseIcon />
              </IconButton>

            </Box>

          )}

        </Box>


        {/* =====================================================
            RIGHT — FORM
        ===================================================== */}

        <Box className="create-pin-form">


          {/* =================================================
              TITLE
          ================================================= */}

          <Box className="create-pin-field">

            <Box className="create-pin-label">
              Title
            </Box>

            <input
              type="text"
              className="create-pin-input"
              placeholder="Add a title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={publishing}
            />

          </Box>


          {/* =================================================
              CATEGORY
          ================================================= */}

          <Box className="create-pin-field">

            <Box className="create-pin-label">
              Category
            </Box>

            <select
              className="create-pin-input create-pin-select"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              disabled={publishing}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

          </Box>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <Box className="create-pin-field">

            <Box className="create-pin-label">
              Description
            </Box>

            <textarea
              className="create-pin-textarea"
              placeholder="Tell everyone what your Pin is about"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={publishing}
            />

          </Box>


          {/* =================================================
              LINK
          ================================================= */}

          <Box className="create-pin-field">

            <Box className="create-pin-label">
              Link
            </Box>

            <Box className="create-pin-link-wrapper">

              <LinkIcon className="create-pin-link-icon" />

              <input
                type="url"
                className="create-pin-input create-pin-link-input"
                placeholder="Add a destination link"
                value={link}
                onChange={(event) =>
                  setLink(event.target.value)
                }
                disabled={publishing}
              />

            </Box>

          </Box>


          {/* =================================================
              BOARD
          ================================================= */}

          <Box className="create-pin-field">

            <Box className="create-pin-label">
              Board
            </Box>


            <Box className="create-pin-board">

              <Box className="create-pin-board-icon">
                <span>＋</span>
              </Box>


              <Box className="create-pin-board-text">

                <Box className="create-pin-board-title">
                  Choose a board
                </Box>

                <Box className="create-pin-board-subtitle">
                  Organize your Pin
                </Box>

              </Box>


              <Box className="create-pin-board-arrow">
                ›
              </Box>

            </Box>

          </Box>


          {/* =================================================
              MOBILE PUBLISH
          ================================================= */}

          <Box
            className={`create-pin-mobile-publish ${
              publishing ? "publishing" : ""
            }`}
            onClick={
              publishing
                ? undefined
                : handleCreatePin
            }
          >
            {publishing
              ? "Publishing..."
              : "Publish Pin"}
          </Box>

        </Box>

      </Box>

    </Box>
  );
}

