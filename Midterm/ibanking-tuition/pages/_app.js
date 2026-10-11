// =====================================================
// pages/_app.js
// Root app - bao gồm AuthProvider + Bootstrap CSS
// =====================================================

import { AuthProvider } from "@/context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
