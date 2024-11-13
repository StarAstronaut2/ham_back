// config/database.js
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// 数据库配置
const dbName = 'HamSystem';
const dbUser = 'root';
const dbPassword = '123456';
const dbHost = 'localhost';

// 创建 Sequelize 实例，但先不连接数据库
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    logging: false,
});

// 函数：检查并创建数据库
async function createDatabaseIfNotExists() {
    try {
        // 连接到 MySQL，不指定数据库
        const connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPassword,
        });

        // 检查数据库是否存在
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`数据库 ${dbName} 已确认存在或创建成功。`);
    } catch (error) {
        console.error('创建数据库时出错:', error);
        throw error;
    }
}

// 导出 Sequelize 实例和创建数据库函数
module.exports = { sequelize, createDatabaseIfNotExists };
