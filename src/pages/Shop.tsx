import React, { useState, useEffect } from "react";
import images from "../constants/coffeeImages";
import { Product } from "../types/product";
import { useLocation } from "react-router-dom";

interface CartItem extends Product {
  qty: number;
}

interface ShopProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
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
  const location = useLocation();

  // Apply category from URL query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setFilter(cat);
  }, [location.search]);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, filter]);

  const filteredProducts =
    filter === "All Products"
      ? products
      : products.filter((p) => p.category === filter);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const reduceQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleBuy = async () => {
    setLoading(true);
    setSuccessMsg("");
    const payload = {
      items: cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
      })),
      totalPayment: totalPrice,
    };
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxU2G-5AD7IVwJnVPK8lCMQPY0325NAxQzhu339QkwCQf9CwmfQlxlradSG4Lqy5CyZ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setSuccessMsg("Order sent to Google Sheet!");
      setCart([]); // Optional: clear cart on success
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Error sending order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page py-12 px-4 bg-amber-50 text-[#4B2E0E] relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mb-4"></div>
            <p className="font-bold text-lg">Processing Order...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {successMsg}
        </div>
      )}
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">Our Coffee Selection</h1>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center mb-6 md:mb-10">
          {["All Products", "Single Origin", "Blends", "Decaf"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded font-medium transition ${filter === cat ? "bg-amber-700 text-white" : "bg-white text-[#4B2E0E] hover:bg-amber-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition scroll-mt-32"
              id={
                product.name === "Guatemalan Antigua"
                  ? "guatemalan"
                  : product.name === "Kenya AA"
                    ? "kenya"
                    : product.name === "Espresso Blend"
                      ? "espresso"
                      : product.name === "Decaf Colombian"
                        ? "decaf"
                        : undefined
              }
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 md:h-52 object-cover"
              />
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-sm md:text-xl mb-1 md:mb-2 leading-tight">{product.name}</h3>
                <p className="text-gray-700 text-xs md:text-sm mb-2 md:mb-3">{product.description}</p>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span className="font-bold text-sm md:text-lg">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-amber-700 text-white px-3 py-1.5 rounded text-xs md:text-sm hover:bg-amber-800 transition w-full md:w-auto"
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
          <div className="mt-12 bg-white shadow-md rounded-lg p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
            <div className="grid grid-cols-[1fr_60px_70px_80px] text-xs font-semibold text-gray-600 pb-2 border-b">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Price</span>
              <span className="text-right">Total Price</span>
            </div>
            {cart.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_70px_80px] text-sm py-3 border-b last:border-0 items-center"
              >
                <span className="truncate">{item.name}</span>
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => reduceQty(item.id)}
                    className="px-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.qty}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <span className="text-center">${item.price.toFixed(2)}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total Payment</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleBuy}
              className="mt-4 w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;
