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
    content: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Log;
