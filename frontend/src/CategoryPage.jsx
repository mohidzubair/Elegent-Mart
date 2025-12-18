
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useWishlist } from "./context/WishlistContext";
import { useCart } from "./context/CartContext";
import { apiFetch } from "./api";

export default function CategoryPage() {
    const { categoryName } = useParams();

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryDisplayName, setCategoryDisplayName] = useState(decodeURIComponent(categoryName || ""));

    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

    // Fetch category info then products for that category from backend
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setFilteredProducts([]);

        (async () => {
            try {
                // Fetch categories to resolve slug -> actual category name
                const cRes = await apiFetch('/api/categories');
                const cJson = await cRes.json();
                const cats = Array.isArray(cJson) ? cJson : (cJson.data || []);

                const requested = decodeURIComponent(categoryName || '').trim();
                // Find category by slug match or name lowercased
                const found = cats.find(cat => (cat.slug && cat.slug === requested) || (cat.name && cat.name.trim().toLowerCase() === requested.toLowerCase()));

                const categoryNameToQuery = found ? found.name : decodeURIComponent(categoryName || '');
                if (mounted) setCategoryDisplayName(found ? found.name : decodeURIComponent(categoryName || ''));

                // Fetch products matching the resolved category name
                const pRes = await apiFetch(`/api/products?category=${encodeURIComponent(categoryNameToQuery)}&limit=200`);
                const pJson = await pRes.json();
                console.debug('[CategoryPage] raw products response:', pJson);
                const arr = Array.isArray(pJson.data) ? pJson.data : [];
                const norm = arr.map(p => ({ ...p, id: p.id ?? p._id }));

                if (mounted) setFilteredProducts(norm);
            } catch (err) {
                console.error('Error loading category products:', err);
                if (mounted) setFilteredProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [categoryName]);

    // loading state
    if (loading) {
        return (
            <main className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
                <div className="text-lg">Loading...</div>
            </main>
        );
    }

    // 🕳️ Empty state
    if (filteredProducts.length === 0) {
        return (
            <main className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 capitalize">
                    {categoryDisplayName}
                </h2>
                <p className="text-gray-500 mb-6">
                    No products found in this category.
                </p>
                <Link
                    to="/"
                    className="bg-[#dc3545] text-white px-6 py-2 rounded-lg hover:bg-white hover:text-[#dc3545] border border-[#dc3545] transition"
                >
                    Back to Home
                </Link>
            </main>
        );
    }

    // 🏬 Main Layout
    return (
        <main className="bg-[#f9f9f9] min-h-screen pt-24 pb-10">
            <div className="mx-2 md:mx-10 bg-white rounded-lg p-5 md:p-10">
                {/* 🏷️ Category Header */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#dc3545] mb-6 text-center capitalize">
                    {decodeURIComponent(categoryName)}
                </h1>

                {/* 🧺 Product Grid — styled like related products */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-2 sm:gap-x-3 md:gap-x-4 justify-center">
                    {filteredProducts.map((product) => {
                        const isInWishlist = wishlist.some(
                            (item) => item.id === product.id
                        );
                        const cartItem = cart.find((c) => c.id === product.id);
                        const quantity = cartItem ? cartItem.quantity : 0;

                        return (
                            <div
                                key={product.id}
                                className="relative bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[#dc3545] transition-all w-full"
                            >
                                {/* ❤️ Wishlist Icon */}
                                <button
                                    onClick={() =>
                                        isInWishlist
                                            ? removeFromWishlist(product.id)
                                            : addToWishlist(product)
                                    }
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

                                {/* 🥬 Product Image + Info */}
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
                                        {product.size || product.unit}
                                    </p>
                                </Link>

                                {/* 🛒 Add to Cart */}
                                <div className="flex justify-between items-center mt-1">
                                    <span className="font-bold text-sm sm:text-base text-gray-800">
                                        Rs {product.price}
                                    </span>

                                    <div className="relative">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className={`relative transition-transform duration-300 ${quantity > 0 ? "-translate-x-1" : "translate-x-0"
                                                }`}
                                        >
                                            <img
                                                src="/Images/add-to-cart.png"
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
            </div>
        </main>
    );
}
