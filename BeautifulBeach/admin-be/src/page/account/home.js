import React from "react";
import { useNavigate } from "react-router-dom";

function HomeAccount() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login-account");
  };
  return (
    <div>
      <h1>Xin chào đến với Beautiful Beach</h1>
      <button onClick={handleLogout} className="submit-btn">
        Logout
      </button>
    </div>
  );
}

export default HomeAccount;
