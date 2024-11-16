var express = require('express');

const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');
const scheduleRouter = require('./routes/schedule');

// 导入模型关联配置（这一步很重要）
require('./models');  // 这会执行 models/index.js 中的关联设置
const app = express();

app.use(bodyParser.json()); // 解析JSON请求体
// 日志中间件
app.use((req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] ${req.method} ${req.url} - 来自 ${req.ip}`);
    next();
});
// 使用任务路由
app.use('/tasks', tasksRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);
app.use('/schedule', scheduleRouter);
module.exports = app;
