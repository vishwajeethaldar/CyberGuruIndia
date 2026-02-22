require('dotenv').config();
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }

    await connectDB();

    const app = require('./src/app');

    app.listen(PORT, () => {
      console.log(`CyberGuruIndia running on http://localhost:${PORT}`);
    });
  } catch (error) {
    if (String(error.message).includes('ECONNREFUSED') || String(error.message).includes('Server selection timed out')) {
      console.error('Failed to start server: MongoDB is not reachable at MONGODB_URI.');
      console.error('Start MongoDB locally or update MONGODB_URI in .env.');
    } else {
      console.error('Failed to start server:', error.message);
    }
    process.exit(1);
  }
})();
