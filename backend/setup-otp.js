const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	phone: String,
	isPhoneVerified: Boolean,
	profileImage: String,
	role: String,
	coinsBalance: Number,
	walletBalance: Number,
	isApproved: Boolean,
	otpCode: String,
	otpExpiry: Date,
	otpAttempts: Number,
	approvedBy: mongoose.Schema.Types.ObjectId,
	approvedAt: Date,
	addedBy: mongoose.Schema.Types.ObjectId,
	transferOverride: {
		sendBlocked: Boolean,
		receiveBlocked: Boolean
	}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateUsersForOTP() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('Connected to MongoDB');

		// Update existing users to add phone fields
		const result = await User.updateMany(
			{ 
				$or: [
					{ phone: { $exists: false } },
					{ isPhoneVerified: { $exists: false } }
				]
			},
			{ 
				$set: { 
					phone: null,
					isPhoneVerified: false,
					otpAttempts: 0
				}
			}
		);

		console.log(`✅ Updated ${result.modifiedCount} users with OTP fields`);

		// Create admin user with verified phone if not exists
		const adminExists = await User.findOne({ role: 'admin', email: 'admin@test.com' });
		if (adminExists && !adminExists.phone) {
			adminExists.phone = '+1234567890';
			adminExists.isPhoneVerified = true;
			await adminExists.save();
			console.log('✅ Updated admin with phone number');
		}

		// Display all users with phone status
		const users = await User.find({}).select('name email phone isPhoneVerified role');
		console.log('\n📊 Users with Phone Status:');
		users.forEach(u => {
			console.log(`👤 ${u.name} (${u.email}) - Phone: ${u.phone || 'Not set'} - Verified: ${u.isPhoneVerified ? '✅' : '❌'} - Role: ${u.role}`);
		});

		await mongoose.disconnect();
		console.log('\n🎉 OTP system setup complete!');
		console.log('\n📱 How to test:');
		console.log('1. Go to registration page');
		console.log('2. Enter phone number and click "Send OTP"');
		console.log('3. Check terminal console for mock OTP code');
		console.log('4. Enter OTP and complete registration');
		console.log('5. Phone number will show in user profile');

	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

updateUsersForOTP();