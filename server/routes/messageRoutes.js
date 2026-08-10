
import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import { decryptMessageText } from "../utils/messageEncryption.js";

const router = express.Router();

const serializeMessage = (message) => {
  if (!message) {
    return message;
  }

  return {
    ...message,
    text: decryptMessageText(message.text),
  };
};
// GET CONVERSATION SUMMARIES FOR A USER
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "name username email photo")
      .populate("receiver", "name username email photo")
      .sort({ createdAt: -1 })
      .lean();

    const conversationMap = new Map();

    for (const message of messages) {
      const senderId = message.sender?._id?.toString();
      const receiverId = message.receiver?._id?.toString();

      const otherUser =
        senderId === userId ? message.receiver : message.sender;

      if (!otherUser?._id) {
        continue;
      }

      const conversationKey = otherUser._id.toString();

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          user: otherUser,
          messages: [serializeMessage(message)],
        });
      }
    }

    return res.status(200).json({
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);

    return res.status(500).json({
      message: "Failed to load conversations.",
      error: error.message,
    });
  }
});

// GET MESSAGES BETWEEN TWO USERS
router.get("/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: userId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: userId,
        },
      ],
    })
      .populate("sender", "name username email photo")
      .populate("receiver", "name username email photo")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      message: "Failed to load messages.",
      error: error.message,
    });
  }
});

// CREATE MESSAGE
router.post("/", async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      text,
    } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: "Sender and receiver are required.",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(
      newMessage._id
    )
      .populate("sender", "name username email photo")
      .populate("receiver", "name username email photo")
      .lean();

    return res.status(201).json({
      message: serializeMessage(populatedMessage),
    });
  } catch (error) {
    console.error("Create Message Error:", error);

    return res.status(500).json({
      message: "Failed to send message.",
      error: error.message,
    });
  }
});

export default router;

