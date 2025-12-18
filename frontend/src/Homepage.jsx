
import { useCart } from "./context/CartContext";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "./api";
import { useWishlist } from "./context/WishlistContext";
import { Link } from "react-router-dom";

function HomePage() {
    const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
    const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();

    const [slideIndex, setSlideIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const SLIDES = [
        { src: "https://res.cloudinary.com/dterdl2hy/image/upload/v1761076820/my_project_images/fmguqkbthdfzgd4xusth.jpg", alt: "Banner 1" },
        { src: "https://res.cloudinary.com/dterdl2hy/image/upload/v1761076545/my_project_images/vu4eyxsllg6chesbizs3.jpg", alt: "Banner 2" },
        { src: "https://res.cloudinary.com/dterdl2hy/image/upload/v1761076528/my_project_images/psinkdwjpkp47jqxtbp0.jpg", alt: "Banner 3" },
        { src: "https://res.cloudinary.com/dterdl2hy/image/upload/v1761076517/my_project_images/esqtykpr72wzmoilpb3d.jpg", alt: "Banner 4" },
    ];

    // 🔴 NEW: Refs for scrollers
    const categoryRef = useRef(null);
    const productRefs = useRef({});

    // 🔴 NEW: Scroll one-card-at-a-time
    const scrollByCard = (ref, direction) => {
        if (!ref?.current) return;

        const card = ref.current.querySelector(":scope > *");
        if (!card) return;

        const cardWidth = card.offsetWidth + 16; // gap
        ref.current.scrollBy({
            left: direction === "left" ? -cardWidth : cardWidth,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const [pRes, cRes] = await Promise.all([
                    apiFetch('/api/products?limit=1000'),
                    apiFetch('/api/categories')
                ]);

                const pJson = await pRes.json();
                const cJson = await cRes.json();

                console.debug('[Homepage] raw products response:', pJson);
                console.debug('[Homepage] raw categories response:', cJson);

                const fetchedProducts = Array.isArray(pJson.data) ? pJson.data : [];
                const normProducts = fetchedProducts.map(p => ({ ...p, id: p.id ?? p._id }));

                const cats = Array.isArray(cJson) ? cJson : (cJson.data || []);

                if (!mounted) return;
                setProducts(normProducts);
                setCategories(cats);
            } catch (err) {
                console.error('Error loading products/categories:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!SLIDES?.length) return;
        const timer = setInterval(() => {
            setSlideIndex((prev) => (prev + 1) % SLIDES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return <div className="pt-24 text-center text-lg">Loading...</div>;
    }

    return (
        <main className="bg-[#f9f9f9] min-h-screen pt-24">

            {/* SLIDESHOW */}
            <div className="overflow-hidden relative md:mx-10">
                <div className="flex justify-end bg-white px-4 py-2 md:hidden">
                    <Link to="/all-products" className="text-[#dc3545] font-semibold">
                        All Products
                    </Link>
                </div>

                <div className="slideshow w-full rounded-lg relative h-[250px] md:h-[400px]">
                    {SLIDES.map((slide, i) => (
                        <img
                            key={i}
                            src={slide.src}
                            alt={slide.alt}
                            className={`rounded-lg absolute inset-0 w-full h-full transition-opacity duration-700 ${i === slideIndex ? "opacity-100" : "opacity-0"
                                } object-contain md:object-cover`}
                        />
                    ))}
                </div>
            </div>

            {/* Shop by Category */}
            <div className="flex items-center justify-center my-8 ml-10">
                <div className="flex-grow h-px bg-gray-300"></div>
                <h2 className="mx-4 text-xl font-semibold text-gray-800">Shop by Category</h2>
                <div className="flex-grow h-px bg-gray-300 mr-10"></div>
            </div>

            {/* CATEGORY SCROLLER + BUTTONS */}
            <div className="relative mx-2 md:mx-10">

                {/* LEFT button */}
                <button
                    onClick={() => scrollByCard(categoryRef, "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 
                        text-[#dc3545] border border-[#dc3545] bg-transparent
                        px-3 py-1 rounded-full z-20 font-bold"
                >
                    ‹
                </button>

                <div
                    ref={categoryRef}
                    className="rounded-lg bg-white flex overflow-x-auto scroll-smooth p-5 md:p-10 gap-2
                    [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {categories.map((cat, i) => (
                        <Link
                            key={i}
                            to={`/category/${cat.name.toLowerCase()}`}
                            className="group flex-none cursor-pointer w-40 md:w-52"
                        >
                            <div className="w-40 h-40 md:w-52 md:h-52 overflow-hidden rounded-lg border">
                                <img
                                    src={cat.image}
                                    className="w-full h-full object-cover group-hover:scale-105"
                                />
                            </div>
                            <p className="text-center mt-2 font-medium group-hover:text-[#dc3545]">{cat.name}</p>
                        </Link>
                    ))}
                </div>

                {/* RIGHT button */}
                <button
                    onClick={() => scrollByCard(categoryRef, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 
                        text-[#dc3545] border border-[#dc3545] bg-transparent
                        px-3 py-1 rounded-full z-20 font-bold"
                >
                    ›
                </button>
            </div>

            {/* CATEGORY SECTIONS */}
            {categories.map((category, index) => {
                const categoryProducts = products.filter(p => {
                    if (!p || !p.category) return false;

                    const catId = category._id || category.id;

                    if (typeof p.category === 'object' && p.category !== null) {
                        const prodCatId = p.category._id || p.category.id;
                        return String(prodCatId) === String(catId);
                    }

                    return String(p.category) === String(catId);
                });

                // Show all categories with banners, even if they have no products
                return (
                    <section key={index} className="mb-12">
                        <div className="mx-2 md:mx-10">
                            <img
                                src={category.banner}
                                alt={category.name}
                                className="rounded-lg w-full"
                            />
                        </div>

                        {categoryProducts.length === 0 ? (
                            <div className="mx-2 md:mx-10 my-6 bg-white rounded-lg p-10 text-center text-gray-500">
                                <p className="text-lg">No products available in this category yet.</p>
                                <p className="text-sm mt-2">Check back soon for new arrivals!</p>
                            </div>
                        ) : (
                            <div className="relative mx-2 md:mx-10">

                                {/* Initialize ref before use */}
                                {!productRefs.current[index] && (productRefs.current[index] = { current: null })}

                                {/* LEFT button */}
                                <button
                                    onClick={() => scrollByCard(productRefs.current[index], "left")}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 
        text-[#dc3545] border border-[#dc3545] bg-transparent
        px-3 py-1 rounded-full z-20 font-bold"
                                >
                                    ‹
                                </button>

                                <div
                                    ref={(el) => (productRefs.current[index] = { current: el })}
                                    className="rounded-lg my-6 md:my-10 bg-white flex overflow-x-auto scroll-smooth p-6 md:p-10 gap-3
    [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {categoryProducts.map((product) => {
                                        const isInWishlist = wishlist.some((item) => item.id === product.id);
                                        const cartItem = cart.find((item) => item.id === product.id);
                                        const quantity = cartItem ? cartItem.quantity : 0;

                                        return (
                                            <div
                                                key={product._id}
                                                className="relative flex-none w-40 sm:w-48 md:w-56 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-[#dc3545] transition-all"
                                            >
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

                                                <Link to={`/product/${product.id}`}>
                                                    <img
                                                        src={product.image}
                                                        className="w-full h-36 sm:h-40 object-contain"
                                                    />
                                                    <p className="text-center mt-1 font-semibold">{product.name}</p>
                                                    <p className="text-center text-gray-500 text-xs">{product.unit}</p>
                                                </Link>

                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="font-bold">Rs {product.price}</span>
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
                                    })}
                                </div>

                                {/* RIGHT button */}
                                <button
                                    onClick={() => scrollByCard(productRefs.current[index], "right")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 
                                    text-[#dc3545] border border-[#dc3545] bg-transparent
                                    px-3 py-1 rounded-full z-20 font-bold"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </section>
                );
            })}
        </main>
    );
}

export default HomePage;
