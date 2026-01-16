const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/schemas/User');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/taskmanager');
    
    // Create test client user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const testUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'client',
        coinsBalance: 500,
        isVerified: true
      },
      { upsert: true, new: true }
    );
    
    // Create test vendor user
    const testVendor = await User.findOneAndUpdate(
      { email: 'vendor@example.com' },
      {
        email: 'vendor@example.com',
        password: hashedPassword,
        name: 'Test Vendor',
        role: 'vendor',
        coinsBalance: 1000,
        isVerified: true
      },
      { upsert: true, new: true }
    );
    
    console.log('Test users created successfully:');
    console.log('User: test@example.com / testpass123 (500 coins)');
    console.log('Vendor: vendor@example.com / testpass123 (1000 coins)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();