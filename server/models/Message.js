import mongoose from "mongoose";
import { encryptMessageText } from "../utils/messageEncryption.js";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre("save", function encryptText(next) {
  if (this.isModified("text")) {
    this.text = encryptMessageText(this.text);
  }

  next();
});

export default mongoose.model("Message", messageSchema);