import React, { useEffect, useState } from "react";
import {
  ImageBannerAdmin,
  ImageBannerAdminAdd,
  ImageBannerAdminUpdate,
  url,
} from "../../api/function";
import { toast } from "react-toastify";

function ImageBanner() {
  const [listImage, setImage] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const [formData, setFromData] = useState({
    img: null,
    type: "",
    content: "",
    title: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "img") {
      setFromData({ ...formData, img: files[0] });
    } else {
      setFromData({ ...formData, [name]: value });
    }
  };
  useEffect(() => {
    fechImage();
  }, []);
  const fechImage = async () => {
    try {
      const rs = await ImageBannerAdmin();
      setImage(rs?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let rs;
      if (idImage === null) {
        rs = await ImageBannerAdminAdd({
          image: formData.img,
          type: formData.type,
          content: formData.content,
          title : formData.title,
        });
      } else {
        rs = await ImageBannerAdminUpdate(
          {
            image: formData.img,
            type: formData.type,
            content: formData.content,
            title: formData.title,
            _method: "PUT",
          },
          idImage
        );
      }
      setFromData({ img: null, type: "", content: "", title: "" });
      setIdImage(null);
      setShowForm(false);
      fechImage();
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (value) => {
    setFromData({ ...value, img: null });
    setIdImage(value.id);
    setShowForm(true);
  };
  const handleDelete = (value) => {};
  return (
    <>
      <div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300 mb-3"
          onClick={() => (showForm ? setShowForm(false) : setShowForm(true))}
        >
          Add
        </button>
        {showForm ? (
          <form
            className="flex items-end gap-8 bg-white p-6 rounded-2xl shadow-lg flex-wrap"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">
                Chọn ảnh
              </label>
              <input
                type="file"
                name="img"
                accept="image/*"
                onChange={handleChange}
                className="block w-56 text-sm text-gray-700 
                 file:mr-4 file:py-2 file:px-4 
                 file:rounded-lg file:border-0 
                 file:text-sm file:font-medium 
                 file:bg-blue-100 file:text-blue-700 
                 hover:file:bg-blue-200 transition"
              />
            </div>

            {formData.img && (
              <div className="flex-shrink-0">
                <img
                  src={URL.createObjectURL(formData.img)}
                  alt="Preview"
                  className="w-40 h-auto rounded-xl shadow-md border"
                />
              </div>
            )}
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="content"
              placeholder="Cotent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.content}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">
                Chọn loại
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 transition"
              >
                <option value="">-- Chọn --</option>
                <option value="1">Banner</option>
                <option value="2">Beautiful</option>
              </select>
            </div>

            <div className="flex">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 
                 text-white text-sm font-semibold rounded-lg shadow-md
                 hover:from-blue-600 hover:to-blue-800 
                 active:scale-95 transition-all"
                disabled={isLoading}
              >
                {idImage === null ? "Add" : "Update"}
              </button>
            </div>
          </form>
        ) : (
          <div></div>
        )}
        <table className="w-full  text-center ">
          <thead className="bg-[#007C85] text-[#fff]">
            <tr>
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Image</th>
              <th className="border border-gray-300 p-2">Title</th>
              <th className="border border-gray-300 p-2">Content</th>
              <th className="border border-gray-300 p-2">Category</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listImage.length == 0 ? (
              <tr>
                <td colSpan={4}>Not data</td>
              </tr>
            ) : (
              listImage.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      key={index}
                      src={url + "" + item.img}
                      alt={item.name}
                      onClick={() => setPreviewImg(url + "" + item.img)}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </td>
                  <td> {item.title}</td>
                  <td> {item.content}</td>

                  <td> {item.type == 1 ? "Banner" : "beautiful"}</td>

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
              ))
            )}
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
    </>
  );
}

export default ImageBanner;
