const Log = require('../models/Log');

const loggingMiddleware = async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        res.json = originalJson;

        const action = `${req.method} ${req.path}`;
        const userId = req.user ? req.user.id : null;
        const module = req.baseUrl.split('/')[1]; // 提取模块名称
        const logType = req.method === 'GET' ? 'Query Log' : 'Action Log'; // 基于请求类型区分日志类别
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let content = {
            userId,
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            response: data
        };

        try {
            Log.create({
                action,
                taskId: req.params.taskId || req.body.taskId || null,
                userId,
                module,
                logType,
                content: JSON.stringify(content),
                ipAddress,
            });
        } catch (error) {
            console.error('日志记录失败:', error);
        }

        return res.json(data);
    };

    next();
};

module.exports = loggingMiddleware;
