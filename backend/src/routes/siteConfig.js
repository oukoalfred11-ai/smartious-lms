const express = require('express');
const SiteConfig = require('../models/SiteConfig');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/siteConfig - Get current site config
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const config = await SiteConfig.findOne();
    res.json({ success: true, config });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/siteConfig - Create or update site config
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (config) {
      Object.assign(config, req.body, { updatedAt: new Date() });
      await config.save();
      logAudit(req.user?.email || 'system', 'update_site_config', config);
    } else {
      config = new SiteConfig(req.body);
      await config.save();
      logAudit(req.user?.email || 'system', 'create_site_config', config);
    }
    res.status(201).json({ success: true, config });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

