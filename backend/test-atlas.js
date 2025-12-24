const mongoose = require('mongoose');

async function testAtlasConnection() {
    try {
        console.log('Testing MongoDB Atlas connection...');
        
        const uri = 'mongodb+srv://myAtlasDBUser:Sanchit2025@myatlasclusteredu.ulekkk7.mongodb.net/dev-blog?retryWrites=true&w=majority&appName=myAtlasClusterEDU';
        
        await mongoose.connect(uri);
        console.log('✅ MongoDB Atlas connected successfully!');
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({ test: String });
        const Test = mongoose.model('Test', testSchema);
        
        const doc = new Test({ test: 'connection test' });
        await doc.save();
        console.log('✅ Database write test successful!');
        
        await Test.deleteOne({ _id: doc._id });
        console.log('✅ Database delete test successful!');
        
        await mongoose.connection.close();
        console.log('✅ Connection closed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.log('❌ MongoDB Atlas connection failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('\n🔑 Authentication issue - check username/password');
        }
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n🌐 Network issue - check internet connection');
        }
        if (error.message.includes('timeout')) {
            console.log('\n⏰ Timeout - Atlas cluster might be paused');
        }
        
        process.exit(1);
    }
}

testAtlasConnection();