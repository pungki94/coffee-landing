import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
<<<<<<< HEAD
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
=======

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  cartId?: string; // untuk identitas unik item
  quantity?: number; // quantity in cart
}

function App() {
  // ❗ INI SATU-SATUNYA STATE CART
  const [cart, setCart] = useState<Product[]>([]);

  return (
    <Router>
      <Navbar cart={cart} setCart={setCart} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/shop"
          element={<Shop cart={cart} setCart={setCart} />}
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
>>>>>>> 2509f1dc97d16622bd5719d630f1c5704fd47247
  );
}

export default App;
