import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Slider from "../../../components/detalBeaches/Slider";
import CommentSection from "../../../components/detalBeaches/CommentSection";
import Sidebar from "../../../components/detalBeaches/Sidebar";
import { detailBeaches } from "../../../api/function";

function DetailBeaches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [description, setDescription] = useState({});

  useEffect(() => {
    const fetchDataImage = async () => {
      if (id) {
        try {
          const rs = await detailBeaches(id);
          if (rs?.data?.data === null) {
            navigate("/this-page-does-not-exist");
            return;
          }
          setDescription(rs?.data?.data || {});

          const images = rs?.data?.data?.images || [];
          const formattedSlides = images.map((img) => ({
            id: img.id,
            image: img.img_link,
          }));
          setSlides(formattedSlides);
        } catch (error) {
          console.error("Failed to fetch:", error);
          setSlides([]);
        }
      }
    };
    fetchDataImage();
  }, [id, navigate]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">

      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
          <Slider slide={slides} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row">

            <div className="w-full lg:w-2/3">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 dark:text-white">
                        {description.name}
                    </h1>
                    
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: description.description }}
                    />
                </div>

                <CommentSection idBeaches={id} />
            </div>

            {description.region_id && (
                <Sidebar id={description.region_id} />
            )}
            
        </div>
      </div>
    </div>
  );
}

export default DetailBeaches;