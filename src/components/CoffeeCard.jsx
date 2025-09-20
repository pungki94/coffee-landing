import React from "react";
function CoffeeCard({ coffee }) {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img
        src={coffee.image}
        alt={coffee.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{coffee.name}</h3>
        <p className="text-sm text-gray-700 mb-4">{coffee.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${coffee.price.toFixed(2)}</span>
          <button className="bg-[#6F4E37] text-white px-3 py-1 rounded hover:bg-[#5a3e2a] transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
export default CoffeeCard;
