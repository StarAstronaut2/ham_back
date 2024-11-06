var express = require('express');

const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');



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

module.exports = app;
