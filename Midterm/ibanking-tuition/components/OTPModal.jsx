// =====================================================
// components/OTPModal.jsx
// Modal xác thực OTP với đồng hồ đếm ngược 5 phút
// Tích hợp gọi API qua Gateway
// =====================================================

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_SECONDS = 5 * 60; // 5 phút

export default function OTPModal({ isOpen, onClose, onSuccess, studentInfo, amount }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Biến lưu transactionId giả lập từ API OTP
  const [txnId, setTxnId] = useState("");

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  const startTimer = useCallback(() => {
    setSecondsLeft(TOTAL_SECONDS);
    setIsExpired(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Gọi API lấy mã OTP mỗi khi modal được mở ra
  const triggerOtpSend = useCallback(async () => {
    const token = localStorage.getItem("ibanking_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/otp/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ studentId: studentInfo?.mssv })
      });
      const data = await response.json();
      if (response.ok) {
        setTxnId(data.transactionId || "TXN_TEMP"); // Lưu ID giao dịch để dùng lúc thanh toán
      } else {
        setError("Không thể gửi OTP lúc này: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API gửi OTP:", err);
    }
  }, [studentInfo]);

  // Khởi động/reset timer và tự động gọi API OTP khi Modal mở
  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError("");
      startTimer();
      triggerOtpSend(); 
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, startTimer, triggerOtpSend]);

  const handleResend = () => {
    setOtp("");
    setError("");
    startTimer();
    triggerOtpSend(); // Gọi lại API nếu người dùng bấm Gửi lại
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const timerColor =
    secondsLeft > 120 ? "#28a745" : secondsLeft > 60 ? "#fd7e14" : "#dc3545";

  // Hàm gọi API Thanh toán
  const handleConfirm = async () => {
    if (isExpired) {
      setError("Mã OTP đã hết hạn. Vui lòng nhấn Gửi lại.");
      return;
    }
    if (!otp.trim() || otp.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("ibanking_token");
      
      // Gọi API Gateway -> Proxy xuống Core Banking Service
      const response = await fetch("http://localhost:8000/api/banking/execute", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          studentId: studentInfo.mssv,
          amount: amount,
          otpCode: otp,
          transactionId: txnId
        })
      });

      const data = await response.json();

      if (response.ok && data.status === "SUCCESS") {
        clearInterval(timerRef.current);
        // Gọi onSuccess để form chính biết mà trừ tiền ở Frontend
        onSuccess(); 
      } else {
        setError(data.message || "Giao dịch thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      setError("Lỗi kết nối máy chủ khi xử lý giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-backdrop show"
        style={{ zIndex: 1040 }}
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="modal d-block"
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
          <div className="modal-content border-0 shadow-lg">
            {/* Header */}
            <div
              className="modal-header text-white border-0"
              style={{ background: "linear-gradient(135deg, #004d99, #0070cc)" }}
            >
              <div>
                <h5 className="modal-title font-weight-bold mb-0" id="otp-modal-title">
                  <i className="fas fa-shield-alt mr-2" />
                  Xác thực OTP
                </h5>
                <p className="mb-0 mt-1" style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                  Mã OTP đã được gửi đến email của bạn
                </p>
              </div>
              <button
                type="button"
                className="close text-white"
                aria-label="Đóng"
                onClick={onClose}
                disabled={loading}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {studentInfo && (
                <div
                  className="rounded p-3 mb-4"
                  style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <p className="small font-weight-bold text-muted text-uppercase mb-2">
                    Thông tin giao dịch
                  </p>
                  <div className="row small">
                    <div className="col-5 text-muted">Sinh viên:</div>
                    <div className="col-7 font-weight-bold">{studentInfo.fullName}</div>
                    <div className="col-5 text-muted">MSSV:</div>
                    <div className="col-7">{studentInfo.mssv}</div>
                    <div className="col-5 text-muted">Số tiền:</div>
                    <div className="col-7 font-weight-bold text-danger">
                      {formatCurrency(amount)}
                    </div>
                  </div>
                </div>
              )}

              {/* Đồng hồ đếm ngược */}
              <div className="text-center mb-4">
                <p className="text-muted small mb-2">Mã OTP hết hạn sau</p>
                <div
                  className="d-inline-block px-4 py-2 rounded-pill font-weight-bold"
                  style={{
                    fontSize: "1.8rem",
                    color: timerColor,
                    backgroundColor: `${timerColor}15`,
                    border: `2px solid ${timerColor}`,
                    letterSpacing: 2,
                    transition: "color 0.3s, background-color 0.3s, border-color 0.3s",
                  }}
                >
                  <i className="fas fa-clock mr-2" style={{ fontSize: "1.2rem" }} />
                  {minutes}:{seconds}
                </div>
                {isExpired && (
                  <p className="text-danger small mt-2 font-weight-bold">
                    <i className="fas fa-exclamation-triangle mr-1" />
                    Mã OTP đã hết hạn!
                  </p>
                )}
              </div>

              {/* Input OTP */}
              <div className="form-group">
                <label className="font-weight-bold">
                  Nhập mã OTP <span className="text-danger">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  className={`form-control form-control-lg text-center font-weight-bold ${error ? "is-invalid" : ""}`}
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleConfirm()}
                  disabled={loading || isExpired}
                  style={{ letterSpacing: 8, fontSize: "1.5rem" }}
                />
                {error && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle mr-1" />
                    {error}
                  </div>
                )}
              </div>
              
              {/* Box hướng dẫn Test API */}
              <div className="p-2 rounded small" style={{ backgroundColor: "#e8f4fd", border: "1px solid #bee3f8" }}>
                <i className="fas fa-info-circle text-primary mr-1" />
                <span className="text-dark">Nhập mã OTP được gửi đến Email của bạn!</span>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleResend}
                disabled={loading}
              >
                <i className="fas fa-redo mr-1" />
                Gửi lại OTP
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleConfirm}
                disabled={loading || isExpired}
                style={{ background: "linear-gradient(135deg, #004d99, #0070cc)", border: "none" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle mr-2" />
                    Xác nhận giao dịch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}