# Hướng dẫn Chạy và Test Dự án NNPTUD-C5

## Các Cách Chạy Dự Án

### Phương pháp 1: Sử dụng Docker Compose (Khuyến nghị)

#### Yêu cầu:
- Docker Desktop đã cài đặt
- Docker Compose

#### Các bước thực hiện:

1. **Mở terminal tại thư mục dự án**
   ```bash
   cd c:/Users/btd14/source/repos/NNPTUD_Ngay8
   ```

2. **Chạy Docker Compose**
   ```bash
   docker-compose up
   ```

3. **Kiểm tra các service đang chạy**
   - MongoDB: `http://localhost:27017`
   - Ứng dụng Node.js: `http://localhost:3000`

4. **Dừng các service**
   ```bash
   docker-compose down
   ```

#### Ưu điểm:
- Tự động cài đặt MongoDB
- Không cần cài Node.js cục bộ
- Môi trường đồng nhất

### Phương pháp 2: Chạy thủ công (không Docker)

#### Yêu cầu:
- Node.js 18+ đã cài đặt
- MongoDB đã cài đặt và chạy

#### Các bước thực hiện:

1. **Cài đặt dependencies**
   ```bash
   npm install
   ```

2. **Khởi động MongoDB**
   - Cách 1: Sử dụng MongoDB Compass hoặc CLI
   - Cách 2: Chạy MongoDB service
   - Kết nối string: `mongodb://localhost:27017/NNPTUD-C5`

3. **Chạy ứng dụng**
   ```bash
   npm start
   ```
   Hoặc với nodemon (tự động restart khi thay đổi code):
   ```bash
   npm run dev
   ```

4. **Kiểm tra ứng dụng**
   - Truy cập: `http://localhost:3000`
   - API Base URL: `http://localhost:3000/api/v1`

## Cấu hình MongoDB

### Kết nối MongoDB
- **Local**: `mongodb://localhost:27017/NNPTUD-C5`
- **Docker**: `mongodb://admin:password123@mongodb:27017/NNPTUD-C5?authSource=admin`

### Khởi tạo database
Database sẽ tự động được tạo với các collection:
- users
- products  
- categories
- carts
- roles
- inventories
- payments
- reservations

## Test API với Postman

### 1. Tạo Postman Collection

#### Import Collection:
1. Mở Postman
2. Click "Import"
3. Chọn "Raw text"
4. Dán nội dung sau:

```json
{
  "info": {
    "name": "NNPTUD-C5 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\",\n  \"email\": \"test@example.com\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "auth", "login"]
            }
          }
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/auth/me",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/users",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "users"]
            }
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/users/{{userId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "users", "{{userId}}"],
              "variable": [
                {
                  "key": "userId",
                  "value": ""
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "products"]
            }
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"iPhone 15\",\n  \"price\": 999.99,\n  \"description\": \"Latest iPhone model\",\n  \"category\": \"69b2763ce64fe93ca6985b56\",\n  \"images\": [\"https://example.com/iphone.jpg\"]\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "products"]
            }
          }
        }
      ]
    }
  ]
}
```

### 2. Cấu hình Postman Environment

Tạo environment với các biến:
- `baseUrl`: `http://localhost:3000/api/v1`
- `token`: (sẽ được set sau khi login)

### 3. Quy trình Test

#### Bước 1: Register user mới
- Endpoint: `POST /auth/register`
- Body: 
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

#### Bước 2: Login để lấy token
- Endpoint: `POST /auth/login`
- Body:
```json
{
  "username": "testuser",
  "password": "password123"
}
```
- **Lưu ý**: Token được lưu trong cookie `TOKEN_LOGIN`

#### Bước 3: Test các endpoint cần authentication
- Postman sẽ tự động gửi cookie
- Test `/auth/me` để verify authentication

#### Bước 4: Test CRUD operations
1. **Products**: Tạo, đọc, cập nhật, xóa sản phẩm
2. **Categories**: Quản lý danh mục
3. **Carts**: Thêm/xóa sản phẩm khỏi giỏ hàng
4. **Users**: Quản lý người dùng (cần role ADMIN)

## Troubleshooting

### 1. Lỗi kết nối MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp**:
- Kiểm tra MongoDB đang chạy: `mongod --version`
- Khởi động MongoDB service
- Với Docker: `docker-compose up mongodb`

### 2. Lỗi thiếu dependencies
```
Error: Cannot find module 'express'
```
**Giải pháp**:
```bash
npm install
```

### 3. Lỗi port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Giải pháp**:
- Đổi port trong `app.js` hoặc `docker-compose.yml`
- Hoặc kill process đang chiếm port 3000

### 4. Lỗi authentication
```
{"message":"thong tin dang nhap khong dung"}
```
**Giải pháp**:
- Kiểm tra username/password
- Đảm bảo đã register trước khi login

## Kiểm tra nhanh với cURL

### 1. Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -c cookies.txt
```

### 3. Get current user (với cookie)
```bash
curl http://localhost:3000/api/v1/auth/me \
  -b cookies.txt
```

## Các công cụ hỗ trợ

1. **Postman**: Test API endpoints
2. **MongoDB Compass**: Quản lý database
3. **Docker Desktop**: Chạy containerized environment
4. **VS Code REST Client**: Test API trực tiếp trong VS Code

## Liên kết hữu ích

- API Documentation: `API_DOCUMENTATION.md`
- Source code: Thư mục hiện tại
- Docker configuration: `docker-compose.yml`, `Dockerfile`
- MongoDB init script: `mongo-init.js`