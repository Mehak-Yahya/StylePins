import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial; padding:20px; max-width:500px; margin:auto; border:1px solid #eee; border-radius:10px;">
          <h2>We got your request</h2>
          <p>You can now reset your password!</p>

          <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#e60023;color:#fff;text-decoration:none;border-radius:25px;">
            Reset password
          </a>

          <p style="font-size:12px;color:#555;">
            You have 24 hours to reset your password.
          </p>
        </div>
      `,
    });

    res.json({ message: "Reset email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
};
