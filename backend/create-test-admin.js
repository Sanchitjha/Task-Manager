const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const User = require('./src/schemas/User');

async function createTestAdmin() {
  try {
    // Delete existing test admin if exists
    await User.deleteOne({ email: 'admin@test.com' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create test admin user
    const testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      coinsBalance: 0,
      isApproved: true
    });
    
    console.log('✅ Test admin created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestAdmin();