// backend/routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories -> list all categories
router.get('/', async (req, res) => {
    try {
        const cats = await Category.find({}).sort({ id: 1 });
        res.json(cats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/categories/:id -> get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/categories -> create new category
router.post('/', async (req, res) => {
    try {
        
        
        // Auto-generate next ID
        const maxCategory = await Category.findOne().sort({ id: -1 });
        const nextId = maxCategory ? maxCategory.id + 1 : 1;

        const categoryData = {
            ...req.body,
            id: nextId,
            slug: req.body.name.toLowerCase().replace(/\s+/g, '-')
        };

        const category = await Category.create(categoryData);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/categories/:id -> update category
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.body.name) {
            updateData.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
        }

        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Category not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/categories/:id -> delete category
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted", id: deleted._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
