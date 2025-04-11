Here's a `README.md` file for the TDHaemoi API documentation:

```markdown
# TDHaemoi API Documentation

## Base URL
```
http://192.168.4.3:3000
```

## Authentication
All endpoints that require authentication expect a JWT token in the Authorization header:
```
Authorization: <your_jwt_token>
```

## Postman Collection
[View Postman Collection](https://drive.google.com/drive/folders/1_3EDSeX2oatyExqyrhSvlwRGQnHnCIQ6?usp=sharing)

---

## User Endpoints

### 1. Register User (Admin only)
**POST** `/users/register`

**Request Body (multipart/form-data):**
- `name` (required): string
- `email` (required): string
- `password` (required): string
- `image` (optional): file

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "user_name",
    "email": "user_email",
    "image": "image_url"
  }
}
```

### 2. Login User (Admin only)
**POST** `/users/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "user_name",
    "email": "user_email",
    "image": "image_url"
  },
  "token": "jwt_token"
}
```

### 3. Update User (Admin only)
**PUT** `/users/:id`

**Headers:** Authorization required  
**Request Body (multipart/form-data):**
- `name` (optional): string
- `image` (optional): file

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "name": "updated_name",
    "email": "user_email",
    "image": "updated_image_url"
  }
}
```

### 4. Change Password (Admin only)
**PATCH** `/users/change-password`

**Headers:** Authorization required  
**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Product Endpoints

### 1. Create Product
**POST** `/products`

**Headers:** Authorization required  
**Request Body (multipart/form-data):**
- `name`: string
- `brand`: string
- `category`: string
- `subCategory`: string
- `typeOfShoes`: string
- `productDesc`: string
- `price`: string
- `availability`: boolean ("true" or "false")
- `offer`: string
- `size`: string
- `feetFirstFit`: string
- `footLength`: string
- `color`: string
- `technicalData`: string
- `company`: string
- `gender`: enum ("MALE", "FEMALE", "UNISEX")
- `images`: files (up to 10 images)

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "product_id",
    "name": "product_name",
    "images": ["image_url1", "image_url2"]
  }
}
```

### 2. Update Product
**PUT** `/products/:id`

**Headers:** Authorization required  
**Request Body (multipart/form-data):**  
Same fields as Create Product (all optional)  
*Note:* New images will be added to existing ones

### 3. Query Products
**GET** `/products/query`

**Query Parameters:**
- `name`: string
- `brand`: string
- `category`: string
- `subCategory`: string
- `typeOfShoes`: string
- `minPrice`: string
- `maxPrice`: string
- `offer`: string
- `size`: string
- `color`: string
- `company`: string
- `gender`: enum ("MALE", "FEMALE", "UNISEX")
- `availability`: boolean ("true" or "false")
- `sortBy`: string (field name)
- `sortOrder`: string ("asc" or "desc")
- `limit`: number
- `page`: number

**Example URL:**
```
http://localhost:3000/products/query?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_id",
      "name": "product_name",
      "images": ["image_url1", "image_url2"]
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "nextPage": true
}
```

### 4. Delete Product Image
**DELETE** `/products/:id/:imageName`

**Headers:** Authorization required  
**Response (200):**
```json
{
  "success": true,
  "message": "Image deleted"
}
```

### 5. Get All Products
**GET** `/products`

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_id",
      "name": "product_name",
      "images": ["image_url1", "image_url2"]
    }
  ]
}
```

---

## Error Responses

**400 Bad Request**
```json
{
  "message": "Error message describing the issue"
}
```

**401 Unauthorized**
```json
{
  "message": "Unauthorized access"
}
```

**404 Not Found**
```json
{
  "message": "404 route not found"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "Error details"
}
```

---

## Notes for Frontend Developers
- Image URLs are automatically generated for both user and product images
- All requests with file uploads must use `multipart/form-data`
- Pagination is available for product queries
- Case-insensitive search is supported for text fields in product queries
- JWT token expiration is set to 100 days
```