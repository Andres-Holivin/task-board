# 📧 Email Controller API Documentation

Controller untuk mengelola dan memonitor email logs dalam Task Board App.

---

## 🔐 Authentication

Semua endpoint memerlukan **JWT Authentication**. Pastikan menyertakan token di header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Endpoints

### 1. Get All Email Logs

**GET** `/emails`

Mendapatkan daftar email logs dengan optional filters.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `PENDING`, `SENT`, `FAILED` |
| `userId` | string | No | Filter by user ID |
| `taskId` | string | No | Filter by task ID |

#### Example Request

```bash
# Get all email logs
GET http://localhost:3001/emails

# Get failed emails only
GET http://localhost:3001/emails?status=FAILED

# Get emails for specific user
GET http://localhost:3001/emails?userId=user-123

# Get emails for specific task
GET http://localhost:3001/emails?taskId=task-456
```

#### Example Response

```json
[
  {
    "id": "email-log-uuid",
    "to": "user@example.com",
    "subject": "✅ Task Baru Berhasil Dibuat",
    "body": "<html>...</html>",
    "status": "SENT",
    "taskId": "task-123",
    "userId": "user-456",
    "error": null,
    "sentAt": "2025-10-03T08:00:00.000Z",
    "createdAt": "2025-10-03T08:00:00.000Z",
    "updatedAt": "2025-10-03T08:00:01.000Z"
  },
  {
    "id": "email-log-uuid-2",
    "to": "user2@example.com",
    "subject": "✅ Task Baru Berhasil Dibuat",
    "body": "<html>...</html>",
    "status": "FAILED",
    "taskId": "task-789",
    "userId": "user-456",
    "error": "Connection timeout",
    "sentAt": null,
    "createdAt": "2025-10-03T07:50:00.000Z",
    "updatedAt": "2025-10-03T07:50:05.000Z"
  }
]
```

---

### 2. Get Email Statistics

**GET** `/emails/stats`

Mendapatkan statistik email untuk current user.

#### Example Request

```bash
GET http://localhost:3001/emails/stats
Authorization: Bearer <your-jwt-token>
```

#### Example Response

```json
{
  "total": 150,
  "sent": 145,
  "failed": 3,
  "pending": 2,
  "successRate": "96.67%"
}
```

---

### 3. Get Email Log by ID

**GET** `/emails/:id`

Mendapatkan detail email log berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Email log ID (UUID) |

#### Example Request

```bash
GET http://localhost:3001/emails/email-log-uuid-123
Authorization: Bearer <your-jwt-token>
```

#### Example Response

```json
{
  "id": "email-log-uuid-123",
  "to": "user@example.com",
  "subject": "✅ Task Baru Berhasil Dibuat",
  "body": "<html>...</html>",
  "status": "SENT",
  "taskId": "task-123",
  "userId": "user-456",
  "error": null,
  "sentAt": "2025-10-03T08:00:00.000Z",
  "createdAt": "2025-10-03T08:00:00.000Z",
  "updatedAt": "2025-10-03T08:00:01.000Z"
}
```

---

### 4. Send Test Email

**POST** `/emails/test`

Mengirim test email untuk testing SMTP configuration.

#### Request Body

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email Subject",
  "message": "This is a test email message"
}
```

#### Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `to` | string | Yes | Valid email address |
| `subject` | string | Yes | Not empty |
| `message` | string | Yes | Not empty |

#### Example Request

```bash
POST http://localhost:3001/emails/test
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Testing Email System",
  "message": "Hello! This is a test email to verify SMTP configuration."
}
```

#### Example Response (Success)

```json
{
  "message": "Test email sent successfully",
  "to": "test@example.com"
}
```

#### Example Response (Error)

```json
{
  "statusCode": 500,
  "message": "Failed to send email: Connection refused",
  "error": "Internal Server Error"
}
```

---

## 🧪 Testing dengan cURL

### Get All Emails

```bash
curl -X GET "http://localhost:3001/emails" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Failed Emails Only

```bash
curl -X GET "http://localhost:3001/emails?status=FAILED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Email Statistics

```bash
curl -X GET "http://localhost:3001/emails/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Email by ID

```bash
curl -X GET "http://localhost:3001/emails/email-log-uuid-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Send Test Email

```bash
curl -X POST "http://localhost:3001/emails/test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email"
  }'
```

---

## 🧪 Testing dengan Postman

### 1. Setup Environment

Create a new environment with:
- `BASE_URL`: `http://localhost:3001`
- `JWT_TOKEN`: `<your-jwt-token>`

### 2. Create Requests

#### Get All Emails
```
GET {{BASE_URL}}/emails
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
```

#### Get Email Stats
```
GET {{BASE_URL}}/emails/stats
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
```

#### Send Test Email
```
POST {{BASE_URL}}/emails/test
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
Body (raw JSON):
{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "Testing email functionality"
}
```

---

## 📊 Use Cases

### 1. Monitor Email Delivery

Check success rate and identify failed emails:

```bash
# Get statistics
GET /emails/stats

# Get all failed emails
GET /emails?status=FAILED
```

### 2. Debug Email Issues

View specific email to debug issues:

```bash
# Get email by ID to see error details
GET /emails/email-log-uuid-123
```

### 3. Test SMTP Configuration

Verify SMTP settings are working:

```bash
POST /emails/test
{
  "to": "your-email@example.com",
  "subject": "SMTP Test",
  "message": "Testing SMTP configuration"
}
```

### 4. Audit Email Activity

Track emails sent for specific task or user:

```bash
# Emails for a specific task
GET /emails?taskId=task-123

# Emails for a specific user
GET /emails?userId=user-456
```

---

## 🔒 Security Features

✅ **JWT Authentication** - All endpoints protected  
✅ **User Isolation** - Stats endpoint shows only current user's data  
✅ **Rate Limiting** - Prevent abuse (recommended to add)  
✅ **Input Validation** - DTOs validate all inputs  

---

## ⚠️ Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Cause:** Missing or invalid JWT token

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "to must be an email",
    "subject should not be empty"
  ],
  "error": "Bad Request"
}
```

**Cause:** Validation errors in request body

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Email log not found"
}
```

**Cause:** Email log with given ID doesn't exist

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to send email: Connection timeout",
  "error": "Internal Server Error"
}
```

**Cause:** SMTP server error or configuration issue

---

## 📈 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server/SMTP error |

---

## 🎯 Best Practices

### 1. Always Check Stats First

Before debugging, check overall statistics:

```bash
GET /emails/stats
```

If success rate is low, check SMTP configuration.

### 2. Filter Results

Use query parameters to narrow down results:

```bash
# Instead of getting all 1000+ emails
GET /emails

# Get only what you need
GET /emails?status=FAILED&userId=current-user
```

### 3. Test Before Production

Always test SMTP configuration:

```bash
POST /emails/test
{
  "to": "your-email@example.com",
  "subject": "Production Test",
  "message": "Testing before going live"
}
```

### 4. Monitor Regularly

Set up monitoring to track:
- Success rate drops below 95%
- Pending emails increase
- Specific error patterns

---

## 🔄 Future Enhancements

Potential improvements:

- [ ] **Pagination** for email logs (currently limited to 100)
- [ ] **Date range filters** (createdAt between X and Y)
- [ ] **Retry endpoint** for failed emails
- [ ] **Bulk operations** (retry all failed, delete old logs)
- [ ] **Email templates management**
- [ ] **Webhook notifications** for failed emails
- [ ] **Rate limiting** to prevent abuse

---

## 📞 Support

For issues or questions:
1. Check email logs: `GET /emails?status=FAILED`
2. Verify SMTP config in `.env`
3. Test connection: `POST /emails/test`
4. Check server logs for detailed errors

---

**Made with ❤️ for Task Board App**
