import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { connectMongoose } from "./db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  try {
    await connectMongoose();
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect MongoDB:", error);
    process.exit(1);
  }

  // API routes
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  // Run server
  const port = 5000;
  server.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`);
  });
})();
