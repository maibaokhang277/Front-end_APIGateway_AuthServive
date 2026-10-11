// =====================================================
// components/UserProfile.jsx
// Hiển thị thông tin tài khoản người dùng
// =====================================================

import { useAuth } from "@/context/AuthContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function UserProfile() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const balanceColor =
    currentUser.balance >= 10000000
      ? "#28a745"
      : currentUser.balance >= 5000000
      ? "#fd7e14"
      : "#dc3545";

  return (
    <div className="card border-0 shadow-sm h-100">
      <div
        className="card-header border-0 text-white"
        style={{ background: "linear-gradient(135deg, #004d99, #0070cc)" }}
      >
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mr-3"
            style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <i className="fas fa-user fa-lg" />
          </div>
          <div>
            <h6 className="mb-0 font-weight-bold">{currentUser.fullName}</h6>
            <small className="text-white-50">@{currentUser.username}</small>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Số dư nổi bật */}
        <div
          className="rounded p-3 mb-3 text-center"
          style={{ backgroundColor: "#f8f9fa", border: "2px solid #e9ecef" }}
        >
          <p className="small text-muted mb-1 text-uppercase font-weight-bold">Số dư khả dụng</p>
          <h3 className="font-weight-bold mb-0" style={{ color: balanceColor }}>
            {formatCurrency(currentUser.balance)}
          </h3>
        </div>

        {/* Thông tin chi tiết */}
        <table className="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td className="text-muted small pl-0" style={{ width: "40%" }}>
                <i className="fas fa-phone-alt mr-1" /> SĐT
              </td>
              <td className="small font-weight-bold">{currentUser.phone}</td>
            </tr>
            <tr>
              <td className="text-muted small pl-0">
                <i className="fas fa-envelope mr-1" /> Email
              </td>
              <td className="small font-weight-bold">{currentUser.email}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
