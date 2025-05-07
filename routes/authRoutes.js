
// routes/authRoutes.js
import express from "express";
import { signup, login, getUser } from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", verifyToken, getUser);

export default router;