import React, { useState } from "react";
import images from "../constants/coffeeImages";
import { Product } from "../types/product";

interface ShopProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}

const products: Product[] = [
  {
    id: 1,
    name: "Guatemalan Antigua",
    price: 13.99,
    image: images.guatemalan,
    description: "Smooth and complex with chocolate and spice notes.",
    category: "Single Origin",
  },
  {
    id: 2,
    name: "Kenya AA",
    price: 16.99,
    image: images.kenya,
    description: "Bright acidity with berry and citrus notes.",
    category: "Single Origin",
  },
  {
    id: 3,
    name: "Espresso Blend",
    price: 14.99,
    image: images.espresso,
    description: "Bold and rich with caramel and nutty notes.",
    category: "Blends",
  },
  {
    id: 4,
    name: "Decaf Colombian",
    price: 12.99,
    image: images.decaf,
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

  // Hapus item berdasarkan cartId unik
  const removeItem = (cartId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  return (
    <section className="page py-12 px-4 bg-amber-50 text-[#4B2E0E]">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Our Coffee Selection
        </h1>

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

        {/* PRODUK GRID */}
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

                  {/* ADD TO CART */}
                  <button
  onClick={() => {
    const newItem = { ...product, cartId: crypto.randomUUID() };
    const newCart = [...cart, newItem];

    // 👉 Tambahkan debug log DI SINI
    console.log("=== DEBUG ITEM ===", newItem);
    console.log("=== DEBUG CART ===", newCart);

    setCart(newCart);
  }}
  className="bg-amber-700 text-white py-1 px-3 rounded text-sm hover:bg-amber-800 transition"
>
  Add to Cart
</button>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CART SUMMARY */}
        {cart.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>

            <ul className="mb-4">
              {cart.map((item) => (
                <li
                  key={item.cartId}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>

                  <button
                    onClick={() => removeItem(item.cartId!)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
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
