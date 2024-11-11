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




#### 0. 注册用户
- **URL**: `/register`
- **方法**: POST
- **描述**: 创建新用户。
- **请求体**:
  - `username` (必填): 用户名。
  - `password` (必填): 密码。
  - `email` (可选): 电子邮箱。
- **响应**:
  - 成功:
    - 状态码: 201
    - 响应体:
      ```json
      {
        "success": true,
        "user": {
          "id": "用户ID",
          "username": "用户名",
          "email": "邮箱"
        },
        "token": "JWT令牌"
      }
      ```
  - 失败:
    - 状态码: 400
    - 响应体（缺少必填项）:
      ```json
      {
        "error": "缺少必要信息",
        "details": {
          "username": "用户名是必填项",
          "password": "密码是必填项"
        }
      }
      ```
    - 状态码: 400
    - 响应体（唯一性约束失败）:
      ```json
      {
        "error": "唯一性检查失败",
        "details": {
          "username": "该用户名已被注册",
          "email": "该电子邮箱已被注册"
        }
      }
      ```
    - 状态码: 500
    - 响应体（服务器错误）:
      ```json
      {
        "error": "服务器内部错误",
        "details": "注册过程中发生意外错误，请稍后重试"
      }
      ```

#### 1. 用户登录
- **URL**: `/login`
- **方法**: POST
- **描述**: 用户登录并获取 JWT 令牌。
- **请求体**:
  - `username` (必填): 用户名。
  - `password` (必填): 密码。
- **响应**:
  - 成功:
    - 状态码: 200
    - 响应体:
      ```json
      {
        "user": {
          // 用户信息
        },
        "token": "JWT令牌"
      }
      ```
  - 失败:
    - 状态码: 401
    - 响应体:
      ```json
      {
        "error": "用户名或密码错误"
      }
      ```
    - 状态码: 500
    - 响应体:
      ```json
      {
        "error": "登录失败"
      }
      ```

#### 2. 修改密码
- **URL**: `/change-password`
- **方法**: POST
- **描述**: 用户修改密码，需要用户已登录。
- **请求体**:
  - `oldPassword` (必填): 旧密码。
  - `newPassword` (必填): 新密码。
- **响应**:
  - 成功:
    - 状态码: 200
    - 响应体:
      ```json
      {
        "success": true,
        "message": "密码修改成功"
      }
      ```
  - 失败:
    - 状态码: 400
    - 响应体:
      ```json
      {
        "error": "缺少必要信息",
        "details": {
          "oldPassword": "旧密码是必填项",
          "newPassword": "新密码是必填项"
        }
      }
      ```
    - 状态码: 401
    - 响应体:
      ```json
      {
        "error": "旧密码不正确"
      }
      ```
    - 状态码: 500
    - 响应体:
      ```json
      {
        "error": "修改密码失败，请稍后重试"
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

