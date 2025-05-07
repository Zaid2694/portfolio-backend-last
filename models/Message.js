// Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);