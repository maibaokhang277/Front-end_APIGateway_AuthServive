// =====================================================
// pages/dashboard.js - Trang chính
// =====================================================

import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import UserProfile from "@/components/UserProfile";
import TransactionHistory from "@/components/TransactionHistory";
import PaymentForm from "@/components/PaymentForm";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  // Guard: chưa đăng nhập thì redirect về login
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted small">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | NMK iBanking</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Head>

      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        {/* Navigation bar */}
        <Navbar />

        <div className="container-fluid py-4" style={{ maxWidth: 1400 }}>
          {/* Page title */}
          <div className="mb-4">
            <h5 className="font-weight-bold text-dark mb-1">
              <i className="fas fa-tachometer-alt text-primary mr-2" />
              Bảng điều khiển
            </h5>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0 mb-0 small">
                <li className="breadcrumb-item text-muted">NMK iBanking</li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </nav>
          </div>

          {/* ─── PHẦN A: Thông tin tài khoản & Lịch sử ─── */}
          <div className="row mb-4">
            {/* Cột trái: User Profile */}
            <div className="col-lg-3 col-md-4 mb-3 mb-md-0">
              <UserProfile />
            </div>

            {/* Cột phải: Lịch sử giao dịch */}
            <div className="col-lg-9 col-md-8">
              <TransactionHistory />
            </div>
          </div>

          {/* ─── PHẦN B: Form Tra cứu & Thanh toán ─── */}
          <div className="row">
            <div className="col-12">
              <PaymentForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-muted small border-top bg-white mt-2">
          © 2026 NMK iBanking · Hệ thống đóng học phí trực tuyến · Phiên bản 1.0
        </footer>
      </div>
    </>
  );
}
