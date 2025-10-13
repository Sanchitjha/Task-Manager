// Script to update existing users with new coinsBalance field
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	profileImage: String,
	role: String,
	walletBalance: Number,
	coinsBalance: Number,
	transferOverride: {
		sendBlocked: Boolean,
		receiveBlocked: Boolean
	}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function migrateUsers() {
	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manager');
		console.log('Connected to MongoDB');

		// Update all users that don't have coinsBalance field
		const result = await User.updateMany(
			{ coinsBalance: { $exists: false } },
			{ $set: { coinsBalance: 0 } }
		);

		console.log(`Updated ${result.modifiedCount} users with coinsBalance field`);

		await mongoose.disconnect();
		console.log('Migration complete!');
		process.exit(0);
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

migrateUsers();
