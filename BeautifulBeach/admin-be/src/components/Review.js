import React, { useEffect, useState } from "react";
import { commentListHome, url } from "../api/function"; 
import { FaStar, FaQuoteLeft } from "react-icons/fa";

function Review() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rs = await commentListHome();
        setReviews(rs?.data?.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const getAvatar = (account) => {
    if (account?.avatar) {
      return account.avatar.startsWith("http")
        ? account.avatar
        : url + account.avatar;
    }
    const name = account?.full_name || "User";
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=150`;
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Feelings from tourists ❤️
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Share from those who have experienced it.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    src={getAvatar(item?.account)}
                    alt={item?.account?.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md relative z-10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=User";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full text-xs shadow-sm z-20">
                    <FaQuoteLeft />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">
                  {item?.account?.full_name || "Anonymous"}
                </h3>

                <div className="flex text-yellow-400 text-sm mb-4">
                   {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < (item.rating || 5) ? "text-yellow-400" : "text-gray-300"} />
                   ))}
                </div>

                <p className="text-gray-600 dark:text-gray-300 italic line-clamp-3">
                  "{item?.message}"
                </p>
                
                <div className="mt-auto pt-4 text-sm text-gray-400 dark:text-gray-500">
                    visited <span className="font-medium text-blue-500">{item?.beach?.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            Currently no reviews. Be the first to share your experience!
          </div>
        )}
      </div>
    </section>
  );
}

export default Review;