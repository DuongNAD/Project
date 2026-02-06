import React, { useState } from "react";
import PropTypes from "prop-types";
import { login } from "../../api/function";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    setErrorMessage("");
    let hasError = false;

    if (!email) {
      setUsernameError("Username is required");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    setTimeout(async () => {
      try {
        const rs = await login({ email, password });
        const token = rs.data?.data?.token;
        const role = rs.data?.data?.role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        navigate("/admin");
      } catch (error) {
        console.log(error.response?.data?.errors);
        toast.error(error.response?.data?.errors);
      }
      setIsLoading(false);
    }, 500);
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorMessage("");
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <span className="shield-icon">🛡️</span>
          </div>
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">Please sign in to manage the system</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {usernameError && (
                <span className="error-message">{usernameError}</span>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      {showPopup && (
        <div className="popup-overlay show">
          <div className="popup">
            <h3>Login Failed</h3>
            <p>{errorMessage}</p>
            <div className="popup-actions">
              <button className="btn-confirm" onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
