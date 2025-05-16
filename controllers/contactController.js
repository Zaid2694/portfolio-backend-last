import fetch from 'node-fetch';
import Message from '../models/Message.js';

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
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: 'POST' }
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
    console.log('Error in submitMessage:', error); // Debug
    res.status(500).json({ error: 'Failed to submit message', details: error.message });
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