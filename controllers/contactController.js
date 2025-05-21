import fetch from 'node-fetch';
import Message from '../models/Message.js';

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
        throw error; // If last retry fails, throw the error
      }
      console.log(`Attempt ${attempt} failed. Retrying after ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const submitMessage = async (req, res) => {
  const { name, email, subject, message, recaptchaToken } = req.body;

  if (!name || !email || !message || !recaptchaToken) {
    return res.status(400).json({ error: 'All fields are required, including reCAPTCHA token' });
  }

  try {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      return res.status(500).json({ error: 'reCAPTCHA secret key is not configured' });
    }

    console.log('Sending reCAPTCHA request with secret:', process.env.RECAPTCHA_SECRET_KEY); // Debug
    const recaptchaResponse = await fetchWithRetry(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: 'POST' },
      2, // Retry 2 times
      1000 // Delay of 1 second between retries
    );
    console.log('reCAPTCHA HTTP Status:', recaptchaResponse.status); // Debug
    const recaptchaData = await recaptchaResponse.json();
    console.log('reCAPTCHA Verification Response:', recaptchaData); // Debug

    if (!recaptchaData.success) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed',
        details: recaptchaData['error-codes'] || 'Unknown error',
      });
    }

    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    res.status(200).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.log('Error in submitMessage:', error.message); // Detailed error message
    if (error.name === 'AbortError') {
      res.status(503).json({ error: 'reCAPTCHA verification timed out', details: 'Request to Google API timed out' });
    } else {
      res.status(500).json({ error: 'Failed to submit message', details: error.message });
    }
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages:', error); // Debug
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};