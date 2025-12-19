
const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const vipController = require('../controllers/vipController');



router.get('/packages', vipController.getAllPackages);


router.get('/packages/:id', vipController.getPackageById);


router.post('/packages', authenticateToken, isAdmin, vipController.createPackage);


router.put('/packages/:id', authenticateToken, isAdmin, vipController.updatePackage);


router.delete('/packages/:id', authenticateToken, isAdmin, vipController.deletePackage);


router.get('/packages/:id/stats', authenticateToken, isAdmin, vipController.getPackageStats);



router.get('/employers', authenticateToken, isAdmin, vipController.getAllVIPEmployers);


router.get('/employers/:companyId', authenticateToken, isAdmin, vipController.getVIPEmployerDetail);


router.post('/employers', authenticateToken, isAdmin, vipController.addVIPEmployer);


router.post('/employers/:companyId/renew', authenticateToken, isAdmin, vipController.renewPackage);


router.get('/employers/:companyId/stats', authenticateToken, isAdmin, vipController.getEmployerStats);


router.get('/my-package', authenticateToken, vipController.getMyPackage);


router.post('/upgrade', authenticateToken, vipController.upgradePackage);



router.post('/ai-match/:companyId', authenticateToken, vipController.aiMatchCVs);


router.get('/ai-match/history/:companyId', authenticateToken, vipController.getAIMatchHistory);


router.post('/send-invitation', authenticateToken, vipController.sendInvitation);


router.post('/save-cv', authenticateToken, vipController.saveCV);


router.get('/saved-cvs/:companyId', authenticateToken, vipController.getSavedCVs);


router.delete('/saved-cvs/:id', authenticateToken, vipController.unsaveCV);



router.get('/dashboard/overview', authenticateToken, isAdmin, vipController.getDashboardOverview);


router.get('/dashboard/revenue', authenticateToken, isAdmin, vipController.getRevenueReport);


router.get('/export/employers', authenticateToken, isAdmin, vipController.exportVIPEmployers);

module.exports = router;