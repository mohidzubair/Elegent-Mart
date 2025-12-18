import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";
import { apiFetch } from "./api";

function Cart() {
    const { cart, addToCart, removeFromCart, updateQuantity, subtotal } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [allProducts, setAllProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch products from backend
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiFetch('/api/products?limit=200');
                const json = await res.json();
                const arr = Array.isArray(json.data) ? json.data : [];
                const norm = arr.map(p => ({ ...p, id: p.id ?? p._id }));

                if (!mounted) return;
                setAllProducts(norm);

                // Filter related products by category
                if (cart.length > 0) {
                    const cartCategoryIds = cart.map((item) => {
                        if (!item.category) return null;
                        if (typeof item.category === 'object' && item.category !== null) {
                            return item.category._id || item.category.id;
                        }
                        return item.category;
                    }).filter(Boolean);

                    const filtered = norm.filter((product) => {
                        if (!product.category) return false;

                        let prodCatId;
                        if (typeof product.category === 'object' && product.category !== null) {
                            prodCatId = product.category._id || product.category.id;
                        } else {
                            prodCatId = product.category;
                        }

                        return cartCategoryIds.includes(String(prodCatId)) &&
                            !cart.some((c) => String(c.id) === String(product.id));
                    });

                    setRelatedProducts(filtered.slice(0, 8));
                } else {
                    setRelatedProducts(norm.slice(0, 8));
                }
            } catch (err) {
                console.error("Error loading products:", err);
                if (mounted) {
                    setAllProducts([]);
                    setRelatedProducts([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [cart]);

    // Wait for products to load
    if (loading) {
        return (
            <main className="pt-24 text-center text-lg min-h-screen flex items-center justify-center">
                Loading...
            </main>
        );
    }

    const discount = cart.length === 0 ? 0 : 48;
    const total = subtotal - discount;

    return (
        <main className="container mx-auto px-4 md:px-10 py-8 my-14">
            {/* FLEX WRAPPER for Cart + Summary */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* LEFT: Cart Items */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[300px] flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                            <p className="text-xl font-medium">Your cart is empty 🛒</p>
                            <Link
                                to="/"
                                className="mt-3 text-[#dc3545] hover:underline font-medium"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between border-b py-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg"
                                    />
                                    <div>
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-sm text-gray-500">{item.unit}</p>
                                        <p className="font-medium">Rs {item.price}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded"
                                        onClick={() => updateQuantity(item.name, -1)}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded"
                                        onClick={() => updateQuantity(item.name, 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <p className="font-semibold">
                                    Rs {item.price * item.quantity}
                                </p>
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => removeFromCart(item.name)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* RIGHT: Order Summary */}
                <div className="md:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>Rs {cart.length === 0 ? 0 : subtotal}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping</span>
                            <span className="text-green-600">
                                {cart.length === 0 ? "—" : "Free"}
                            </span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Discount</span>
                            <span>- Rs {cart.length === 0 ? 0 : discount}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs {cart.length === 0 ? 0 : total}</span>
                        </div>

                        {cart.length === 0 ? (
                            <Link
                                to="/"
                                className="w-full mt-4 bg-[#dc3545] text-white py-3 rounded-lg hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545] transition font-medium text-center block"
                            >
                                Continue Shopping
                            </Link>
                        ) : (
                            <Link
                                to="/checkout"
                                className="w-full mt-4 bg-[#dc3545] text-white py-3 rounded-lg hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545] transition font-medium text-center block"
                            >
                                Proceed to Checkout
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Related Products (from database.json) */}
            {cart.length > 0 && relatedProducts.length > 0 && (
                <div className="w-full mt-6 bg-gray-200 p-4 rounded-lg shadow">
                    <div className="flex items-center my-6 md:my-10">
                        <div className="flex-grow border-t border-gray-400"></div>
                        <span className="px-2 md:px-4 text-base md:text-lg font-bold">
                            You May Also Like
                        </span>
                        <div className="flex-grow border-t border-gray-400"></div>
                    </div>

                    <section className="mt-12">
                        <div className="flex overflow-x-auto gap-3 sm:gap-4 md:gap-5 rounded-lg bg-white p-4 sm:p-6 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {relatedProducts.map((product, i) => {
                                const isInWishlist = wishlist.some(
                                    (item) => item.id === product.id
                                );
                                const cartItem = cart.find(
                                    (item) => item.id === product.id
                                );
                                const quantity = cartItem ? cartItem.quantity : 0;

                                return (
                                    <div
                                        key={i}
                                        className="relative flex-none w-40 sm:w-48 md:w-56 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-[#dc3545] transition-all"
                                    >
                                        {/* ❤️ Wishlist Icon */}
                                        <button
                                            onClick={() => {
                                                isInWishlist
                                                    ? removeFromWishlist(product.id)
                                                    : addToWishlist(product);
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

                                        {/* 🖼️ Product Image + Info */}
                                        <Link to={`/product/${product.id}`}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-36 sm:h-40 object-contain rounded-md mb-2 transition-transform duration-200 hover:scale-105"
                                            />
                                            <p className="text-center mt-1 font-semibold text-sm sm:text-base text-gray-800 hover:text-[#dc3545] transition">
                                                {product.name}
                                            </p>
                                            <p className="text-center text-gray-500 text-xs sm:text-sm mb-2">
                                                {product.unit}
                                            </p>
                                        </Link>

                                        {/* 🛒 Simple Add to Cart */}
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="font-bold text-sm sm:text-base text-gray-800">
                                                Rs {product.price || "N/A"}
                                            </span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="p-2 text-white rounded-full hover:scale-110 transition"
                                            >
                                                <img
                                                    src="/Images/add-to-cart.png"
                                                    alt="Add to cart"
                                                    className="w-5 sm:w-6"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Cart;
