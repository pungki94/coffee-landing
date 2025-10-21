import React, { useState, useEffect } from "react";

interface CoffeeVariant {
  name: string;
  description: string;
  image: string;
}

const coffeeVariants: CoffeeVariant[] = [
  {
    name: "Ethiopian Yirgacheffe",
    description: "Bright and floral with notes of citrus and berry.",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fb03d6f4-3755-4f93-98f7-e3cce8c182e8.png",
  },
  {
    name: "Colombian Supremo",
    description: "Well-balanced with caramel sweetness and nutty undertones.",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/45dfe40a-fe62-4cb2-a91b-f1f772de2a15.png",
  },
  {
    name: "Sumatra Mandheling",
    description: "Full-bodied and earthy with notes of dark chocolate and spice.",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1b791844-69c4-4991-9c10-96cf263bc627.png",
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
      {/* Hero + Carousel */}
      <div className="relative w-full h-[80vh] md:h-[90vh] bg-gradient-to-b from-amber-600 via-amber-500 to-amber-400 overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {coffeeVariants.map((slide, index) => (
            <div
              key={index}
              className="w-full h-full relative flex-shrink-0"
            >
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-full object-cover filter saturate-150 brightness-90"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center px-4">
                <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 opacity-0 animate-fade-in">
                  {slide.name}
                </h3>
                <p className="text-white text-lg md:text-xl drop-shadow-md opacity-0 animate-fade-in delay-200">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Text */}
        <div className="absolute top-1/4 w-full flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-4 animate-fade-up">
            Start Your Day With Perfect Coffee
          </h1>
          <p className="text-xl md:text-2xl text-white drop-shadow-md max-w-2xl mb-6 animate-fade-up delay-150">
            Discover the finest coffee beans from around the world, carefully
            roasted to perfection for your brewing pleasure.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full transition">
            Explore Our Blends
          </button>
        </div>

        {/* Prev/Next */}
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

        {/* Slide indicators */}
        <div className="absolute bottom-6 w-full flex justify-center space-x-2 z-20">
          {coffeeVariants.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Featured Coffees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coffee cards */}
          </div>
        </div>
      </div>

      {/* Brewing Guide */}
      <div className="coffee-light text-white py-16 px-4 bg-amber-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">The Art of Brewing</h2>
          <p className="text-lg mb-10">
            Learn how to brew the perfect cup of coffee with our expert guides
            and premium equipment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Brewing steps */}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Home;
