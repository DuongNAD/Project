import React, { useState } from "react";
import { toast } from "react-toastify";
import { loginAccout } from "../../api/function";
import { useNavigate } from "react-router-dom";

function LoginAccout() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rs = await loginAccout(formData);

      const token = rs?.data?.data?.token;
      const role = rs?.data?.data?.role;
      const user = rs?.data?.data?.account;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Đăng nhập thành công!");

        navigate("/");
      } else {
        toast.error("Không nhận được token từ hệ thống.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.errors || error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Sai thông tin đăng nhập");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="username"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          Login
        </button>
      </form>
      <button
        type="button"
        onClick={() => navigate("/forgot-passs")}
        className="toggle-link"
      >
        Forgot Password
      </button>
      <button
        onClick={() => navigate("/register-account")}
        className="toggle-link"
      >
        Don't have an account? Sign up
      </button>
    </div>
  );
}

export default LoginAccout;
