// server.js
const app = require('./app');
const { sequelize, createDatabaseIfNotExists } = require('./config/database');
const Task = require('./models/Task');
const Log = require('./models/Log'); // 确保导入 Log 模型
// 导入模型
const User = require('./models/User');
// 端口设置
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await createDatabaseIfNotExists();
        await sequelize.sync(); // 确保同步所有模型，包括 Log
        app.listen(PORT, () => {
            console.log(`服务器正在端口 ${PORT} 上运行`);
        });
    } catch (error) {
        console.error('数据库同步失败:', error);
    }
})();

