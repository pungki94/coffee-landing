import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Product } from "../types/product";

interface CartItem extends Product {
  qty: number;
}

interface NavbarProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Shop", path: "/shop" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar({ cart, setCart }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);

  const toggleMobile = () => setMobileOpen((v) => !v);
  const toggleCart = () => setCartOpen((v) => !v);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addQty = (id: number) =>
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p))
    );

  const reduceQty = (id: number) =>
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );

  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

  /** SUBMIT TO GOOGLE SHEET */
  const handleBuy = async () => {
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

      alert("Order sent to Google Sheet!");
    } catch (err) {
      console.error(err);
      alert("Error sending order!");
    }
  };

  return (
    <nav className="coffee-bg text-white p-4 sticky top-0 z-[999] shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-2xl font-bold">Coffee Bliss</span>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active-nav" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* CART ICON */}
          <button
            onClick={toggleCart}
            className="relative p-1.5 rounded-full bg-amber-600 hover:bg-amber-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 
                  1.707.707 1.707H17m0 
                  0a2 2 0 100 4 2 2 0 
                  000-4m-8 
                  2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>

        {/* MOBILE ICONS */}
        <div className="md:hidden flex gap-4">
          <button
            onClick={toggleCart}
            className="relative p-1.5 rounded-full bg-amber-600 hover:bg-amber-700 w-8 h-8 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 
                  1.707.707 1.707H17m0 
                  0a2 2 0 100 4 2 2 0 
                  000-4m-8 
                  2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>

          <button onClick={toggleMobile} className="p-2 text-white text-2xl">
            ☰
          </button>
        </div>
      </div>

      {/* === CART SIDEBAR === */}
      {cartOpen && (
        <div
          ref={cartRef}
          className="fixed md:absolute right-2 top-16 md:top-12
          bg-white text-[#4B2E0E] rounded-xl shadow-xl
          w-[90vw] md:w-80 max-h-[70vh] overflow-y-auto p-4 z-[999]"
        >
          {cart.length === 0 ? (
            <p className="text-center py-4">Your cart is empty</p>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_45px_70px_80px] text-[11px] font-semibold pb-2 border-b uppercase tracking-wide">
                <span className="text-left">Item</span>
                <span className="text-center">Qty</span>
                <span className="text-center">Price</span>
                <span className="text-center">Total</span>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_45px_70px_80px] items-center text-sm py-2 border-b"
                >
                  <span className="whitespace-pre-wrap break-words pr-2 text-left">
                    {item.name}
                  </span>

                  <div className="flex gap-1 items-center justify-center">
                    <button
                      onClick={() => reduceQty(item.id)}
                      className="px-2 rounded bg-gray-200"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => addQty(item.id)}
                      className="px-2 rounded bg-gray-200"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-center text-[#4B2E0E] font-medium">
                    ${item.price.toFixed(2)}
                  </span>

                  <span className="text-center font-bold text-amber-700">
                    {(item.qty * item.price).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between mt-3 font-bold text-sm">
                <span>Total Payment:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handleBuy}
                className="mt-3 w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
              >
                Buy
              </button>
            </>
          )}
        </div>
      )}

      {/* === MOBILE MENU === */}
      {mobileOpen && (
        <div className="md:hidden bg-[#4B2E0E] rounded-lg mt-2 p-4">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded text-white hover:bg-amber-600 ${
                    isActive ? "bg-amber-700" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
