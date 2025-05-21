import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import multer from 'multer'; // For file uploads
import path from 'path';

// Utility function to fetch with timeout
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Utility function to retry fetch on failure
const fetchWithRetry = async (url, options, retries = 2, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed. Retrying after ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailNotification = async (name, email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Handle file upload with form data
export const submitMessage = async (req, res) => {
  upload.single('attachment')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed', details: err.message });
    }

    const { name, email, subject, message, recaptchaToken } = req.body;

    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({ error: 'All fields are required, including reCAPTCHA token' });
    }

    try {
      if (!process.env.RECAPTCHA_SECRET_KEY) {
        return res.status(500).json({ error: 'reCAPTCHA secret key is not configured' });
      }

      console.log('Sending reCAPTCHA request with secret:', process.env.RECAPTCHA_SECRET_KEY);
      const recaptchaResponse = await fetchWithRetry(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        { method: 'POST' },
        2,
        1000
      );
      console.log('reCAPTCHA HTTP Status:', recaptchaResponse.status);
      const recaptchaData = await recaptchaResponse.json();
      console.log('reCAPTCHA Verification Response:', recaptchaData);

      if (!recaptchaData.success) {
        return res.status(400).json({
          error: 'reCAPTCHA verification failed',
          details: recaptchaData['error-codes'] || 'Unknown error',
        });
      }

      const newMessage = new Message({
        name,
        email,
        subject,
        message,
        status: 'pending', // New field
        attachment: req.file ? `/uploads/${req.file.filename}` : null, // Store attachment path
      });
      await newMessage.save();

      await sendEmailNotification(name, email, subject, message);

      res.status(200).json({
        message: `Message submitted successfully by ${name}!`,
        messageId: newMessage._id,
      });
    } catch (error) {
      console.log('Error in submitMessage:', error.message);
      if (error.name === 'AbortError') {
        res.status(503).json({ error: 'reCAPTCHA verification timed out', details: 'Request to Google API timed out' });
      } else {
        res.status(500).json({ error: 'Failed to submit message', details: error.message });
      }
    }
  });
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};