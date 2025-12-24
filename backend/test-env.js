require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'NOT SET');

console.log('\n=== Full MONGODB_URI (first 50 chars) ===');
console.log(process.env.MONGODB_URI?.substring(0, 50) + '...' || 'NOT SET');

console.log('\n=== Attempting MongoDB connection ===');
const mongoose = require('mongoose');

async function testConnection() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manager';
        console.log('Using URI:', uri.substring(0, 50) + '...');
        
        await mongoose.connect(uri);
        console.log('✅ Connected successfully!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();