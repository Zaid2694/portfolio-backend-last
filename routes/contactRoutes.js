import express from "express";
import { submitMessage, getMessages } from "../controllers/contactController.js";
import verifyToken from "../middleware/verifyToken.js";
import Message from "../models/Message.js";

const router = express.Router();

router.post("/contact", submitMessage);

// Secure admin-only routes
router.get("/messages", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized: Admin access required" });
  }
  next();
}, getMessages);

router.delete("/messages/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized: Admin access required" });
  }
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
});

export default router;