import React, { useState, useEffect } from "react";
import "./style/BeachCard.css";
import { favoritesAdd, favoritesDelete, url } from "../api/function";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaHeart, FaRegComment } from "react-icons/fa";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

function BeachCard({ beach, onOpenMap }) {
  const thumbnail =
    beach.images && beach.images.length > 0
      ? (beach.images[0].img_link.startsWith("http") 
          ? beach.images[0].img_link 
          : url + beach.images[0].img_link)
      : "https://via.placeholder.com/400x300?text=No+Image";
      
  const navigate = useNavigate();

  const truncateHTML = (html, maxLength = 10) => {
    const text = new DOMParser().parseFromString(html, "text/html").body
      .textContent;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const [favoritesState, setFavoritesState] = useState({});
  const [favoritesCount, setFavoritesCount] = useState({});

  useEffect(() => {
    setFavoritesState((prev) => ({
      ...prev,
      [beach.id]: beach.is_favorite || false,
    }));
    setFavoritesCount((prev) => ({
      ...prev,
      [beach.id]: beach.favorites_count || 0,
    }));
  }, [beach]);

  const enventStatus = async (id) => {
    if (!localStorage.getItem("token")) {
      toast.error("You are not logged in as a member.");
      return;
    }
    if (localStorage.getItem("role") != 2) {
      toast.error("You are not authorized.");
      return;
    }

    const isFavorite = favoritesState[id];
    const newFavoritesState = { ...favoritesState };
    const newFavoritesCount = { ...favoritesCount };

    if (!isFavorite) {
      newFavoritesState[id] = true;
      newFavoritesCount[id] = (favoritesCount[id] || 0) + 1;
    } else {
      newFavoritesState[id] = false;
      newFavoritesCount[id] = (favoritesCount[id] || 1) - 1;
    }

    setFavoritesState(newFavoritesState);
    setFavoritesCount(newFavoritesCount);

    try {
      if (!isFavorite) {
        await favoritesAdd(id);
      } else {
        await favoritesDelete(id);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, rollback!");
      setFavoritesState(favoritesState);
      setFavoritesCount(favoritesCount);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition p-4 border border-transparent dark:border-gray-700">
        <img
          src={thumbnail}
          alt={beach.name}
          className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition"
          onClick={() => navigate("/detail-beaches/" + beach.id)}
        />

        <h2
          className="mt-3 text-xl font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => navigate("/detail-beaches/" + beach.id)}
        >
          {beach.name}
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <b className="text-gray-700 dark:text-gray-300">Regions:</b> {beach?.region?.name}
        </p>
        <div
          className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(truncateHTML(beach.description, 20)),
          }}
        />

        <div className="flex items-center justify-between mt-3 w-full">
          {beach.latitude && beach.longitude && (
            <button
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              onClick={() =>
                beach.latitude &&
                beach.longitude &&
                onOpenMap(beach.latitude, beach.longitude)
              }
            >
              <FaMapMarkerAlt /> Map
            </button>
          )}

          <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-gray-300">
            <button
              onClick={() => enventStatus(beach.id)}
              className="flex items-center gap-2 hover:text-red-500 transition"
            >
              <FaHeart
                color={favoritesState[beach.id] ? "red" : ""}
                className={`text-lg ${!favoritesState[beach.id] ? "dark:text-gray-400" : ""}`}
              />
              <span>{favoritesCount[beach.id]}</span>
            </button>
            
            <div className="flex items-center gap-2">
                <FaRegComment className="text-lg dark:text-gray-400" />
                <span>{beach.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BeachCard;