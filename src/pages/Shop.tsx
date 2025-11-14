import React, { useState } from "react";
import { Product } from "../App";

interface ShopProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}

const products: Product[] = [
  {
    id: 1,
    name: "Guatemalan Antigua",
    price: 13.99,
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/cb53f77f-3460-413b-a5d2-cf606c16cf6a.png",
    description: "Smooth and complex with chocolate and spice notes.",
    category: "Single Origin",
  },
  {
    id: 2,
    name: "Kenya AA",
    price: 16.99,
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b3291879-597b-46be-bac0-e28bddcaaa6c.png",
    description: "Bright acidity with berry and citrus notes.",
    category: "Single Origin",
  },
  {
    id: 3,
    name: "Espresso Blend",
    price: 14.99,
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/757ee85a-39cb-4f05-b672-86c0c3b0ebe7.png",
    description: "Bold and rich with caramel and nutty notes.",
    category: "Blends",
  },
  {
    id: 4,
    name: "Decaf Colombian",
    price: 12.99,
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8020900d-d8c2-48ba-9ad6-2768a2b940ae.png",
    description: "Smooth and mild with chocolate notes.",
    category: "Decaf",
  },
];

const Shop: React.FC<ShopProps> = ({ cart, setCart }) => {
  const [filter, setFilter] = useState<string>("All Products");

  const filteredProducts =
    filter === "All Products"
      ? products
      : products.filter((p) => p.category === filter);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="page py-12 px-4 bg-amber-50 text-[#4B2E0E]">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Our Coffee Selection
        </h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {["All Products", "Single Origin", "Blends", "Decaf"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded transition font-medium ${
                filter === cat
                  ? "bg-amber-700 text-white"
                  : "bg-white text-[#4B2E0E] hover:bg-amber-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white text-[#4B2E0E] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-gray-700 text-sm mb-3">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setCart([...cart, product])}
                    className="bg-amber-700 text-white py-1 px-3 rounded text-sm hover:bg-amber-800 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>
            <ul className="mb-4">
              {cart.map((item, index) => (
                <li key={index} className="flex justify-between mb-2">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default Shop;
