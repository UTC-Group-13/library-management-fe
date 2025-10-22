import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LibraryAdmin from "./LibraryAdmin";
import LoginPage from "./pages/LoginPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <LibraryAdmin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
