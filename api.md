# 任务管理系统 API 文档

## 基础信息

- 基础路径: `/api`
- 响应格式: JSON
- 认证方式: JWT Token (在需要认证的接口中通过 Authorization header 传递)
  ```
  Authorization: Bearer <token>
  ```

## 1. 账号相关接口

### 1.1 用户注册

- **接口**: POST `/auth/register`
- **描述**: 创建新用户账号
- **认证**: 不需要
- **请求体**:
  ```json
  {
    "username": "string",     // 必填，3-30个字符
    "password": "string",     // 必填，最少6个字符
    "email": "string"        // 选填，需要符合邮箱格式
  }
  ```
- **响应**:
  - 成功 (201):
    ```json
    {
      "success": true,
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "isAdmin": false
      },
      "token": "string"
    }
    ```
  - 错误 (400):
    ```json
    {
      "error": "错误类型",
      "details": {
        "username": "错误信息",
        "password": "错误信息",
        "email": "错误信息"
      }
    }
    ```

### 1.2 用户登录

- **接口**: POST `/auth/login`
- **描述**: 用户登录获取认证token
- **认证**: 不需要
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**:
  - 成功 (200):
    ```json
    {
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "isAdmin": "boolean"
      },
      "token": "string"
    }
    ```
  - 错误 (401):
    ```json
    {
      "error": "用户名或密码错误"
    }
    ```

### 1.3 修改密码

- **接口**: POST `/auth/change-password`
- **描述**: 修改当前登录用户的密码
- **认证**: 需要
- **请求体**:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **响应**:
  - 成功 (200):
    ```json
    {
      "success": true,
      "message": "密码修改成功"
    }
    ```
  - 错误 (400/401):
    ```json
    {
      "error": "错误信息",
      "details": {
        "oldPassword": "错误信息",
        "newPassword": "错误信息"
      }
    }
    ```

## 2. 任务相关接口

### 2.1 获取任务列表

- **接口**: GET `/tasks`
- **描述**: 获取当前用户的所有任务
- **认证**: 需要
- **响应**:
  - 成功 (200):
    ```json
    [
      {
        "id": "number",
        "content": "string",
        "deadline": "date",
        "finish": "boolean",
        "priority": "number",
        "userId": "number",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
    ```
  - 错误 (500):
    ```json
    {
      "error": "获取任务失败"
    }
    ```

### 2.2 获取单个任务

- **接口**: GET `/tasks/:id`
- **描述**: 根据ID获取特定任务
- **认证**: 需要
- **参数**:
  - `id`: 任务ID (路径参数)
- **响应**:
  - 成功 (200):
    ```json
    {
      "id": "number",
      "content": "string",
      "deadline": "date",
      "finish": "boolean",
      "priority": "number",
      "userId": "number",
      "createdAt": "date",
      "updatedAt": "date"
    }
    ```
  - 错误 (404):
    ```json
    {
      "error": "任务未找到"
    }
    ```

### 2.3 创建任务

- **接口**: POST `/tasks`
- **描述**: 创建新任务
- **认证**: 需要
- **请求体**:
  ```json
  {
    "content": "string",    // 必填，任务内容
    "deadline": "date",     // 必填，截止日期
    "finish":"boolean",     // 可选，默认为false
    "priority": "number"    // 必填，优先级(0-2)
  }
  ```
- **响应**:
  - 成功 (201):
    ```json
    {
      "message": "任务创建成功",
      "task": {
        "id": "number",
        "content": "string",
        "deadline": "date",
        "priority": "number",
        "finish": "boolean",
        "userId": "number"
      }
    }
    ```
  - 错误 (400):
    ```json
    {
      "error": "错误信息"
    }
    ```

### 2.4 更新任务

- **接口**: PUT `/tasks/:id`
- **描述**: 更新指定任务
- **认证**: 需要
- **参数**:
  - `id`: 任务ID (路径参数)
- **请求体**: (所有字段都是可选的)
  ```json
  {
    "content": "string",
    "deadline": "date",
    "priority": "number",
    "finish": "boolean"
  }
  ```
- **响应**:
  - 成功 (200):
    ```json
    {
      "id": "number",
      "content": "string",
      "deadline": "date",
      "finish": "boolean",
      "priority": "number",
      "userId": "number",
      "updatedAt": "date",
      "createdAt": "date"
    }
    ```
  - 错误 (404):
    ```json
    {
      "error": "任务未找到"
    }
    ```

### 2.5 删除单个任务

- **接口**: DELETE `/tasks/:id`
- **描述**: 删除指定任务
- **认证**: 需要
- **参数**:
  - `id`: 任务ID (路径参数)
- **响应**:
  - 成功 (200):
    ```json
    {
      "message": "任务已删除"
    }
    ```
  - 错误 (404):
    ```json
    {
      "error": "任务未找到"
    }
    ```

### 2.6 删除所有任务

- **接口**: DELETE `/tasks`
- **描述**: 删除当前用户的所有任务
- **认证**: 需要
- **响应**:
  - 成功 (200):
    ```json
    {
      "message": "所有任务已删除"
    }
    ```
  - 错误 (500):
    ```json
    {
      "error": "删除所有任务失败"
    }
    ```

## 3. 数据模型

### 3.1 用户模型 (User)

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 30
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  email: {
    type: String,
    unique: true,
    format: email
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}
```

### 3.2 任务模型 (Task)

```javascript
{
  content: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  finish: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    required: true,
    enum: [0, 1, 2]
  },
  userId: {
    type: Number,
    required: true
  }
}
```

## 4. 错误码说明

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权或授权失败
- 404: 资源未找到
- 500: 服务器内部错误

## 5. 注意事项

1. 所有需要认证的接口都需要在请求头中携带有效的 JWT Token
2. 任务的优先级必须是 0、1、2 之一
3. 用户只能操作自己创建的任务
4. 密码修改后需要重新登录获取新的 token
5. 所有时间相关的字段都使用 ISO 8601 格式