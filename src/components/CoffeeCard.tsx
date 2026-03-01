import React from "react";
import { Product } from "../types/product";
import { getImagePath } from "../utils/imageHelper";

interface CoffeeCardProps {
  coffee: Product;
  onEdit?: (coffee: Product) => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (coffee: Product) => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onEdit, onDelete, onAddToCart }) => {
  return (
    <div className="coffee-card bg-white rounded-lg overflow-hidden shadow-md relative group">
      <div className="relative">
        <img src={coffee.image ? getImagePath(coffee.image) : ''} alt={coffee.name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(coffee)}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-gray-600 hover:text-amber-700 transition"
              title="Edit Product"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(coffee.id)}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-gray-600 hover:text-red-700 transition"
              title="Delete Product"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{coffee.name}</h3>
        <p className="text-gray-700 mb-4">{coffee.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${coffee.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart && onAddToCart(coffee)}
            className="bg-amber-700 text-white py-1 px-3 rounded text-sm hover:bg-amber-800 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
