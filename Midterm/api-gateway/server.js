const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Cho phép Frontend gọi API mà không bị chặn lỗi CORS
app.use(cors());

// Middleware để đọc dữ liệu JSON (chỉ dùng cho route auth)
app.use('/api/auth', express.json());

// ==========================================
// 1. AUTH SERVICE (Dữ liệu người dùng giả lập)
// ==========================================
const mockUser = {
    username: "524H0016", 
    password: "password123",
    fullName: "Mai Bảo Khang",
    email: "langkang2707@gmail.com",
    phone: "0901234567",
    balance: 20000000 // Khởi tạo số dư 20 triệu
};

// API Đăng nhập
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra thông tin
    if (username === mockUser.username && password === mockUser.password) {
        // Tạo chuỗi mã hóa JWT (có hạn 1 tiếng)
        const token = jwt.sign(
            { username: mockUser.username, fullName: mockUser.fullName }, 
            process.env.JWT_SECRET || 'secret_key_tam_thoi_SOA', 
            { expiresIn: '1h' }
        );

        return res.json({
            message: "Đăng nhập thành công",
            token: token,
            user: {
                fullName: mockUser.fullName,
                email: mockUser.email,
                phone: mockUser.phone,
                balance: mockUser.balance
            }
        });
    }
    
    return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
});

// ==========================================
// 2. NGƯỜI GÁC CỔNG (MIDDLEWARE JWT)
// ==========================================
// Hàm này sẽ kiểm tra xem Frontend có gửi thẻ (token) lên không
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ chuỗi "Bearer <token>"

    if (!token) return res.status(403).json({ message: "Truy cập bị từ chối: Vui lòng đăng nhập" });

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tam_thoi_SOA', (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
        req.user = decoded; // Lưu lại thông tin giải mã
        next(); // Token đúng -> Cho phép đi tiếp vào Gateway
    });
};

// ==========================================
// 3. API GATEWAY ĐỊNH TUYẾN ĐẾN POSTMAN
// ==========================================
// Cấu hình Proxy
const proxyOptions = {
    target: process.env.MOCK_SERVER_URL, // Lấy URL Postman từ file .env
    changeOrigin: true,
    pathRewrite: {
        '^/api': ""
    }
};

app.get('/api/tuition/:mssv', verifyToken, async (req, res) => {
    try {
        // Xóa dấu / ở cuối URL trong .env nếu có để ghép chuỗi cho chuẩn
        const baseUrl = process.env.MOCK_SERVER_URL.replace(/\/$/, '');
        const mockUrl = `${baseUrl}/tuition/${req.params.mssv}`;
        
        console.log("Đang gọi sang Postman URL:", mockUrl); // Log ra để kiểm tra

        const response = await fetch(mockUrl);
        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error("Lỗi gọi Mock Server:", error);
        res.status(500).json({ message: "Lỗi kết nối đến Backend thực tế" });
    }
});

// Chuyển tiếp request Gửi OTP
app.post('/api/otp/send', verifyToken, async (req, res) => {
    try {
        const baseUrl = process.env.MOCK_SERVER_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi gửi OTP" });
    }
});

// Chuyển tiếp request Thanh toán
app.post('/api/banking/execute', verifyToken, async (req, res) => {
    try {
        const baseUrl = process.env.MOCK_SERVER_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/banking/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi thanh toán" });
    }
});

// ==========================================
// 4. KHỞI CHẠY SERVER
// ==========================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
    console.log(`🔗 Đang trỏ Mock Server tới: ${process.env.MOCK_SERVER_URL || 'CHƯA CÓ URL'}`);
    console.log(`=============================================`);
});