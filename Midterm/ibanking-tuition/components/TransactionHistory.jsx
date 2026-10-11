// =====================================================
// components/TransactionHistory.jsx
// Bảng lịch sử giao dịch
// =====================================================

import { useAuth } from "@/context/AuthContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.abs(amount));

export default function TransactionHistory() {
  const { transactions } = useAuth();

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
        <h6 className="mb-0 font-weight-bold">
          <i className="fas fa-history text-primary mr-2" />
          Lịch sử giao dịch
        </h6>
        <span className="badge badge-primary badge-pill">{transactions.length}</span>
      </div>

      <div className="card-body p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-inbox fa-3x mb-3 d-block" />
            Chưa có giao dịch nào
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th className="pl-3 border-0 text-muted small text-uppercase font-weight-bold">Mã GD</th>
                  <th className="border-0 text-muted small text-uppercase font-weight-bold">Thời gian</th>
                  <th className="border-0 text-muted small text-uppercase font-weight-bold">Nội dung</th>
                  <th className="text-right border-0 text-muted small text-uppercase font-weight-bold">Số tiền</th>
                  <th className="text-center border-0 text-muted small text-uppercase font-weight-bold pr-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="pl-3 align-middle">
                      <code className="small text-secondary">{tx.id}</code>
                    </td>
                    <td className="align-middle small text-muted text-nowrap">{tx.date}</td>
                    <td className="align-middle small">{tx.description}</td>
                    <td className="text-right align-middle font-weight-bold text-nowrap">
                      {tx.amount < 0 ? (
                        <span className="text-danger">- {formatCurrency(tx.amount)}</span>
                      ) : (
                        <span className="text-success">+ {formatCurrency(tx.amount)}</span>
                      )}
                    </td>
                    <td className="text-center align-middle pr-3">
                      <span className="badge badge-success badge-pill small">
                        <i className="fas fa-check mr-1" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
