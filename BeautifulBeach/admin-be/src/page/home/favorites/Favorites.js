import React, { useEffect, useState } from "react";
import { favorites } from "../../../api/function"; 
import BeachCard from "../../../components/BeachCard"; 
import { useNavigate } from "react-router-dom";

function Favorites() {
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const rs = await favorites(); 
      setBeaches(rs?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMap = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            ✨ Featured Beaches
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the most popular and top-rated destinations voted by our community.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-20">
            Loading amazing places...
          </div>
        ) : beaches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {beaches.map((beach) => (
              <BeachCard 
                key={beach.id} 
                beach={beach} 
                onOpenMap={handleOpenMap} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🏖️</div>
            <p className="text-xl">No featured beaches found yet.</p>
            <button 
                onClick={() => navigate("/")}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
                Explore Beaches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;