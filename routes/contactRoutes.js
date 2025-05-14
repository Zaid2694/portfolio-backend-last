import express from "express";
import { submitMessage, getMessages } from "../controllers/contactController.js";

const router = express.Router();

router.post("/contact", submitMessage);
router.get("/messages", getMessages); // admin access only
// router.delete('/messages/:id', verifyToken, async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Unauthorized' });
//   }
//   try {
//     await Message.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Message deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete message' });
//   }
// });

export default router;