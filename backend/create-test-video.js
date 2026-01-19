require('dotenv').config();
const mongoose = require('mongoose');
const { Video } = require('./src/schemas/Video');

async function createTestVideo() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');
        
        // Create a test video with 1 minute duration for easy testing
        const testVideo = {
            title: 'Test Video - Auto Coin System',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample YouTube URL
            duration: 180, // 3 minutes
            description: 'Test video to verify the auto-coin system works correctly',
            coinsPerInterval: 5,
            intervalDuration: 60,
            useTimeBased: true,
            coinsReward: 15, // 3 minutes × 5 coins
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            isActive: true
        };
        
        // Check if test video already exists
        const existing = await Video.findOne({ title: testVideo.title });
        
        if (existing) {
            console.log('✅ Test video already exists');
            console.log('Title:', existing.title);
            console.log('Duration:', existing.duration, 'seconds');
            console.log('Coins per minute:', existing.coinsPerInterval);
        } else {
            const video = await Video.create(testVideo);
            console.log('✅ Test video created successfully!');
            console.log('Title:', video.title);
            console.log('Duration:', video.duration, 'seconds');
            console.log('Coins per minute:', video.coinsPerInterval);
            console.log('Total possible coins:', video.coinsReward);
        }
        
        console.log('\n📹 Test the auto-coin system:');
        console.log('1. Login as a user');
        console.log('2. Go to the Earn page');
        console.log('3. Select the test video');
        console.log('4. Play for 1+ minute to see auto-rewards');
        console.log('5. Check your coin balance increases every minute');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestVideo();