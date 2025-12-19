/**
 * routes/payment.js
 * Payment Routes - Handle payment callbacks and VIP status updates
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const { authMiddleware, optionalAuth } = require('../middleware/auth'); 


const authenticateToken = authMiddleware;

/**
 * POST /api/payment/callback
 * Callback từ payment gateway sau khi thanh toán
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('💰 Payment callback received:', req.body);
    
    const { orderId, status, transactionId, responseCode } = req.body;
    
    
    if (status === 'SUCCESS' || status === 'COMPLETED' || status === '00' || responseCode === '00') {
      
      
      const result = await pool.query(
        'SELECT * FROM payments WHERE order_id = $1',
        [orderId]
      );
      
      if (result.rows.length === 0) {
        console.error(' Payment not found for orderId:', orderId);
        return res.status(404).json({ 
          success: false, 
          error: 'Payment not found' 
        });
      }
      
      const payment = result.rows[0];
      console.log(' Found payment:', payment);
      
      
      await pool.query(
        `UPDATE payments 
         SET status = 'completed', 
             transaction_id = $1, 
             updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2`,
        [transactionId || `TXN_${Date.now()}`, orderId]
      );
      
      console.log(' Payment status updated to completed');
      
      
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
      
      await pool.query(
        `UPDATE users 
         SET subscription_type = 'premium',
             is_premium = true,
             subscription_start = $1,
             subscription_end = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [subscriptionStart, subscriptionEnd, payment.user_id]
      );
      
      console.log(' VIP status updated for user:', payment.user_id);
      console.log('   - Subscription Type: premium');
      console.log('   - Start Date:', subscriptionStart);
      console.log('   - End Date:', subscriptionEnd);
      
      
      const userResult = await pool.query(
        'SELECT id, email, subscription_type, is_premium, subscription_start, subscription_end FROM users WHERE id = $1',
        [payment.user_id]
      );
      console.log(' Updated user data:', userResult.rows[0]);
      
      res.json({ 
        success: true, 
        message: 'Payment processed and VIP status updated successfully',
        data: {
          orderId,
          userId: payment.user_id,
          subscription: {
            type: 'premium',
            start: subscriptionStart,
            end: subscriptionEnd
          }
        }
      });
      
    } else {
      
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2',
        [status === 'FAILED' ? 'failed' : 'pending', orderId]
      );
      
      console.log('  Payment not successful. Status:', status);
      
      res.json({ 
        success: false, 
        message: 'Payment not successful',
        status
      });
    }
    
  } catch (error) {
    console.error(' Payment callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Kiểm tra trạng thái payment
 */
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }
    
    const payment = result.rows[0];
    
    
    const userResult = await pool.query(
      'SELECT id, email, subscription_type, is_premium, subscription_start, subscription_end FROM users WHERE id = $1',
      [payment.user_id]
    );
    
    res.json({ 
      success: true, 
      payment,
      user: userResult.rows[0] || null
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/payment/sync-vip/:userId
 * Admin: Sync VIP status thủ công cho user đã thanh toán
 */
router.post('/sync-vip/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(' Syncing VIP status for user:', userId);
    
    
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE user_id = $1
       AND (status = 'completed' OR status = 'SUCCESS')
       AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.log('⚠️  No completed payment found for user:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'No completed payment found in last 30 days' 
      });
    }
    
    const payment = result.rows[0];
    const subscriptionStart = new Date(payment.created_at);
    const subscriptionEnd = new Date(subscriptionStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    
    await pool.query(
      `UPDATE users 
       SET subscription_type = 'premium',
           is_premium = true,
           subscription_start = $1,
           subscription_end = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [subscriptionStart, subscriptionEnd, userId]
    );
    
    console.log(' VIP status synced successfully');
    console.log('   - User ID:', userId);
    console.log('   - Payment Date:', subscriptionStart);
    console.log('   - Expiry Date:', subscriptionEnd);
    
    
    const userResult = await pool.query(
      'SELECT id, email, subscription_type, is_premium, subscription_start, subscription_end FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'VIP status synced successfully',
      user: userResult.rows[0],
      subscription: {
        start: subscriptionStart,
        end: subscriptionEnd
      }
    });
    
  } catch (error) {
    console.error(' Error syncing VIP status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/payment/my-subscription
 * Lấy thông tin subscription của user hiện tại (CẦN AUTH)
 */
router.get('/my-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await pool.query(
      `SELECT 
        id, 
        email, 
        subscription_type, 
        is_premium, 
        subscription_start, 
        subscription_end,
        EXTRACT(DAY FROM (subscription_end - CURRENT_TIMESTAMP))::INTEGER as days_remaining
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = userResult.rows[0];
    
    
    const paymentsResult = await pool.query(
      `SELECT * FROM payments 
       WHERE user_id = $1
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );
    
    res.json({
      success: true,
      subscription: {
        type: user.subscription_type,
        isPremium: user.is_premium === true,
        startDate: user.subscription_start,
        endDate: user.subscription_end,
        daysRemaining: user.days_remaining || 0,
        isActive: user.is_premium === true && (user.days_remaining || 0) > 0
      },
      paymentHistory: paymentsResult.rows
    });
    
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;