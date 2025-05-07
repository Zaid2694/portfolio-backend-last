// controllers/contactController.js
import Message from "../models/Message.js";
import sendEmail from "../utils/sendEmail.js";

export const submitMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "Missing fields" });

  try {
    const newMsg = await Message.create({ name, email, subject, message });
    await sendEmail({ name, email, subject, message });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessages = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

