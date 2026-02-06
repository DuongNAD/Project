import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { ImageBanner, url } from "../api/function";

function Hero() {
  const [imagesBanner, setImageBanner] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const fectImage = async () => {
    try {
      const rs = await ImageBanner(1);
      setImageBanner(rs?.data?.data || []);
    } catch (error) {
      console.error("Error fetching hero images:", error);
    }
  };

  useEffect(() => {
    fectImage();
  }, []);

  useEffect(() => {
    if (imagesBanner.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === imagesBanner.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [imagesBanner]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      navigate("/seach-beaches/" + inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (imagesBanner.length === 0) {
    return null;
  }

  const currentImage = imagesBanner[currentIndex];
  const imageUrl = currentImage?.img?.startsWith('http')
    ? currentImage.img
    : url + currentImage?.img;

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-gray-900">

      <div className="absolute inset-0">
        <img
          key={currentIndex}
          src={imageUrl}
          alt={currentImage?.title}
          className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out transform scale-105 hover:scale-100"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10"></div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 mt-10">

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
          {currentImage?.title || "Welcome to SeaView"}
        </h1>
        <p className="text-xl md:text-2xl text-gray-100 max-w-3xl drop-shadow-md mb-10 font-light opacity-90">
          {currentImage?.content || "Khám phá những bãi biển đẹp nhất thế giới cùng chúng tôi."}
        </p>

        <div className="w-full max-w-3xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <div className="relative bg-white rounded-full p-1.5 pr-2 flex items-center shadow-2xl transition-all transform hover:-translate-y-1">

            <div className="pl-4 pr-2 text-gray-400">
              <FaSearch className="text-xl" />
            </div>

            <input
              type="text"
              className="flex-1 p-2 md:p-3 text-gray-700 text-lg outline-none bg-transparent placeholder-gray-400 font-medium"
              placeholder="Where do you want to go?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Hero;