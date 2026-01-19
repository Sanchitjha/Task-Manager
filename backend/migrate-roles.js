const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateRoles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Count existing users with old roles
    const clientCount = await usersCollection.countDocuments({ role: 'client' });
    const vendorCount = await usersCollection.countDocuments({ role: 'vendor' });
    
    console.log(`\nFound ${clientCount} users with role 'client'`);
    console.log(`Found ${vendorCount} users with role 'vendor'`);
    
    if (clientCount === 0 && vendorCount === 0) {
      console.log('\n✅ No users need migration. All roles are already updated!');
      return;
    }
    
    // Migrate client → user
    if (clientCount > 0) {
      const clientResult = await usersCollection.updateMany(
        { role: 'client' },
        { $set: { role: 'user' } }
      );
      console.log(`\n✅ Updated ${clientResult.modifiedCount} users from 'client' to 'user'`);
    }
    
    // Migrate vendor → partner
    if (vendorCount > 0) {
      const vendorResult = await usersCollection.updateMany(
        { role: 'vendor' },
        { $set: { role: 'partner' } }
      );
      console.log(`✅ Updated ${vendorResult.modifiedCount} users from 'vendor' to 'partner'`);
    }
    
    // Verify migration
    const userCount = await usersCollection.countDocuments({ role: 'user' });
    const partnerCount = await usersCollection.countDocuments({ role: 'partner' });
    const adminCount = await usersCollection.countDocuments({ role: 'admin' });
    const subadminCount = await usersCollection.countDocuments({ role: 'subadmin' });
    
    console.log('\n📊 Current Role Distribution:');
    console.log(`   - Admin: ${adminCount}`);
    console.log(`   - SubAdmin: ${subadminCount}`);
    console.log(`   - User: ${userCount}`);
    console.log(`   - Partner: ${partnerCount}`);
    
    // Check for any remaining old roles
    const oldClientCount = await usersCollection.countDocuments({ role: 'client' });
    const oldVendorCount = await usersCollection.countDocuments({ role: 'vendor' });
    
    if (oldClientCount > 0 || oldVendorCount > 0) {
      console.log('\n⚠️ Warning: Some users still have old roles!');
      console.log(`   - client: ${oldClientCount}`);
      console.log(`   - vendor: ${oldVendorCount}`);
    } else {
      console.log('\n✅ Migration completed successfully! All roles updated.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run migration
console.log('🚀 Starting role migration...');
console.log('   client → user');
console.log('   vendor → partner\n');

migrateRoles()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
