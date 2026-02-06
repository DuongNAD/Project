import React, { useEffect, useState } from "react";
import {
  addBeaches,
  beaches,
  deleteBeache,
  region,
  searchBeaches,
  updateBeaches,
  url,
} from "../../api/function";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function Beaches() {
  const [listBeaches, setListBeaches] = useState([]);
  const [regionlist, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFromData] = useState({
    name: "",
    description: "",
    location: "",
    id: null,
    region_id: "",
    latitude: "",
    longitude: "",
    images: [],
  });
  const handleEditorChange = (content) => {
    setFromData({ ...formData, description: content });
  };
  useEffect(() => {
    fetchDataRegion();
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFromData({ ...formData, [e.target.name]: e.target.value });
  };
  const fetchDataRegion = async () => {
    try {
      const rs = await region();
      setRegions(rs.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    setIsLoading(true);

    formData.images.forEach((file) => {
      if (file instanceof File) {
        data.append("images[]", file);
      } else if (!file.isNew && file.url) {
        data.append("old_images[]", file.url);
      }
    });
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("region_id", formData.region_id);
    data.append("location", formData.location);
    data.append("longitude", formData.longitude);
    data.append("latitude", formData.latitude);

    try {
      const method = formData.id !== null ? "PUT" : "POST";
      let rs;
      if (method === "POST") {
        rs = await addBeaches(data);
      } else {
        data.append("_method", "PUT");

        rs = await updateBeaches(data, formData.id);
      }
      fetchData();
      toast.success(rs.data?.message);
      setFromData({
        name: "",
        description: "",
        location: "",
        id: null,
        region_id: "",
        latitude: "",
        longitude: "",
        images: [],
      });
      setShowForm(false);
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
    } finally {
      setIsLoading(false);
    }
  };
  const fetchData = async () => {
    try {
      const rs = await beaches();
      setListBeaches(rs.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (value) => {
    const images =
      value.images?.map((img) =>
        img.img_link ? { url: img.img_link } : img
      ) || [];
    setFromData({ ...value, images });
    setShowForm(true);

    console.log(formData);
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
          const rs = await deleteBeache(value.id);
          Swal.fire("Deleted!", "Data has been deleted.", "success");
          fetchData();
        } catch (error) {
          Swal.fire("Failed!", "Delete failed, please try again.", "error");
        }
      }
    });
  };
  const handleSearch = async () => {
    try {
      const rs = await searchBeaches(search);
      setListBeaches(rs.data?.data || []);
    } catch (error) {}
  };
  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300 mb-3"
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-3">
            <input
              type="text"
              name="name"
              placeholder="Name Beaches"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="location"
              placeholder="Name location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="longitude"
              placeholder="Longitude"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.longitude}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="latitude"
              placeholder="Latitude"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.latitude}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
              required
            >
              <option value="">-- Select regions --</option>
              {regionlist
                ? regionlist.map((item) => (
                    <option value={item.id}>{item.name}</option>
                  ))
                : null}
            </select>
            <Editor
              apiKey="h9m4zl3z71i528wkvqa05goi539oxxpr2prkmoenfonsfbzg"
              value={formData.description}
              init={{
                height: 400,
                menubar: true,
                plugins: "lists link image table code wordcount",
                toolbar:
                  "undo redo | formatselect | bold italic underline | " +
                  "alignleft aligncenter alignright | bullist numlist | link image | code",
              }}
              onEditorChange={handleEditorChange}
            />

            <label className="flex items-center justify-center w-48 px-4 py-2 bg-blue-600 text-white rounded-lg shadow cursor-pointer hover:bg-blue-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Select photo
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setFromData({
                    ...formData,
                    images: [...formData.images, ...Array.from(e.target.files)],
                  })
                }
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2 flex-wrap">
            {formData.images.map((file, index) => {
              let src = "";

              if (file instanceof File) {
                src = URL.createObjectURL(file);
              } else if (file.url) {
                src = file.url.startsWith("http") ? file.url : url + file.url;
              } else {
                src = file;
              }

              return (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={src}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.images.filter(
                        (_, i) => i !== index
                      );
                      setFromData({ ...formData, images: newImages });
                    }}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="btn-submit mb-5"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : formData.id
              ? "Update"
              : "Add Beaches"}
          </button>
        </form>
      ) : null}
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Region</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Description</th>
            <th>Images</th>

            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listBeaches.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.location}</td>
              <td>{item.region.name}</td>
              <td>{item.latitude}</td>
              <td>{item.longitude}</td>

              <td>
                <div
                  className="max-w-xs overflow-hidden text-ellipsis line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </td>
              <td>
                <div className="flex gap-2 flex-wrap max-w-xs">
                  {item.images?.map((img, index) => (
                    <img
                      key={index}
                      src={
                          item.images?.[0]?.img_link?.startsWith('http') 
                              ? item.images[0].img_link 
                              : `http://127.0.0.1:8000${item.images?.[0]?.img_link}`
                      }
                      alt={item.name}
                      onClick={() => setPreviewImg(url + "" + img.img_link)}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              </td>

              <td>
                <button
                  className="btn-edit"
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
      {previewImg && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute top-2 right-2 text-white text-2xl font-bold 
             bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center
             shadow hover:bg-opacity-75 transition"
            >
              &times;
            </button>

            <img
              src={previewImg}
              alt="preview"
              className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Beaches;
