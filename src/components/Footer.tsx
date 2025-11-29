import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#4B2E0E] text-white p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Coffee Bliss</h3>
            <p>
              Providing premium coffee experiences since 2010. Sourced
              sustainably, roasted with care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="hover:underline">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:underline">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" className="hover:underline">
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="hover:underline">
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Products</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Single Origin
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Blends
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Decaf Options
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Brewing Equipment
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="mb-4">Subscribe for updates and exclusive offers</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-l w-full text-gray-800 focus:outline-none"
              />
              <button className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-r text-white font-medium transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-amber-800 mt-12 pt-8 text-center text-sm">
          <p>Made with © 2025 PT Integrasi Performa Amanah (Grasfam). All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
