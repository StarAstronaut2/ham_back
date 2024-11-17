const express = require('express');
const router = express.Router();
const { parse } = require('json2csv'); // 用于生成 CSV
const ExcelJS = require('exceljs'); // 用于生成 Excel
const { Course, Task, Log, User, CourseSchedule, StudentCourse } = require('../models'); // 导入所有模型
const { auth } = require('../middleware/auth'); // 身份验证中间件

// 可用模型映射
const MODELS = {
    course: {
        model: Course,
        fields: [
            { header: '课程编号', key: 'courseId' },
            { header: '课程名称', key: 'name' },
            { header: '学分', key: 'credit' },
            { header: '授课教师', key: 'instructor' },
            { header: '开课院系', key: 'department' },
            { header: '课程容量', key: 'capacity' },
            { header: '已选人数', key: 'enrolled' },
            { header: '学年', key: 'academicYear' },
            { header: '学期', key: 'semester' },
        ],
    },
    task: {
        model: Task,
        fields: [
            { header: '任务ID', key: 'id' },
            { header: '任务内容', key: 'content' },
            { header: '截止日期', key: 'deadline' },
            { header: '是否完成', key: 'finish' },
            { header: '优先级', key: 'priority' },
            { header: '用户ID', key: 'userId' },
        ],
    },
    log: {
        model: Log,
        fields: [
            { header: '日志ID', key: 'id' },
            { header: '操作', key: 'action' },
            { header: '任务ID', key: 'taskId' },
            { header: '用户ID', key: 'userId' },
            { header: '模块', key: 'module' },
            { header: '日志类型', key: 'logType' },
            { header: '内容', key: 'content' },
            { header: 'IP地址', key: 'ipAddress' },
            { header: '时间戳', key: 'timestamp' },
        ],
    },
    user: {
        model: User,
        fields: [
            { header: '用户ID', key: 'id' },
            { header: '用户名', key: 'username' },
            { header: '电子邮箱', key: 'email' },
            { header: '是否管理员', key: 'isAdmin' },
        ],
    },
    courseschedule: {
        model: CourseSchedule,
        fields: [
            { header: '课程安排ID', key: 'id' },
            { header: '课程ID', key: 'courseId' },
            { header: '星期几', key: 'dayOfWeek' },
            { header: '开始节次', key: 'startSlot' },
            { header: '结束节次', key: 'endSlot' },
            { header: '教室', key: 'classroom' },
            { header: '起始周', key: 'weekStart' },
            { header: '结束周', key: 'weekEnd' },
            { header: '周类型', key: 'weekType' },
        ],
    },
    studentcourse: {
        model: StudentCourse,
        fields: [
            { header: '选课关系ID', key: 'id' },
            { header: '学生ID', key: 'studentId' },
            { header: '课程ID', key: 'courseId' },
            { header: '选课状态', key: 'status' },
            { header: '选课时间', key: 'selectTime' },
        ],
    },
};

// 导出数据接口
router.get('/', auth, async (req, res) => {
    const { model, format = 'csv' } = req.query; // 获取模型名称和导出格式
    console.log('收到的请求参数:', req.query);
    console.log('支持的模型:', Object.keys(MODELS));

    if (!model) {
        return res.status(400).json({ error: '必须提供模型名称（model 参数）' });
    }

    const selectedModel = MODELS[model?.toLowerCase()];
    if (!selectedModel) {
        return res.status(400).json({ error: `无效的模型名称: ${model}` });
    }

    try {
        // 查询数据
        const data = await selectedModel.model.findAll();
        const rows = data.map(item => item.get());

        if (format === 'csv') {
            // 生成 CSV
            const csv = parse(rows, { fields: selectedModel.fields.map(f => f.key) });
            res.header('Content-Type', 'text/csv');
            res.attachment(`${model}.csv`);
            return res.send(csv);
        } else if (format === 'excel') {
            // 生成 Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`${model.charAt(0).toUpperCase() + model.slice(1)}`);

            // 添加表头
            worksheet.columns = selectedModel.fields;

            // 添加数据行
            worksheet.addRows(rows);

            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment(`${model}.xlsx`);
            await workbook.xlsx.write(res);
            return res.end();
        } else {
            return res.status(400).json({ error: '不支持的导出格式' });
        }
    } catch (error) {
        console.error('导出失败:', error);
        res.status(500).json({ error: '导出失败', details: error.message });
    }
});

module.exports = router;
