// server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env FIRST
dotenv.config();

// Import routes/config AFTER dotenv
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import Post from "./models/Post.js";
import { cloudinary } from "./config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ================= DATABASE =================
connectDB();

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log(
    "☁️ Cloudinary configured:",
    process.env.CLOUDINARY_CLOUD_NAME
  );
} else {
  console.warn("⚠️ Cloudinary NOT configured - check .env");
}

// ================= SECURITY =================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    contentSecurityPolicy: false,
  })
);

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://blogspacebyharshuu.netlify.app",
  "https://blogspace-fxgv.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman/mobile apps
      if (!origin) {
        return callback(null, true);
      }

      // Allow listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all localhost + netlify domains
      if (
        origin.includes("localhost") ||
        origin.includes("netlify.app")
      ) {
        return callback(null, true);
      }

      console.log("⚠️ CORS blocked:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
    ],

    exposedHeaders: ["set-cookie"],
  })
);

// ================= MIDDLEWARE =================
app.use(compression());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());
app.use(mongoSanitize());

// ================= STATIC FILES =================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= LOGGER =================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ================= RATE LIMITER =================
app.use("/api/", apiLimiter);

// ================= HEALTH ROUTE =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cloudinary:
      process.env.CLOUDINARY_CLOUD_NAME ||
      "not configured",
  });
});

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use(
  "/api/posts/:postId/comments",
  commentRoutes
);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/newsletter", newsletterRoutes);

// ================= CRON JOB =================
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    await Post.updateMany(
      {
        status: "scheduled",
        scheduledAt: { $lte: now },
      },
      {
        $set: {
          status: "published",
          publishedAt: now,
        },
      }
    );
  } catch (error) {
    console.error(
      "Cron error:",
      error.message
    );
  }
});

// ================= PRODUCTION FRONTEND =================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(
    __dirname,
    "../frontend/dist"
  );

  app.use(
    express.static(frontendPath, {
      maxAge: "1y",
    })
  );

  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    res.sendFile(
      path.join(frontendPath, "index.html")
    );
  });
}

// ================= 404 =================
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

export default app;
