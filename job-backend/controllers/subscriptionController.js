const pool = require('../config/db');

/**
 * @desc    Tạo subscription sau khi thanh toán
 * @route   POST /api/subscriptions
 * @access  Private (Employer)
 */
exports.createSubscription = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const employerId = req.user.id;
    const { packageName, price, duration, paymentMethod, orderId } = req.body;

    console.log(' Creating subscription for employer:', employerId);
    console.log(' Package:', packageName);

    await client.query('BEGIN');

   
    const companyResult = await client.query(
      'SELECT id, package_type FROM companies WHERE employer_id = $1',
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công ty'
      });
    }

    const company = companyResult.rows[0];

    
    let newPackageType = 'FREE';
    let additionalJobs = 0;

    if (packageName.includes('Cơ bản')) {
      newPackageType = 'BASIC';
      additionalJobs = 5;
    } else if (packageName.includes('Chuyên nghiệp')) {
      newPackageType = 'PRO';
      additionalJobs = 10;
    } else if (packageName.includes('Doanh nghiệp')) {
      newPackageType = 'PREMIUM';
      additionalJobs = 9999;
    }

   
    const endDate = new Date();
    if (duration === 'tháng') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration === 'năm') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    console.log(' Upgrading to:', newPackageType, 'with', additionalJobs, 'jobs');

   
    await client.query(
      `UPDATE companies 
       SET package_type = $1,
           remaining_jobs = remaining_jobs + $2,
           package_expired_at = $3
       WHERE id = $4`,
      [newPackageType, additionalJobs, endDate, company.id]
    );

    
    await client.query(
      `INSERT INTO subscriptions 
       (employer_id, package_name, package_type, price, start_date, end_date, payment_method, order_id, status) 
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, 'active')`,
      [employerId, packageName, newPackageType, price, endDate, paymentMethod, orderId]
    );

    await client.query('COMMIT');

    console.log(' Subscription created successfully!');

    res.json({
      success: true,
      message: 'Kích hoạt gói thành công!',
      package: {
        type: newPackageType,
        jobs_added: additionalJobs,
        expired_at: endDate
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    client.release();
  }
};