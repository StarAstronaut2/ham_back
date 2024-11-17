// scripts/exportToSqlite.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

// MySQL配置
const mysqlConfig = {
    database: 'HamSystem',
    username: 'root',
    password: '123456',
    host: 'localhost',
    dialect: 'mysql',
    logging: false
};

// SQLite配置
const sqliteConfig = {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/database.sqlite'),
    logging: false
};

// 确保data目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 如果SQLite文件已存在，则备份
if (fs.existsSync(sqliteConfig.storage)) {
    const backupPath = `${sqliteConfig.storage}.backup-${Date.now()}`;
    fs.copyFileSync(sqliteConfig.storage, backupPath);
    console.log(`已创建现有数据库备份: ${backupPath}`);
}

// 创建数据库连接
const mysqlConnection = new Sequelize(mysqlConfig);
const sqliteConnection = new Sequelize(sqliteConfig);

async function getTableNames() {
    try {
        const [results] = await mysqlConnection.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = '${mysqlConfig.database}'
            AND TABLE_TYPE = 'BASE TABLE'
        `);
        return results.map(result => result.TABLE_NAME); // 返回完整表名
    } catch (error) {
        console.error('获取表名失败:', error);
        return [];
    }
}

async function getTableSchema(tableName) {
    try {
        const [columns] = await mysqlConnection.query(`
            SELECT
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${mysqlConfig.database}'
            AND TABLE_NAME = '${tableName}'
            ORDER BY ORDINAL_POSITION
        `);

        const attributes = {};
        for (const column of columns) {
            const attribute = {
                type: convertDataType(column.DATA_TYPE),
                allowNull: column.IS_NULLABLE === 'YES'
            };

            if (column.COLUMN_KEY === 'PRI') {
                attribute.primaryKey = true;
                if (column.EXTRA === 'auto_increment') {
                    attribute.autoIncrement = true;
                }
            }

            if (column.COLUMN_DEFAULT !== null) {
                if (column.COLUMN_DEFAULT === 'CURRENT_TIMESTAMP') {
                    attribute.defaultValue = Sequelize.literal('CURRENT_TIMESTAMP');
                } else {
                    attribute.defaultValue = column.COLUMN_DEFAULT;
                }
            }

            attributes[column.COLUMN_NAME] = attribute;
        }

        return attributes;
    } catch (error) {
        console.error(`获取表 ${tableName} 的结构失败:`, error);
        return null;
    }
}

function convertDataType(mysqlType) {
    const typeMap = {
        'varchar': DataTypes.STRING,
        'char': DataTypes.STRING,
        'text': DataTypes.TEXT,
        'int': DataTypes.INTEGER,
        'tinyint': DataTypes.INTEGER,
        'smallint': DataTypes.INTEGER,
        'mediumint': DataTypes.INTEGER,
        'bigint': DataTypes.BIGINT,
        'float': DataTypes.FLOAT,
        'double': DataTypes.DOUBLE,
        'decimal': DataTypes.DECIMAL,
        'datetime': DataTypes.DATE,
        'timestamp': DataTypes.DATE,
        'date': DataTypes.DATEONLY,
        'time': DataTypes.TIME,
        'boolean': DataTypes.BOOLEAN,
        'enum': DataTypes.STRING, // SQLite不支持ENUM
        'json': DataTypes.JSON,
        'blob': DataTypes.BLOB
    };

    const baseType = mysqlType.split('(')[0].toLowerCase();
    return typeMap[baseType] || DataTypes.STRING;
}

async function exportData() {
    try {
        console.log('开始导出数据...');

        // 测试数据库连接
        await mysqlConnection.authenticate();
        console.log('MySQL连接成功');
        await sqliteConnection.authenticate();
        console.log('SQLite连接成功');

        // 获取所有表名
        const tableNames = await getTableNames();
        console.log('\n发现的表:', tableNames);

        // 处理每个表
        for (const tableName of tableNames) {
            console.log(`\n处理表 ${tableName}...`);

            // 获取表结构
            const attributes = await getTableSchema(tableName);
            if (!attributes) {
                console.log(`跳过表 ${tableName} (无法获取结构)`);
                continue;
            }

            // 在两个数据库中定义模型
            const MysqlModel = mysqlConnection.define(tableName, attributes, {
                tableName: tableName,
                timestamps: true,
                freezeTableName: true  // 防止Sequelize自动添加's'
            });

            const SqliteModel = sqliteConnection.define(tableName, attributes, {
                tableName: tableName,
                timestamps: true,
                freezeTableName: true  // 防止Sequelize自动添加's'
            });

            try {
                // 在SQLite中创建表
                await SqliteModel.sync({ force: true });
                console.log(`- 在SQLite中创建表 ${tableName}`);

                // 从MySQL获取数据
                const records = await MysqlModel.findAll();
                console.log(`- 从MySQL中读取了 ${records.length} 条记录`);

                if (records.length > 0) {
                    // 写入SQLite
                    await SqliteModel.bulkCreate(
                        records.map(record => record.toJSON()),
                        {
                            logging: false,
                            hooks: false
                        }
                    );
                    console.log(`- 成功导入 ${records.length} 条记录到SQLite`);
                }
            } catch (error) {
                console.error(`处理表 ${tableName} 时出错:`, error.message);
                if (error.sql) {
                    console.log('SQL查询:', error.sql);
                }
                console.error('详细错误:', error);
                // 继续处理其他表
                continue;
            }
        }

        console.log('\n数据导出完成！');

    } catch (error) {
        console.error('导出过程中发生错误:', error);
    } finally {
        // 关闭数据库连接
        await mysqlConnection.close();
        await sqliteConnection.close();
        console.log('\n数据库连接已关闭');
    }
}

// 执行导出
exportData();