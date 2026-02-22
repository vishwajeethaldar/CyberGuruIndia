require('dotenv').config();
const connectDB = require('../src/config/db');
const { seedAdminAndCategories } = require('../src/utils/seed');

(async () => {
  try {
    await connectDB();
    await seedAdminAndCategories();
    console.log('Seeding done.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
