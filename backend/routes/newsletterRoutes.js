import express from "express";
import crypto from "crypto";
import Newsletter from "../models/Newsletter.js";
import { asyncHandler } from "../utils/error.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// @POST /api/newsletter/subscribe
router.post(
  "/subscribe",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.json({
          success: true,
          message: "Welcome back! You're re-subscribed 🎉",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Already subscribed!",
      });
    }

    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    await Newsletter.create({
      email: email.toLowerCase(),
      name,
      unsubscribeToken,
    });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully! 🚀",
    });
  }),
);

// @GET /api/newsletter/unsubscribe/:token
router.get(
  "/unsubscribe/:token",
  asyncHandler(async (req, res) => {
    const subscriber = await Newsletter.findOneAndUpdate(
      { unsubscribeToken: req.params.token },
      { isActive: false },
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Invalid unsubscribe link.",
      });
    }

    res.json({
      success: true,
      message: "Unsubscribed successfully. Sorry to see you go!",
    });
  }),
);

export default router;
