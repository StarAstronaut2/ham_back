// models/Task.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // 确保导入的是 { sequelize }
const User = require('./User');
const Task = sequelize.define('Task', {
    content: { //任务内容
        type: DataTypes.STRING,
        allowNull: false,
    },
    deadline: { //截止日期
        type: DataTypes.DATE,
        allowNull: false,
    },
    finish: {  //是否完成
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    priority: { //优先级，取值范围:0、1、2
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: { //用户ID，由后端生成
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },

});
// Task.belongsTo(User);
// User.hasMany(Task);
module.exports = Task;
