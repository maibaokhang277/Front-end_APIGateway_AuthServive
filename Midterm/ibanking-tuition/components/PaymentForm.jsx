// =====================================================
// components/PaymentForm.jsx
// Form tra cứu và thanh toán học phí - 3 nhóm
// =====================================================

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DUMMY_STUDENTS } from "@/lib/dummyData";
import OTPModal from "./OTPModal";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function PaymentForm() {
  const { currentUser, processPayment } = useAuth();

  // State tra cứu
  const [mssv, setMssv] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // State thanh toán
  const [agreed, setAgreed] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Điều kiện enable nút Xác nhận giao dịch
  const hasEnoughBalance =
    studentInfo && currentUser && currentUser.balance >= studentInfo.tuitionFee;
  const canPay = studentInfo !== null && agreed && hasEnoughBalance;

  // Gọi API Gateway để tra cứu MSSV
  const handleLookup = async () => {
    if (!mssv.trim()) {
      setLookupError("Vui lòng nhập MSSV.");
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    setStudentInfo(null);
    setAgreed(false);
    setSuccessMsg("");

    try {
      // 1. Lấy token để xác thực với Gateway
      const token = localStorage.getItem("ibanking_token");
      if (!token) throw new Error("Phiên đăng nhập đã hết hạn.");

      // 2. Gửi request GET đến API Gateway
      const response = await fetch(`http://localhost:8000/api/tuition/${mssv.trim()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      // 3. Xử lý kết quả trả về từ Gateway (và Mock Server Postman)
      if (response.ok) {
        const data = await response.json();
        
        // Cần đảm bảo dữ liệu Mock Server trả về khớp key với UI (fullName, faculty, semester...)
        // Nếu Mock Server chỉ trả studentName, ta map lại cho UI:
        setStudentInfo({
          ...data,
          fullName: data.studentName || data.fullName || "Chưa cập nhật tên",
          faculty: data.faculty || "Khoa Công nghệ thông tin",
          semester: data.semester || "HK1/2026-2027",
          tuitionFee: data.tuitionFee || 0
        });
      } else {
        // Trường hợp API Gateway trả lỗi (ví dụ 404 Not Found từ Postman)
        setLookupError(
          `Không tìm thấy sinh viên với MSSV "${mssv.trim()}". Vui lòng kiểm tra lại.`
        );
      }
    } catch (error) {
      setLookupError("Lỗi kết nối máy chủ. " + error.message);
    } finally {
      setLookupLoading(false);
    }
  };

  // Xử lý sau khi OTP thành công
  const handleOTPSuccess = () => {
    processPayment(studentInfo, studentInfo.tuitionFee);
    setShowOTPModal(false);
    setSuccessMsg(
      `Giao dịch thành công! Đã đóng học phí ${formatCurrency(studentInfo.tuitionFee)} cho sinh viên ${studentInfo.fullName}.`
    );
    // Reset form
    setStudentInfo(null);
    setMssv("");
    setAgreed(false);
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div
          className="card-header text-white border-0"
          style={{ background: "linear-gradient(135deg, #155724, #28a745)" }}
        >
          <h6 className="mb-0 font-weight-bold">
            <i className="fas fa-money-bill-wave mr-2" />
            Tra cứu & Thanh toán học phí
          </h6>
        </div>

        <div className="card-body p-4">
          {/* Thông báo thành công */}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-start" role="alert">
              <i className="fas fa-check-circle fa-lg mr-3 mt-1 flex-shrink-0" />
              <div>
                <strong>Giao dịch thành công!</strong>
                <br />
                <span className="small">{successMsg}</span>
              </div>
              <button
                type="button"
                className="close ml-auto"
                onClick={() => setSuccessMsg("")}
              >
                <span>&times;</span>
              </button>
            </div>
          )}

          {/* ─── NHÓM 1: Người nộp tiền (Read-only) ─── */}
          <fieldset className="border rounded p-3 mb-4">
            <legend
              className="w-auto px-2 mb-0"
              style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#004d99" }}
            >
              <i className="fas fa-user-tie mr-1" />
              Người nộp tiền
            </legend>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group mb-2">
                  <label className="small text-muted mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={currentUser?.fullName || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-2">
                  <label className="small text-muted mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={currentUser?.phone || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-2">
                  <label className="small text-muted mb-1">Email</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={currentUser?.email || ""}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <p className="small text-muted mb-0 mt-1">
              <i className="fas fa-lock mr-1" />
              Thông tin lấy từ tài khoản đăng nhập, không thể chỉnh sửa.
            </p>
          </fieldset>

          {/* ─── NHÓM 2: Thông tin học phí ─── */}
          <fieldset className="border rounded p-3 mb-4">
            <legend
              className="w-auto px-2 mb-0"
              style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#004d99" }}
            >
              <i className="fas fa-search mr-1" />
              Thông tin học phí
            </legend>

            <div className="form-row align-items-end mb-3">
              <div className="col">
                <label className="small text-muted mb-1">
                  Mã số sinh viên (MSSV) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${lookupError ? "is-invalid" : ""}`}
                  value={mssv}
                  onChange={(e) => {
                    setMssv(e.target.value);
                    setLookupError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !lookupLoading && handleLookup()}
                  disabled={lookupLoading}
                />
                {lookupError && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle mr-1" />
                    {lookupError}
                  </div>
                )}
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  style={{ background: "linear-gradient(135deg, #004d99, #0070cc)", border: "none" }}
                >
                  {lookupLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-1" />
                      Đang tra cứu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search mr-1" />
                      Tra cứu
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Kết quả tra cứu */}
            {studentInfo && (
              <div
                className="rounded p-3"
                style={{
                  backgroundColor: "#f0fff4",
                  border: "1px solid #c3e6cb",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <p className="small font-weight-bold text-success mb-2">
                  <i className="fas fa-check-circle mr-1" />
                  Tra cứu thành công
                </p>
                <div className="row small">
                  <div className="col-sm-6">
                    <div className="mb-1">
                      <span className="text-muted">Họ tên sinh viên: </span>
                      <strong>{studentInfo.fullName}</strong>
                    </div>
                    <div className="mb-1">
                      <span className="text-muted">MSSV: </span>
                      <strong>{studentInfo.mssv}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-1">
                      <span className="text-muted">Khoa: </span>
                      <strong>{studentInfo.faculty}</strong>
                    </div>
                    <div className="mb-1">
                      <span className="text-muted">Học kỳ: </span>
                      <strong>{studentInfo.semester}</strong>
                    </div>
                  </div>
                  <div className="col-12 mt-2">
                    <div
                      className="p-2 rounded d-flex align-items-center justify-content-between"
                      style={{ backgroundColor: "#fff", border: "1px dashed #28a745" }}
                    >
                      <span className="text-muted">
                        <i className="fas fa-money-check-alt mr-1" />
                        Học phí cần đóng:
                      </span>
                      <strong className="text-danger" style={{ fontSize: "1.1rem" }}>
                        {formatCurrency(studentInfo.tuitionFee)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* ─── NHÓM 3: Thông tin thanh toán ─── */}
          <fieldset className="border rounded p-3 mb-4">
            <legend
              className="w-auto px-2 mb-0"
              style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#004d99" }}
            >
              <i className="fas fa-credit-card mr-1" />
              Thông tin thanh toán
            </legend>

            <div className="row small mb-3">
              <div className="col-sm-6">
                <div
                  className="p-3 rounded h-100"
                  style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <p className="text-muted mb-1">Số dư khả dụng</p>
                  <p
                    className="font-weight-bold mb-0"
                    style={{
                      fontSize: "1.1rem",
                      color:
                        currentUser?.balance >= 10000000
                          ? "#28a745"
                          : currentUser?.balance >= 5000000
                          ? "#fd7e14"
                          : "#dc3545",
                    }}
                  >
                    {currentUser ? formatCurrency(currentUser.balance) : "—"}
                  </p>
                </div>
              </div>
              <div className="col-sm-6 mt-2 mt-sm-0">
                <div
                  className="p-3 rounded h-100"
                  style={{
                    backgroundColor: studentInfo ? "#fff8f8" : "#f8f9fa",
                    border: `1px solid ${studentInfo ? "#f5c6cb" : "#e9ecef"}`,
                  }}
                >
                  <p className="text-muted mb-1">Số tiền cần thanh toán</p>
                  <p
                    className="font-weight-bold mb-0"
                    style={{ fontSize: "1.1rem", color: studentInfo ? "#dc3545" : "#6c757d" }}
                  >
                    {studentInfo ? formatCurrency(studentInfo.tuitionFee) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cảnh báo không đủ số dư */}
            {studentInfo && !hasEnoughBalance && (
              <div className="alert alert-warning small py-2 mb-3">
                <i className="fas fa-exclamation-triangle mr-1" />
                <strong>Số dư không đủ!</strong> Số dư khả dụng thấp hơn học phí cần đóng.
              </div>
            )}

            {/* Checkbox đồng ý */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="agreeCheckbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="agreeCheckbox">
                Tôi đồng ý với{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Điều khoản và thỏa thuận hệ thống
                </a>{" "}
                của NMK iBanking. Giao dịch này sẽ được xử lý ngay lập tức và không thể hoàn tác.
              </label>
            </div>
          </fieldset>

          {/* ─── NÚT XÁC NHẬN GIAO DỊCH ─── */}
          <div className="text-right">
            {!canPay && (
              <p className="small text-muted mb-2">
                <i className="fas fa-info-circle mr-1" />
                {!studentInfo
                  ? "Tra cứu MSSV thành công để tiếp tục."
                  : !hasEnoughBalance
                  ? "Số dư không đủ để thực hiện giao dịch."
                  : "Vui lòng đồng ý với thỏa thuận hệ thống."}
              </p>
            )}
            <button
              type="button"
              className="btn btn-lg px-5"
              disabled={!canPay}
              onClick={() => setShowOTPModal(true)}
              style={{
                background: canPay
                  ? "linear-gradient(135deg, #155724, #28a745)"
                  : undefined,
                border: "none",
                color: canPay ? "white" : undefined,
                transition: "all 0.2s",
              }}
            >
              <i className="fas fa-lock mr-2" />
              Xác nhận giao dịch
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSuccess={handleOTPSuccess}
        studentInfo={studentInfo}
        amount={studentInfo?.tuitionFee}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
}
