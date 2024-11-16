// models/CourseSchedule.js - 课程时间安排表
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const CourseSchedule = sequelize.define('CourseSchedule', {
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
        },
        comment: '关联的课程ID'
    },
    dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 7
        },
        comment: '星期几(1-7)'
    },
    startSlot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '开始节次(1-12)'
    },
    endSlot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '结束节次(1-12)'
    },
    classroom: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '教室'
    },
    weekStart: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '起始周次'
    },
    weekEnd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '结束周次'
    },
    weekType: {
        type: DataTypes.ENUM('all', 'odd', 'even'),
        defaultValue: 'all',
        comment: '周类型：all-所有周，odd-单周，even-双周'
    }
});
module.exports = CourseSchedule;
