const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // 在生产环境中使用环境变量

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '缺少Token，请先登录' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: '无效或过期的Token，请重新登录' });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: '用户不存在或已被删除，请重新登录' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('身份验证过程中出现错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

module.exports = { auth, JWT_SECRET };


