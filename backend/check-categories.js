import mongoose from 'mongoose';
import Product from './models/Product.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCategoryDistribution() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri, { dbName: 'elegent-mart' });

        const categories = await Category.find({}).sort({ id: 1 });
        console.log(`\n📂 Total categories: ${categories.length}\n`);

        for (const cat of categories) {
            const count = await Product.countDocuments({ category: cat._id });
            console.log(`${cat.id}. ${cat.name.padEnd(25)} - ${count} products`);
        }

        const productsWithoutCategory = await Product.countDocuments({ category: { $exists: false } });
        console.log(`\n⚠️  Products without category: ${productsWithoutCategory}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCategoryDistribution();
