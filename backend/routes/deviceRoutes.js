const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', deviceController.addDevice);
router.get('/', deviceController.getDevices);
router.post('/status', deviceController.updateDeviceStatus);
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;
