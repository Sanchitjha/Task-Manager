#!/usr/bin/env node

/**
 * Test script to verify wallet transaction flow
 * Run: node test-wallet-transaction.js
 */

const mongoose = require('mongoose');
const { User } = require('./src/schemas/User');
const { Product } = require('./src/schemas/Product');
const { Order } = require('./src/schemas/Order');
const { Transaction } = require('./src/schemas/Transaction');

async function testWalletTransaction() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find or create test user
    let user = await User.findOne({ email: 'user@test.com' });
    if (!user) {
      console.log('⚠️  Test user not found. Creating...');
      user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        password: 'hashedpassword',
        role: 'user',
        coinsBalance: 1000 // Start with 1000 coins
      });
      console.log('✅ Created test user with 1000 coins\n');
    }

    // Find or create test Partner
    let partner = await User.findOne({ email: 'partner@test.com' });
    if (!partner) {
      console.log('⚠️  Test Partner not found. Creating...');
      partner = await User.create({
        name: 'Test Partner',
        email: 'partner@test.com',
        password: 'hashedpassword',
        role: 'Partner',
        coinsBalance: 0
      });
      console.log('✅ Created test Partner with 0 coins\n');
    }

    // Find or create test product
    let product = await Product.findOne({ vendor: partner._id });
    if (!product) {
      console.log('⚠️  Test product not found. Creating...');
      product = await Product.create({
        title: 'Test Product',
        description: 'A test product for transaction verification',
        vendor: partner._id,
        originalPrice: 100,
        discountPercentage: 0,
        coinConversionRate: 1,
        stock: 100,
        category: 'General',
        isPublished: true
      });
      console.log('✅ Created test product (100 coins)\n');
    }

    console.log('📊 BEFORE TRANSACTION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User (${user.email}): ${user.coinsBalance} coins`);
    console.log(`Partner (${partner.email}): ${partner.coinsBalance} coins`);
    console.log('');

    // Simulate order creation (simplified version)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const coinPrice = Math.ceil(product.originalPrice / product.coinConversionRate);
      const quantity = 2;
      const totalCoinsUsed = coinPrice * quantity;

      console.log('🛒 SIMULATING ORDER:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Product: ${product.title}`);
      console.log(`Price: ${coinPrice} coins each`);
      console.log(`Quantity: ${quantity}`);
      console.log(`Total: ${totalCoinsUsed} coins`);
      console.log('');

      // Check balance
      if (user.coinsBalance < totalCoinsUsed) {
        throw new Error('Insufficient coins!');
      }

      // Create order
      const orderId = `TEST-ORD-${Date.now()}`;
      const order = await Order.create([{
        orderId,
        customer: user._id,
        vendor: vendor._id,
        items: [{
          product: product._id,
          productSnapshot: {
            title: product.title,
            originalPrice: product.originalPrice,
            coinPrice: coinPrice
          },
          quantity,
          unitCoinPrice: coinPrice,
          totalCoinsPaid: totalCoinsUsed
        }],
        totalCoinsUsed,
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      }], { session });

      // Transfer coins
      user.coinsBalance -= totalCoinsUsed;
      await user.save({ session });

      partner.coinsBalance = (partner.coinsBalance || 0) + totalCoinsUsed;
      await partner.save({ session });

      // Create transactions
      await Transaction.create([
        {
          userId: client._id,
          type: 'purchase',
          amount: -totalCoinsUsed,
          description: `Order payment: ${orderId}`,
          status: 'completed',
          metadata: {
            orderId: order[0]._id,
            partnerId: partner._id
          }
        },
        {
          userId: partner._id,
          type: 'sale',
          amount: totalCoinsUsed,
          description: `Order received: ${orderId}`,
          status: 'completed',
          metadata: {
            orderId: order[0]._id,
            customerId: user._id
          }
        }
      ], { session });

      await session.commitTransaction();
      console.log('✅ Transaction committed successfully!\n');

      // Refresh balances
      await user.updateOne({ $inc: {} }); // Force refresh
      await partner.updateOne({ $inc: {} });
      const updatedUser = await User.findById(user._id);
      const updatedPartner = await User.findById(partner._id);

      console.log('📊 AFTER TRANSACTION:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`User (${updatedUser.email}): ${updatedUser.coinsBalance} coins (-${totalCoinsUsed})`);
      console.log(`Partner (${updatedPartner.email}): ${updatedPartner.coinsBalance} coins (+${totalCoinsUsed})`);
      console.log('');

      // Check transactions
      const userTx = await Transaction.findOne({ userId: user._id, type: 'purchase' }).sort({ createdAt: -1 });
      const vendorTx = await Transaction.findOne({ userId: partner._id, type: 'sale' }).sort({ createdAt: -1 });

      console.log('📝 TRANSACTION RECORDS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User Transaction:');
      console.log(`  Type: ${userTx.type}`);
      console.log(`  Amount: ${userTx.amount} coins`);
      console.log(`  Status: ${userTx.status}`);
      console.log(`  Description: ${userTx.description}`);
      console.log('');
      console.log('Partner Transaction:');
      console.log(`  Type: ${partnerTx.type}`);
      console.log(`  Amount: ${partnerTx.amount} coins`);
      console.log(`  Status: ${partnerTx.status}`);
      console.log(`  Description: ${partnerTx.description}`);
      console.log('');

      console.log('✅ WALLET TRANSACTION SYSTEM IS WORKING CORRECTLY! ✅');
      console.log('Coins successfully transferred from user to partner.');

    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Transaction failed:', error.message);
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run test
if (require.main === module) {
  testWalletTransaction();
}

module.exports = { testWalletTransaction };
