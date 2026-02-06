import React, { useEffect, useState } from "react";
import { listBeachesRegion, url } from "../../api/function";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ id }) => {
  const [listBeaches, setListBeaches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (id && id !== "undefined" && id !== null) {
        fechData();
    }
  }, [id]);

  const fechData = async () => {
    if (!id) return;
    try {
      const rs = await listBeachesRegion(id);
      setListBeaches(rs?.data?.data || []);
    } catch (error) {}
  };

  const detailBeaches = (value) => {
    navigate("/detail-beaches/" + value.id);
  };

  const getImg = (path) => {
      if(!path) return "https://via.placeholder.com/300";
      return path.startsWith('http') ? path : url + path;
  }

  return (
    <aside className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:pl-8">
      <h2 className="text-xl font-bold mb-6 pb-2 border-b dark:border-gray-700 dark:text-white">
        📍 Nearby Beaches
      </h2>
      <div className="flex flex-col gap-4">
        {listBeaches.map((beach) => (
          <div
            onClick={() => detailBeaches(beach)}
            className="group flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-500 dark:border-gray-700"
            key={beach.id || beach.name}
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <img
                src={getImg(beach.images && beach.images[0] ? beach.images[0].img_link : "")}
                alt={beach.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150"}}
                />
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                {beach.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {beach.location || "Beautiful location to visit..."}
              </p>
              <span className="text-xs text-blue-500 mt-2 font-medium">View Detail →</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;