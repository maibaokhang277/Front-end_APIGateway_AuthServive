// =====================================================
// DUMMY DATA - Dữ liệu giả lập cho toàn bộ ứng dụng
// =====================================================

// Tài khoản ngân hàng (dùng cho Login)
export const DUMMY_ACCOUNTS = [
  {
    id: 1,
    username: "nguyenvana",
    password: "123456",
    fullName: "Nguyễn Văn An",
    phone: "0901234567",
    email: "nguyenvana@vietcombank.com.vn",
    balance: 25000000, // 25 triệu VNĐ
  },
  {
    id: 2,
    username: "tranthib",
    password: "123456",
    fullName: "Trần Thị Bình",
    phone: "0912345678",
    email: "tranthib@vietcombank.com.vn",
    balance: 8500000, // 8.5 triệu VNĐ
  },
];

// Danh sách sinh viên & học phí (dùng cho Tra cứu MSSV)
export const DUMMY_STUDENTS = {
  "2151012345": {
    mssv: "2151012345",
    fullName: "Lê Thị Cẩm Nhung",
    faculty: "Công nghệ Thông tin",
    semester: "HK1 2025-2026",
    tuitionFee: 12800000,
  },
  "2151067890": {
    mssv: "2151067890",
    fullName: "Phạm Minh Tuấn",
    faculty: "Kỹ thuật Điện - Điện tử",
    semester: "HK1 2025-2026",
    tuitionFee: 13500000,
  },
  "2251011111": {
    mssv: "2251011111",
    fullName: "Ngô Thị Thu Hà",
    faculty: "Quản trị Kinh doanh",
    semester: "HK1 2025-2026",
    tuitionFee: 9500000,
  },
  "2351022222": {
    mssv: "2351022222",
    fullName: "Võ Văn Đức",
    faculty: "Xây dựng",
    semester: "HK1 2025-2026",
    tuitionFee: 11200000,
  },
};

// Lịch sử giao dịch mẫu ban đầu
export const DUMMY_TRANSACTIONS = [
  {
    id: "TXN001",
    date: "08/10/2026 09:15:32",
    description: "Đóng học phí SV: 2151099999 - Trịnh Hùng Cường",
    amount: -10500000,
    status: "Thành công",
  },
  {
    id: "TXN002",
    date: "01/09/2026 14:22:10",
    description: "Nạp tiền từ ATM",
    amount: 20000000,
    status: "Thành công",
  },
  {
    id: "TXN003",
    date: "15/08/2026 11:05:44",
    description: "Đóng học phí SV: 2051088888 - Đỗ Thị Lan",
    amount: -9800000,
    status: "Thành công",
  },
];

// OTP giả lập (trong thực tế sẽ được gửi qua email/SMS)
export const DUMMY_OTP = "123456";
