// config/database.js
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// 数据库配置
const config = {
    mysql: {
        dbName: 'HamSystem',
        dbUser: 'root',
        dbPassword: '123456',
        dbHost: 'localhost'
    },
    sqlite: {
        // 修改存储位置逻辑
        getStoragePath: () => {
            // 检查是否在 pkg 环境中运行
            const isPkg = typeof process.pkg !== 'undefined';

            if (isPkg) {
                // 在 pkg 环境中，使用用户数据目录
                const userDataDir = process.env.APPDATA ||
                    (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' :
                        process.env.HOME + "/.local/share");

                const appDataDir = path.join(userDataDir, 'HamSystem');
                return path.join(appDataDir, 'database.sqlite');
            } else {
                // 开发环境中使用原来的路径
                return path.join(__dirname, '../data/database.sqlite');
            }
        }
    }
};

// 获取存储模式，默认使用 SQLite
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';

// 创建 Sequelize 实例的函数
function createSequelizeInstance() {
    if (STORAGE_MODE === 'mysql') {
        return new Sequelize(
            config.mysql.dbName,
            config.mysql.dbUser,
            config.mysql.dbPassword,
            {
                host: config.mysql.dbHost,
                dialect: 'mysql',
                logging: false,
            }
        );
    } else {
        const dbPath = config.sqlite.getStoragePath();
        return new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false,
        });
    }
}

// 创建 Sequelize 实例
const sequelize = createSequelizeInstance();

// 检查并创建数据库（仅MySQL模式需要）
async function createDatabaseIfNotExists() {
    if (STORAGE_MODE === 'mysql') {
        try {
            const connection = await mysql.createConnection({
                host: config.mysql.dbHost,
                user: config.mysql.dbUser,
                password: config.mysql.dbPassword,
            });

            await connection.query(
                `CREATE DATABASE IF NOT EXISTS \`${config.mysql.dbName}\`;`
            );
            console.log(`数据库 ${config.mysql.dbName} 已确认存在或创建成功。`);
            await connection.end();
        } catch (error) {
            console.error('创建MySQL数据库时出错:', error);
            throw error;
        }
    } else {
        // SQLite 模式下确保数据目录存在
        const dbPath = config.sqlite.getStoragePath();
        const dataDir = path.dirname(dbPath);

        try {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            console.log(`使用SQLite数据库，位置: ${dbPath}`);
        } catch (error) {
            console.error('创建SQLite数据目录时出错:', error);
            throw error;
        }
    }
}

// 初始化数据库
async function initializeDatabase() {
    try {
        await createDatabaseIfNotExists();
        await sequelize.authenticate();
        console.log(`成功连接到${STORAGE_MODE.toUpperCase()}数据库`);
        return true;
    } catch (error) {
        console.error(`数据库连接失败:`, error);
        return false;
    }
}

module.exports = {
    sequelize,
    initializeDatabase,
    getStorageMode: () => STORAGE_MODE,
    getDatabasePath: () => STORAGE_MODE === 'sqlite' ? config.sqlite.getStoragePath() : null
};