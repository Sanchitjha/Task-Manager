const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    const email = 'Jha1947.sj@gmail.com';
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('✅ User already exists:', {
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        walletBalance: user.walletBalance,
        hasPassword: !!user.password
      });
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('password123', user.password);
      console.log('🔐 Password test:', isValidPassword ? 'VALID' : 'INVALID');
      
    } else {
      console.log('🆕 Creating new user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      user = await User.create({
        name: 'Test User',
        email: email,
        password: hashedPassword,
        role: 'client',
        isEmailVerified: true,
        walletBalance: 1000
      });
      
      console.log('✅ User created successfully:', {
        email: user.email,
        role: user.role,
        password: 'password123'
      });
    }
    
    // Also create an admin user for testing
    const adminEmail = 'admin@test.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        walletBalance: 5000
      });
      console.log('👑 Admin user created:', {
        email: adminUser.email,
        password: 'admin123'
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestUser();