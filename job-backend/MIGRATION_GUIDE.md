# 🚀 Migration Guide - Restructure Job Portal Backend

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Cấu trúc mới](#cấu-trúc-mới)
3. [Bước migration](#bước-migration)
4. [Testing](#testing)
5. [Deployment](#deployment)

---

## 🎯 Tổng quan

### Cấu trúc cũ (Hiện tại):
- Tất cả code trong 1 file `server.js` (~2000 lines)
- Routes, controllers, business logic lẫn lộn
- Khó maintain và scale

### Cấu trúc mới (MVC Pattern):
```
job-backend/
├── config/          # Configuration files
├── models/          # Database models
├── controllers/     # Route handlers
├── routes/          # API routes
├── middleware/      # Middleware functions
├── services/        # Business logic
├── utils/           # Utilities
├── validations/     # Validation schemas
├── database/        # Database scripts & seeders
├── uploads/         # File uploads
├── logs/            # Application logs
├── tests/           # Tests
├── .env             # Environment variables
├── server.js        # Server entry point (NEW - clean)
└── app.js           # Express app config (Optional)
```

---

## 📂 Cấu trúc mới chi tiết

### 1. **server.js** (Main Entry Point)
```javascript
// Clean, minimal, chỉ khởi động server
require('dotenv').config();
const app = require('./app'); // hoặc inline config

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. **routes/index.js** (Route Aggregator)
```javascript
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/jobs', require('./jobs'));
router.use('/applications', require('./applications'));
router.use('/users', require('./users'));
router.use('/employers', require('./employers'));
router.use('/admin', require('./admin'));
router.use('/categories', require('./categories'));

module.exports = router;
```

### 3. **Controllers** (Business Logic)
Chuyển từ:
```javascript
// OLD - trong server.js
app.post("/api/auth/login", async (req, res) => {
  // 50 lines of code...
});
```

Sang:
```javascript
// NEW - controllers/authController.js
exports.login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

---

## 🔄 Bước Migration

### **STEP 1: Backup code cũ**
```bash
# Backup server.js cũ
cp server.js server.js.backup
```

### **STEP 2: Cài đặt packages mới**
```bash
npm install helmet morgan winston
npm install sharp nodemailer
npm install express-rate-limit express-slow-down
npm install joi express-validator
```

### **STEP 3: Tạo cấu trúc thư mục**
```bash
mkdir -p config models controllers routes middleware services utils validations database/seeders uploads logs tests
```

### **STEP 4: Tạo các file config**
1. **config/db.js** - Giữ nguyên
2. **config/passport.js** - Tách Google OAuth logic
3. **.env** - Copy từ .env.example

### **STEP 5: Di chuyển Routes**

**Tạo từng file route:**

**routes/auth.js:**
```javascript
const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateUserLogin } = require('../middleware/validateInput');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, validateUserLogin, authController.login);
router.post('/register', authLimiter, authController.register);
// ... other routes

module.exports = router;
```

**Lặp lại cho:**
- routes/jobs.js
- routes/applications.js
- routes/users.js
- routes/employers.js
- routes/admin.js
- routes/categories.js

### **STEP 6: Tạo Controllers**

**controllers/authController.js:**
```javascript
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  
  res.json({
    success: true,
    data: result
  });
});

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  
  res.status(201).json({
    success: true,
    data: result
  });
});

// ... other methods
```

**Tạo controllers cho:**
- jobController.js
- applicationController.js
- userController.js
- employerController.js
- adminController.js
- categoryController.js

### **STEP 7: Di chuyển Business Logic sang Services**

Các services đã có:
- ✅ authService.js
- ✅ jobService.js
- ✅ emailService.js
- ✅ uploadService.js
- ✅ searchService.js

### **STEP 8: Copy Middleware**

Các middleware đã có:
- ✅ auth.js
- ✅ roleCheck.js
- ✅ validateInput.js
- ✅ errorHandler.js
- ✅ upload.js
- ✅ rateLimiter.js

### **STEP 9: Cập nhật server.js mới**

Replace file `server.js` cũ bằng version mới đã tạo (clean version).

### **STEP 10: Test từng route**

**Test flow:**
```bash
# 1. Start server
npm start

# 2. Test health
curl http://localhost:5000/health

# 3. Test auth
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Test jobs
curl http://localhost:5000/api/jobs
```

---

## ✅ Checklist Migration

### Phase 1: Setup (Day 1)
- [ ] Backup code cũ
- [ ] Cài packages mới
- [ ] Tạo cấu trúc thư mục
- [ ] Setup .env file
- [ ] Test database connection

### Phase 2: Core Structure (Day 2-3)
- [ ] Tạo routes/index.js
- [ ] Tạo middleware files
- [ ] Tạo service files
- [ ] Setup error handling

### Phase 3: Routes & Controllers (Day 4-6)
- [ ] Auth routes + controller
- [ ] Jobs routes + controller
- [ ] Applications routes + controller
- [ ] Users routes + controller
- [ ] Employers routes + controller
- [ ] Admin routes + controller
- [ ] Categories routes + controller

### Phase 4: Testing (Day 7)
- [ ] Test all auth endpoints
- [ ] Test all job endpoints
- [ ] Test all application endpoints
- [ ] Test file uploads
- [ ] Test error handling

### Phase 5: Optimization (Day 8)
- [ ] Add validation
- [ ] Add logging
- [ ] Add rate limiting
- [ ] Performance tuning

### Phase 6: Documentation (Day 9)
- [ ] API documentation
- [ ] README update
- [ ] Setup guide

### Phase 7: Deployment (Day 10)
- [ ] Deploy to staging
- [ ] Final testing
- [ ] Deploy to production

---

## 🧪 Testing Commands

```bash
# Development
npm run dev

# Production
npm start

# Run tests
npm test

# Run specific test
npm test -- auth.test.js

# Check code coverage
npm run coverage
```

---

## 🚀 Deployment

### Environment-specific configs:

**Development:**
```env
NODE_ENV=development
LOG_LEVEL=debug
```

**Staging:**
```env
NODE_ENV=staging
LOG_LEVEL=info
```

**Production:**
```env
NODE_ENV=production
LOG_LEVEL=error
```

---

## 📊 So sánh trước/sau

| Metric | Trước | Sau |
|--------|-------|-----|
| Lines in server.js | ~2000 | ~100 |
| Files | 5-10 | 50+ |
| Maintainability | Thấp | Cao |
| Testability | Khó | Dễ |
| Scalability | Khó | Dễ |
| Team collaboration | Khó | Dễ |

---

## 💡 Best Practices

1. **Always use async/await** thay vì callbacks
2. **Use asyncHandler** wrapper cho error handling
3. **Validate input** ở middleware layer
4. **Business logic** nên ở services, không phải controllers
5. **Controllers** chỉ nên gọi services và trả response
6. **Routes** chỉ định nghĩa URL và middleware chain
7. **Use environment variables** cho mọi config
8. **Log mọi thứ** quan trọng
9. **Handle errors** properly với global error handler
10. **Write tests** cho mọi endpoint quan trọng

---

## 🆘 Troubleshooting

### Lỗi thường gặp:

**1. Cannot find module**
```bash
# Solution: Check import path
const routes = require('./routes'); // ✅
const routes = require('./routes/index'); // ✅
```

**2. Database connection failed**
```bash
# Check .env
# Check database is running
# Check credentials
```

**3. Routes not working**
```bash
# Check route order in routes/index.js
# Specific routes must come before general routes
```

**4. CORS errors**
```bash
# Update CORS config in server.js
# Check FRONTEND_URL in .env
```

---

## 📚 Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Design Patterns](https://nodejs.org/en/docs/guides/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✨ Kết luận

Migration này sẽ giúp code:
- ✅ **Sạch hơn** - Dễ đọc, dễ hiểu
- ✅ **Bảo trì dễ hơn** - Thay đổi một chỗ không ảnh hưởng toàn bộ
- ✅ **Scale tốt hơn** - Thêm features mới dễ dàng
- ✅ **Test được** - Có thể test từng phần riêng
- ✅ **Team work tốt hơn** - Nhiều người có thể làm song song

**Estimated Time:** 7-10 days (full-time)

Good luck! 🚀