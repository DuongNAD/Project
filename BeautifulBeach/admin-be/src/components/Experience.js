import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { p1, p2 } from "../asset";

function Experience() {
  const images = [
    p1,
    p2,
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-100">
      <h2 className="text-3xl font-bold text-center mb-6">
        Trải nghiệm sinh động
      </h2>
      <p className="text-center max-w-2xl mx-auto text-gray-600 mb-12">
        Hình ảnh động đầy cảm xúc giúp bạn cảm nhận không khí biển đảo như thật.
      </p>

      <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        <motion.img
          key={current}
          src={images[current]}
          alt="Trải nghiệm biển"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-80 object-cover"
        />
         <div className="absolute inset-0 flex justify-between items-center px-4">
          <button
            onClick={() =>
              setCurrent(current === 0 ? images.length - 1 : current - 1)
            }
            className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCurrent(current === images.length - 1 ? 0 : current + 1)
            }
            className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default Experience;
