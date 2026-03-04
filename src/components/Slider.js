import React, { useState, useEffect } from "react";

const imageUrls = [
  "https://img.freepik.com/free-photo/portrait-engineer-job-site-during-work-hours_23-2151589656.jpg",
  "https://www.petrosync.com/blog/wp-content/uploads/2024/01/mechanical-engineer-in-oil-and-gas-chemical-and-power-industries.png",
  "https://www.discoverengineering.org/wp-content/uploads/2024/05/Setting_Clear_Career_Objectives_in_Mechanical_Engineering_0002.jpg",
  "https://www.redlinegroup.com/app/data/blog/crop_2f715c409546d253dcad384debc872bf.jpg",
  "https://www.expatrio.com/hubfs/Expatrio%20Hatch%20Child%20-%20Theme_2024Migration/Blog%20Graphics/Studying%20in%20Germany/studying-germany-mechanical-engineering.webp"
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % imageUrls.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section className="relative bg-gradient-to-br h-[90vh] md:h-[90vh]  from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-4 sm:py-8 md:py-8 overflow-hidden w-full">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-6 md:gap-6 relative z-10">
        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left animate-fadeInUp">
          <h1 className="text-2xl sm:text-4xl md:text-3xl  lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              Precision Engineering
            </span>{" "}
            for Demanding Industries
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Cutting-edge mechanical seals and industrial hardware designed to withstand extreme conditions while maximizing efficiency and longevity.
          </p>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <a
              href="#products"
              className="relative inline-flex items-center justify-center px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
            >
              <span className="relative z-10">Explore Products</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>

            {/* Hide this button on small screens */}
            <a
              href="#contact"
              className="hidden sm:inline-flex relative items-center justify-center px-10 py-4 bg-white text-gray-800 font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 group overflow-hidden"
            >
              <span className="relative z-10">Get a Quote</span>
              <span className="absolute inset-0 bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
          </div>

          {/* Trust indicators - hidden on mobile */}
          <div className="hidden sm:flex md:mt-4 gap-24 flex-wrap items-center justify-center md:justify-start  text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              ISO 9001 Certified
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              24/7 Technical Support
            </div>
          </div>
        </div>

        {/* Image Slider */}
        <div
          className="w-full md:w-1/2 h-[24rem] sm:h-[26rem] md:h-[22rem] lg:h-[75vh] relative rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {imageUrls.map((url, index) => (
            <div
              key={url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={url}
                alt="Industrial engineering solutions"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-400 opacity-10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-blue-600 opacity-10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-400 opacity-10 rounded-full filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
    </section>
  );
};

export default Hero;
