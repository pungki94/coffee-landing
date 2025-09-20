import React from "react";
import { Link } from "react-router-dom";
function Home() {
  return (
    <section className="text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to Coffee Bliss</h2>
      <p className="mb-8 text-lg max-w-xl mx-auto">
        Discover the finest coffee blends sourced from around the world. Freshly roasted and delivered to your doorstep.
      </p>
      <Link
        to="/shop"
        className="inline-block bg-[#6F4E37] text-white px-6 py-3 rounded hover:bg-[#5a3e2a] transition"
      >
        Shop Now
      </Link>
    </section>
  );
}
export default Home;
