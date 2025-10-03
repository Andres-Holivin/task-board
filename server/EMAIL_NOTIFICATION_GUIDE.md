# Email Notification System

Sistem notifikasi email otomatis untuk Task Board App menggunakan Nodemailer.

## Fitur

✅ **Automatic Email Notification**: Kirim email notifikasi otomatis saat user membuat task baru  
✅ **Email Logging**: Semua email yang dikirim disimpan ke database di tabel `email_logs`  
✅ **Error Handling**: Email error tidak mengganggu flow pembuatan task (graceful degradation)  
✅ **Beautiful HTML Template**: Email menggunakan template HTML yang menarik dan responsive

## Arsitektur

```
┌─────────────┐
│   Client    │
└─────┬───────┘
      │ POST /tasks
      ▼
┌─────────────────┐
│ Tasks Controller│
└─────┬───────────┘
      │
      ▼
┌─────────────────┐       ┌──────────────┐
│  Tasks Service  │──────>│ Email Service│
└─────┬───────────┘       └──────┬───────┘
      │                          │
      ▼                          ▼
┌─────────────────┐       ┌──────────────┐
│   Task Created  │       │ Email Sent + │
│   in Database   │       │ Logged to DB │
└─────────────────┘       └──────────────┘
```

## Database Schema

### Tabel `email_logs`

```prisma
model EmailLog {
  id        String      @id @default(uuid())
  to        String      // Email penerima
  subject   String      // Subject email
  body      String      // HTML body email
  status    EmailStatus @default(PENDING)
  taskId    String?     // ID task yang terkait
  userId    String      // ID user yang memicu email
  error     String?     // Error message jika gagal
  sentAt    DateTime?   // Waktu email berhasil dikirim
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([userId])
  @@index([status])
  @@index([taskId])
  @@map("email_logs")
}

enum EmailStatus {
  PENDING  // Email sedang dalam antrian
  SENT     // Email berhasil dikirim
  FAILED   // Email gagal dikirim
}
```

## Cara Kerja

### 1. User Membuat Task Baru

```typescript
// Client request
POST /api/tasks
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "TODO"
}
```

### 2. Tasks Service Membuat Task & Trigger Email

```typescript
async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
  // 1. Buat task di database
  const task = await this.prisma.task.create({...});

  // 2. Kirim email secara async (tidak block response)
  this.sendTaskCreatedEmail(userId, taskResult).catch(err => {
    console.error('Failed to send task created email:', err);
  });

  return taskResult;
}
```

### 3. Email Service Mengirim Email

```typescript
async sendTaskCreatedEmail(userEmail, userId, taskId, taskTitle, taskDescription) {
  // 1. Simpan log dengan status PENDING
  const emailLog = await this.prisma.emailLog.create({
    data: { to: userEmail, subject, body, status: 'PENDING', ... }
  });

  try {
    // 2. Kirim email menggunakan Nodemailer
    await this.transporter.sendMail({...});

    // 3. Update status ke SENT
    await this.prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'SENT', sentAt: new Date() }
    });
  } catch (error) {
    // 4. Update status ke FAILED jika error
    await this.prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', error: error.message }
    });
  }
}
```

## Konfigurasi SMTP

Tambahkan environment variables berikut di `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=Task Board App
```

### Setup Gmail SMTP (Recommended)

1. Enable 2-Factor Authentication di Google Account
2. Generate App Password:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Generate App Password untuk "Mail"
   - Copy password yang di-generate
3. Gunakan App Password sebagai `SMTP_PASS`

## Template Email

Email menggunakan HTML template yang menarik dengan fitur:

- ✅ Responsive design
- ✅ Professional styling dengan warna brand
- ✅ Header dengan icon emoji
- ✅ Task title dan description yang jelas
- ✅ Footer dengan branding app

### Preview Email

```
┌────────────────────────────────────┐
│  🎉 Task Baru Berhasil Dibuat!     │
│         (Green Header)             │
├────────────────────────────────────┤
│                                    │
│  Halo,                             │
│                                    │
│  Task baru Anda telah berhasil     │
│  dibuat:                           │
│                                    │
│  📋 Complete project documentation │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Write comprehensive docs     │ │
│  └──────────────────────────────┘ │
│                                    │
│  Anda dapat melihat dan mengelola  │
│  task ini di dashboard Anda.       │
│                                    │
├────────────────────────────────────┤
│  Email ini dikirim otomatis oleh   │
│         Task Board App             │
└────────────────────────────────────┘
```

## Error Handling

### Graceful Degradation

Email service menggunakan **fire-and-forget** pattern:

```typescript
// Email dikirim secara async dan tidak block response
this.sendTaskCreatedEmail(userId, task).catch(err => {
  console.error('Failed to send task created email:', err);
  // Error di-log tapi tidak throw
});
```

**Benefits:**
- ✅ Task tetap dibuat meskipun email gagal dikirim
- ✅ User experience tidak terganggu
- ✅ Error tercatat di log untuk monitoring

### Error Logging

Semua error disimpan ke database:

```typescript
await this.prisma.emailLog.update({
  where: { id: emailLog.id },
  data: {
    status: 'FAILED',
    error: error.message // Error message disimpan
  }
});
```

## Query Email Logs

### Cek semua email yang dikirim ke user

```sql
SELECT * FROM email_logs 
WHERE "userId" = 'user-id' 
ORDER BY "createdAt" DESC;
```

### Cek email yang failed

```sql
SELECT * FROM email_logs 
WHERE status = 'FAILED' 
ORDER BY "createdAt" DESC;
```

### Cek email untuk task tertentu

```sql
SELECT * FROM email_logs 
WHERE "taskId" = 'task-id';
```

## Testing

### Manual Testing

1. Pastikan SMTP credentials sudah benar di `.env`
2. Start server: `yarn start:dev`
3. Buat task baru via API atau UI
4. Check email inbox
5. Check database `email_logs` table

### Test Email Service Locally

```typescript
// test/email.test.ts
describe('EmailService', () => {
  it('should send task created email', async () => {
    const result = await emailService.sendTaskCreatedEmail(
      'test@example.com',
      'user-id',
      'task-id',
      'Test Task',
      'Test Description'
    );
    
    // Check email_logs table
    const log = await prisma.emailLog.findFirst({
      where: { taskId: 'task-id' }
    });
    
    expect(log.status).toBe('SENT');
  });
});
```

## Monitoring

### Metrics to Monitor

1. **Email Success Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'SENT') as sent,
     COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
     COUNT(*) as total
   FROM email_logs
   WHERE "createdAt" > NOW() - INTERVAL '24 hours';
   ```

2. **Average Delivery Time**
   ```sql
   SELECT AVG("sentAt" - "createdAt") as avg_delivery_time
   FROM email_logs
   WHERE status = 'SENT';
   ```

3. **Common Errors**
   ```sql
   SELECT error, COUNT(*) as count
   FROM email_logs
   WHERE status = 'FAILED'
   GROUP BY error
   ORDER BY count DESC;
   ```

## Best Practices

✅ **Async Processing**: Email dikirim secara async agar tidak block API response  
✅ **Comprehensive Logging**: Semua email dicatat dengan status dan error  
✅ **User Privacy**: Email credentials tidak pernah di-expose ke client  
✅ **Error Recovery**: Gagal kirim email tidak mengganggu core functionality  
✅ **Template Management**: HTML template di-manage di service untuk konsistensi  

## Future Enhancements

Fitur yang bisa ditambahkan di masa depan:

1. **Email Queue**: Gunakan Bull/BullMQ untuk queue management
2. **Retry Logic**: Automatic retry untuk email yang failed
3. **Multiple Templates**: Template berbeda untuk berbagai event
4. **Email Preferences**: User bisa pilih notifikasi apa yang ingin diterima
5. **Batch Emails**: Kirim digest email harian/mingguan
6. **Email Analytics**: Track open rate, click rate, etc.
7. **Unsubscribe Link**: Tambahkan link unsubscribe di email

## Troubleshooting

### Email tidak terkirim

1. Check SMTP credentials di `.env`
2. Check `email_logs` table untuk error message
3. Check console log untuk error
4. Test SMTP connection:
   ```typescript
   await this.transporter.verify();
   ```

### Gmail SMTP Error: "Less secure app access"

- **Solution**: Gunakan App Password instead of account password
- Follow setup Gmail SMTP guide di atas

### Database error: "Table email_logs does not exist"

- **Solution**: Run migration
  ```bash
  npx prisma migrate dev
  ```

## Kontak

Jika ada pertanyaan atau issue, silakan buat issue di GitHub repository.

---

**Made with ❤️ by Task Board Team**
