# 任务管理系统 API 文档

## 基础信息

- 基础URL: `http://localhost:3000`
- 所有请求和响应均使用 JSON 格式
- 需要认证的接口都需要在请求头中携带 token
- 认证格式: `Authorization: Bearer <your-token>`

## 状态码说明

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证或认证失败
- 404: 资源未找到
- 500: 服务器内部错误

## 认证相关接口

### 1. 用户注册

**请求方法：** POST

**URL：** `/auth/register`

**请求参数：**

```json
{
  "username": "string",     // 用户名，必填
  "password": "string",     // 密码，必填
  "email": "string"        // 邮箱，必填，需要符合邮箱格式
}
```

**响应示例：**

```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-11-11T10:00:00.000Z",
    "updatedAt": "2024-11-11T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..." // JWT token
}
```

### 2. 用户登录

**请求方法：** POST

**URL：** `/auth/login`

**请求参数：**

```json
{
  "username": "string",     // 用户名，必填
  "password": "string"      // 密码，必填
}
```

**响应示例：**

```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-11-11T10:00:00.000Z",
    "updatedAt": "2024-11-11T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..." // JWT token
}
```

## 任务管理接口

> 注意：以下所有接口都需要在请求头中携带 token

### 1. 获取所有任务

**请求方法：** GET

**URL：** `/tasks`

**请求头：**
```
Authorization: Bearer <your-token>
```

**响应示例：**

```json
[
  {
    "id": 1,
    "content": "完成API文档",
    "completed": false,
    "userId": 1,
    "createdAt": "2024-11-11T10:00:00.000Z",
    "updatedAt": "2024-11-11T10:00:00.000Z"
  },
  {
    "id": 2,
    "content": "实现前端界面",
    "completed": true,
    "userId": 1,
    "createdAt": "2024-11-11T11:00:00.000Z",
    "updatedAt": "2024-11-11T11:00:00.000Z"
  }
]
```

### 2. 创建新任务

**请求方法：** POST

**URL：** `/tasks`

**请求头：**
```
Authorization: Bearer <your-token>
```

**请求参数：**

```json
{
  "content": "string",          // 任务内容，必填
  "completed": boolean         // 任务状态，可选，默认false
}
```

**响应示例：**

```json
{
  "id": 1,
  "content": "新任务内容",
  "completed": false,
  "userId": 1,
  "createdAt": "2024-11-11T10:00:00.000Z",
  "updatedAt": "2024-11-11T10:00:00.000Z"
}
```

### 3. 更新任务

**请求方法：** PUT

**URL：** `/tasks/:id`

**请求头：**
```
Authorization: Bearer <your-token>
```

**请求参数：**

```json
{
  "content": "string",          // 任务内容，可选
  "completed": boolean         // 任务状态，可选
}
```

**响应示例：**

```json
{
  "id": 1,
  "content": "更新后的任务内容",
  "completed": true,
  "userId": 1,
  "createdAt": "2024-11-11T10:00:00.000Z",
  "updatedAt": "2024-11-11T12:00:00.000Z"
}
```

### 4. 删除特定任务

**请求方法：** DELETE

**URL：** `/tasks/:id`

**请求头：**
```
Authorization: Bearer <your-token>
```

**响应示例：**

```json
{
  "message": "任务已删除"
}
```

### 5. 删除所有任务

**请求方法：** DELETE

**URL：** `/tasks`

**请求头：**
```
Authorization: Bearer <your-token>
```

**响应示例：**

```json
{
  "message": "所有任务已删除"
}
```

## 错误响应示例

### 1. 认证失败

```json
{
  "error": "请先登录"
}
```

### 2. 参数错误

```json
{
  "error": "注册失败",
  "details": "用户名已存在"
}
```

### 3. 资源未找到

```json
{
  "error": "任务未找到"
}
```

## 注意事项

1. token 的获取：
   - 用户注册或登录成功后，会在响应中返回 token
   - 后续请求需要将此 token 添加到请求头中

2. 安全性：
   - 所有包含敏感信息的请求都应使用 HTTPS
   - 不要在客户端明文存储密码
   - token 应安全存储，建议使用 localStorage 或 httpOnly cookie

3. 错误处理：
   - 确保处理所有可能的错误响应
   - 网络错误需要适当的重试机制
   - 401 错误可能意味着 token 过期，需要重新登录

4. 最佳实践：
   - 实现请求拦截器统一添加 token
   - 实现响应拦截器统一处理错误
   - 建议使用 axios 等成熟的 HTTP 客户端库

