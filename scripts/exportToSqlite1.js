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

// 定义要导出的表及其模型
const models = {
    User: {
        attributes: {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    Task: {
        attributes: {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false
            },
            deadline: {
                type: DataTypes.DATE,
                allowNull: false
            },
            finish: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            priority: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    Log: {
        attributes: {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false
            },
            taskId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            content: {
                type: DataTypes.STRING,
                allowNull: true
            },
            timestamp: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    Courese: {
        attributes: {
            courseId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            credit: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            instructor: {
                type: DataTypes.STRING,
                allowNull: false
            },
            department: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT
            },
            capacity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            enrolled: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            academicYear: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            semester: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    CourseSchedule: {
        attributes: {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            courseId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Courses',
                    key: 'courseId'
                }
            },
            dayOfWeek: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            startSlot: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            endSlot: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            classroom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            weekStart: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            weekEnd: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            weekType: {
                type: DataTypes.STRING,  // SQLite不支持ENUM，改用STRING
                defaultValue: 'all'
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    StudentCourse: {
        attributes: {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            studentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            courseId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Courses',
                    key: 'courseId'
                }
            },
            status: {
                type: DataTypes.STRING,  // SQLite不支持ENUM，改用STRING
                defaultValue: 'selected'
            },
            selectTime: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }
    },
    // 在这里添加其他表的定义
};
async function inspectTableStructure(sequelize, tableName) {
    try {
        const query = `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${mysqlConfig.database}'
            AND TABLE_NAME = '${tableName}s'
            ORDER BY ORDINAL_POSITION
        `;
        const [results] = await sequelize.query(query);
        console.log(`\n${tableName} 表结构:`);
        console.table(results);
        return results;
    } catch (error) {
        console.error(`获取表结构失败: ${error.message}`);
        return null;
    }
}
async function exportData() {
    try {
        console.log('开始导出数据...');

        // 测试MySQL连接
        await mysqlConnection.authenticate();
        console.log('MySQL连接成功');

        // 测试SQLite连接
        await sqliteConnection.authenticate();
        console.log('SQLite连接成功');
        // 定义导出顺序（处理外键依赖）
        const exportOrder = ['Users', 'Courses', 'Tasks', 'StudentCourses', 'CourseSchedules', 'Logs'];
        // 在导出之前检查并显示表结构
        for (const modelName of exportOrder) {
            await inspectTableStructure(mysqlConnection, modelName);
        }

        // 按顺序在SQLite中创建表并导入数据
        for (const modelName of exportOrder) {
            const modelDef = models[modelName];
            console.log(`\n处理表 ${modelName}...`);

            // 在两个数据库中定义相同的模型
            const MysqlModel = mysqlConnection.define(modelName, modelDef.attributes, {
                tableName: `${modelName}s`,
                timestamps: true
            });
            const SqliteModel = sqliteConnection.define(modelName, modelDef.attributes, {
                tableName: `${modelName}s`,
                timestamps: true
            });

            try {
                // 在SQLite中创建表
                await SqliteModel.sync({ force: true });
                console.log(`- 在SQLite中创建表 ${modelName}`);

                // 从MySQL获取所有数据
                const records = await MysqlModel.findAll();
                console.log(`- 从MySQL中读取了 ${records.length} 条记录`);

                if (records.length > 0) {
                    // 将数据写入SQLite
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
                console.error(`处理 ${modelName} 表时出错:`, error.message);
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