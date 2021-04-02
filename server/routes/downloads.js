const express = require('express');

const router = express.Router();

router.get('/omi/windows', (req, res) => {
    res.download('downloads/omi-windows.rar');
});

module.exports = router;