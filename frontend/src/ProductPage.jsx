import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";

function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
    const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();
    // Increase quantity
    const handleIncrease = () => {
        const step = product.quantity_increase || 1;
        const newQty = quantity + step;

        setQuantity(newQty);

        addToCart({ ...product, quantity: newQty });
    };

    // Decrease quantity
    const handleDecrease = () => {
        const step = product.quantity_increase || 1;

        setQuantity(prev => {
            const newQty = Math.max(0, prev - step);

            if (newQty === 0) {
                removeFromCart(product.id);
            } else {
                updateQuantity(product.id, newQty);
            }

            return newQty;
        });
    };



    useEffect(() => {
        setLoading(true);
        // Load product from backend by ID (Mongo _id)
        (async () => {
            try {
                const res = await apiFetch(`/api/products/${id}`);
                if (res.status === 404) {
                    setProduct(null);
                    setRelatedProducts([]);
                    setLoading(false);
                    return;
                }
                const p = await res.json();
                console.debug('[ProductPage] fetched product:', p);
                // normalize id so UI keeps using product.id
                const norm = { ...p, id: p.id ?? p._id };
                setProduct(norm);

                // fetch related products by category from backend
                if (norm?.category) {
                    try {
                        // If category is an object, prefer the name; otherwise use the string/id
                        let catParam = norm.category;
                        if (typeof norm.category === 'object' && norm.category !== null) {
                            catParam = norm.category.name || norm.category._id;
                        }
                        const relRes = await apiFetch(`/api/products?category=${encodeURIComponent(catParam)}&limit=20`);
                        const relJson = await relRes.json();
                        console.debug('[ProductPage] related raw response:', relJson);
                        const relArr = Array.isArray(relJson.data) ? relJson.data : [];
                        const normRel = relArr
                            .map(r => ({ ...r, id: r.id ?? r._id }))
                            .filter(r => r.id !== norm.id);
                        console.debug('[ProductPage] normalized related count:', normRel.length);
                        setRelatedProducts(normRel);
                    } catch (err) {
                        console.error('Error loading related products:', err);
                        setRelatedProducts([]);
                    }
                } else {
                    setRelatedProducts([]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error loading product:", err);
                setProduct(null);
                setRelatedProducts([]);
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!product)
        return (
            <div className="p-10 text-center text-red-600">Product not found</div>
        );

    return (
        <main className="pt-36 pb-16 px-4 sm:px-6 lg:px-20 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="text-xs sm:text-sm text-gray-600 mb-6">
                <Link to="/" className="hover:underline">
                    Home
                </Link>{" "}
                &gt;{" "}
                <Link to="#" className="hover:underline">
                    {typeof product.category === 'object' && product.category !== null
                        ? product.category.name
                        : product.category}
                </Link>{" "}
                &gt;{" "}
                <span className="text-[#dc3545] font-semibold">{product.name}</span>
            </div>

            {/* Product Section */}
            <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Image */}
                <div className="flex justify-center items-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-64 h-52 sm:w-80 sm:h-60 object-contain rounded-lg"
                    />
                </div>

                {/* Right: Info */}
                <div className="space-y-5">
                    <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-500 text-sm">Category: {typeof product.category === 'object' && product.category !== null
                        ? product.category.name
                        : product.category}</p>
                    <p className="text-gray-500 text-sm">Unit: {product.unit}</p>

                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-semibold text-[#dc3545]">
                            Rs {product.price}
                        </span>
                    </div>

                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {product.description || "No additional description available."}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                        <label className="font-medium">Quantity:</label>

                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">

                            {/* - Button */}
                            <button
                                onClick={handleDecrease}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300"
                            >
                                -
                            </button>

                            {/* Quantity Display */}
                            <div className="px-4 py-2 text-center">
                                {quantity}
                            </div>

                            {/* + Button */}
                            <button
                                onClick={handleIncrease}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300"
                            >
                                +
                            </button>

                        </div>
                    </div>


                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* 🛒 ADD TO CART */}
                        <button
                            onClick={() => {
                                const productWithQty = { ...product, quantity: Number(quantity) };
                                addToCart(productWithQty);
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#dc3545] text-white font-medium hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545] transition"
                        >
                            🛒 Add to Cart
                        </button>

                        {/* ❤️ Wishlist */}
                        <button
                            onClick={() => {
                                const isInWishlist = wishlist.some(
                                    (item) => item.id === product.id
                                );
                                if (isInWishlist) removeFromWishlist(product.id);
                                else addToWishlist(product);
                            }}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${wishlist.some((item) => item.id === product.id)
                                ? "bg-[#dc3545] text-white hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545]"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                        >
                            ❤️ Wishlist
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ Related Products — same style as All-Products grid */}
            {relatedProducts.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-lg sm:text-xl font-bold mb-6 text-center">
                        You May Also Like
                    </h2>

                    {/* 🧱 Product Grid (same as All-Products) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {relatedProducts.map((item) => {
                            const isInWishlist = wishlist.some((w) => w.id === item.id);
                            const cartItem = cart.find((c) => c.id === item.id);
                            const quantity = cartItem ? cartItem.quantity : 0;

                            return (
                                <div
                                    key={item.id}
                                    className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[#dc3545] transition-all relative"
                                >
                                    {/* ❤️ Wishlist Icon */}
                                    <button
                                        onClick={() =>
                                            isInWishlist
                                                ? removeFromWishlist(item.id)
                                                : addToWishlist(item)
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
                                    <Link to={`/product/${item.id}`}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-36 sm:h-40 object-contain rounded-md mb-2 transition-transform duration-200 hover:scale-105"
                                        />
                                        <p className="text-center mt-1 font-semibold text-sm sm:text-base md:text-lg text-gray-800 hover:text-[#dc3545] transition">
                                            {item.name}
                                        </p>
                                        <p className="text-center text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                                            {item.size || item.unit}
                                        </p>
                                    </Link>

                                    {/* 🛒 Cart Section */}
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="font-bold text-sm sm:text-base text-gray-800">
                                            Rs {item.price || "N/A"}
                                        </span>

                                        <div className="relative">
                                            {/* Add to Cart */}
                                            <button
                                                onClick={() => addToCart(item)}
                                                className={`relative transition-transform duration-300 ${quantity > 0 ? "-translate-x-1" : "translate-x-0"
                                                    }`}
                                            >
                                                <img
                                                    src="/Images/add-to-cart.png"
                                                    alt="Add to cart"
                                                    className="w-5 sm:w-6 transition-transform duration-300"
                                                />

                                                {/* Quantity Badge */}
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
                </section>
            )}
        </main>
    );
}

export default ProductPage;
