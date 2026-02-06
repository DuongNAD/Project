import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { vefifyPass } from "../../api/function";
function ResetPassword() {
  const [password, setPassWord] = useState("");
  const [confirmPassword, setConfirmPassWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { token_otp } = location.state || {};
  useEffect(() => {
    if (!token_otp) {
      navigate("/otp");
      return;
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Confirmation password does not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const rs = await vefifyPass({ password, token: token_otp });
      navigate("/login-account");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
    setError("");
  };
  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Create new password</h2>
      <p style={{ textAlign: "center", marginBottom: "25px", color: "#666" }}>
        Please enter a new password for your account.
      </p>

      <div className="form-group">
        <label htmlFor="password">New password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassWord(e.target.value)}
          required
          placeholder="Nhập mật khẩu mới"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassWord(e.target.value)}
          required
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>

      {error && (
        <p
          className="error-message"
          style={{ color: "red", textAlign: "center" }}
        >
          {error}
        </p>
      )}

      <button type="submit" className="submit-btn" disabled={isLoading}>
        Reset Password
      </button>
    </form>
  );
}

export default ResetPassword;
