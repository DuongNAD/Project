import React, { useEffect, useRef, useState } from "react";
import Hero from "../../components/Hero";
import { motion } from "framer-motion";
import Testimonial from "../../components/Review";
import { 
  FaHeart, 
  FaRegComment, 
  FaMapMarkerAlt, 
  FaChartLine, 
  FaCalendarDay, 
  FaGlobe, 
  FaUsers 
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import {
  ImageBanner,
  favoritesAdd,
  favoritesCheck,
  favoritesDelete,
  listBeachesHome,
  url,
  visitAdd,
  visitTotal,
} from "../../api/function";
import { useNavigate } from "react-router-dom";

function Home() {
  const [beaches, setBeaches] = useState([]);
  const [imageBetifu, setImageBetifu] = useState([]);
  const navigate = useNavigate();
  const [favoritesState, setFavoritesState] = useState({});
  const [favoritesCount, setFavoritesCount] = useState({});
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: null, lng: null });
  const visitedRef = useRef(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!visitedRef.current) {
      visitAdds();
      fectDataImageBe();
      fectData();
      visit();
      visitedRef.current = true;
    }
  }, [stats]);

  const visitAdds = async () => {
    if (sessionStorage.getItem("visited")) return;
    try {
      await visitAdd();
      sessionStorage.setItem("visited", "true");
    } catch (error) {}
  };

  const fectDataImageBe = async () => {
    try {
      const rs = await ImageBanner(2);
      setImageBetifu(rs?.data?.data || []);
    } catch (error) {}
  };

  const visit = async () => {
    try {
      const rs = await visitTotal();
      setStats(rs?.data);
    } catch (error) {}
  };

  const fectData = async () => {
    try {
      const rs = await listBeachesHome();
      const list = rs.data?.data || [];
      setBeaches(list);

      const favState = {};
      const favCount = {};

      for (let b of list) {
        favCount[b.id] = b.favorites_count;
        if (localStorage.getItem("token") && localStorage.getItem("user")) {
          try {
            const res = await favoritesCheck(b.id);
            favState[b.id] = res?.data?.message ? true : false;
          } catch (error) {
            favState[b.id] = false;
          }
        } else {
          favState[b.id] = false;
        }
      }
      setFavoritesState(favState);
      setFavoritesCount(favCount);
    } catch (error) {}
  };

  const enventStatus = async (id) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to add to favorites!");
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
      toast.error("Something went wrong!");
      setFavoritesState(favoritesState);
      setFavoritesCount(favoritesCount);
    }
  };

  const detailBeaches = (id) => {
    navigate("/detail-beaches/" + id);
  };

  const openMapModal = (lat, lng) => {
    setMapCoords({ lat, lng });
    setMapModalOpen(true);
  };

  const truncateHTML = (html, maxLength = 100) => {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent;
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-all duration-300 group">
      <div className={`text-3xl mb-2 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value || 0}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Hero />

      <div className="relative -mt-10 z-20 px-4">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
           <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                 <FaChartLine className="text-blue-500" /> Site Traffic Overview
              </h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard title="Today" value={stats.today} icon={<FaCalendarDay />} color="text-green-500" />
              <StatCard title="Week" value={stats.week} icon={<FaChartLine />} color="text-blue-500" />
              <StatCard title="Month" value={stats.month} icon={<FaCalendarDay />} color="text-purple-500" />
              <StatCard title="Online" value={stats.online} icon={<FaGlobe />} color="text-red-500" />
              <StatCard title="Total Visits" value={stats.total} icon={<FaUsers />} color="text-orange-500" />
           </div>
        </div>
      </div>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              ✨ Featured Destinations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our top-rated paradises. Crystal clear water and white sands await you.
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12 !px-4"
          >
            {beaches.map((b, i) => (
              <SwiperSlide key={i} className="pb-10">
                <div className="group h-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">

                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={
                        b.images && b.images.length > 0
                          ? (b.images[0].img_link?.startsWith('http') 
                              ? b.images[0].img_link 
                              : url + b.images[0].img_link)
                          : "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={b.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                      onClick={() => detailBeaches(b.id)}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1 text-yellow-500">
                         ★ {b.rating || "5.0"}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1" onClick={() => detailBeaches(b.id)}>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
                        {b.name}
                      </h3>
                      <div className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4"
                           dangerouslySetInnerHTML={{
                             __html: DOMPurify.sanitize(truncateHTML(b.description, 80)),
                           }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                      <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); enventStatus(b.id); }}
                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors group/heart"
                          >
                            <FaHeart className={`text-lg transition-transform group-hover/heart:scale-125 ${favoritesState[b.id] || b.favorites_count > 0 ? "text-red-500" : ""}`} />
                            <span className="font-medium">{favoritesCount[b.id] || b.favorites_count}</span>
                          </button>
                          
                          <button onClick={() => detailBeaches(b.id)} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                            <FaRegComment className="text-lg" />
                            <span className="font-medium">{b.comments_count}</span>
                          </button>
                      </div>

                      {b.latitude && b.longitude && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openMapModal(b.latitude, b.longitude); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                        >
                          <FaMapMarkerAlt /> Map
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 dark:text-white">📸 Beach Photo Album</h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
            Immerse yourself in the stunning visuals captured from our top destinations.
          </p>
          
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12 !px-4"
          >
            {imageBetifu.map((b, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-64 md:h-80 overflow-hidden rounded-2xl shadow-lg cursor-pointer group">
                  <img
                    src={
                      b.img?.startsWith('http') 
                        ? b.img 
                        : url + b.img
                    }
                    alt={`slide-${i}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
         <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">✨ Premium Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

               <div className="bg-white dark:bg-gray-700 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">🏖️</div>
                  <h3 className="font-bold text-xl mb-3 dark:text-white">Beach Guides</h3>
                  <p className="text-gray-500 dark:text-gray-300">Curated lists and hidden gems for the perfect sun-soaked getaway.</p>
               </div>

               <div className="bg-white dark:bg-gray-700 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">📍</div>
                  <h3 className="font-bold text-xl mb-3 dark:text-white">Interactive Maps</h3>
                  <p className="text-gray-500 dark:text-gray-300">Navigate effortlessly with our smart maps featuring key spots.</p>
               </div>

               <div className="bg-white dark:bg-gray-700 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">💬</div>
                  <h3 className="font-bold text-xl mb-3 dark:text-white">Community</h3>
                  <p className="text-gray-500 dark:text-gray-300">Join thousands of travelers sharing real reviews and experiences.</p>
               </div>
            </div>
         </div>
      </section>

      <Testimonial />

      {mapModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
               <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2"><FaMapMarkerAlt className="text-red-500"/> Location Map</h3>
               <button
                onClick={() => setMapModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="w-full h-[400px] md:h-[500px]">
              <iframe
                src={`https://maps.google.com/maps?q=$${mapCoords.lat},${mapCoords.lng}&hl=es&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Map Location"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;