import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Product } from "../App";

interface NavbarProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
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
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active-nav" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}

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
              </span>
            )}
          </button>

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
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded hover:bg-amber-600 ${
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
