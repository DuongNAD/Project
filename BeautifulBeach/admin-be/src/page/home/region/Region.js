import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BeachCard from "../../../components/BeachCard"; 
import { listBeachesRegion, listBeachesHome } from "../../../api/function";

function Region() {
  const { id } = useParams(); 
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0); 
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setBeaches([]); 
    try {
      let rs;
      if (id === "all") {
        rs = await listBeachesHome(); 
        setTitle("All Beaches 🌍");
      } else {
        rs = await listBeachesRegion(id);
        setTitle("Region Beaches 📍");
      }
      
      setBeaches(rs?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMap = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 animate-fade-in-down">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the hidden gems and beautiful coastlines in this area.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
             <p className="mt-2 text-gray-500 dark:text-gray-400">Finding beaches...</p>
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
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 mx-auto max-w-2xl">
            <div className="text-6xl mb-4">🌊</div>
            <h3 className="text-xl font-bold mb-2">No beaches found</h3>
            <p className="mb-6 text-center px-4">It looks like there are no beaches listed in this region yet.</p>
            <button 
                onClick={() => navigate("/region/all")}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
            >
                View All Beaches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Region;