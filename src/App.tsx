
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Product } from "./types/product";

// MUST match Navbar: Product + qty
export interface CartItem extends Product {
  qty: number;
}

function App() {
  // gunakan CartItem[], bukan Product[]
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuth") === "true";
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuth", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuth");
    setCart([]); // Clear cart on logout
  };

  return (
    <Router basename="/coffee-landing">
      <ScrollToTop />
      <Routes>
        {/* Public Login & Register Route - No Navbar/Footer */}
        <Route
          path="/login"
          element={
            <Login onLogin={handleLogin} />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes - With Navbar & Footer */}
        <Route
          element={
            isAuthenticated ? (
              <>
                <Navbar cart={cart} setCart={setCart} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                <Outlet />
                <Footer />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop cart={cart} setCart={setCart} />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
