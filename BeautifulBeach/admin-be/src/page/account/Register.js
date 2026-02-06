import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { registerAccount } from "../../api/function";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    birthday: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    avatarPreview: null,
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (formData.avatarPreview) {
        URL.revokeObjectURL(formData.avatarPreview);
      }
    };
  }, [formData.avatarPreview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { full_name, birthday, gender, email, phone, password, confirmPassword } = formData;

    if (!full_name) newErrors.full_name = "Vui lòng nhập Họ tên.";
    if (!birthday) newErrors.birthday = "Vui lòng nhập Ngày sinh.";
    if (!gender) newErrors.gender = "Vui lòng chọn Giới tính.";
    if (!email) newErrors.email = "Vui lòng nhập Email.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không hợp lệ.";
    if (!phone) newErrors.phone = "Vui lòng nhập SĐT.";
    if (!password) newErrors.password = "Vui lòng nhập Mật khẩu.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu không khớp.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("username", formData.email);   
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("birthday", formData.birthday);

      if (formData.avatar) {
        formDataToSend.append("image", formData.avatar); 
        formDataToSend.append("avatar", formData.avatar); 
      }

      await registerAccount(formDataToSend);
      
      toast.success("Đăng ký thành công! Đang chuyển hướng...", {
        position: "top-center",
        toastId: "register-success"
      });
      
      setTimeout(() => {
        navigate("/otp", { state: { email: formData.email, case: "verify-account" } });
      }, 1500);

    } catch (error) {
      console.error("Chi tiết lỗi:", error);

      if (error.response) {
          const svError = error.response.data;

          if (svError.errors) {
              Object.values(svError.errors).forEach((errArray) => {
                  if (Array.isArray(errArray)) errArray.forEach(msg => toast.error(msg));
                  else toast.error(errArray);
              });
          } 

          else if (svError.message) {
              toast.error(svError.message);
          }
          else {
              toast.error(`Lỗi Server (${error.response.status}). Vui lòng thử ảnh nhỏ hơn.`);
          }
      } else if (error.request) {
          toast.error("Không kết nối được Server. Kiểm tra lại mạng hoặc API URL.");
      } else {
          toast.error("Lỗi không xác định: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex bg-white font-sans overflow-hidden w-screen h-screen">

      <button 
        onClick={() => navigate("/")} 
        className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition shadow-sm"
        title="Close"
      >
        ✕
      </button>

      <div 
        className="hidden lg:flex lg:w-[40%] bg-cover bg-center items-center justify-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Join SeaView</h1>
          <p className="text-xl opacity-90">Discover the most beautiful beaches in the world.</p>
        </div>
      </div>

      <div className="w-full lg:w-[60%] h-full flex flex-col items-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-3xl mt-8">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                        {formData.avatarPreview ? (
                            <img src={formData.avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-3xl">📷</span>
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition font-semibold">
                        Upload
                        <input type="file" name="avatar" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" placeholder="Your Name" />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition" />
                    {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 transition">
                        <option value="">Select Gender</option>
                        <option value="0">Male</option>
                        <option value="1">Female</option>
                        <option value="2">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition" placeholder="name@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition" placeholder="0912..." />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition" placeholder="••••••••" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition" placeholder="••••••••" />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform active:scale-[0.99] disabled:opacity-70 mt-6">
                {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-center text-gray-600 mt-4">
                Already have an account? 
                <button type="button" onClick={() => navigate("/login-account")} className="text-blue-600 font-bold hover:underline ml-2">Log in</button>
            </p>

          </form>
        </div>
      </div>

      <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          limit={1} 
          style={{ zIndex: 20000 }} 
      />
      
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

export default Register;