// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Log = require('../models/Log'); // 导入日志模型
const { auth } = require('../middleware/auth');
// 将 auth 中间件添加到所有路由
router.use(auth);
// 辅助函数：记录日志
async function createLog(action, taskId = null, content = null) {
    try {
        await Log.create({
            action,
            taskId,
            content,
        });
    } catch (error) {
        console.error('记录日志失败:', error);
    }
}
// 获取当前用户的所有任务
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { userId: req.user.id }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: '获取任务失败' });
    }
});

// 根据ID获取任务
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: '任务未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '获取任务失败' });
    }
});

// 创建新任务
router.post('/', async (req, res) => {
    const { content, deadline, priority, finish } = req.body;

    // 输入验证
    if (!content || !deadline || priority === undefined) {
        return res.status(400).json({ error: '任务内容、截止日期和优先级为必填项' });
    }

    if (typeof priority !== 'number' || priority < 0 || priority > 3) {
        return res.status(400).json({ error: '优先级必须为0、1、2之一' });
    }
    const currentDate = new Date();
    if (new Date(deadline) < currentDate) {
        return res.status(400).json({ error: '截止日期不能早于当前日期' });
    }
    try {
        // 创建任务
        const task = await Task.create({
            content,
            deadline,
            finish,
            priority,
            userId: req.user.id
        });

        // 记录创建任务的日志
        await createLog('创建', task.id, `任务内容: ${task.content}`);

        // 返回任务信息
        res.status(201).json({
            message: '任务创建成功',
            task: {
                id: task.id,
                content: task.content,
                deadline: task.deadline,
                priority: task.priority,
                finish: task.finish,
                userId: task.userId
            }
        });
    } catch (error) {
        console.error('创建任务失败:', error);
        res.status(500).json({ error: '创建任务失败' });
    }
});

// 确保用户只能访问/修改自己的任务
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        // 检查新截止日期是否早于当前日期
        if (req.body.deadline && new Date(req.body.deadline) < new Date()) {
            return res.status(400).json({ error: '截止日期不能早于当前日期' });
        }
        if (task) {
            await task.update(req.body);
            await createLog('更新', task.id, `更新后内容: ${task.content}`);
            res.json(task);
        } else {
            res.status(404).json({ error: '任务未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新任务失败' });
    }
});

// 只能删除自己的所有任务
router.delete('/', async (req, res) => {
    try {
        await Task.destroy({
            where: { userId: req.user.id }
        });
        await createLog('删除所有任务');
        res.json({ message: '所有任务已删除' });
    } catch (error) {
        res.status(500).json({ error: '删除所有任务失败' });
    }
});


// 只能删除自己的任务
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (task) {
            await task.destroy();
            await createLog('删除', task.id, `已删除内容: ${task.content}`);
            res.json({ message: '任务已删除' });
        } else {
            res.status(404).json({ error: '任务未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '删除任务失败' });
    }
});

module.exports = router;
