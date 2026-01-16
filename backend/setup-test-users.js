require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function setupUsers() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('🔗 Connected to new MongoDB Atlas cluster');
        
        // Define User schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: { type: String, enum: ['user', 'Partner', 'admin', 'subadmin'], default: 'user' },
            isApproved: { type: Boolean, default: true },
            isEmailVerified: { type: Boolean, default: true },
            coinsBalance: { type: Number, default: 100 },
            walletBalance: { type: Number, default: 0 }
        });
        
        const User = mongoose.model('User', userSchema);
        
        console.log('🚀 Creating test users...\n');
        
        // Test users to create
        const testUsers = [
            {
                name: 'Partner User',
                email: 'Jha1947.sj@gmail.com',
                password: 'Sm@522002',
                role: 'Partner',
                coinsBalance: 0
            },
            {
                name: 'User Account',
                email: 'user@test.com',
                password: 'password123',
                role: 'user',
                coinsBalance: 500
            },
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin',
                coinsBalance: 0
            },
            {
                name: 'Sub Admin User',
                email: 'subadmin@test.com',
                password: 'subadmin123',
                role: 'subadmin',
                coinsBalance: 0
            }
        ];
        
        for (const userData of testUsers) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ email: userData.email });
                
                if (existingUser) {
                    console.log(`⚠️  User ${userData.email} already exists, updating password...`);
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    await User.updateOne(
                        { email: userData.email },
                        { password: hashedPassword }
                    );
                    console.log(`✅ Password updated for ${userData.email}`);
                } else {
                    // Create new user
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    const user = await User.create({
                        ...userData,
                        password: hashedPassword
                    });
                    console.log(`✅ Created new user: ${user.email} (${user.role})`);
                }
                
                // Test password
                const user = await User.findOne({ email: userData.email });
                const passwordMatch = await bcrypt.compare(userData.password, user.password);
                console.log(`🔑 Password test for ${userData.email}: ${passwordMatch ? 'PASS ✅' : 'FAIL ❌'}`);
                
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⚠️  User ${userData.email} already exists (duplicate key)`);
                } else {
                    console.error(`❌ Error creating ${userData.email}:`, error.message);
                }
            }
            console.log('');
        }
        
        console.log('📝 LOGIN CREDENTIALS:');
        console.log('═══════════════════════');
        console.log('🤝 PARTNER:');
        console.log('  Email: Jha1947.sj@gmail.com');
        console.log('  Password: Sm@522002');
        console.log('');
        console.log('👤 USER:');
        console.log('  Email: user@test.com');
        console.log('  Password: password123');
        console.log('');
        console.log('👑 ADMIN:');
        console.log('  Email: admin@test.com');
        console.log('  Password: admin123');
        console.log('');
        console.log('⚡ SUB ADMIN:');
        console.log('  Email: subadmin@test.com');
        console.log('  Password: subadmin123');
        console.log('');
        
        await mongoose.connection.close();
        console.log('🎉 Setup complete! You can now login with any of the above accounts.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setupUsers();