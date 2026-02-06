import React, { useEffect, useState } from "react";
import {
  addRegion,
  deleteRegion,
  region,
  searchRegion,
  updateRegion,
} from "../../api/function";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function Region() {
  const [regionlist, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", id: null });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const rs = await region();
      setRegions(rs.data?.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const method = formData.id !== null ? "PUT" : "POST";
      let rs;
      if (method === "POST") {
        rs = await addRegion({ name: formData.name });
      } else {
        rs = await updateRegion(
          { name: formData.name, _method: "PUT" },
          formData.id
        );
      }
      toast.success(rs.data?.message);

      setIsLoading(false);
      fetchData();
      setShowForm(false);
      setFormData({ name: "", id: null });
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
      setIsLoading(false);
    }
  };
  const handleEdit = (value) => {
    setFormData(value);
    setShowForm(true);
  };
  const handleSearch = async () => {
    try {
      const rs = await searchRegion(search);
      setRegions(rs.data?.data || []);
    } catch (error) {}
  };
  const handleDelete = (value) => {
    Swal.fire({
      title: "Are you sure you want to delete?",
      text: "This action cannot be undone.!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "DELETE",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const rs = await deleteRegion(value.id);
          Swal.fire("Deleted!", "Data has been deleted.", "success");
          fetchData();
        } catch (error) {
          Swal.fire("Failed!", "Delete failed, please try again.", "error");
        }
      }
    });
  };
  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;
  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300"
          onClick={() => (showForm ? setShowForm(false) : setShowForm(true))}
        >
          Add
        </button>

        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>

      {showForm ? (
        <div>
          <form className="user-form" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                name="name"
                placeholder="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : formData.id
                  ? "Update"
                  : "Add Region"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div></div>
      )}
      <table className="w-full  text-center ">
        <thead className="bg-[#007C85] text-[#fff]">
          <tr>
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {regionlist.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{item.id}</td>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2">
                <button
                  className="btn-edit mr-2"
                  onClick={() => handleEdit(item)}
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button
                  className="btn-block"
                  onClick={() => handleDelete(item)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Region;
