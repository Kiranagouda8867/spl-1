'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

router.get('/', authenticate, notificationsController.getNotifications);
router.put('/:id/read', authenticate, notificationsController.markAsRead);
router.put('/read-all', authenticate, notificationsController.markAllAsRead);
router.delete('/:id', authenticate, notificationsController.deleteNotification);

module.exports = router;
