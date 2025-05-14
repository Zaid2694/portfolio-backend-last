// server.js
    import express from "express";
    import dotenv from "dotenv";
    import cors from "cors";
    import connectDB from "./config/db.js";
    import authRoutes from "./routes/authRoutes.js";
    import contactRoutes from "./routes/contactRoutes.js";

    dotenv.config();
    connectDB();

    const app = express();
    // Update CORS to allow multiple origins or specific origin
    app.use(cors({ 
      origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both origins
      credentials: true 
    }));
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api", contactRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));