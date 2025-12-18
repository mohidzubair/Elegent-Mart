// Quick script to add category references to existing products
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

dotenv.config();

async function fixProductCategories() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const dbName = process.env.MONGODB_DB || "elegent-mart";

        await mongoose.connect(uri, { dbName });
        console.log("✅ Connected to MongoDB");

        // Get all categories
        const categories = await Category.find({});
        console.log(`📂 Found ${categories.length} categories`);

        // Create a map of category names to their ObjectIds
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
            categoryMap[cat.name.toLowerCase()] = cat._id;
        });

        console.log("Category map:", Object.keys(categoryMap));

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products`);

        let updated = 0;
        let skipped = 0;

        for (const product of products) {
            // Skip if already has a category ObjectId
            if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                skipped++;
                continue;
            }

            // Try to assign a category based on product name or set a default
            let categoryId = null;

            // Check if product name suggests a category
            const name = product.name.toLowerCase();

            if (name.includes('tomato') || name.includes('onion') || name.includes('potato') ||
                name.includes('apple') || name.includes('banana') || name.includes('vegetable') ||
                name.includes('fruit')) {
                categoryId = categoryMap['Fruits & Vegetables'] || categoryMap['fruits & vegetables'];
            } else if (name.includes('spice') || name.includes('chili') || name.includes('masala')) {
                categoryId = categoryMap['Spices'] || categoryMap['spices'];
            } else if (name.includes('cola') || name.includes('juice') || name.includes('drink') || name.includes('beverage')) {
                categoryId = categoryMap['Beverages'] || categoryMap['beverages'];
            } else if (name.includes('milk') || name.includes('cheese') || name.includes('egg') || name.includes('dairy')) {
                categoryId = categoryMap['Dairy & Eggs'] || categoryMap['dairy & eggs'];
            } else if (name.includes('snack') || name.includes('chip') || name.includes('lays')) {
                categoryId = categoryMap['Snacks'] || categoryMap['snacks'];
            } else {
                // Default to first category if we can't determine
                categoryId = categories[0]?._id;
            }

            if (categoryId) {
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { category: categoryId } }
                );
                console.log(`✅ Updated "${product.name}" -> category ${categoryId}`);
                updated++;
            } else {
                console.warn(`⚠️ Could not assign category to "${product.name}"`);
            }
        }

        console.log(`\n🎉 Done! Updated ${updated} products, skipped ${skipped}`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

fixProductCategories();
