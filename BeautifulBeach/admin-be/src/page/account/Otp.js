import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { vefifyAccount, vefifyOtp } from "../../api/function";

function Otp() {
  const [otp, setOtp] = useState("");
  const [timer, setTimeer] = useState(300);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState("");

  const { email, case: type } = location.state || {};
  useEffect(() => {

  }, []);
  useEffect(() => {
    if (timer <= 0) {
      setIsResendDisabled(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeer((prevTimer) => prevTimer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [1000]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be a 6-digit number");
      return;
    }
    try {
      if (type === "forgot-pass") {
        console.log(111111111111);
        const rs = await vefifyOtp({ otp });
        const token_otp = rs.data?.data?.token_otp;
        navigate("/reset-pass", { state: { token_otp } });
      } else if (type === "verify-account") {
        console.log(222222222222);
        const rs = await vefifyAccount({ otp });
        navigate("/login-account");
      }
    } catch (error) {
      setError(error?.response?.data?.errors);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    setError("");
    setIsResendDisabled(true);
    toast.success("check mail");
    setTimeer(300);
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Please enter your OTP code</h2>
      <p style={{ textAlign: "center", marginBottom: "25px", color: "#666" }}>
        A 6-digit OTP code is sent to your Gmail
      </p>
      <div className="form-group">
        <label htmlFor="otp">OTP Code</label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Vui lòng nhập mã OTP gồn 6 số"
          maxLength="6"
          required
        />
      </div>
      {error && (
        <p
          className="error-message"
          style={{ color: "red", textAlign: "center", marginBottom: "15px" }}
        >
          {error}
        </p>
      )}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        Xác nhận
      </button>
      <div
        className="resend-container"
        style={{ textAlign: "center", marginTop: "20px", color: "#666" }}
      >
        {timer > 0 ? (
          <p>Gửi lại mã sau: {formatTime(timer)}</p>
        ) : (
          <p>Bạn không nhận được mã?</p>
        )}
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isResendDisabled}
          className="toggle-link"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            color: isResendDisabled ? "#999" : "#007bff",
          }}
        >
          Resend code
        </button>
      </div>
    </form>
  );
}

export default Otp;
