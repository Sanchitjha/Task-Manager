require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');
        
        // Define User schema directly
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: { type: String, enum: ['client', 'vendor', 'admin', 'subadmin'], default: 'client' },
            isApproved: { type: Boolean, default: true },
            isEmailVerified: { type: Boolean, default: false },
            coinsBalance: { type: Number, default: 0 },
            walletBalance: { type: Number, default: 0 }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Check if user exists
        const existingUser = await User.findOne({ email: 'Jha1947.sj@gmail.com' });
        
        if (existingUser) {
            console.log('✅ User already exists:');
            console.log(`Email: ${existingUser.email}`);
            console.log(`Role: ${existingUser.role}`);
            console.log(`Name: ${existingUser.name}`);
        } else {
            console.log('Creating new test user...');
            
            const hashedPassword = await bcrypt.hash('Sm@522002', 10);
            const user = await User.create({
                name: 'Test Vendor',
                email: 'Jha1947.sj@gmail.com',
                password: hashedPassword,
                role: 'vendor',
                isApproved: true,
                isEmailVerified: true
            });
            
            console.log('✅ Test user created:');
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Name: ${user.name}`);
        }
        
        // Test password
        const user = await User.findOne({ email: 'Jha1947.sj@gmail.com' });
        const passwordMatch = await bcrypt.compare('Sm@522002', user.password);
        console.log(`\n🔑 Password test: ${passwordMatch ? 'PASS' : 'FAIL'}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();