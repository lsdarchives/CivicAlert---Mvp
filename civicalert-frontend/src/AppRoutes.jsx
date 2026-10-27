
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Dashboard from "./App";

function AdminRoute({ children }) {
  const token = localStorage.getItem("civicalert_token");
  const savedUser = localStorage.getItem("civicalert_user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!token || user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/admin/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/admin/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
