// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const loggingMiddleware = require('../middleware/loggingMiddleware');
router.use(loggingMiddleware);
//注册
router.post('/register', async (req, res) => {
  try {
    // 1. 基础数据验证
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: '缺少必要信息',
        details: {
          username: !username ? '用户名是必填项' : null,
          password: !password ? '密码是必填项' : null
        }
      });
    }

    // 2. 创建用户
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    // 3. 返回成功响应
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: false // 普通用户注册，默认为false
      },
      token
    });

  } catch (error) {
    // 4. 错误处理
    if (error.name === 'SequelizeValidationError') {
      // 处理验证错误
      const validationErrors = error.errors.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});

      return res.status(400).json({
        error: '输入验证失败',
        details: validationErrors
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      // 处理唯一约束错误
      const field = error.errors[0].path;
      const message = field === 'username' ?
        '该用户名已被注册' :
        '该电子邮箱已被注册';

      return res.status(400).json({
        error: '唯一性检查失败',
        details: {
          [field]: message
        }
      });
    }

    // 处理其他意外错误
    console.error('注册错误:', error);
    res.status(500).json({
      error: '服务器内部错误',
      details: '注册过程中发生意外错误，请稍后重试'
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});


// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 检查请求体是否包含旧密码和新密码
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: '缺少必要信息',
        details: {
          oldPassword: !oldPassword ? '旧密码是必填项' : null,
          newPassword: !newPassword ? '新密码是必填项' : null
        }
      });
    }

    // 验证旧密码是否正确
    const user = req.user; // 使用auth中间件后，req.user已包含当前登录用户的信息
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(401).json({ error: '旧密码不正确' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '修改密码失败，请稍后重试' });
  }
});
module.exports = router;