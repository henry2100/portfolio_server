const express = require('express');
const router = express.Router();
const {
  login,
  verifyToken,
  getSiteData,
  saveSiteData,
  uploadFile,
  addProject,
  updateProject,
  deleteProject,
  proxyPdf,
} = require('../controllers/dashboardController');
const authDashboard = require('../middlewares/authDashboard');

router.post('/login', login);
router.get('/verify', authDashboard, verifyToken);
router.get('/site-data', getSiteData);
router.put('/site-data', authDashboard, saveSiteData);
router.post('/upload', authDashboard, uploadFile);
router.post('/projects', authDashboard, addProject);
router.put('/projects/:index', authDashboard, updateProject);
router.delete('/projects/:index', authDashboard, deleteProject);
router.get('/proxy-pdf', proxyPdf);

module.exports = router;
