import React, { useState, useEffect } from "react";
import { Product } from "../types/product";
import { useLocation } from "react-router-dom";
import { fetchProductsFromSpreadsheet } from "../services/spreadsheetService";
import coffeeImages from "../constants/coffeeImages";

// Helper function to resolve image path
<<<<<<< HEAD
const getImagePath = (imageName: string | any): string => {
  if (!imageName || typeof imageName !== 'string') return '';
=======
const getImagePath = (imageName: string): string => {
  if (!imageName) return '';
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379

  const cleanName = imageName.trim();

  // If it's already a full URL (http/https), return as is
  if (cleanName.startsWith('http://') || cleanName.startsWith('https://')) {
    // Helper to convert Google Drive shareable links to direct image links
    if (cleanName.includes('drive.google.com')) {
      const idMatch = cleanName.match(/\/d\/([\w-]+)|id=([\w-]+)/);
      if (idMatch) {
        const id = idMatch[1] || idMatch[2];
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
    }
    return cleanName;
  }

  const lowerName = cleanName.toLowerCase();

  // Define manual aliases for spelling variations or specific overrides
  const manualAliases: { [key: string]: string } = {
    'sumatera': 'sumatra',
    'columbian': 'colombian', // Spelling fix
    'kopi': 'espresso',       // Generic coffee alias
  };

  // Helper to find image in coffeeImages object
  const findImage = (key: string) => {
    return (coffeeImages as any)[key];
  };

  // 1. Check manual aliases (fuzzy match)
  for (const alias of Object.keys(manualAliases)) {
    // Check if input contains the alias (e.g. "Columbian Supremo" contains "columbian")
    if (lowerName.includes(alias)) {
      const targetKey = manualAliases[alias];
      const img = findImage(targetKey);
      if (img) return img;
    }
  }

  // 2. Check coffeeImages keys (exact & fuzzy)
  const keys = Object.keys(coffeeImages);

  // 2a. Exact match or match with .png
  for (const key of keys) {
    if (lowerName === key || lowerName === `${key}.png`) {
      return findImage(key);
    }
  }

  // 2b. Partial match (if input contains the image key name)
  // e.g. "Ethiopian Yirgacheffe" contains "ethiopian"
  for (const key of keys) {
    if (lowerName.includes(key)) {
      return findImage(key);
    }
  }

  // 3. Fallback: Try to use the filename from public/images
  if (lowerName.match(/\.(png|jpg|jpeg|webp)$/)) {
    return `/images/${cleanName}`;
  } else {
    return `/images/${cleanName}.png`;
  }
};

const ProductImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`${className} bg-amber-50 flex flex-col items-center justify-center text-amber-800/50`}>
        <span className="text-4xl mb-2">☕</span>
        <span className="text-sm font-medium">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

interface CartItem extends Product {
  qty: number;
}

interface ShopProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Shop: React.FC<ShopProps> = ({ cart, setCart }) => {
  const [filter, setFilter] = useState<string>("All Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [errorProducts, setErrorProducts] = useState<string>("");
  const location = useLocation();

<<<<<<< HEAD
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

=======
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379
  const fetchProducts = async (force: boolean = false) => {
    // Try to load from localStorage first if not forcing
    if (!force) {
      const cachedProducts = localStorage.getItem('shop_products');

<<<<<<< HEAD
      // Disable cache to ensure fresh data every time (as per previous logic)
      // Note: If we want to re-enable cache later, change this back to true
=======
      // Disable cache to ensure fresh data every time
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379
      const cacheValid = false;

      if (cachedProducts && cacheValid) {
        try {
          const parsedProducts = JSON.parse(cachedProducts);
          if (Array.isArray(parsedProducts)) {
<<<<<<< HEAD
            // Normalize cached data too, just in case old bad data is stuck there
            const validCached = parsedProducts.map(normalizeProduct);
            setProducts(validCached);
            setLoadingProducts(false);
            return; // Exit if cache was used
=======
            setProducts(parsedProducts);
            setLoadingProducts(false);
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    } else {
      setLoadingProducts(true);
    }

    try {
      const data = await fetchProductsFromSpreadsheet();
<<<<<<< HEAD
      if (Array.isArray(data) && data.length > 0) {
        // Validation: Filter out nulls or invalid items and Normalize
        const validData = data
          .filter(item => item && typeof item === 'object' && item.id)
          .map(normalizeProduct);

        setProducts(validData);
        localStorage.setItem('shop_products', JSON.stringify(validData));
        localStorage.setItem('shop_products_timestamp', Date.now().toString());
        setLoadingProducts(false);
      } else {
        // Handle empty but successful response
        setProducts([]);
        setLoadingProducts(false);
=======
      if (data.length > 0) {
        setProducts(data);
        localStorage.setItem('shop_products', JSON.stringify(data));
        localStorage.setItem('shop_products_timestamp', Date.now().toString());
        setLoadingProducts(false);
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379
      }
    } catch (err) {
      console.error(err);
      if (force) setErrorProducts("Failed to fetch fresh data");
    } finally {
      if (force) setLoadingProducts(false);
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
      await fetch(
        "https://script.google.com/macros/s/AKfycbxU2G-5AD7IVwJnVPK8lCMQPY0325NAxQzhu339QkwCQf9CwmfQlxlradSG4Lqy5CyZ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
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
        <div className="fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {successMsg}
        </div>
      )}
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">Our Coffee Selection</h1>

        {/* FILTER */}
        {!loadingProducts && !errorProducts && (
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center mb-6 md:mb-10">
<<<<<<< HEAD
            {["All Products", ...Array.from(new Set(products.map(p => p?.category).filter(Boolean)))].map((cat) => (
=======
            {["All Products", ...Array.from(new Set(products.map(p => p.category)))].map((cat) => (
>>>>>>> b1c94699c7d585c98ba9e703fc97994f691d4379
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded font-medium transition ${filter === cat ? "bg-amber-700 text-white" : "bg-white text-[#4B2E0E] hover:bg-amber-200"
                  }`}
              >
                {cat}
              </button>
            ))}
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
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition scroll-mt-32"
                id={`product-${product.id}`}
              >
                <ProductImage
                  src={product.image ? getImagePath(product.image) : ''}
                  alt={product.name}
                  className="w-full h-40 md:h-52 object-cover"
                />
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-xl mb-1 md:mb-2 leading-tight">{product.name}</h3>
                  <p className="text-gray-700 text-xs md:text-sm mb-2 md:mb-3">{product.description}</p>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="font-bold text-sm md:text-lg">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-amber-700 text-white px-3 py-1.5 rounded text-xs md:text-sm hover:bg-amber-800 transition w-full md:w-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
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
    </section>
  );
};

export default Shop;
