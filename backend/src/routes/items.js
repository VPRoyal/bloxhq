const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const {
  validatePagination,
  handleValidationErrors,
  validateNewItem,
} = require("../middleware/validation");

const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache to reduce disk I/O
let itemsCache = null;
let lastCacheModified = null;

// Utility to read data (intentionally sync to highlight blocking issue)
const readData = async () => {
  try {
    const fileStats = await fs.stat(DATA_PATH);

    // Check for cache validity
    if (
      itemsCache &&
      lastCacheModified &&
      fileStats.mtime <= lastCacheModified
    ) {
      return itemsCache;
    }

    // Fetch fresh data
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const fileData = JSON.parse(raw) || [];

    // Update cache
    itemsCache = fileData;
    lastCacheModified = fileStats.mtime;
    return fileData;
  } catch (err) {
    console.error("Error reading data:", err);
    throw new Error("Failed to read data");
  }
};

// Utility to write data
async function writeData(data) {
  const jsonData = JSON.stringify(data, null, 2);
  await fs.writeFile(DATA_PATH, jsonData, "utf8");

  // Invalidate cache
  itemsCache = data;
  lastModified = new Date();
}

// Search Function
const performSearch = (items, query) => {
  if (!query) return items;

  const searchTerm = query.toLowerCase();

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
  );
};

const createItem = (body) => {
  const { name, category, price } = body;
  const newItem = {
    id: Date.now() + Math.random(), // Better ID generation
    name: name.trim(),
    category: category.trim(),
    price: parseFloat(price),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newItem;
};

// GET /api/items
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await readData();
      const { page = 1, limit = 10, q } = req.query;

      // Apply search filter
      const filteredItems = performSearch(data, q);

      // Calculate pagination
      const total = filteredItems.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Apply pagination
      const items = filteredItems.slice(offset, offset + limit);

      res.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        ...(q && { searchQuery: q }),
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post(
  "/",
  validateNewItem,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      // TODO: Validate payload (intentional omission)
      const data = await readData();
      const item = createItem(req.body);
      data.push(item);
      await writeData(data);

      res.status(201).json({ item, message: "Item created successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
