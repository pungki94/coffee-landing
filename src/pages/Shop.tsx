import React, { useState, useEffect } from "react";
import { api } from "../config/api";
import { Product, CartItem } from "../types/product";
import { useLocation } from "react-router-dom";

import ProductModal from "../components/ProductModal";
import CoffeeCard from "../components/CoffeeCard";

// Helper function removed - moved to src/utils/imageHelper.ts

interface ShopProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isAuthenticated: boolean;
}

const Shop: React.FC<ShopProps> = ({ cart, setCart, isAuthenticated }) => {
  const [filter, setFilter] = useState<string>("All Products");
  // Extend Product to include internal stable ID for UI keys
  interface ProductWithLocalId extends Product {
    _localId?: string;
  }
  const [products, setProducts] = useState<ProductWithLocalId[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  const [errorProducts, setErrorProducts] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const location = useLocation();

  // Helper to safely parse product data
  const normalizeProduct = (item: any): Product => {
    // Ensure item is an object
    if (!item || typeof item !== 'object') return item;

    const safeItem = { ...item };

    // Ensure price is a number
    if (typeof safeItem.price === 'string') {
      // Remove generic currency symbols and whitespace, then parse
      const parsed = parseFloat(safeItem.price.replace(/[^0-9.-]/g, ''));
      safeItem.price = isNaN(parsed) ? 0 : parsed;
    } else if (typeof safeItem.price !== 'number') {
      // Fallback for null/undefined/other types
      safeItem.price = 0;
    }

    return safeItem;
  };

  // Helper to ensure each product has a stable local ID for React keys
  const ensureLocalId = (p: Product): ProductWithLocalId => {
    return { ...p, _localId: (p as any)._localId || p.id.toString() };
  };

  const fetchProducts = async (force: boolean = false, isBackground: boolean = false) => {
    // Try to load from localStorage first if not forcing
    if (!force) {
      const cachedProducts = localStorage.getItem('shop_products');
      const cachedTimestamp = localStorage.getItem('shop_products_timestamp');

      // Enable cache - use cached data if available
      // Cache is valid for 5 minutes (300000 ms)
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();
      const timestamp = cachedTimestamp ? parseInt(cachedTimestamp) : 0;
      const cacheValid = cachedProducts && (now - timestamp < CACHE_DURATION);

      if (cachedProducts) {
        try {
          const parsedProducts = JSON.parse(cachedProducts);
          if (Array.isArray(parsedProducts)) {
            // Normalize cached data too, just in case old bad data is stuck there
            const validCached = parsedProducts.map(normalizeProduct);
            setProducts(validCached);
            setLoadingProducts(false);

            // If cache is still valid, just return
            if (cacheValid) {
              return;
            }
            // If cache is expired, continue to fetch fresh data in background
            // but we already showed cached data, so user sees instant load
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    } else {
      if (!isBackground) setLoadingProducts(true);
    }

    try {
      const data = await api.products.getAll();
      console.log('Fetched products data:', data); // DEBUG

      if (Array.isArray(data) && data.length > 0) {
        // Validation: Filter out nulls or invalid items and Normalize
        const validData = data
          .filter(item => item && typeof item === 'object' && item.id)
          .map(normalizeProduct)
          .map(ensureLocalId);

        console.log('Valid products after normalization:', validData); // DEBUG

        // Log image URLs for debugging
        validData.forEach(p => {
          console.log(`Product ${p.id} (${p.name}): image = "${p.image}"`);
        });

        // Merge with existing state to preserve _localId (key) and base64 images (anti-flicker)
        setProducts(prev => {
          return validData.map(newProduct => {
            // 1. Try exact ID match
            let existing = prev.find(p => p.id === newProduct.id);

            // 2. If no exact match, try fuzzy match (Optimistic ID mismatch case)
            // If we have a local product with temp ID (id < 0) but same name, assume it's the one we just added.
            if (!existing) {
              existing = prev.find(p => p.id < 0 && p.name === newProduct.name);
            }

            if (existing) {
              return {
                ...newProduct,
                _localId: existing._localId, // Keep stable key
                // Keep existing image if it's base64 (optimistic) to avoid loading flicker
                image: (existing.image && existing.image.startsWith('data:')) ? existing.image : newProduct.image
              };
            }
            return newProduct;
          });
        });

        localStorage.setItem('shop_products', JSON.stringify(validData));
        localStorage.setItem('shop_products_timestamp', Date.now().toString());
        setLoadingProducts(false);
        setErrorProducts(""); // Clear any previous errors
      } else {
        // Handle empty but successful response
        setProducts([]);
        setLoadingProducts(false);
        setErrorProducts(""); // Clear any previous errors
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setLoadingProducts(false); // Always stop loading

      // Only show error on initial load or foreground refresh, not background
      if (!isBackground) {
        setErrorProducts("Failed to load products. Please refresh the page.");
      }
    }
  };

  // Fetch products from spreadsheet
  useEffect(() => {
    fetchProducts();

    const handleRefresh = () => {
      console.log("Shop refresh triggered...");
      fetchProducts(true);
    };

    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, []);

  // ... (rest of code)

  // Apply category from URL query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setFilter(cat);
  }, [location.search]);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, filter]);

  const filteredProducts =
    filter === "All Products"
      ? products
      : products.filter((p) => p.category === filter);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const reduceQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

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
      await api.order.create(payload);
      setSuccessMsg("Order sent to Google Sheet!");
      setCart([]); // Optional: clear cart on success
      setTimeout(() => setSuccessMsg(""), 1500);
    } catch (err) {
      console.error(err);
      alert("Error sending order!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (productData.id) {
        // Edit Mode
        // Optimistic Update (include all fields including image)
        setProducts((prev) =>
          prev.map((p) => p.id === productData.id
            ? { ...p, ...productData } // Include image for immediate display
            : p)
        );
        setIsModalOpen(false); // Close immediately

        const res = await api.products.update(productData);
        if (res.status === 'success') {
          setSuccessMsg("Product updated successfully!");
          setTimeout(() => setSuccessMsg(""), 2000);
          // Refresh in background to update localStorage with real Drive image URLs
          fetchProducts(true, true);
        } else {
          alert("Failed to update: " + res.error);
          fetchProducts(true); // Revert on failure
        }
      } else {
        // Add Mode - Optimistic Update (same as Edit for consistency)
        const tempId = -Date.now();
        const optimisticProduct: ProductWithLocalId = {
          id: tempId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image, // Show uploaded image immediately
          category: productData.category,
          _localId: tempId.toString(), // Stable key for React
        };

        // Optimistic update: add product immediately to UI
        setProducts((prev) => [...prev, optimisticProduct]);
        setIsModalOpen(false); // Close immediately

        const res = await api.products.add(productData);
        if (res.status === 'success') {
          // Update the temporary ID with the real ID from server
          if (res.id) {
            setProducts((prev) => prev.map(p => p.id === tempId ? { ...p, id: res.id } : p));
          }
          setSuccessMsg("Product added successfully!");
          setTimeout(() => setSuccessMsg(""), 2000);
          // Always refresh in background to update localStorage with real data
          fetchProducts(true, true);
        } else {
          alert("Failed to add: " + res.error);
          // Remove optimistic product on failure
          setProducts((prev) => prev.filter((p) => p.id !== tempId));
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving product.");
      fetchProducts(true); // Revert on error
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      // Check if product is temporary (from optimistic add, not yet synced)
      if (id < 0) {
        // Just remove from UI, no backend call needed
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg("Product removed!");
        setTimeout(() => setSuccessMsg(""), 2000);
        return;
      }

      // Optimistic Update - remove product immediately from UI (same as add/edit)
      const productToDelete = products.find(p => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));

      const res = await api.products.delete(id);
      if (res.status === 'success') {
        setSuccessMsg("Product deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 2000);
        // Refresh in background to update localStorage cache
        fetchProducts(true, true);
      } else {
        alert("Failed to delete: " + res.error);
        // Revert optimistic update on failure
        if (productToDelete) {
          setProducts((prev) => [...prev, productToDelete]);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting product.");
      fetchProducts(true); // Revert on error
    }
  };

  return (
    <section className="page py-12 px-4 bg-amber-50 text-[#4B2E0E] relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mb-4"></div>
            <p className="font-bold text-lg">Processing Order...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl z-[999] flex items-center gap-3 animate-slide-down border-2 border-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold text-lg">{successMsg}</span>
        </div>
      )}
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">Our Coffee Selection</h1>

        {/* FILTER & ADD BUTTON CONTAINER */}
        {!loadingProducts && !errorProducts && (
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 max-w-6xl mx-auto">

            {/* ADD BUTTON (Left side) - Only show for authenticated users */}
            <div className="mb-4 md:mb-0">
              {isAuthenticated && (
                <button
                  onClick={handleAddProduct}
                  className="w-10 h-10 bg-amber-700 hover:bg-amber-800 text-white rounded flex items-center justify-center transition shadow-md"
                  title="Add New Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>

            {/* FILTERS (Center-ish) */}
            <div className="flex flex-wrap gap-2 justify-center">
              {["All Products", ...Array.from(new Set(products.map(p => p?.category).filter(Boolean)))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded font-medium transition ${filter === cat
                    ? "bg-amber-700 text-white shadow-md"
                    : "bg-white text-[#4B2E0E] hover:bg-amber-100"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Spacer for centering logic (Right side) - optional, keeps filters centered-ish if we want perfect center relative to page, 
                but flex-between is fine. If we want filters truly centered, we might need a different layout. 
                Let's stick to flex-between for now. 
            */}
            <div className="w-10 hidden md:block"></div>
          </div>
        )}

        {/* LOADING STATE */}
        {loadingProducts && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
            <p className="text-lg font-semibold">Loading products from spreadsheet...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {errorProducts && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-bold mb-2">Error Loading Products</p>
              <p>{errorProducts}</p>
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loadingProducts && !errorProducts && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._localId || product.id}
                id={`product-${product.id}`}
                className="transition scroll-mt-32"
              >
                <CoffeeCard
                  coffee={product}
                  onEdit={isAuthenticated ? handleEditProduct : undefined}
                  onDelete={isAuthenticated ? handleDeleteProduct : undefined}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        )}

        {/* CART SUMMARY */}
        {cart.length > 0 && (
          <div className="mt-12 bg-white shadow-md rounded-lg p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
            <div className="grid grid-cols-[1fr_60px_70px_80px] text-xs font-semibold text-gray-600 pb-2 border-b">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Price</span>
              <span className="text-right">Total Price</span>
            </div>
            {cart.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_70px_80px] text-sm py-3 border-b last:border-0 items-center"
              >
                <span className="truncate">{item.name}</span>
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => reduceQty(item.id)}
                    className="px-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.qty}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <span className="text-center">${item.price.toFixed(2)}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total Payment</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleBuy}
              className="mt-4 w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
            >
              Buy
            </button>
          </div>
        )}
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={currentProduct}
      />
    </section>
  );
};

export default Shop;
