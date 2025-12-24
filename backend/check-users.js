require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/schemas/User');

async function checkUsers() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');
        
        const users = await User.find({}, { password: 0 }); // Exclude password from output
        console.log('\n=== EXISTING USERS ===');
        
        if (users.length === 0) {
            console.log('No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Name: ${user.name || 'N/A'}`);
                console.log(`   Approved: ${user.isApproved !== false}`);
                console.log(`   Email Verified: ${user.isEmailVerified || false}`);
                console.log('');
            });
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
}

checkUsers();