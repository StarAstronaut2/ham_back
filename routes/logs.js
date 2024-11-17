const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

router.get('/search', async (req, res) => {
    const { module, logType, startDate, endDate, limit, offset } = req.query;

    const whereConditions = {};
    if (module) whereConditions.module = module;
    if (logType) whereConditions.logType = logType;
    if (startDate && endDate) {
        whereConditions.timestamp = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    try {
        const logs = await Log.findAndCountAll({
            where: whereConditions,
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
        });

        res.json({
            success: true,
            total: logs.count,
            data: logs.rows,
        });
    } catch (error) {
        console.error('日志查询失败:', error);
        res.status(500).json({ error: '日志查询失败' });
    }
});

module.exports = router;
