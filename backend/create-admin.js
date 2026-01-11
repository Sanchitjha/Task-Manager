const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/manager');
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      coinsBalance: 1000,
      walletBalance: 1000,
      isVerified: true,
      isEmailVerified: true,
      isApproved: true
    });
    
    console.log('Admin user created successfully:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Coins: 1000');
    
    // Create test client user
    const testUser = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'client',
      coinsBalance: 500,
      walletBalance: 500,
      isVerified: true,
      isEmailVerified: true,
      isApproved: true
    });
    
    console.log('Test user created successfully:');
    console.log('Email: test@example.com');
    console.log('Password: admin123');
    console.log('Role: client');
    console.log('Coins: 500');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

createAdminUser();