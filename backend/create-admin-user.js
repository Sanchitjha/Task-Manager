const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('./src/schemas/User');
const { connectMongo } = require('./src/lib/mongo');

const app = express();

async function createAdminUser() {
    try {
        await connectMongo();
        console.log('Connected to database');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@test.com');
            console.log('Try logging in now.');
            process.exit(0);
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            email: 'admin@test.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
            coinsBalance: 1000,
            walletBalance: 1000,
            isVerified: true,
            isEmailVerified: true,
            isApproved: true
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@test.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('You can now login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdminUser();