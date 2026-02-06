import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sentOtpPass } from "../../api/function";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmimit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const rs = await sentOtpPass({ email });
      navigate("/otp",{ state: { email, case: "forgot-pass" } });
    } catch (error) {
      setError(error?.response?.data?.errors?.email[0]);
    } finally {
      setIsLoading(false);
    }
  };
  const navigate = useNavigate();
  const onBackToLogin = () => {
    navigate("/login-account");
  };
  return (
    <div>
      <h2>Forgot Password</h2>
      <p style={{ textAlign: "center", marginBottom: "25px", color: "#666" }}>
        Enter your email to receive OTP code to reset password.
      </p>
      <form onSubmit={handleSubmimit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          Send OTP code
        </button>
        {error && (
          <p
            className="error-message"
            style={{ color: "red", textAlign: "center", marginBottom: "15px" }}
          >
            {error}
          </p>
        )}
        <button type="button" onClick={onBackToLogin} className="toggle-link">
          &larr; Back to Login
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
