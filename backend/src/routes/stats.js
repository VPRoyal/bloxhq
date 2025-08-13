const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { mean } = require("../utils/stats");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../data/items.json");

// Cache Implementation
let statsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Cache Validation
const isCacheValid = () => {
  return (
    statsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION
  );
};

// Clear cache
const clearCache = () => {
  statsCache = null;
  cacheTimestamp = null;
};

// Calculate Stats
const calculateStats = (items) => {
  if (!items || items.length === 0) {
    return {
      total: 0,
      averagePrice: 0,
    };
  }

  const total = items.length;
  const prices = items.map((item) => item.price);
  const averagePrice = mean(prices);

  return {
    total,
    averagePrice,
  };
};

// Read Data
const readData = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data:", err);
    throw new Error("Failed to read data");
  }
};

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    if (isCacheValid()) {
      const cacheAge = Math.round((Date.now() - cacheTimestamp) / 1000);
      return res.json({
        ...statsCache,
        cached: true,
        cacheAge,
      });
    }

    const items = await readData();
    const stats = calculateStats(items);

    // Update cache
    statsCache = stats;
    cacheTimestamp = Date.now();

    return res.json({
      ...stats,
      cached: false,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    next(error);
  }
});

// POST /api/stats/refresh - Clear cache and get fresh stats
router.post("/refresh", async (req, res, next) => {
  try {
    clearCache();

    const items = await readData();
    const stats = calculateStats(items);

    // Update cache
    statsCache = stats;
    cacheTimestamp = Date.now();

    res.json({
      message: "Cache refreshed",
      ...stats,
      cached: false,
    });
  } catch (error) {
    console.error("Error refreshing stats:", error);
    next(error);
  }
});

module.exports = router;
