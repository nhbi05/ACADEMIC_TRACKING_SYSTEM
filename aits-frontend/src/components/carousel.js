import React, { useState, useEffect } from "react";

const images = [
  "/images/photo-1.jpg",
  "/images/photo-2.jpg",
  "/images/photo-3.jpg",
  "/images/photo-4.jpg",
];

const Carousel = ({ children }) => {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prevCurrent) => 
        prevCurrent === length - 1 ? 0 : prevCurrent + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(timer);
  }, [length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/65"></div>
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default Carousel;
