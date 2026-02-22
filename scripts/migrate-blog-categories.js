/**
 * Migration Script: Add default category to existing blogs
 * 
 * This script creates a default "Uncategorized" category and assigns it
 * to all existing blogs that don't have a category field.
 * 
 * Usage: node scripts/migrate-blog-categories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../src/models/Blog');
const Category = require('../src/models/Category');

async function migrateCategories() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if "Uncategorized" category exists, create if not
    let defaultCategory = await Category.findOne({ slug: 'uncategorized' });
    
    if (!defaultCategory) {
      console.log('Creating default "Uncategorized" category...');
      defaultCategory = await Category.create({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category for blogs without a specific category'
      });
      console.log('✓ Created default category:', defaultCategory.name);
    } else {
      console.log('✓ Default category already exists:', defaultCategory.name);
    }

    // Find all blogs without a category
    const blogsWithoutCategory = await Blog.find({
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    });

    console.log(`\nFound ${blogsWithoutCategory.length} blogs without category`);

    if (blogsWithoutCategory.length === 0) {
      console.log('✓ All blogs already have categories. No migration needed.');
      return;
    }

    // Update blogs to use default category
    console.log('Assigning default category to blogs...');
    const result = await Blog.updateMany(
      {
        $or: [
          { category: { $exists: false } },
          { category: null }
        ]
      },
      {
        $set: { category: defaultCategory._id }
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} blogs with default category`);

    // Verify migration
    const remainingBlogsWithoutCategory = await Blog.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    });

    if (remainingBlogsWithoutCategory === 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log(`All ${await Blog.countDocuments()} blogs now have categories.`);
    } else {
      console.warn(`\n⚠️  Warning: ${remainingBlogsWithoutCategory} blogs still without category`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run migration
migrateCategories();
