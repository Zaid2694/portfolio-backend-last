import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import rateLimit from "express-rate-limit";

dotenv.config();
connectDB();

const app = express();

// Rate limiting for /api/contact
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:5173", "https://portfolio-frontend-dwfu.onrender.com"], // Add deployed frontend URL
  credentials: true 
}));
app.use(express.json());

// Apply rate limiting to contact route
app.use("/api/contact", contactLimiter);

app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));