import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useWishlist } from "./context/WishlistContext";
import { useCart } from "./context/CartContext";
import { apiFetch } from "./api";

function AllProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

    // ✅ Fetch products from backend
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const url = searchQuery
                    ? `/api/products?limit=200&search=${encodeURIComponent(searchQuery)}`
                    : '/api/products?limit=200';
                const res = await apiFetch(url);
                const json = await res.json();
                console.debug('[AllProducts] raw products response:', json);
                const arr = Array.isArray(json.data) ? json.data : [];
                const norm = arr.map(p => ({ ...p, id: p.id ?? p._id }));
                console.debug('[AllProducts] normalized products count:', norm.length);
                if (norm.length > 0) console.debug('[AllProducts] sample product:', norm[0]._id || norm[0].id, norm[0].name);
                if (mounted) setProducts(norm);
            } catch (err) {
                console.error('Error loading products:', err);
                if (mounted) setProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [searchQuery]);

    return (
        <main className="bg-[#f9f9f9] min-h-screen pt-24 pb-10">
            <div className="mx-2 md:mx-10 bg-white rounded-lg p-5 md:p-10">
                {/* 🏷️ Page Header */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#dc3545] mb-6 text-center">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
                </h1>

                {/* 🧺 Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 ">
                    {loading ? (
                        <div className="col-span-full text-center py-10">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-10">No products found.</div>
                    ) : (
                        products.map((product) => {
                            const isInWishlist = wishlist.some((item) => item.id === product.id);
                            const cartItem = cart.find((item) => item.id === product.id);
                            const quantity = cartItem ? cartItem.quantity : 0;

                            return (
                                <div
                                    key={product._id}
                                    className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[#dc3545] transition-all relative md:w-64"
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
                                        <p className="text-center mt-1 font-semibold text-sm sm:text-base md:text-lg text-gray-800 hover:text-[#dc3545] transition">
                                            {product.name}
                                        </p>
                                        <p className="text-center text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                                            {product.size || product.unit}
                                        </p>
                                    </Link>

                                    {/* 🛒 Cart Section (Same as HomePage) */}
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="font-bold text-sm sm:text-base text-gray-800">
                                            Rs {product.price || "N/A"}
                                        </span>

                                        <div className="relative">
                                            {/* Add to cart button */}
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
                        }))}
                </div>
            </div>
        </main>
    );
}

export default AllProducts;
