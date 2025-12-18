// backend/routes/productRoutes.js
// CRUD + listing routes for products.

import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

// GET /api/products -> list with optional filters ?search=&category=&minPrice=&maxPrice=
router.get("/", async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, limit = 50 } = req.query;
        const query = {};

        // If category is provided, it could be either category name or ObjectId
        if (category) {
            // Try to find category by name first
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                query.category = categoryDoc._id;
            } else {
                // If not found by name, assume it's an ObjectId
                query.category = category;
            }
        }

        if (search) query.name = { $regex: search, $options: "i" };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // log the query that will be executed
        console.log('[productRoutes] list - mongo query:', JSON.stringify(query), 'limit=', limit);

        const products = await Product.find(query)
            .populate('category', 'name image slug') // Populate category details
            .limit(Number(limit));

        console.log('[productRoutes] list - found', products.length, 'products');
        if (products.length > 0) console.log('[productRoutes] list - sample product:', products[0]._id, products[0].name);

        res.json({ count: products.length, data: products });
    } catch (err) {
        console.error('[productRoutes] list error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/products/:id -> single
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name image banner slug'); // Populate category details
        if (!product) return res.status(404).json({ message: "Product not found" });
        console.log('[productRoutes] get -', product._id, product.name);
        res.json(product);
    } catch (err) {
        console.error('[productRoutes] get error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/products -> create (dev only, no auth yet)
router.post("/", async (req, res) => {
    try {
        const body = req.body;

        // If category is provided as a name, convert it to ObjectId
        if (body.category && typeof body.category === 'string') {
            const categoryDoc = await Category.findOne({ name: body.category });
            if (!categoryDoc) {
                return res.status(400).json({ message: `Category '${body.category}' not found` });
            }
            body.category = categoryDoc._id;
        }

        console.log('[productRoutes] create - body:', JSON.stringify(body));
        const product = await Product.create(body);
        console.log('[productRoutes] create - created id:', product._id);
        const populatedProduct = await Product.findById(product._id).populate('category', 'name image slug');
        console.log('[productRoutes] create - populated:', populatedProduct ? populatedProduct._id : null);
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error('[productRoutes] create error:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/products/:id -> update
router.put("/:id", async (req, res) => {
    try {
        const body = req.body;

        // If category is provided as a name, convert it to ObjectId
        if (body.category && typeof body.category === 'string') {
            const categoryDoc = await Category.findOne({ name: body.category });
            if (!categoryDoc) {
                return res.status(400).json({ message: `Category '${body.category}' not found` });
            }
            body.category = categoryDoc._id;
        }

        console.log('[productRoutes] update - id:', req.params.id, 'body:', JSON.stringify(body));
        const updated = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
            .populate('category', 'name image slug');
        if (!updated) {
            console.log('[productRoutes] update - not found:', req.params.id);
            return res.status(404).json({ message: "Product not found" });
        }
        console.log('[productRoutes] update - updated:', updated._id, updated.name);
        res.json(updated);
    } catch (err) {
        console.error('[productRoutes] update error:', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/products/:id -> delete
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        console.log('[productRoutes] delete - deleted id:', deleted._id, 'name:', deleted.name);
        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        console.error('[productRoutes] delete error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/products/seed -> insert sample products if collection empty
router.post("/seed", async (_req, res) => {
    try {
        const existing = await Product.countDocuments();
        if (existing > 0) return res.status(400).json({ message: "Products already exist. Clear collection to reseed." });

        // Find or create categories for seed data
        const categoryNames = ["Fruits & Vegetables", "Spices", "Beverages", "Dairy & Eggs"];
        const categoryMap = {};

        for (const catName of categoryNames) {
            let category = await Category.findOne({ name: catName });
            if (!category) {
                // Create basic category if it doesn't exist
                const maxCategory = await Category.findOne().sort({ id: -1 }).limit(1);
                const nextId = maxCategory ? maxCategory.id + 1 : 1;
                category = await Category.create({
                    id: nextId,
                    name: catName,
                    slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
                    image: `/Images/${catName.toLowerCase()}.png`,
                    banner: `/Images/${catName.toLowerCase()}-banner.png`
                });
            }
            categoryMap[catName] = category._id;
        }

        const samples = [
            {
                name: "Fresh Apple",
                image: "/Images/apple.png",
                category: categoryMap["Fruits & Vegetables"],
                unit: "1 Kg",
                price: 320,
                description: "Crisp, juicy apples packed with natural sweetness.",
                stock: 150,
                tags: ["fruit", "fresh"],
            },
            {
                name: "Bananas",
                image: "/Images/banana.jpg",
                category: categoryMap["Fruits & Vegetables"],
                unit: "Dozen",
                price: 180,
                description: "Ripe bananas rich in potassium.",
                stock: 200,
                tags: ["fruit"],
            },
            {
                name: "National Red Chili Powder",
                image: "/Images/national rd chilli.avif",
                category: categoryMap["Spices"],
                unit: "100g",
                price: 80,
                description: "Pure red chili powder for rich flavor.",
                stock: 180,
                tags: ["spice"],
            },
            {
                name: "Coca-Cola 1.5L",
                image: "/Images/coca cola 1.5L.webp",
                category: categoryMap["Beverages"],
                unit: "1.5 L",
                price: 180,
                description: "Classic refreshing beverage.",
                stock: 250,
                tags: ["drink"],
            },
            {
                name: "Cheddar Cheese",
                image: "/Images/cheese.png",
                category: categoryMap["Dairy & Eggs"],
                unit: "200g",
                price: 350,
                description: "Rich sharp cheddar cheese.",
                stock: 90,
                tags: ["dairy"],
            }
        ];

        console.log('[productRoutes] seed - categoryMap:', categoryMap);
        const created = await Product.insertMany(samples);
        console.log('[productRoutes] seed - created count:', created.length);
        const populated = await Product.find({ _id: { $in: created.map(p => p._id) } }).populate('category');
        console.log('[productRoutes] seed - populated sample:', populated.length > 0 ? populated[0]._id : null);
        res.status(201).json({ message: "Seeded", count: created.length, data: populated });
    } catch (err) {
        console.error('[productRoutes] seed error:', err);
        res.status(500).json({ message: err.message });
    }
});

export default router;
