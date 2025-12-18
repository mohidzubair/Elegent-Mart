import React, { useEffect, useState } from "react";
import { useWishlist } from "./context/WishlistContext";
import { useCart } from "./context/CartContext";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";

function Wishlist() {
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlist();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  const [database, setDatabase] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch products from backend to compute related products
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/products?limit=200');
        const json = await res.json();
        const arr = Array.isArray(json.data) ? json.data : [];

        // normalize products and derive a stable category key that works
        // whether category is a populated object, an ObjectId string, or a plain name
        const norm = arr.map((p) => {
          const id = p.id ?? p._id;
          let categoryKey = null;
          if (p && p.category) {
            if (typeof p.category === 'object' && p.category !== null) {
              categoryKey = p.category.name || p.category._id || null;
            } else {
              categoryKey = p.category;
            }
          }
          return { ...p, id, categoryKey };
        });

        if (!mounted) return;
        setAllProducts(norm);
        // default related products (first 8)
        setRelatedProducts(norm.slice(0, 8));
      } catch (err) {
        console.error('Error loading products for wishlist:', err);
        if (mounted) {
          setAllProducts([]);
          setRelatedProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // ✅ Filter related products to exclude items already in wishlist
  useEffect(() => {
    if (allProducts.length === 0) return;

    // create a set of category keys from wishlist items (normalize like above)
    const wishlistCategoryKeys = wishlist.map((w) => {
      if (!w || !w.category) return null;
      if (typeof w.category === 'object' && w.category !== null) return w.category.name || w.category._id;
      return w.category;
    });

    const filtered = allProducts.filter((item) => {
      if (!item) return false;
      const key = item.categoryKey ?? (typeof item.category === 'object' && item.category !== null ? (item.category.name || item.category._id) : item.category);
      return key && wishlistCategoryKeys.includes(key) && !wishlist.some((w) => w.id === item.id);
    });

    setRelatedProducts(filtered.slice(0, 8));
  }, [allProducts, wishlist]);

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="mt-28 text-center text-gray-500">
        Loading wishlist...
      </div>
    );
  }

  // 🛍️ Empty Wishlist
  if (wishlist.length === 0) {
    return (
      <div className="mt-28 flex flex-col items-center justify-center text-gray-600 px-4 min-h-[60vh]">
        <img
          src={"/Images/wishlist.svg"}
          alt="Empty wishlist"
          className="w-56 h-56 object-contain mb-4"
        />
        <p className="text-lg">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="mt-28 mb-0 px-4 md:px-10 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#dc3545]">❤️ My Wishlist</h2>

      {/* 💖 Wishlist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
        {wishlist.map((product) => {
          const isInWishlist = wishlist.some((item) => item.id === product.id);
          const cartItem = cart.find((item) => item.id === product.id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div
              key={product._id}
              className="relative flex-none bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md hover:border-[#dc3545] transition-all"
            >
              {/* ❤️ Remove from Wishlist */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-[#dc3545] transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 🖼️ Product Image */}
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-36 sm:h-40 object-contain rounded-md mb-2 transition-transform duration-200 hover:scale-105"
                />
                <p className="text-center mt-2 font-semibold text-sm sm:text-base text-gray-800 hover:text-[#dc3545] transition">
                  {product.name}
                </p>
                <p className="text-center text-gray-500 text-xs sm:text-sm mb-2">
                  {product.unit}
                </p>
              </Link>

              {/* 🛒 Cart Section (same as HomePage) */}
              <div className="flex justify-between items-center mt-1">
                <span className="font-bold text-sm sm:text-base text-gray-800">
                  Rs {product.price || "N/A"}
                </span>

                <div className="relative">
                  <button
                    onClick={() => addToCart(product)}
                    className={`relative transition-transform duration-300 ${quantity > 0 ? "-translate-x-1" : "translate-x-0"
                      }`}
                  >
                    <img
                      src={"/Images/add-to-cart.png"}
                      alt="Add to cart"
                      className="w-5 sm:w-6 transition-transform duration-300"
                    />

                    {/* 🔴 Quantity Badge */}
                    {quantity > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#dc3545] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-md">
                        {quantity}
                      </span>
                    )}
                  </button>

                  {/* ➖ Remove button */}
                  {quantity > 0 && (
                    <button
                      onClick={() => {
                        if (quantity === 1) {
                          removeFromCart(product.name);
                        } else {
                          updateQuantity(product.name, -1);
                        }
                      }}
                      className="absolute -left-5 top-1/2 -translate-y-1/2 text-[#dc3545] text-lg font-bold"
                    >
                      −
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔁 Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 pb-10">
          <h3 className="text-xl font-semibold mb-4 text-[#dc3545]">
            Related Products
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {relatedProducts.map((item) => {
              const isInWishlist = wishlist.some((w) => w.id === item.id);
              const cartItem = cart.find((c) => c.id === item.id);
              const quantity = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={item._id}
                  className="relative flex-none bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md hover:border-[#dc3545] transition-all"
                >
                  {/* ❤️ Wishlist Icon */}
                  <button
                    onClick={() => {
                      isInWishlist
                        ? removeFromWishlist(item.id)
                        : addToWishlist(item);
                    }}
                    className={`absolute top-2 right-2 z-10 transition ${isInWishlist
                      ? "text-[#dc3545]"
                      : "text-gray-400 hover:text-[#dc3545]"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={isInWishlist ? "#dc3545" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.02-4.5-4.5-4.5-1.74 0-3.223.99-4 2.445A4.491 4.491 0 008.5 3.75C6.02 3.75 4 5.765 4 8.25c0 7.22 8 11.25 8 11.25s8-4.03 8-11.25z"
                      />
                    </svg>
                  </button>

                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-36 sm:h-40 object-contain rounded-md mb-2 transition-transform duration-200 hover:scale-105"
                    />
                    <p className="text-center mt-1 font-semibold text-sm sm:text-base text-gray-800 hover:text-[#dc3545] transition">
                      {item.name}
                    </p>
                    <p className="text-center text-gray-500 text-xs sm:text-sm mb-2">
                      {item.unit}
                    </p>
                  </Link>

                  {/* 🛒 Cart Section (same as HomePage) */}
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-sm sm:text-base text-gray-800">
                      Rs {item.price || "N/A"}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => addToCart(item)}
                        className={`relative transition-transform duration-300 ${quantity > 0 ? "-translate-x-1" : "translate-x-0"
                          }`}
                      >
                        <img
                          src={"/Images/add-to-cart.png"}
                          alt="Add to cart"
                          className="w-5 sm:w-6 transition-transform duration-300"
                        />

                        {quantity > 0 && (
                          <span className="absolute -top-2 -right-2 bg-[#dc3545] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-md">
                            {quantity}
                          </span>
                        )}
                      </button>

                      {quantity > 0 && (
                        <button
                          onClick={() => {
                            if (quantity === 1) {
                              removeFromCart(item.name);
                            } else {
                              updateQuantity(item.name, -1);
                            }
                          }}
                          className="absolute -left-5 top-1/2 -translate-y-1/2 text-[#dc3545] text-lg font-bold"
                        >
                          −
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
