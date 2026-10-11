// =====================================================
// components/LoginForm.jsx
// Form đăng nhập iBanking
// =====================================================

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo / Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #004d99, #0070cc)",
            }}
          >
            <i className="fas fa-university fa-2x text-white" />
          </div>
          <h4 className="font-weight-bold text-dark mb-1">NMK iBanking</h4>
          <p className="text-muted small">Hệ thống đóng học phí trực tuyến</p>
        </div>

        {/* Card Login */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="card-title font-weight-bold mb-4">Đăng nhập</h5>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="fas fa-exclamation-circle mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="font-weight-semibold small text-muted text-uppercase">
                  Tên đăng nhập
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text bg-light border-right-0">
                      <i className="fas fa-user text-muted" />
                    </span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    className="form-control border-left-0"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="font-weight-semibold small text-muted text-uppercase">
                  Mật khẩu
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text bg-light border-right-0">
                      <i className="fas fa-lock text-muted" />
                    </span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control border-left-0 border-right-0"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-left-0"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block mt-4"
                disabled={loading}
                style={{ background: "linear-gradient(135deg, #004d99, #0070cc)", border: "none" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            {/* Gợi ý tài khoản test */}
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#e8f4fd", border: "1px solid #bee3f8" }}>
              <p className="small font-weight-bold text-primary mb-2">
                <i className="fas fa-info-circle mr-1" />
                Tài khoản API Gateway:
              </p>
              <div className="small text-muted">
                <div><strong>Username:</strong> 524H0016 &nbsp;|&nbsp; <strong>Pass:</strong> password123</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-muted small mt-3">
          © 2026 NMK - Hệ thống ngân hàng trực tuyến
        </p>
      </div>
    </div>
  );
}
