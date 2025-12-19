const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, subscriptionController.createSubscription);

module.exports = router;