1. Cách khởi chạy hệ thống:
Mở 2 cửa sổ Terminal song song:

Terminal 1 (Khởi chạy API Gateway ở cổng 8000):
cd api-gateway -> npm install -> npm run dev

Terminal 2 (Khởi chạy Frontend ở cổng 3000):
cd ibanking-tuition -> npm install -> npm run dev

Mở trình duyệt vào http://localhost:3000.

Tài khoản đăng nhập test: Username: 524H0016 | Password: password123

2. Hướng dẫn cắm API thật vào Gateway (Ráp nối Microservices):
Frontend chỉ giao tiếp duy nhất với API Gateway (cổng 8000). Anh em KHÔNG CẦN đụng vào code thư mục ibanking-tuition. Mọi thao tác ráp nối chỉ làm ở file api-gateway/server.js.

Anh em mở file api-gateway/server.js, cuộn xuống phần "3. API GATEWAY ĐỊNH TUYẾN". Tôi đang dùng hàm fetch để gọi sang Postman. Anh em code xong service của mình chạy ở cổng nào (ví dụ Spring Boot cổng 8080, FastAPI cổng 8081) thì vào đây đổi link lại.

Ông làm Student/Tuition Service (TV3):
Tìm route app.get('/api/tuition/:mssv', ...)
Sửa URL trong hàm fetch thành URL API thật của ông:
const response = await fetch('http://localhost:<cổng_của_ông>/api/tuition/${req.params.mssv}');

Ông làm Core Banking & OTP (TV2):
Tìm route app.post('/api/otp/send', ...) và app.post('/api/banking/execute', ...)
Sửa URL trong hàm fetch thành endpoint thực tế của hệ thống.
Ví dụ: const response = await fetch('http://localhost:<cổng_core_banking>/transaction/execute', ...)

3. Lưu ý về JSON Data Contract (Rất quan trọng):
Để Frontend hiển thị đúng mà không bị vỡ giao diện, API thật của anh em khi trả dữ liệu về (Response) phải có các field (key) giống hệt như Mock Data tôi đang cấu hình. Cụ thể:

API Tra cứu học phí: Cần trả về cục JSON có chứa { "studentName": "...", "tuitionFee": 15000000 }.

API Thanh toán: Khi trừ tiền thành công, trả về { "status": "SUCCESS" } (hoặc báo lỗi thì trả về { "message": "Lý do lỗi..." }).