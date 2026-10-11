// =====================================================
// components/Navbar.jsx
// Thanh điều hướng phía trên
// =====================================================

import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav
      className="navbar navbar-expand navbar-dark shadow-sm"
      style={{ background: "linear-gradient(135deg, #002d5c, #004d99)" }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mr-2"
            style={{ width: 34, height: 34, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <i className="fas fa-university" />
          </div>
          <span className="font-weight-bold" style={{ fontSize: "1rem" }}>
            NMK <span style={{ opacity: 0.7, fontWeight: 400 }}>iBanking</span>
          </span>
        </a>

        {/* Right side */}
        {currentUser && (
          <div className="ml-auto d-flex align-items-center">
            <span className="text-white-50 small mr-3 d-none d-md-block">
              <i className="fas fa-user-circle mr-1" />
              {currentUser.fullName}
            </span>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-1" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
