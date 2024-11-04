// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 获取所有任务
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.findAll();
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
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: '创建任务失败' });
    }
});

// 更新任务
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.update(req.body);
            res.json(task);
        } else {
            res.status(404).json({ error: '任务未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '更新任务失败' });
    }
});

// 删除任务
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.destroy();
            res.json({ message: '任务已删除' });
        } else {
            res.status(404).json({ error: '任务未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '删除任务失败' });
    }
});

module.exports = router;
