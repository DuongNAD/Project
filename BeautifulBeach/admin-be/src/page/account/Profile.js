import React, { useState, useEffect } from "react";
import { accountDetal, accountUpdate, url } from "../../api/function";
import { toast } from "react-toastify";

function Profile() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    fectData();
  }, []);

  const fectData = async () => {
    try {
      const rs = await accountDetal();
      setFormData(rs?.data?.data || {});
      if (rs?.data?.data?.avatar) {
        const svAvatar = rs?.data?.data?.avatar;
        setPreview(svAvatar.startsWith("http") ? svAvatar : url + svAvatar);
      }
    } catch (error) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          form.append(key, formData[key]);
        }
      });
      if (avatar) {
        form.append("avatar", avatar);
      }

      await accountUpdate(form);

      const resDetail = await accountDetal();
      if (resDetail?.data?.data?.avatar) {
         localStorage.setItem("avatar", resDetail.data.data.avatar);
      }

      toast.success("Update profile success");
      setTimeout(() => {
        window.location.reload(); 
      }, 1000);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else if (typeof errors === "object" && errors !== null) {
        Object.values(errors).forEach((errArray) => {
          if (Array.isArray(errArray)) {
            errArray.forEach((msg) => toast.error(msg));
          } else {
            toast.error(errArray);
          }
        });
      } else if (typeof errors === "string") {
        toast.error(errors);
      } else {
        toast.error("An error occurred, please try again!");
      }
    } finally {
        setLoading(false); 
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-colors";

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300">

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="avatar preview"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-200 dark:ring-blue-900 mb-3"
                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150"}}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 text-gray-500 dark:text-gray-400">
                No Avatar
              </div>
            )}
            <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              Change Avatar
            </label>
          </div>

          <input
            type="text"
            name="full_name"
            value={formData.full_name || ""}
            onChange={handleChange}
            placeholder="Full Name"
            className={inputClass}
          />

          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className={inputClass}
            readOnly 
          />

          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Phone Number"
            className={inputClass}
          />

          <select
            name="sex" 
            value={formData.sex || ""}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select gender</option>
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>

          <input
            type="date"
            name="birthday"
            value={formData.birthday || ""}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            type="password"
            name="old_password"
            onChange={handleChange}
            placeholder="Old Password"
            className={inputClass}
          />

          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="New Password"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;