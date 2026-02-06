import React, { useState, useEffect } from "react";
import { url } from "../../api/function";
import "./Slider.css";

function Slider({ slide }) {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    setSlides(slide || []);
  }, [slide]);

  const handleNext = () => {
    if (slides.length <= 1) return;
    const newSlides = [...slides];
    const firstSlide = newSlides.shift();
    newSlides.push(firstSlide);
    setSlides(newSlides);
  };

  const handlePrev = () => {
    if (slides.length <= 1) return;
    const newSlides = [...slides];
    const lastSlide = newSlides.pop();
    newSlides.unshift(lastSlide);
    setSlides(newSlides);
  };

  if (slides.length === 0) {
    return <div className="slider-loading">Loading slider...</div>;
  }

  const activeSlide = slides[0];
  const totalSlides = slides.length;
 
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return imagePath.startsWith("http") ? imagePath : url + imagePath;
  };

  let thumbnailSlides;
  if (totalSlides <= 3) {
    thumbnailSlides = slides.slice(1, 2);
  } else if (totalSlides === 4) {
    thumbnailSlides = slides.slice(1, 3);
  } else {
    thumbnailSlides = slides.slice(1, 4);
  }

  const thumbnailContainerClass =
    totalSlides <= 3
      ? "slider__thumbnails-container single-thumbnail"
      : "slider__thumbnails-container";

  return (
    <main className="slider-container">
      <div
        className="slider__main-image"
        style={{ backgroundImage: `url(${getImageUrl(activeSlide?.image)})` }}
      />

      <div className={thumbnailContainerClass}>
        {thumbnailSlides.map((slide) => (
          <div
            key={slide.id}
            className="slider__thumbnail-item"
            style={{ backgroundImage: `url(${getImageUrl(slide?.image)})` }}
          />
        ))}
      </div>

      <div className="slider__nav">
        <button
          onClick={handlePrev}
          className="slider__nav-button slider__nav-button--prev"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className="slider__nav-button slider__nav-button--next"
        >
          ›
        </button>
      </div>
    </main>
  );
}

export default Slider;