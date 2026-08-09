import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: false,
    },

    googleId: {
      type: String,
      default: null,
    },

    photo: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    // Users who follow this user
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Users this user follows
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Number of times this profile has been viewed
    profileViews: {
      type: Number,
      default: 0,
    },

    resetToken: String,

    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);