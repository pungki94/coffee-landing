import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
<<<<<<< HEAD
import { Product } from "../types/product";

interface CartItem extends Product {
  qty: number;
}

interface NavbarProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
=======
import { Product } from "../App";

interface NavbarProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
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
<<<<<<< HEAD

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
=======
  const cartRef = useRef<HTMLDivElement>(null);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const toggleCart = () => setCartOpen(!cartOpen);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // FIX: Remove berdasarkan cartId unik
  const handleRemove = (cartId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  return (
    <nav className="coffee-bg text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <span className="text-xl sm:text-2xl font-bold">Coffee Bliss</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active-nav" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}

<<<<<<< HEAD
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
=======
          {/* Shopping Cart */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={toggleCart}
              className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 transition relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Desktop Mini Cart */}
            {cartOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white text-[#4B2E0E] shadow-lg rounded-lg p-4 z-50 max-h-[80vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center py-4">Your cart is empty</p>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <li
                          key={item.cartId}
                          className="flex items-center py-2 justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                            <span className="text-sm truncate">{item.name} <span className="text-amber-700 font-semibold">(Qty: {item.quantity || 1})</span></span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-sm">
                              ${((item.price * (item.quantity || 1)).toFixed(2))}
                            </span>

                            <button
                              onClick={() => handleRemove(item.cartId!)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between font-bold mt-4">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center space-x-2 sm:space-x-4">
          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 transition relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>

            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
              </span>
            )}
          </button>

<<<<<<< HEAD
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
              {/* Header */}
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
                  {/* Item Name */}
                  <span className="whitespace-pre-wrap break-words pr-2 text-left">
                    {item.name}
                  </span>

                  {/* QTY */}
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

                  {/* Price */}
                  <span className="text-center text-[#4B2E0E] font-medium">
                    ${item.price.toFixed(2)}
                  </span>

                  {/* Total */}
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
=======
          {/* Mobile Cart */}
          {cartOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-72 bg-white text-[#4B2E0E] shadow-lg rounded-lg p-4 z-50">
              {cart.length === 0 ? (
                <p className="text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <li
                        key={item.cartId}
                        className="flex items-center py-2 justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                          <span className="text-sm truncate">{item.name} <span className="text-amber-700 font-semibold">(Qty: {item.quantity || 1})</span></span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold text-sm">
                            ${((item.price * (item.quantity || 1)).toFixed(2))}
                          </span>
                          <button
                            onClick={() => handleRemove(item.cartId!)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between font-bold mt-4">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Hamburger Menu */}
          <button onClick={toggleMobile}>
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#4B2E0E] text-white mt-2 rounded-lg shadow-lg">
          <ul className="flex flex-col space-y-2 p-4">
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
<<<<<<< HEAD
                  `block px-3 py-2 rounded text-white hover:bg-amber-600 ${
=======
                  `block px-3 py-2 rounded hover:bg-amber-600 ${
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
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
