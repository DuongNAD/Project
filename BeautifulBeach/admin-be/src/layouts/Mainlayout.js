import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Mainlayout({ children }) {
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
        <div className="dash-actions">
          <div className="dash-tabs">
            <button
              className={`tab-btn ${
                location.pathname === "/admin/region" ? "region" : ""
              }`}
              onClick={() => navigate("/admin/region")}
            >
              Region Management
            </button>

            <button
              className={`tab-btn ${
                location.pathname === "/admin/beaches" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/beaches")}
            >
              Beach Management
            </button>
            <button
              className={`tab-btn ${
                location.pathname === "/admin/account" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/account")}
            >
              Accout Management
            </button>
            <button
              className={`tab-btn ${
                location.pathname === "/admin/banner" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/banner")}
            >
              Banner Management
            </button>
            <button
              className={`tab-btn ${
                location.pathname === "/admin/comment" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/comment")}
            >
              Comment Management
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default Mainlayout;
