const express = require('express');

const router = express.Router();

router.get('/omi/windows', (req, res) => {
    res.download('downloads/omi-windows.rar');
});

router.get('/omi/linux', (req, res) => {
    res.download('downloads/omi-linux.rar');
});

router.get('/omi/mac', (req, res) => {
    res.download('downloads/omi-mac.rar');
});

module.exports = router;