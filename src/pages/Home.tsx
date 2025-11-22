import React, { useState, useEffect } from "react";
import images from "../constants/coffeeImages";
import { CoffeeVariant } from "../types/CoffeeVariant";

const coffeeVariants: CoffeeVariant[] = [
  {
    name: "Ethiopian Yirgacheffe",
    description: "Bright and floral with notes of citrus and berry.",
    image: images.ethiopian,
  },
  {
    name: "Colombian Supremo",
    description: "Well-balanced with caramel sweetness and nutty undertones.",
    image: images.colombian,
  },
  {
    name: "Sumatra Mandheling",
    description: "Full-bodied and earthy with notes of dark chocolate and spice.",
    image: images.sumatra,
  },
];

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === coffeeVariants.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () =>
    setCurrentSlide(
      currentSlide === 0 ? coffeeVariants.length - 1 : currentSlide - 1
    );

  const nextSlide = () =>
    setCurrentSlide(
      currentSlide === coffeeVariants.length - 1 ? 0 : currentSlide + 1
    );

  return (
    <section id="home-page" className="page relative w-full">

      {/* ======================== */}
      {/*      HERO + CAROUSEL     */}
      {/* ======================== */}
      <div className="relative w-full h-[80vh] md:h-[90vh] bg-gradient-to-b from-amber-600 via-amber-500 to-amber-400 overflow-hidden">

        {/* SLIDER */}
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {coffeeVariants.map((slide, index) => (
            <div key={index} className="w-full h-full relative flex-shrink-0">
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-full object-contain md:object-cover filter saturate-150 brightness-90"
              />

              {/* Overlay Title/Description */}
              <div className="absolute bottom-10 md:bottom-16 w-full flex flex-col items-center text-center px-4">
                <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl mb-2 animate-fade-in">
                  {slide.name}
                </h3>
                <p className="text-white text-lg md:text-xl drop-shadow-md animate-fade-in delay-200">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* HERO TEXT (di atas, tidak menutupi gambar) */}
        <div className="absolute top-10 md:top-16 w-full flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-4 animate-fade-up">
            Start Your Day With Perfect Coffee
          </h1>
          <p className="text-xl md:text-2xl text-white drop-shadow-md max-w-2xl mb-6 animate-fade-up delay-150">
            Discover the finest coffee beans from around the world.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full transition">
            Explore Our Blends
          </button>
        </div>

        {/* SLIDE BUTTONS */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition z-20"
        >
          &#8592;
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition z-20"
        >
          &#8594;
        </button>

        {/* INDICATORS */}
        <div className="absolute bottom-6 w-full flex justify-center space-x-2 z-20">
          {coffeeVariants.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white scale-125" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
      {/* ======================== */}
      {/*     FEATURED PRODUCTS    */}
      {/* ======================== */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Featured Coffees
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* SINGLE ORIGIN */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">Single Origin Premium</h3>
              <ul className="space-y-2 text-gray-700">
                <li><span className="font-semibold">Ethiopian Yirgacheffe</span> — Floral, citrus</li>
                <li><span className="font-semibold">Colombia Supremo</span> — Caramel & nutty</li>
                <li><span className="font-semibold">Sumatra Mandheling</span> — Earthy, chocolate</li>
              </ul>
            </div>

            {/* SPECIAL BLENDS */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">Special Blends</h3>
              <ul className="space-y-2 text-gray-700">
                <li><span className="font-semibold">House Blend</span> — Smooth & balanced</li>
                <li><span className="font-semibold">Espresso Roast Blend</span> — Dark & bold</li>
                <li><span className="font-semibold">Morning Sunrise Blend</span> — Light & fruity</li>
              </ul>
            </div>

            {/* POPULAR PICKS */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">Popular Picks</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Ethiopian Yirgacheffe</span>
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  BEST SELLER
                </span>
              </div>
              <div className="text-yellow-500 text-sm flex gap-1 mb-2">★★★★★</div>
              <p className="text-gray-700 text-sm">
                Bright, fruity, and crowd-favorite tasting notes.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ======================== */}
      {/*      BREWING GUIDE       */}
      {/* ======================== */}
      <div className="coffee-light text-white py-16 px-4 bg-amber-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">The Art of Brewing</h2>
          <p className="text-lg mb-10">
            Learn how to brew the perfect cup of coffee with expert guides and premium tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <h3 className="font-bold text-lg mb-2">1. Choose Your Beans</h3>
              <p>Select the right beans for your taste.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. Grind Properly</h3>
              <p>Different brew methods need different grind sizes.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. Brew with Care</h3>
              <p>The perfect ratio, temperature, and timing matter.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Home;
