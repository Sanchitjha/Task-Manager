require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function updatePassword() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');
        
        // Define User schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String
        });
        
        const User = mongoose.model('User', userSchema);
        
        const email = 'Jha1947.sj@gmail.com';
        const newPassword = 'Sm@522002';
        
        console.log(`Updating password for ${email}`);
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const result = await User.updateOne(
            { email },
            { password: hashedPassword }
        );
        
        console.log('Update result:', result);
        
        // Test the updated password
        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log(`\n🔑 Password test: ${isMatch ? 'PASS' : 'FAIL'}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updatePassword();