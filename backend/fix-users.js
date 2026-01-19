const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	role: String,
	coinsBalance: Number,
	walletBalance: Number,
	isApproved: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixUsers() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('Connected to MongoDB');

		// Fix users with undefined roles
		await User.updateMany(
			{ role: { $exists: false } },
			{ $set: { role: 'user', isApproved: true } }
		);

		// Fix clients and admins without isApproved
		await User.updateMany(
			{ role: { $in: ['user', 'admin'] }, isApproved: { $ne: true } },
			{ $set: { isApproved: true } }
		);

		// Fix missing coinsBalance
		await User.updateMany(
			{ coinsBalance: { $exists: false } },
			{ $set: { coinsBalance: 0 } }
		);

		// Fix missing walletBalance
		await User.updateMany(
			{ walletBalance: { $exists: false } },
			{ $set: { walletBalance: 0 } }
		);

		console.log('✅ Fixed user data');

		// Display all users
		const users = await User.find({});
		console.log(`\n📊 Total users: ${users.length}`);
		users.forEach(u => {
			console.log(`👤 ${u.email} - Role: ${u.role} - Approved: ${u.isApproved} - Coins: ${u.coinsBalance}`);
		});

		// Create a test admin if none exists
		const adminExists = await User.findOne({ role: 'admin', isApproved: true });
		if (!adminExists) {
			const hashedPassword = await bcrypt.hash('admin123', 10);
			await User.create({
				name: 'Test Admin',
				email: 'admin@test.com',
				password: hashedPassword,
				role: 'admin',
				isApproved: true,
				coinsBalance: 1000,
				walletBalance: 500
			});
			console.log('\n✅ Created test admin: admin@test.com / admin123');
		}

		// Create a test user if needed
		const clientExists = await User.findOne({ email: 'test@test.com' });
		if (!clientExists) {
			const hashedPassword = await bcrypt.hash('test123', 10);
			await User.create({
				name: 'Test User',
				email: 'test@test.com',
				password: hashedPassword,
				role: 'user',
				isApproved: true,
				coinsBalance: 100,
				walletBalance: 50
			});
			console.log('✅ Created test user: test@test.com / test123');
		}

		await mongoose.disconnect();
		console.log('\n🎉 All done! You can now login with:');
		console.log('Admin: admin@test.com / admin123');
		console.log('Client: test@test.com / test123');
		console.log('Or use any existing user from the list above');
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

fixUsers();