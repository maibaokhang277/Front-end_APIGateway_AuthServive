// =====================================================
// context/AuthContext.js
// Global state management: Auth + User Balance + Transactions
// Đã tích hợp API Gateway (http://localhost:8000)
// =====================================================

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]); // Bắt đầu với mảng rỗng thay vì dummy data
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session khi refresh trang
  useEffect(() => {
    const token = localStorage.getItem("ibanking_token");
    const userDataStr = localStorage.getItem("ibanking_user"); // Lưu cả object user thay vì chỉ id

    if (token && userDataStr) {
      try {
        const user = JSON.parse(userDataStr);
        // Lấy balance đã lưu để duy trì số dư sau giao dịch khi F5
        const savedBalance = localStorage.getItem("ibanking_balance");
        setCurrentUser({
          ...user,
          balance: savedBalance ? parseInt(savedBalance) : user.balance,
        });
        const savedTx = localStorage.getItem("ibanking_transactions");
        if (savedTx) {
          setTransactions(JSON.parse(savedTx));
        }
      } catch (error) {
        console.error("Lỗi khôi phục session:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Gọi API Login thực tế xuống Gateway
  const login = async (username, password) => {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Nếu lỗi (sai pass, v.v.), ném lỗi ra để LoginForm hiển thị
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    // Đăng nhập thành công -> Lưu Token và User Info vào localStorage
    localStorage.setItem("ibanking_token", data.token);
    localStorage.setItem("ibanking_user", JSON.stringify(data.user));
    localStorage.setItem("ibanking_balance", data.user.balance);

    // Cập nhật state để UI đổi sang trang Dashboard
    setCurrentUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ibanking_token");
    localStorage.removeItem("ibanking_user");
    localStorage.removeItem("ibanking_balance");
    localStorage.removeItem("ibanking_transactions");
    setCurrentUser(null);
    setTransactions([]);
  };

  // Tạm thời giữ nguyên logic cập nhật UI sau khi thanh toán thành công
  // (Sẽ tích hợp gọi API Thanh toán ở file PaymentForm sau)
  const processPayment = (student, amount) => {
    const newBalance = currentUser.balance - amount;
    localStorage.setItem("ibanking_balance", newBalance);
    setCurrentUser((prev) => ({ ...prev, balance: newBalance }));

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newTx = {
      id: `TXN${Date.now()}`,
      date: dateStr,
      description: `Đóng học phí SV: ${student.mssv || ''}`,
      amount: -amount,
      status: "Thành công",
    };
    setTransactions((prev) => {
      const updatedTxList = [newTx, ...prev];
      localStorage.setItem("ibanking_transactions", JSON.stringify(updatedTxList));
      return updatedTxList;
    });
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, transactions, login, logout, processPayment, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}