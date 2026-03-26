# API Documentation for NNPTUD-C5 Project

## Base URL
`http://localhost:3000/api/v1`

## Authentication
Most endpoints require authentication via JWT token stored in cookies. Use `/auth/login` to obtain token.

## API Endpoints

### Authentication (`/auth`)

#### 1. Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```
- **Response**: Returns created user with cart

#### 2. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**: JWT token (also set as cookie `TOKEN_LOGIN`)

#### 3. Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Response**: "logout thanh cong"

#### 4. Change Password
- **URL**: `/auth/changepassword`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
```json
{
  "oldpassword": "string",
  "newpassword": "string"
}
```

#### 5. Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Current user object

#### 6. Forgot Password
- **URL**: `/auth/forgotpassword`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
```json
{
  "email": "string"
}
```

#### 7. Reset Password
- **URL**: `/auth/resetpassword/:token`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
```json
{
  "password": "string"
}
```

### Users Management (`/users`)

#### 1. Get All Users
- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required + ADMIN/MODERATOR role
- **Response**: Array of users

#### 2. Get User by ID
- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: User object

#### 3. Create User
- **URL**: `/users`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "string (ObjectId)",
  "fullname": "string",
  "avatarUrl": "string"
}
```

#### 4. Update User
- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Not required
- **Request Body**: Partial user data

#### 5. Delete User (Soft Delete)
- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Not required
- **Response**: Updated user with `isDeleted: true`

### Products (`/products`)

#### 1. Get All Products
- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `title`: Filter by title (case-insensitive)
  - `min`: Minimum price (default: 0)
  - `max`: Maximum price (default: 10000)
- **Response**: Array of products with category populated

#### 2. Get Product by ID
- **URL**: `/products/:id`
- **Method**: `GET`
- **Response**: Single product object

#### 3. Create Product
- **URL**: `/products`
- **Method**: `POST`
- **Request Body**:
```json
{
  "title": "string",
  "price": "number",
  "description": "string",
  "category": "string (ObjectId)",
  "images": ["string"]
}
```
- **Note**: Automatically creates inventory entry with stock: -1

#### 4. Update Product
- **URL**: `/products/:id`
- **Method**: `PUT`
- **Request Body**: Partial product data

#### 5. Delete Product (Soft Delete)
- **URL**: `/products/:id`
- **Method**: `DELETE`
- **Response**: Product with `isDeleted: true`

### Categories (`/categories`)

#### 1. Get All Categories
- **URL**: `/categories`
- **Method**: `GET`
- **Response**: Array of categories

#### 2. Get Category by ID
- **URL**: `/categories/:id`
- **Method**: `GET`
- **Response**: Single category object

#### 3. Create Category
- **URL**: `/categories`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "string",
  "image": "string"
}
```
- **Note**: Slug is auto-generated from name

#### 4. Update Category
- **URL**: `/categories/:id`
- **Method**: `PUT`
- **Request Body**: Partial category data

#### 5. Delete Category (Soft Delete)
- **URL**: `/categories/:id`
- **Method**: `DELETE`
- **Response**: Category with `isDeleted: true`

### Carts (`/carts`)

#### 1. Get User Cart
- **URL**: `/carts`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User's cart with products

#### 2. Add to Cart
- **URL**: `/carts/add`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
```json
{
  "product": "string (ObjectId)",
  "quantity": "number"
}
```

#### 3. Remove from Cart
- **URL**: `/carts/remove`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
```json
{
  "product": "string (ObjectId)",
  "quantity": "number"
}
```

### Roles (`/roles`)

#### 1. Get All Roles
- **URL**: `/roles`
- **Method**: `GET`
- **Response**: Array of roles

#### 2. Get Role by ID
- **URL**: `/roles/:id`
- **Method**: `GET`
- **Response**: Single role object

#### 3. Create Role
- **URL**: `/roles`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

#### 4. Update Role
- **URL**: `/roles/:id`
- **Method**: `PUT`
- **Request Body**: Partial role data

#### 5. Delete Role (Soft Delete)
- **URL**: `/roles/:id`
- **Method**: `DELETE`
- **Response**: Role with `isDeleted: true`

### File Upload (`/upload`)

#### 1. Upload Single File
- **URL**: `/upload/one_file`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (file upload)
- **Response**: File metadata

#### 2. Upload Multiple Files
- **URL**: `/upload/multiple_file`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**: `files` (multiple file upload, max 5)
- **Response**: Array of file metadata

#### 3. Get Uploaded File
- **URL**: `/upload/:filename`
- **Method**: `GET`
- **Response**: File content

## Sample Data for Testing

### Register a User
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

### Login
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### Create Product
```json
{
  "title": "Sample Product",
  "price": 29.99,
  "description": "This is a sample product",
  "category": "69b2763ce64fe93ca6985b56",
  "images": ["https://example.com/image.jpg"]
}
```

### Create Category
```json
{
  "name": "Electronics",
  "image": "https://example.com/category.jpg"
}
```

## Important Notes

1. **Authentication**: After login, the JWT token is stored in a cookie named `TOKEN_LOGIN`. Postman should handle cookies automatically.

2. **Role-based Access**: Some endpoints require specific roles (ADMIN, MODERATOR).

3. **Soft Delete**: Most DELETE operations are soft deletes (sets `isDeleted: true`).

4. **MongoDB IDs**: Use valid MongoDB ObjectId strings for references.

5. **File Upload**: Files are saved to `uploads/` directory.

6. **Error Responses**: Most errors return 404 with message in Vietnamese.