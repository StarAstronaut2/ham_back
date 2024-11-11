// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '用户名不能为空'
      },
      len: {
        args: [3, 30],
        msg: '用户名长度必须在3到30个字符之间'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '密码不能为空'
      },
      len: {
        args: [6, 100],
        msg: '密码长度必须至少为6个字符'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: {
        msg: '请输入有效的电子邮箱地址'
      }
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (!user.password) throw new Error('密码是必填项');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
