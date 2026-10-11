// =====================================================
// pages/index.js - Redirect về /login
// =====================================================

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function IndexPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Đang chuyển hướng...</span>
      </div>
    </div>
  );
}
