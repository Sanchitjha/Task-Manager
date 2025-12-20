const bcrypt = require('bcrypt');
const { connectMongo } = require('./src/lib/mongo');
const User = require('./src/schemas/User');

async function updatePassword() {
    try {
        await connectMongo();
        console.log('Connected to MongoDB');
        
        const email = 'Jha1947.sj@gmail.com';
        const newPassword = 'Sm@522002'; // The password from the frontend
        
        console.log(`Updating password for ${email} to: ${newPassword}`);
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New hashed password:', hashedPassword);
        
        const result = await User.updateOne(
            { email },
            { password: hashedPassword }
        );
        
        console.log('Update result:', result);
        
        // Test the password immediately
        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log(`Password test: ${newPassword} matches stored hash: ${isMatch}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updatePassword();