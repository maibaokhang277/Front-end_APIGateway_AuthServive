// =====================================================
// pages/login.js - Trang đăng nhập
// =====================================================

import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  // Nếu đã đăng nhập → redirect thẳng sang dashboard
  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Đăng nhập | NMK iBanking</title>
        <meta name="description" content="Hệ thống đóng học phí iBanking" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Head>
      <LoginForm />
    </>
  );
}
