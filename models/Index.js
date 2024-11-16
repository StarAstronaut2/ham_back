// models/index.js
const Course = require('./Course');
const CourseSchedule = require('./CourseSchedule');
const StudentCourse = require('./StudentCourse');
const User = require('./User');
const Task = require('./Task');
const Log = require('./Log');
// Course 与 CourseSchedule 的一对多关联
Course.hasMany(CourseSchedule, {
    foreignKey: 'courseId',
    sourceKey: 'courseId',
    as: 'CourseSchedules'
});
CourseSchedule.belongsTo(Course, {
    foreignKey: 'courseId',
    targetKey: 'courseId'
});

// Course 与 StudentCourse 的一对多关联
Course.hasMany(StudentCourse, {
    foreignKey: 'courseId',
    sourceKey: 'courseId',
    as: 'StudentCourses'
});
StudentCourse.belongsTo(Course, {
    foreignKey: 'courseId',
    targetKey: 'courseId'
});

module.exports = {
    Course,
    CourseSchedule,
    StudentCourse,
    User,
    Task,
    Log
};