const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const killPort = require("kill-port");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");
const { initRuntimeConfig } = require("./config/runtimeConfig");
require("dotenv").config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1000, // Limit requests per window
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Middleware
app.use(cors()); // For not allowing all origins to access the API
app.options("*", cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Logging
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("production"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// Routes
app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
  });
});

const startServer = (port) => {
  // initRuntimeConfig();  // Commented out because API were not working
  const server = app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });

  server.timeout = 30000;

  const shutdownHandler = (signal) => {
    console.log(`\nCaught ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log("Server closed. Port released.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Force exiting after timeout");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGINT", () => shutdownHandler("SIGINT"));
  process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdownHandler("uncaughtException");
  });
};

// Kill port BEFORE starting server
killPort(PORT, "tcp")
  .then(() => {
    console.log(`Port ${PORT} killed. Starting fresh server...`);
    startServer(PORT);
  })
  .catch((err) => {
    console.warn(
      `Port ${PORT} may not have been in use. Starting server anyway...`
    );
    startServer(PORT);
  });
