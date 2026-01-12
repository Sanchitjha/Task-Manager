# Wallet Transaction Flow Documentation

## ✅ Transaction System is ACTIVE and WORKING

### 🔄 How Coin Transfer Works

When a client purchases a product from a vendor, the following transaction flow occurs automatically:

### 1. Order Creation (`/backend/src/routes/orders.js`)

```
Client Places Order
    ↓
System validates stock & calculates total coins needed
    ↓
Checks if client has sufficient coins
    ↓
Creates order with transaction session (atomic operation)
```

### 2. Coin Transfer Process

#### Step 1: Deduct from Client
```javascript
user.coinsBalance -= totalCoinsUsed;
await user.save({ session });
```

#### Step 2: Add to Vendor
```javascript
vendor.coinsBalance = (vendor.coinsBalance || 0) + totalCoinsUsed;
await vendor.save({ session });
```

#### Step 3: Create Transaction Records
Two transaction records are created:

**Client Transaction:**
- Type: `purchase`
- Amount: `-totalCoinsUsed` (negative)
- Description: "Order payment: ORD-xxxxx"
- Metadata: Contains orderId, vendorId, itemCount

**Vendor Transaction:**
- Type: `sale`
- Amount: `+totalCoinsUsed` (positive)
- Description: "Order received: ORD-xxxxx"
- Metadata: Contains orderId, customerId, itemCount

### 3. Transaction Schema Updates

The Transaction schema now supports:
- ✅ `purchase` - Client buying products
- ✅ `sale` - Vendor receiving payment
- ✅ `earn` - Client earning from videos
- ✅ `redeem` - Converting coins to wallet balance
- ✅ `withdrawal` - Vendor withdrawing funds
- ✅ `refund` - Returning coins to client
- ✅ `transfer_send` / `transfer_receive` - P2P transfers

### 4. Vendor Wallet Features

#### Available Endpoints:

1. **GET `/api/vendor/wallet`**
   - Returns current balance
   - Shows pending earnings (orders in processing)
   - Lists total lifetime earnings
   - Displays transaction history
   - Includes saved bank details

2. **POST `/api/vendor/wallet/withdraw`**
   - Minimum: 100 coins
   - Requires bank details
   - Creates withdrawal transaction (pending status)
   - Deducts coins from vendor balance

3. **POST `/api/vendor/wallet/bank-details`**
   - Saves bank account information
   - Required for withdrawals

4. **GET `/api/vendor/analytics`**
   - Time-based analytics (week/month/year)
   - Total revenue in coins
   - Top-selling products
   - Recent orders summary

### 5. Frontend Pages

#### Client Wallet (`/wallet`)
- Shows coins balance and wallet balance
- Lists all transactions (earn, purchase, redeem)
- Redeem coins to wallet balance (100 coins = ₹1)

#### Vendor Wallet (`/seller/wallet`)
- Shows available balance
- Displays pending earnings from processing orders
- Shows total lifetime earnings
- Withdrawal system with bank details
- Complete transaction history

#### Vendor Analytics (`/seller/analytics`)
- Revenue tracking
- Order statistics
- Top products performance
- Sales trends

### 6. Transaction Safety Features

✅ **Atomic Operations**: Uses MongoDB sessions to ensure all-or-nothing transactions

✅ **Balance Validation**: Checks sufficient coins before processing

✅ **Stock Management**: Updates product stock atomically with payment

✅ **Audit Trail**: Complete transaction history for both parties

✅ **Error Handling**: Rollback on any failure in the transaction chain

### 7. Testing the Flow

To verify coin transfers are working:

1. **Create Test Client & Vendor:**
   ```bash
   cd backend
   node setup-test-users.js
   ```

2. **Give Client Some Coins:**
   - Client watches videos to earn coins
   - OR admin can credit coins directly

3. **Vendor Creates Product:**
   - Login as vendor
   - Create product with price

4. **Client Purchases Product:**
   - Browse products
   - Add to cart
   - Checkout with coins

5. **Verify Transaction:**
   - Check client wallet: coins deducted
   - Check vendor wallet: coins added
   - Both should see transaction records

### 8. Example Transaction Flow

```
Initial State:
- Client: 1000 coins
- Vendor: 500 coins

Client buys product for 200 coins:
→ Client Transaction: -200 (type: purchase)
→ Vendor Transaction: +200 (type: sale)

Final State:
- Client: 800 coins
- Vendor: 700 coins
```

### 9. Error Scenarios Handled

- ❌ Insufficient client balance → Order rejected, no deduction
- ❌ Out of stock → Order rejected, no deduction
- ❌ Database error → Full rollback, no partial transactions
- ❌ Invalid order data → Validation error, no processing

### 10. Future Enhancements

Possible improvements:
- [ ] Commission system (platform fee)
- [ ] Escrow for disputed orders
- [ ] Automated vendor payouts
- [ ] Multi-currency support
- [ ] Loyalty rewards/cashback

---

## 🎯 Summary

**The wallet transaction system is FULLY FUNCTIONAL:**

✅ Coins transfer from client to vendor on purchase
✅ Both parties see transaction records
✅ Atomic operations ensure data consistency
✅ Complete audit trail maintained
✅ Vendor can withdraw earnings
✅ Analytics track all revenue

**All transactions are logged and traceable in the database.**
