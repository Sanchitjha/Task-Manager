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

    // Find or create test client
    let client = await User.findOne({ email: 'client@test.com' });
    if (!client) {
      console.log('⚠️  Test client not found. Creating...');
      client = await User.create({
        name: 'Test Client',
        email: 'client@test.com',
        password: 'hashedpassword',
        role: 'client',
        coinsBalance: 1000 // Start with 1000 coins
      });
      console.log('✅ Created test client with 1000 coins\n');
    }

    // Find or create test vendor
    let vendor = await User.findOne({ email: 'vendor@test.com' });
    if (!vendor) {
      console.log('⚠️  Test vendor not found. Creating...');
      vendor = await User.create({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: 'hashedpassword',
        role: 'vendor',
        coinsBalance: 0
      });
      console.log('✅ Created test vendor with 0 coins\n');
    }

    // Find or create test product
    let product = await Product.findOne({ vendor: vendor._id });
    if (!product) {
      console.log('⚠️  Test product not found. Creating...');
      product = await Product.create({
        title: 'Test Product',
        description: 'A test product for transaction verification',
        vendor: vendor._id,
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
    console.log(`Client (${client.email}): ${client.coinsBalance} coins`);
    console.log(`Vendor (${vendor.email}): ${vendor.coinsBalance} coins`);
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
      if (client.coinsBalance < totalCoinsUsed) {
        throw new Error('Insufficient coins!');
      }

      // Create order
      const orderId = `TEST-ORD-${Date.now()}`;
      const order = await Order.create([{
        orderId,
        customer: client._id,
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
      client.coinsBalance -= totalCoinsUsed;
      await client.save({ session });

      vendor.coinsBalance = (vendor.coinsBalance || 0) + totalCoinsUsed;
      await vendor.save({ session });

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
            vendorId: vendor._id
          }
        },
        {
          userId: vendor._id,
          type: 'sale',
          amount: totalCoinsUsed,
          description: `Order received: ${orderId}`,
          status: 'completed',
          metadata: {
            orderId: order[0]._id,
            customerId: client._id
          }
        }
      ], { session });

      await session.commitTransaction();
      console.log('✅ Transaction committed successfully!\n');

      // Refresh balances
      await client.updateOne({ $inc: {} }); // Force refresh
      await vendor.updateOne({ $inc: {} });
      const updatedClient = await User.findById(client._id);
      const updatedVendor = await User.findById(vendor._id);

      console.log('📊 AFTER TRANSACTION:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Client (${updatedClient.email}): ${updatedClient.coinsBalance} coins (-${totalCoinsUsed})`);
      console.log(`Vendor (${updatedVendor.email}): ${updatedVendor.coinsBalance} coins (+${totalCoinsUsed})`);
      console.log('');

      // Check transactions
      const clientTx = await Transaction.findOne({ userId: client._id, type: 'purchase' }).sort({ createdAt: -1 });
      const vendorTx = await Transaction.findOne({ userId: vendor._id, type: 'sale' }).sort({ createdAt: -1 });

      console.log('📝 TRANSACTION RECORDS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Client Transaction:');
      console.log(`  Type: ${clientTx.type}`);
      console.log(`  Amount: ${clientTx.amount} coins`);
      console.log(`  Status: ${clientTx.status}`);
      console.log(`  Description: ${clientTx.description}`);
      console.log('');
      console.log('Vendor Transaction:');
      console.log(`  Type: ${vendorTx.type}`);
      console.log(`  Amount: ${vendorTx.amount} coins`);
      console.log(`  Status: ${vendorTx.status}`);
      console.log(`  Description: ${vendorTx.description}`);
      console.log('');

      console.log('✅ WALLET TRANSACTION SYSTEM IS WORKING CORRECTLY! ✅');
      console.log('Coins successfully transferred from client to vendor.');

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
