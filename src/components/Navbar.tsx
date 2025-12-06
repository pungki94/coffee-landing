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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobile = () => setMobileOpen((v) => !v);
  const toggleCart = () => setCartOpen((v) => !v);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Close Cart if clicked outside
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        // Also ensure not clicking the toggle button itself if it was separate, 
        // but here the logic is simple. The user asked for "mobile sidebar", so focusing on that.
        // (Actually, the cart toggle logic might be slightly buggy if the toggle button is outside the ref, 
        // but I shouldn't change existing behavior unless necessary. The user asked ONLY for mobile sidebar fix.)
        setCartOpen(false);
      }

      // Close Mobile Menu if clicked outside
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

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
      setCart([]);
      setCartOpen(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Error sending order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[88px] md:h-[120px] w-full block"></div>
      <nav className="coffee-bg text-white px-4 md:px-10 py-3 md:py-5 fixed top-0 z-[999] shadow-md w-full">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white text-[#4B2E0E] p-6 rounded-lg shadow-xl flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mb-4"></div>
              <p className="font-bold text-lg">Processing Order...</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[1000] animate-bounce">
            {successMsg}
          </div>
        )}
        {/* HEADER CONTAINER */}
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-16 md:h-20">
          {/* LOGO */}
          <span className="text-2xl md:text-4xl font-bold tracking-wide leading-tight">
            Coffee Bliss
          </span>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-10 items-center text-lg md:text-xl">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `font-semibold tracking-wide ${isActive ? "underline underline-offset-4" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* CART (DESKTOP) */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-full bg-amber-600 hover:bg-amber-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
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
                <span className="absolute -top-1.5 -right-1.5 text-[10px] w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
          </div>

          {/* MOBILE ICONS */}
          <div className="md:hidden flex gap-3 items-center">
            {/* CART MOBILE */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
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

            {/* HAMBURGER */}
            <button
              ref={hamburgerButtonRef}
              onClick={toggleMobile}
              className="p-2 text-white text-xl"
            >
              ☰
            </button>
          </div>
        </div>

        {/* CART POPUP */}
        {cartOpen && (
          <div
            ref={cartRef}
            className="
          fixed md:absolute
          right-2 md:right-4
          top-16 md:top-14
          bg-white text-[#4B2E0E] rounded-xl shadow-xl
          w-[92vw] md:w-full md:max-w-sm
          max-h-[70vh] overflow-y-auto p-4 z-[999]"
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

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-[#4B2E0E] rounded-lg mt-2 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-white text-base font-medium hover:bg-amber-600 ${isActive ? "bg-amber-700" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
