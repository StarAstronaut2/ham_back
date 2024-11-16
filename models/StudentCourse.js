// models/StudentCourse.js - 学生选课关系表
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentCourse = sequelize.define('StudentCourse', {
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
        },
        comment: '学生ID'
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'courseId'
        },
        comment: '课程ID'
    },
    status: {
        type: DataTypes.ENUM('selected', 'dropped'),
        defaultValue: 'selected',
        comment: '选课状态：selected-已选，dropped-已退'
    },
    selectTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '选课时间'
    }
});
module.exports = StudentCourse;
