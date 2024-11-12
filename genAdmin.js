const bcrypt = require('bcryptjs');

async function generateHashedPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    console.log('加密后的密码:', hashedPassword); // 输出加密后的密码
}

generateHashedPassword("123456"); // 将'your_admin_password'替换为你想要的管理员密码
// INSERT INTO Users(username, password, email, isAdmin, createdAt, updatedAt)
// VALUES('admin', '$2a$10$$2a$10$VPERS9fZAU8KROT2VDAPJu3R161yclXn4UGADBRz1Y3sMAHmEgpcK', 'admin@example.com', true, NOW(), NOW());
