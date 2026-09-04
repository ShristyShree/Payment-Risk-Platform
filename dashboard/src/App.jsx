import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MakeTransaction from "./pages/MakeTransaction";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetails from "./pages/TransactionDetails";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/transactions/new"
                element={<MakeTransaction />}
              />

              <Route
                path="/transactions"
                element={<TransactionHistory />}
              />

              <Route
                path="/transactions/:id"
                element={<TransactionDetails />}
              />

            </Route>
          </Route>

          {/* DEFAULT */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* UNKNOWN ROUTES */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;