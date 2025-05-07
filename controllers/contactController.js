import fetch from 'node-fetch';
import Message from '../models/Message.js'; // Agar tumne model banaya hai

export const submitMessage = async (req, res) => {
  const { name, email, subject, message, recaptchaToken } = req.body;

  // reCAPTCHA verification
  const recaptchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    {
      method: 'POST',
    }
  );

  const recaptchaData = await recaptchaResponse.json();
  if (!recaptchaData.success) {
    return res.status(400).json({ error: 'reCAPTCHA verification failed' });
  }

  // Save message to MongoDB
  try {
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    res.status(200).json({ message: "Message submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
