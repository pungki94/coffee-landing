import React from "react";
import { NavLink } from "react-router-dom";
const navItems = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About", path: "/about" },
];
function Header() {
  return (
    <header className="bg-brown-900 bg-[#4B2E0E] text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Coffee Bliss</h1>
        <nav className="space-x-6">
          {navItems.map(({ name, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "underline font-semibold"
                  : "hover:underline"
              }
              end={path === "/"}
            >
              {name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
export default Header;
