const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginAndCheckAudit);
router.get('/audits/:facultyId', authController.getAuditDatesForFaculty); // For Calender
router.post('/admin/login', authController.adminLogin); // Admin login route

module.exports = router;
