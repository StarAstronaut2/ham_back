// models/Log.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Log = sequelize.define('Log', {
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // 如果日志可能涉及用户行为
    },
    module: {
        type: DataTypes.STRING, // 日志所属模块
        allowNull: true,
    },
    logType: {
        type: DataTypes.STRING, // 日志类型（功能日志、错误日志等）
        allowNull: false,
    },
    content: {
        type: DataTypes.JSON, // 动态内容
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.STRING, // 记录请求IP
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Log;
