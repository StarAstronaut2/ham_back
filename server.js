// server.js
const app = require('./app');
const { sequelize, initializeDatabase } = require('./config/database');
const models = require('./models');

// 端口设置
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        // 初始化数据库
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('数据库初始化失败，服务器启动终止');
            process.exit(1);
        }

        // 同步数据库模型
        await sequelize.sync();

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`服务器正在端口 ${PORT} 上运行`);
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
})();