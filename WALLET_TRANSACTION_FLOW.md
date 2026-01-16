# Wallet Transaction Flow Documentation

## ✅ Transaction System - ACTIVE and WORKING

### 🎯 Purpose: Customer Discount System

**Important:** Coins are used exclusively to provide discounts to customers. Partners earn coins as a metric of sales performance, but **cannot withdraw them as real money**. The system tracks Partner earnings for analytics and performance monitoring only.

### 🔄 How Coin Transfer Works

When a user purchases a product from a Partner, the following transaction flow occurs automatically:

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

#### Step 2: Add to Partner
```javascript
partner.coinsBalance = (partner.coinsBalance || 0) + totalCoinsUsed;
await partner.save({ session });
```

#### Step 3: Create Transaction Records
Two transaction records are created:

**User Transaction:**
- Type: `purchase`
- Amount: `-totalCoinsUsed` (negative)
- Description: "Order payment: ORD-xxxxx"
- Metadata: Contains orderId, partnerId, itemCount

**Partner Transaction:**
- Type: `sale`
- Amount: `+totalCoinsUsed` (positive)
- Description: "Order received: ORD-xxxxx"
- Metadata: Contains orderId, customerId, itemCount

### 3. Transaction Schema Updates

The Transaction schema now supports:
- ✅ `purchase` - User buying products
- ✅ `sale` - Partner receiving payment
- ✅ `earn` - User earning from videos
- ✅ `redeem` - Converting coins to wallet balance
- ✅ `withdrawal` - Partner withdrawing funds
- ✅ `refund` - Returning coins to user
- ✅ `transfer_send` / `transfer_receive` - P2P transfers

### 4. Partner Wallet Features

#### Available Endpoints:

1. **GET `/api/partner/wallet`**
   - Returns current balance (coins earned from sales)
   - Shows pending earnings (orders in processing)
   - Lists total lifetime earnings
   - Displays transaction history (sales and refunds)

2. **GET `/api/partner/analytics`**
   - Time-based analytics (week/month/year)
   - Total revenue in coins
   - Top-selling products
   - Recent orders summary

**Note:** Withdrawal functionality has been removed. Coins serve as a performance metric and customer discount mechanism only.

### 5. Frontend Pages

#### User Wallet (`/wallet`)
- Shows coins balance and wallet balance
- Lists all transactions (earn, purchase, redeem)
- Redeem coins to wallet balance (100 coins = ₹1)

#### Partner Wallet (`/seller/wallet`)
- Shows earned coins from sales (performance metric)
- Displays pending earnings from processing orders
- Shows total lifetime earnings
- Complete transaction history (sales and refunds)
- Analytics links for detailed business insights

**Note:** Partners track earnings but cannot withdraw. Coins remain in the system to provide customer discounts.

#### Partner Analytics (`/seller/analytics`)
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

1. **Create Test User & Partner:**
   ```bash
   cd backend
   node setup-test-users.js
   ```

2. **Give User Some Coins:**
   - User watches videos to earn coins
   - OR admin can credit coins directly

3. **Partner Creates Product:**
   - Login as Partner
   - Create product with price

4. **User Purchases Product:****
   - Browse products
   - Add to cart
   - Checkout with coins

5. **Verify Transaction:**
   - Check user wallet: coins deducted
   - Check Partner wallet: coins added
   - Both should see transaction records

### 8. Example Transaction Flow

```
Initial State:
- User: 1000 coins
- Partner: 500 coins

User buys product for 200 coins:
→ User Transaction: -200 (type: purchase)
→ Partner Transaction: +200 (type: sale)

Final State:
- User: 800 coins
- Partner: 700 coins
```

### 9. Error Scenarios Handled

- ❌ Insufficient user balance → Order rejected, no deduction
- ❌ Out of stock → Order rejected, no deduction
- ❌ Database error → Full rollback, no partial transactions
- ❌ Invalid order data → Validation error, no processing

### 10. System Design Philosophy

**Coin Economy:**
- Users earn coins by watching videos
- Users spend coins to get discounts on products
- Partners receive coins as a sales performance metric
- Coins stay in the system to maintain the discount economy
- Partners benefit from increased sales volume due to coin-based discounts

**Why No Partner Withdrawals:**
- Coins are a customer loyalty/discount mechanism, not real currency
- Partners earn regular revenue from product sales (set in prices)
- Coin system encourages customer engagement and repeat purchases
- Keeps the discount ecosystem sustainable

---

## 🎯 Summary

**The wallet transaction system is FULLY FUNCTIONAL:**

✅ Coins transfer from user to Partner on purchase
✅ Both parties see transaction records  
✅ Atomic operations ensure data consistency
✅ Complete audit trail maintained
✅ Partner earnings tracked for analytics
✅ **Coins provide customer discounts, not withdrawable cash**
✅ System encourages customer engagement through coin-earning

**Purpose:** Create a sustainable discount ecosystem where customers earn and spend coins, Partners track performance, and everyone benefits from increased engagement and sales.
