var express = require('express');

const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');



const app = express();

app.use(bodyParser.json()); // 解析JSON请求体

// 使用任务路由
app.use('/tasks', tasksRouter);

module.exports = app;
