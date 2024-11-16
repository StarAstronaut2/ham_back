// models/Course.js - 课程基本信息表
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: '课程编号，如: CS101'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '课程名称'
    },
    credit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: '学分'
    },
    instructor: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '授课教师'
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '开课院系'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '课程描述'
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '课程容量'
    },
    enrolled: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '已选人数'
    },
    academicYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '学年，如：2024'
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[1, 2, 3]]
        },
        comment: '学期：1，2，3'
    }
});
module.exports = Course;
