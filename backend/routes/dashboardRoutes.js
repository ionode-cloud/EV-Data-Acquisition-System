const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public standard user routes
router.get('/', dashboardController.getDashboards);

// Public AMIN ONLY routes
router.post('/', dashboardController.createDashboard);
router.delete('/:id', dashboardController.deleteDashboard);

module.exports = router;
