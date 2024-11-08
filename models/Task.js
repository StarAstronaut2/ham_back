// models/Task.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // 确保导入的是 { sequelize }

const Task = sequelize.define('Task', {
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finish: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = Task;
