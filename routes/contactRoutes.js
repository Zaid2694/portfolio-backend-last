// routes/contactRoutes.js
import express from "express";
import { submitMessage, getMessages } from "../controllers/contactController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/contact", submitMessage);
router.get("/messages", verifyToken, getMessages);

export default router;