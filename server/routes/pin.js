import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Pin from "../models/Pin.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// CREATE PIN
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      link,
      image,
      category,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        message: "Image is required.",
      });
    }

    let imageUrl = "";

    if (image && typeof image === "string" && image.startsWith("data:image/")) {
      const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);

      if (!matches) {
        return res.status(400).json({ message: "Invalid image data." });
      }

      const ext = matches[1].split("/")[1] || "png";
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      const buffer = Buffer.from(matches[2], "base64");

      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    } else if (image && typeof image === "string" && image.trim()) {
      imageUrl = image.trim();
    }

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required." });
    }

    const pin = await Pin.create({
      user: userId,
      title: title.trim(),
      description: description?.trim() || "",
      link: link?.trim() || "",
      image: imageUrl,
      category: category?.trim() || "Created",

      views: 0,
      saves: 0,
      shares: 0,
      commentsCount: 0,
    });

    // Populate user so frontend gets complete information
    await pin.populate("user", "name username email photo bio");

    return res.status(201).json({
      message: "Pin created successfully.",
      pin,
    });
  } catch (error) {
    console.error("Create Pin Error:", error);

    return res.status(500).json({
      message: "Failed to create Pin.",
      error: error.message,
    });
  }
});

// GET USER CREATED PINS
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const pins = await Pin.find({
      user: userId,
    })
      .populate("user", "name username email photo bio")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      pins,
      count: pins.length,
    });
  } catch (error) {
    console.error("Get User Created Pins Error:", error);

    return res.status(500).json({
      message: "Failed to load user's Pins.",
      error: error.message,
    });
  }
});

// GET SINGLE PIN
// GET ALL PINS 
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find()
      .populate("user", "name username email photo bio")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      pins,
      count: pins.length,
    });
  } catch (error) {
    console.error("Get All Pins Error:", error);

    return res.status(500).json({
      message: "Failed to load pins.",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate(
        "user",
        "name username email photo bio"
      )
      .lean();

    if (!pin) {
      return res.status(404).json({
        message: "Pin not found.",
      });
    }

    return res.status(200).json({
      pin,
    });
  } catch (error) {
    console.error("Get Pin Error:", error);

    return res.status(500).json({
      message: "Failed to load Pin.",
      error: error.message,
    });
  }
});

// INCREMENT VIEW
router.patch("/:id/view", async (req, res) => {
  try {
    const pin = await Pin.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!pin) {
      return res.status(404).json({
        message: "Pin not found.",
      });
    }

    return res.status(200).json({
      views: pin.views,
    });
  } catch (error) {
    console.error("View Error:", error);

    return res.status(500).json({
      message: "Failed to update views.",
      error: error.message,
    });
  }
});

// INCREMENT SAVE
router.patch("/:id/save", async (req, res) => {
  try {
    const pin = await Pin.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          saves: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!pin) {
      return res.status(404).json({
        message: "Pin not found.",
      });
    }

    return res.status(200).json({
      saves: pin.saves,
    });
  } catch (error) {
    console.error("Save Error:", error);

    return res.status(500).json({
      message: "Failed to update saves.",
      error: error.message,
    });
  }
});

// UNSAVE
router.patch("/:id/unsave", async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({
        message: "Pin not found.",
      });
    }

    pin.saves = Math.max(0, pin.saves - 1);
    await pin.save();
    return res.status(200).json({
      saves: pin.saves,
    });
  } catch (error) {
    console.error("Unsave Error:", error);

    return res.status(500).json({
      message: "Failed to update saves.",
      error: error.message,
    });
  }
});

// SHARE
router.patch("/:id/share", async (req, res) => {
  try {
    const pin = await Pin.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          shares: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!pin) {
      return res.status(404).json({
        message: "Pin not found.",
      });
    }

    return res.status(200).json({
      shares: pin.shares,
    });
  } catch (error) {
    console.error("Share Error:", error);

    return res.status(500).json({
      message: "Failed to update shares.",
      error: error.message,
    });
  }
});

export default router;