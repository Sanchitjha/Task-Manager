const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    const email = 'Jha1947.sj@gmail.com';
    const newPassword = 'password123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const result = await User.updateOne(
      { email: email },
      { 
        password: hashedPassword,
        isEmailVerified: true,
        walletBalance: 1000 // Give some coins for testing
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successfully for:', email);
      console.log('🔑 New password:', newPassword);
      
      // Verify the password works
      const user = await User.findOne({ email });
      const isValid = await bcrypt.compare(newPassword, user.password);
      console.log('🔐 Password verification:', isValid ? 'SUCCESS' : 'FAILED');
      
      console.log('👤 User details:', {
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified
      });
    } else {
      console.log('❌ User not found or password not updated');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();