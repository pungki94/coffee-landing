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

  // Auto slide
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

      {/* ================= HERO ================= */}
      <div className="relative w-full h-[80vh] md:h-[90vh] bg-gradient-to-b from-amber-600 via-amber-500 to-amber-400 overflow-hidden">

        {/* SLIDER IMAGES */}
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

              <div className="absolute bottom-10 md:bottom-16 w-full text-center px-4">
                <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl mb-2">
                  {slide.name}
                </h3>
                <p className="text-lg md:text-xl text-white drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* STATIC TEXT (TIDAK BERGESER) */}
        <div className="absolute top-10 md:top-16 w-full text-center px-4 z-30">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-4">
            Start Your Day With Perfect Coffee
          </h1>
          <p className="text-xl md:text-2xl text-white drop-shadow-md max-w-2xl mx-auto mb-6">
            Discover the finest coffee beans from around the world.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full transition">
            Explore Our Blends
          </button>
        </div>

        {/* CHEVRON DI TENGAH DI BAWAH EXPLORE BUTTON */}
        <div className="absolute w-full flex justify-center gap-16 top-[56%] md:top-[58%] z-40">

          <button
            onClick={prevSlide}
            className="
              bg-black/30 hover:bg-black/50
              text-white text-3xl
              w-14 h-14
              rounded-full
              flex justify-center items-center
              backdrop-blur-sm shadow-lg transition
            "
          >
            ❮
          </button>
          <button
            onClick={nextSlide}
            className="
              bg-black/30 hover:bg-black/50
              text-white text-3xl
              w-14 h-14
              rounded-full
              flex justify-center items-center
              backdrop-blur-sm shadow-lg transition
            "
          >
            ❯
          </button>
        </div>

        {/* DOT INDICATORS */}
        <div className="absolute bottom-6 w-full flex justify-center gap-2 z-20">
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

      {/* ================= FEATURED SECTION ================= */}
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

    </section>
  );
};

export default Home;
