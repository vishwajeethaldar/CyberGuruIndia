const User = require('../models/User');
const Category = require('../models/Category');
const { DEFAULT_CATEGORIES } = require('./constants');

async function seedAdminAndCategories() {
  const adminUsername = process.env.ADMIN_SEED_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';

  const existingAdmin = await User.findOne({ username: adminUsername });
  if (!existingAdmin) {
    await User.create({
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Seeded admin user: ${adminUsername}`);
  }

  for (const name of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
    }
  }

  console.log('Category seed completed');
}

module.exports = {
  seedAdminAndCategories,
};
