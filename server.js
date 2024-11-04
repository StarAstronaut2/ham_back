// server.js
const app = require('./app');
const { sequelize, createDatabaseIfNotExists } = require('./config/database');

// 端口设置
const PORT = process.env.PORT || 3000;

// 先检查并创建数据库，然后同步模型和启动服务器
(async () => {
    try {
        // 检查并创建数据库
        await createDatabaseIfNotExists();

        // 同步模型
        await sequelize.sync();

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`服务器正在端口 ${PORT} 上运行`);
        });
    } catch (error) {
        console.error('数据库同步失败:', error);
    }
})();
