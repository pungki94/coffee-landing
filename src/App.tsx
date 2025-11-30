import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import { Product } from "./types/product";

// MUST match Navbar: Product + qty
export interface CartItem extends Product {
  qty: number;
}

function App() {
  // gunakan CartItem[], bukan Product[]
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
   <Router basename="/coffee-landing">
   <Navbar cart={cart} setCart={setCart} />
   <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/shop" element={<Shop cart={cart} setCart={setCart} />} />
      <Route path="/contact" element={<Contact />} />
   </Routes>
   <Footer />
</Router>
  );
}

export default App;
