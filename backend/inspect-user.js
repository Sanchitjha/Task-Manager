const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
require('dotenv').config();

async function inspectUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    const email = 'Jha1947.sj@gmail.com';
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return process.exit(1);
    }
    
    console.log('👤 User details:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Password Hash Length:', user.password ? user.password.length : 0);
    console.log('  Password Hash Preview:', user.password ? user.password.substring(0, 10) + '...' : 'No password');
    
    // Test multiple common passwords
    const testPasswords = ['password123', 'Password123', '123456', 'admin', 'test123'];
    
    console.log('\n🔐 Testing passwords:');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`  "${pwd}": ${isValid ? '✅ MATCH' : '❌ No match'}`);
    }
    
    // Create a new password hash manually and test
    console.log('\n🔧 Creating fresh password hash...');
    const freshHash = await bcrypt.hash('password123', 10);
    const freshTest = await bcrypt.compare('password123', freshHash);
    console.log('  Fresh hash test:', freshTest ? '✅ SUCCESS' : '❌ FAILED');
    
    // Replace the user's password with fresh hash
    await User.updateOne({ email }, { password: freshHash });
    console.log('  Updated user password with fresh hash');
    
    // Test again with updated user
    const updatedUser = await User.findOne({ email });
    const finalTest = await bcrypt.compare('password123', updatedUser.password);
    console.log('  Final test with updated hash:', finalTest ? '✅ SUCCESS' : '❌ FAILED');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

inspectUser();