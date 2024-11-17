// routes/schedule.js
const express = require('express');
const router = express.Router();
const { Course, CourseSchedule, StudentCourse } = require('../models');
const { auth } = require('../middleware/auth');
const { Op, literal } = require('sequelize');  // Added literal import
const { sequelize } = require('../models');
const loggingMiddleware = require('../middleware/loggingMiddleware');
router.use(loggingMiddleware);
// 辅助函数：获取当前教学周
function getCurrentWeek() {
    // 这里需要根据实际的学期开始时间计算当前教学周
    // 示例：假设开学时间是 2024-02-26
    const semesterStart = new Date('2024-09-01');
    const now = new Date();
    const diffTime = Math.abs(now - semesterStart);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
}

// 辅助函数：获取当前学年和学期
function getCurrentAcademicInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 假设学期划分：
    // 春季学期：2-6月 (1)
    // 夏季学期：7-8月 (2)
    // 秋季学期：9-1月 (3)
    let semester;
    if (month >= 2 && month <= 6) {
        semester = 1;  // 春季学期
    } else if (month >= 7 && month <= 8) {
        semester = 2;  // 夏季学期
    } else {
        semester = 3;  // 秋季学期
        // 如果是9-12月，使用当前年份；如果是1月，使用上一年
        if (month === 1) {
            year--;
        }
    }

    return { academicYear: year, semester };
}

// 查询课表
router.get('/search', auth, async (req, res) => {
    // 打印请求参数
    console.log('课程查询请求参数:', {
        ...req.query,
    });
    try {
        const {
            academicYear,   // 学年
            semester,       // 学期（1-春季，2-夏季，3-秋季）
            instructor,     // 授课教师
            name,          // 课程名称
            department,     // 开课院系
            hasCapacity,   // 是否有余量（true/false）
        } = req.query;

        // 构建查询条件
        const whereConditions = {};
        const scheduleWhereConditions = {};

        // 基本条件
        if (academicYear) whereConditions.academicYear = parseInt(academicYear);
        if (semester) whereConditions.semester = parseInt(semester);
        if (instructor) whereConditions.instructor = { [Op.like]: `%${instructor}%` };
        if (name) whereConditions.name = { [Op.like]: `%${name}%` };
        if (department) whereConditions.department = { [Op.like]: `%${department}%` };

        // Update capacity check to compare enrolled with capacity
        if (hasCapacity === 'true') {
            whereConditions[Op.and] = [
                { capacity: { [Op.gt]: 0 } },  // capacity must be positive
                literal('enrolled < capacity')  // enrolled must be less than capacity
            ];
        } else if (hasCapacity === 'false') {
            whereConditions[Op.and] = [
                { capacity: { [Op.gt]: 0 } },  // capacity must be positive
                literal('enrolled >= capacity')  // no remaining capacity
            ];
        }



        // 执行查询
        const courses = await Course.findAll({
            where: whereConditions,
            include: [{
                model: CourseSchedule,
                as: 'CourseSchedules',  // 确保这里使用了正确的别名
                where: Object.keys(scheduleWhereConditions).length > 0 ? scheduleWhereConditions : undefined,
                required: Object.keys(scheduleWhereConditions).length > 0
            }]
        });


        // Add remainingCapacity to response
        const formattedCourses = courses.map(course => ({
            ...course.get(),
            remainingCapacity: course.capacity - course.enrolled,
            schedules: course.CourseSchedules.map(schedule => schedule.get())
        }));

        res.json({
            success: true,
            data: {
                total: formattedCourses.length,
                courses: formattedCourses
            }
        });

    } catch (error) {
        console.error('课程查询失败:', error);
        res.status(500).json({
            success: false,
            error: '课程查询失败',
            details: error.message
        });
    }
});

// 获取个人周课表
router.get('/weekly', auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const week = parseInt(req.query.week) || getCurrentWeek();
        const weekType = week % 2 === 0 ? 'even' : 'odd';
        const { academicYear, semester } = getCurrentAcademicInfo();

        const studentCourses = await StudentCourse.findAll({
            where: {
                studentId: studentId,
                status: 'selected'
            },
            attributes: ['courseId']
        });

        const courseIds = studentCourses.map(sc => sc.courseId);

        const courses = await Course.findAll({
            where: {
                courseId: { [Op.in]: courseIds },
                academicYear,
                semester
            },
            include: [{
                model: CourseSchedule,
                as: 'CourseSchedules',
                where: {
                    weekStart: { [Op.lte]: week },
                    weekEnd: { [Op.gte]: week },
                    [Op.or]: [
                        { weekType: 'all' },
                        { weekType: weekType }
                    ]
                },
                required: true
            }]
        });

        // 修改返回格式，确保始终包含 week 字段
        res.json({
            success: true,
            data: {
                week: week,
                courses: courses.map(course => ({
                    courseId: course.courseId,
                    name: course.name,
                    instructor: course.instructor,
                    credit: course.credit,
                    schedules: course.CourseSchedules.map(schedule => schedule.get())
                }))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取课表失败',
            details: error.message
        });
    }
});
//获取当前周数
router.get('/current-week', auth, async (req, res) => {
    try {
        const currentWeek = getCurrentWeek();
        res.json({
            success: true,
            data: {
                week: currentWeek,
                academicInfo: getCurrentAcademicInfo()
            }
        });
    } catch (error) {
        console.error('获取当前周数失败:', error);
        res.status(500).json({
            success: false,
            error: '获取当前周数失败',
            details: error.message
        });
    }
});
// 按学期获取个人课表概览
router.get('/semester', auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        let { academicYear, semester } = req.query;

        // 如果没有提供学年或学期，使用当前学年和学期
        if (!academicYear || !semester) {
            const currentInfo = getCurrentAcademicInfo();
            academicYear = academicYear || currentInfo.academicYear;
            semester = semester || currentInfo.semester;
        }

        // 将参数转换为整数
        academicYear = parseInt(academicYear);
        semester = parseInt(semester);

        const courses = await Course.findAll({
            where: {
                academicYear,
                semester
            },
            include: [
                {
                    model: CourseSchedule,
                    attributes: ['dayOfWeek', 'startSlot', 'endSlot', 'classroom',
                        'weekStart', 'weekEnd', 'weekType']
                },
                {
                    model: StudentCourse,
                    where: {
                        studentId: studentId,
                        status: 'selected'
                    },
                    required: true
                }
            ],
            attributes: ['courseId', 'name', 'instructor', 'credit', 'description']
        });

        res.json({
            success: true,
            data: {
                academicYear,
                semester,
                courses: courses.map(course => ({
                    ...course.get(),
                    schedules: course.CourseSchedules.map(schedule => schedule.get())
                }))
            }
        });

    } catch (error) {
        console.error('获取学期课表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取学期课表失败',
            details: error.message
        });
    }
});

module.exports = router;