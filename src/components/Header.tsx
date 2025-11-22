import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <nav className="coffee-bg text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold">Coffee Bliss</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active-nav" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active-nav" : ""}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active-nav" : ""}`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active-nav" : ""}`
            }
          >
            Contact
          </NavLink>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          {/* Ikon Keranjang Shop */}
          <button className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 
                2.293c-.63.63-.184 1.707.707 1.707H17m0 
                0a2 2 0 100 4 2 2 0 000-4zm-8 
                2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>

          {/* Tombol Menu Mobile */}
          <button className="md:hidden" id="mobile-menu-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden hidden mt-4 pb-2" id="mobile-menu">
        <div className="flex flex-col space-y-3 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item py-2 px-4 rounded ${
                isActive ? "active-nav bg-brown-900" : ""
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `nav-item py-2 px-4 rounded ${
                isActive ? "active-nav bg-brown-900" : ""
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `nav-item py-2 px-4 rounded ${
                isActive ? "active-nav bg-brown-900" : ""
              }`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `nav-item py-2 px-4 rounded ${
                isActive ? "active-nav bg-brown-900" : ""
              }`
            }
          >
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
