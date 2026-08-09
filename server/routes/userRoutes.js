import express from "express";
import User from "../models/User.js";

const router = express.Router();

// =====================================================
// SEARCH USERS
// GET /api/users/search?q=mehak
// =====================================================

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          username: {
            $regex: query,
            $options: "i",
          },
        },
        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
      .select("_id name username email photo bio")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);

    res.status(500).json({
      message: "Failed to search users",
    });
  }
});


// =====================================================
// UPDATE USER PROFILE
// PUT /api/users/:userId
// =====================================================

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body || {};

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const allowedFields = [
      "name",
      "username",
      "bio",
      "photo",
      "profilePicture",
      "avatar",
      "email",
    ];

    const safeUpdates = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    });

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({
        message: "No valid profile updates provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      safeUpdates,
      { new: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

// =====================================================
// GET USER PROFILE
// GET /api/users/:userId
// =====================================================

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      profileViews: user.profileViews || 0,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to load profile",
    });
  }
});


// =====================================================
// FOLLOW
// =====================================================

router.post("/:userId/follow", async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({
        message: "Follower ID is required",
      });
    }

    if (userId.toString() === followerId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const userToFollow = await User.findById(userId);
    const follower = await User.findById(followerId);

    if (!userToFollow || !follower) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!userToFollow.followers) {
      userToFollow.followers = [];
    }

    if (!follower.following) {
      follower.following = [];
    }

    const alreadyFollowing = userToFollow.followers.some(
      (id) => id.toString() === followerId.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following this user",
        following: true,
        followersCount: userToFollow.followers.length,
      });
    }

    userToFollow.followers.push(follower._id);
    follower.following.push(userToFollow._id);

    await userToFollow.save();
    await follower.save();

    res.json({
      message: "User followed successfully",
      following: true,
      followersCount: userToFollow.followers.length,
      followingCount: follower.following.length,
    });
  } catch (error) {
    console.error("Follow error:", error);

    res.status(500).json({
      message: "Failed to follow user",
    });
  }
});


// =====================================================
// UNFOLLOW
// =====================================================

router.delete("/:userId/follow", async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({
        message: "Follower ID is required",
      });
    }

    const userToUnfollow = await User.findById(userId);
    const follower = await User.findById(followerId);

    if (!userToUnfollow || !follower) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    userToUnfollow.followers =
      (userToUnfollow.followers || []).filter(
        (id) => id.toString() !== followerId.toString()
      );

    follower.following =
      (follower.following || []).filter(
        (id) => id.toString() !== userId.toString()
      );

    await userToUnfollow.save();
    await follower.save();

    res.json({
      message: "User unfollowed successfully",
      following: false,
      followersCount: userToUnfollow.followers.length,
      followingCount: follower.following.length,
    });
  } catch (error) {
    console.error("Unfollow error:", error);

    res.status(500).json({
      message: "Failed to unfollow user",
    });
  }
});


// =====================================================
// CHECK FOLLOW STATUS
// =====================================================

router.get(
  "/:userId/follow-status/:viewerId",
  async (req, res) => {
    try {
      const { userId, viewerId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const followers = user.followers || [];

      const following = followers.some(
        (id) => id.toString() === viewerId.toString()
      );

      res.json({
        following,
        followersCount: followers.length,
      });
    } catch (error) {
      console.error("Follow status error:", error);

      res.status(500).json({
        message: "Failed to check follow status",
      });
    }
  }
);


// =====================================================
// PROFILE VIEW
// =====================================================

router.post("/:userId/view", async (req, res) => {
  try {
    const { userId } = req.params;
    const { viewerId } = req.body;

    // Don't count own profile views
    if (
      viewerId &&
      viewerId.toString() === userId.toString()
    ) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        profileViews: user.profileViews || 0,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          profileViews: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      profileViews: user.profileViews || 0,
    });
  } catch (error) {
    console.error("Profile view error:", error);

    res.status(500).json({
      message: "Failed to update profile views",
    });
  }
});

export default router;