const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
require('dotenv').config();

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    const email = 'Jha1947.sj@gmail.com';
    const testPassword = 'password123';
    
    console.log('🔍 Looking for user with email:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found in database');
      return process.exit(1);
    }
    
    console.log('👤 User found:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      walletBalance: user.walletBalance,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Test password comparison
    console.log('🔐 Testing password...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password does not match. Resetting password...');
      
      // Create a new hashed password
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      
      await User.updateOne(
        { email },
        { password: newHashedPassword }
      );
      
      console.log('✅ Password reset completed');
      
      // Test again
      const updatedUser = await User.findOne({ email });
      const isNewPasswordValid = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('New password test:', isNewPasswordValid);
    }
    
    // Test JWT secret
    console.log('🔑 JWT Secret exists:', !!process.env.JWT_SECRET);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

debugLogin();