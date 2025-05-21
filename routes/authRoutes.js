import express from "express";
import { signup, login, getUser, verifyEmail } from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", verifyToken, getUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/logout", verifyToken, (req, res) => {
  // JWT is stateless, so logout is handled by frontend (delete token)
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;