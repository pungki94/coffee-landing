import React from "react";

export interface Coffee {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface CoffeeCardProps {
  coffee: Coffee;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee }) => {
  return (
    <div className="coffee-card bg-white rounded-lg overflow-hidden shadow-md">
      <img src={coffee.image} alt={coffee.name} className="w-full h-48 object-cover"/>
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{coffee.name}</h3>
        <p className="text-gray-700 mb-4">{coffee.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${coffee.price.toFixed(2)}</span>
          <button className="coffee-light text-white py-1 px-3 rounded text-sm hover:bg-amber-700 transition">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
