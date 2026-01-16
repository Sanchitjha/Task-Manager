const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Use Atlas connection string from env
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manager';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const adminEmail = 'showcaseiretail@gmail.com';
    const adminPassword = 'Scac1991@';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      console.log('Admin details:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        role: existingAdmin.role,
        name: existingAdmin.name
      });
      console.log('\n🔑 Use these credentials to login:');
      console.log('Email: showcaseiretail@gmail.com');
      console.log('Password: Scac1991@');
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      phone: '9999999999',
      coinsBalance: 10000,
      walletBalance: 10000,
      isVerified: true,
      isEmailVerified: true,
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Admin details:', {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
      coinsBalance: adminUser.coinsBalance,
      walletBalance: adminUser.walletBalance
    });
    console.log('\n🔑 Admin Login Credentials:');
    console.log('Email: showcaseiretail@gmail.com');
    console.log('Password: Scac1991@');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdminUser();