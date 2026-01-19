const cron = require('node-cron');
const { ProductSubscription } = require('../schemas/ProductSubscription');
const { Product } = require('../schemas/Product');
const { User } = require('../schemas/User');

// Create notification helper (you can integrate with your notification system)
async function sendExpiryNotification(partner, admin, product, subscription) {
  try {
    console.log(`[NOTIFICATION] Subscription expired for product: ${product.title}`);
    console.log(`  - Partner: ${partner.email}`);
    console.log(`  - Product ID: ${product._id}`);
    console.log(`  - Expired on: ${subscription.endDate}`);
    
    // TODO: Integrate with your notification system
    // Examples:
    // - Send email to partner and admin
    // - Create in-app notification
    // - Send SMS/push notification
    
    // For now, just log it
    return true;
  } catch (error) {
    console.error('Error sending expiry notification:', error);
    return false;
  }
}

// Check for expired subscriptions
async function checkExpiredSubscriptions() {
  try {
    console.log('[CRON] Checking for expired subscriptions...');
    
    const now = new Date();
    
    // Find active subscriptions that have expired
    const expiredSubscriptions = await ProductSubscription.find({
      status: 'active',
      endDate: { $lte: now },
      isDeleted: false
    }).populate('product').populate('vendor', 'name email');
    
    if (expiredSubscriptions.length === 0) {
      console.log('[CRON] No expired subscriptions found');
      return;
    }
    
    console.log(`[CRON] Found ${expiredSubscriptions.length} expired subscriptions`);
    
    // Get admin users
    const admins = await User.find({ role: 'admin' });
    
    // Process each expired subscription
    for (const subscription of expiredSubscriptions) {
      try {
        // Update subscription status
        subscription.status = 'expired';
        await subscription.save();
        
        // Unpublish the product
        const product = await Product.findById(subscription.product);
        if (product) {
          product.isPublished = false;
          product.currentSubscription = null;
          await product.save();
          
          console.log(`[CRON] Unpublished product: ${product.title}`);
        }
        
        // Send notifications if not already sent
        if (!subscription.expiryNotificationSent) {
          const partner = subscription.vendor;
          
          // Send to all admins
          for (const admin of admins) {
            await sendExpiryNotification(partner, admin, product, subscription);
          }
          
          // Mark notification as sent
          subscription.expiryNotificationSent = true;
          subscription.expiryNotificationSentAt = new Date();
          await subscription.save();
        }
        
      } catch (error) {
        console.error(`[CRON] Error processing subscription ${subscription._id}:`, error);
      }
    }
    
    console.log('[CRON] Finished processing expired subscriptions');
    
  } catch (error) {
    console.error('[CRON] Error in checkExpiredSubscriptions:', error);
  }
}

// Check for subscriptions expiring soon (1 day before)
async function checkExpiringSubscriptions() {
  try {
    console.log('[CRON] Checking for subscriptions expiring soon...');
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find active subscriptions expiring tomorrow
    const expiringSubscriptions = await ProductSubscription.find({
      status: 'active',
      endDate: { $gte: now, $lte: tomorrow },
      isDeleted: false
    }).populate('product').populate('vendor', 'name email');
    
    if (expiringSubscriptions.length === 0) {
      console.log('[CRON] No subscriptions expiring soon');
      return;
    }
    
    console.log(`[CRON] Found ${expiringSubscriptions.length} subscriptions expiring soon`);
    
    // Get admin users
    const admins = await User.find({ role: 'admin' });
    
    // Send reminder notifications
    for (const subscription of expiringSubscriptions) {
      const partner = subscription.vendor;
      const product = subscription.product;
      
      console.log(`[REMINDER] Subscription expiring tomorrow for product: ${product.title}`);
      console.log(`  - Partner: ${partner.email}`);
      console.log(`  - Expires on: ${subscription.endDate}`);
      
      // TODO: Send reminder notification
      // This is different from expiry notification - it's a warning
    }
    
  } catch (error) {
    console.error('[CRON] Error in checkExpiringSubscriptions:', error);
  }
}

// Initialize cron jobs
function initSubscriptionCron() {
  console.log('[CRON] Initializing subscription monitoring...');
  
  // Check for expired subscriptions every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running hourly expired subscriptions check');
    await checkExpiredSubscriptions();
  });
  
  // Check for expiring subscriptions every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running daily expiring subscriptions reminder');
    await checkExpiringSubscriptions();
  });
  
  // Also run immediately on startup
  setTimeout(async () => {
    console.log('[CRON] Running initial subscription check...');
    await checkExpiredSubscriptions();
  }, 5000); // Wait 5 seconds after startup
  
  console.log('[CRON] Subscription monitoring initialized');
  console.log('[CRON] - Expired check: Every hour');
  console.log('[CRON] - Expiring reminder: Daily at 9 AM');
}

module.exports = {
  initSubscriptionCron,
  checkExpiredSubscriptions,
  checkExpiringSubscriptions
};
