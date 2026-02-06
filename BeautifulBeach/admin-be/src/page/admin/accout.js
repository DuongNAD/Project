import React, { useEffect, useState } from "react";
import { accounts, accountsStatus, searchAccount } from "../../api/function";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
function Accout() {
  const [listAccount, setListAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const rs = await accounts();
      setListAccount(rs.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const settingStatus = async (id, status) => {
    Swal.fire({
      title:
        status == 1
          ? "Do you want to open an account?"
          : "Do you want to lock your account?",
      text: "This action cannot be undone.!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: status == 1 ? "ACTIVE" : "BLOCK",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const rs = await accountsStatus({ id_account: id, status: status });
          Swal.fire(
            status == 1 ? "ACTIVE" : "BLOCK",
            status == 1 ? "Data has been ACTIVE." : "Data has been BLOCK.",
            "success"
          );
          fetchData();
        } catch (error) {
          Swal.fire(
            "Failed!",
            status == 1
              ? "ACTIVE failed, please try again."
              : "BLOCK failed, please try again.",
            "error"
          );
        }
      }
    });
  };
  const handleSearch = async () => {
    try {
      const rs = await searchAccount(search);
      setListAccount(rs.data?.data || []);
    } catch (error) {}
  };
  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm mb-3"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>birthday</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listAccount.map((item) => (
            <tr key={item.id}>
              <td>{item.full_name}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td> {new Date(item.birthday).toLocaleDateString("vi-VN")}</td>

              <td>
                <span
                  className={`status ${
                    item.status === 1 ? "active" : "blocked"
                  }`}
                >
                  {item.status === 1 ? "active" : "blocked"}
                </span>
              </td>

              <td>
                {item.status === 1 ? (
                  <button
                    type="button"
                    onClick={() => settingStatus(item.id, 0)}
                    className="
    inline-flex items-center gap-2
    rounded-2xl px-4 py-2
    bg-red-600 text-white
    shadow-sm shadow-red-600/30
    hover:bg-red-500
    active:scale-[.98]
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-red-400/60
    disabled:opacity-60 disabled:cursor-not-allowed
    transition
  "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z"
                        fill="currentColor"
                      />
                    </svg>
                    Block
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => settingStatus(item.id, 1)}
                    className="
    inline-flex items-center gap-2
    rounded-2xl px-4 py-2
    bg-green-600 text-white font-medium
    shadow-sm shadow-green-600/30
    hover:bg-green-500
    active:scale-[.98]
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-green-400/60
    disabled:opacity-60 disabled:cursor-not-allowed
    transition
  "
                  >
                    Active
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Accout;
