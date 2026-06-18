import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: false   // ✅ FIX: Google users don't need password
  },

  googleId: {
    type: String,
    default: null      // ✅ for Google login users
  },

  resetToken: String,
  resetTokenExpiry: Date,

  photo: String
});

export default mongoose.model("User", userSchema);