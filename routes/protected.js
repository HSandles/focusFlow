const express = require('express');
const authenticateToken = require('../middleware/authMiddleware'); // ✅ Ensure this is correct

const router = express.Router();

// ✅ Protected Route (Requires a valid token)
router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, user ${req.user.id}!` });
});

module.exports = router;
