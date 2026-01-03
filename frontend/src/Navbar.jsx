import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { apiFetch } from "./api";

function Navbar() {
    const [selectedArea, setSelectedArea] = useState("Iqbal Avenue Phase 3");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isDeliverOpen, setDeliverOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [icons, setIcons] = useState({});
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState("");
    const [mobileSearchResults, setMobileSearchResults] = useState({ products: [], categories: [] });
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const { cart } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ✅ Fetch both categories and icons dynamically from database.json
    useEffect(() => {
        fetch("/database.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || []);
                setIcons(data.icons || {});
            })
            .catch((err) => console.error("Error loading database:", err));
    }, []);

    // ✅ Fetch categories from backend for search
    useEffect(() => {
        const fetchBackendCategories = async () => {
            try {
                const res = await apiFetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.data || data || []);
                }
            } catch (err) {
                console.error("Error loading backend categories:", err);
            }
        };
        fetchBackendCategories();
    }, []);

    // ✅ Handle search input (Desktop)
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults({ products: [], categories: [] });
                setShowSearchDropdown(false);
                return;
            }

            try {
                // Search products
                const productsRes = await apiFetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=10`);
                const products = productsRes.ok ? (await productsRes.json()).data || [] : [];

                // Filter categories
                const matchingCategories = categories.filter(cat =>
                    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                setSearchResults({ products, categories: matchingCategories });
                setShowSearchDropdown(true);
            } catch (err) {
                console.error("Search error:", err);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, categories]);

    // ✅ Handle search input (Mobile)
    useEffect(() => {
        const searchProducts = async () => {
            if (mobileSearchQuery.trim().length < 2) {
                setMobileSearchResults({ products: [], categories: [] });
                return;
            }

            try {
                const productsRes = await apiFetch(`/api/products?search=${encodeURIComponent(mobileSearchQuery)}&limit=10`);
                const products = productsRes.ok ? (await productsRes.json()).data || [] : [];

                const matchingCategories = categories.filter(cat =>
                    cat.name.toLowerCase().includes(mobileSearchQuery.toLowerCase())
                );

                setMobileSearchResults({ products, categories: matchingCategories });
            } catch (err) {
                console.error("Mobile search error:", err);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [mobileSearchQuery, categories]);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProductClick = (productId) => {
        setShowSearchDropdown(false);
        setSearchQuery("");
        navigate(`/product/${productId}`);
    };

    const handleCategoryClick = (categoryName) => {
        setShowSearchDropdown(false);
        setSearchQuery("");
        navigate(`/category/${encodeURIComponent(categoryName.toLowerCase())}`);
    };

    const handleMobileProductClick = (productId) => {
        setMobileSearchQuery("");
        setSearchOpen(false);
        navigate(`/product/${productId}`);
    };

    const handleMobileCategoryClick = (categoryName) => {
        setMobileSearchQuery("");
        setSearchOpen(false);
        navigate(`/category/${encodeURIComponent(categoryName.toLowerCase())}`);
    };

    const handleLogout = async () => {
        await logout();
        setShowUserDropdown(false);
        navigate('/login');
    };


    return (
        <>
            {/* ✅ Navbar Header */}
            <header className="bg-[#dc3545] text-white shadow-md fixed top-0 left-0 w-full z-50">
                <div className="flex justify-between items-center px-4 py-3">
                    {/* Left: Logo + Deliver To */}
                    <div className="flex items-center space-x-2">
                        <Link to="/" aria-label="Home">
                            <img
                                src="/Images/transparent-mart-logo.png"
                                alt="Elegant Mart Logo"
                                className="h-10 md:h-12 w-auto"
                            />
                        </Link>

                        <button
                            onClick={() => setDeliverOpen(true)}
                            className="flex items-center space-x-1 hover:opacity-80 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 text-white"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2.25c-3.728 0-6.75 2.94-6.75 6.563 0 4.335 6.75 12.937 6.75 12.937s6.75-8.602 6.75-12.937c0-3.623-3.022-6.563-6.75-6.563zm0 8.438a1.875 1.875 0 1 1 0-3.75 1.875 1.875 0 0 1 0 3.75z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm">Deliver to ▼</span>
                                <span className="text-xs text-gray-200 truncate w-28 md:w-32">
                                    {selectedArea || "Select area..."}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Right: Login/Profile (Mobile only) */}
                    <div className="md:hidden relative">
                        {user ? (
                            <div>
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-1"
                                >
                                    {icons.profile && (
                                        <img
                                            src={icons.profile}
                                            alt="Profile"
                                            className="w-9 h-9 rounded-full hover:opacity-80"
                                        />
                                    )}
                                </button>
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login">
                                {icons.profile && (
                                    <img
                                        src={icons.profile}
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full hover:opacity-80"
                                    />
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Middle: Search bar (desktop only) */}
                    <div className="hidden md:flex items-center flex-1 justify-center mx-4">
                        <div className="relative w-3/5" ref={searchRef}>
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                                className="w-full py-2 pl-10 pr-4 rounded-full bg-white focus:outline-none text-gray-800"
                            />
                            <div
                                className="absolute left-3 top-2 text-gray-500 cursor-pointer hover:text-[#dc3545] transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                &#9776;
                            </div>

                            {/* Search Dropdown */}
                            {showSearchDropdown && (searchResults.products.length > 0 || searchResults.categories.length > 0) && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                                    {/* Categories Section */}
                                    {searchResults.categories.length > 0 && (
                                        <div className="border-b border-gray-100">
                                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                                Categories
                                            </div>
                                            {searchResults.categories.map((category) => (
                                                <div
                                                    key={category._id}
                                                    onClick={() => handleCategoryClick(category.name)}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 border-b border-gray-50 last:border-0"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700 font-medium">
                                                            Groceries & Pets › {category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Products Section */}
                                    {searchResults.products.length > 0 && (
                                        <div>
                                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                                </svg>
                                                Products
                                            </div>
                                            {searchResults.products.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => handleProductClick(product._id)}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 border-b border-gray-50 last:border-0"
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800 font-medium">{product.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {typeof product.category === 'object' ? product.category?.name : product.category}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#dc3545]">Rs {product.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* View All Results */}
                                    {(searchResults.products.length > 0 || searchResults.categories.length > 0) && (
                                        <div className="px-4 py-3 text-center border-t border-gray-100">
                                            <button
                                                onClick={() => {
                                                    setShowSearchDropdown(false);
                                                    navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
                                                    setSearchQuery("");
                                                }}
                                                className="text-sm text-[#dc3545] hover:underline font-medium"
                                            >
                                                View All Results →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Wishlist Icon beside search bar */}
                        <Link
                            to="/wishlist"
                            className="ml-4 flex items-center justify-center bg-white rounded-full w-10 h-10 hover:bg-gray-100 transition"
                        >
                            {icons.wishlist && (
                                <img
                                    src={icons.wishlist}
                                    alt="Wishlist"
                                    className="w-6 h-6 object-contain"
                                />
                            )}
                        </Link>
                    </div>

                    {/* Right side: All Products, Cart, Login/Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/all-products"
                            className="text-white font-semibold hover:text-gray-200"
                        >
                            All Products
                        </Link>

                        <Link to="/cart" className="relative">
                            {icons.cart && (
                                <img
                                    src={icons.cart}
                                    alt="Cart"
                                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                />
                            )}
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#dc3545] text-white text-xs rounded-full px-1.5">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center space-x-1"
                                >
                                    {icons.profile && (
                                        <img
                                            src={icons.profile}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full hover:opacity-80"
                                        />
                                    )}
                                </button>
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login">
                                {icons.profile && (
                                    <img
                                        src={icons.profile}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full hover:opacity-80"
                                    />
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ✅ Compact Mobile Bottom Navbar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-gray-200 flex justify-around items-center py-2 md:hidden z-50">
                {/* Categories */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center text-gray-600 hover:text-[#dc3545] transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mb-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                    <span className="text-[10px] leading-tight">Categories</span>
                </button>

                {/* Home */}
                <Link
                    to="/"
                    className="flex flex-col items-center text-gray-600 hover:text-[#dc3545] transition-colors"
                >
                    {icons.home && (
                        <img src={icons.home} className="w-5 h-5 mb-0.5" alt="Home" />
                    )}
                    <span className="text-[10px] leading-tight">Home</span>
                </Link>

                {/* Search */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="flex flex-col items-center text-gray-600 hover:text-[#dc3545] transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mb-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        />
                    </svg>
                    <span className="text-[10px] leading-tight">Search</span>
                </button>

                {/* Wishlist */}
                <Link
                    to="/wishlist"
                    className="flex flex-col items-center text-gray-600 hover:text-[#dc3545] transition-colors"
                >
                    {icons.wishlist && (
                        <img
                            src={icons.wishlist}
                            alt="Wishlist"
                            className="w-5 h-5 mb-0.5 object-contain"
                        />
                    )}
                    <span className="text-[10px] leading-tight">Wishlist</span>
                </Link>

                {/* Cart */}
                <Link
                    to="/cart"
                    className="flex flex-col items-center text-gray-600 hover:text-[#dc3545] transition-colors relative"
                >
                    {icons.cart && (
                        <img src={icons.cart} alt="Cart" className="w-5 h-5 mb-0.5" />
                    )}
                    <span className="text-[10px] leading-tight">Cart</span>
                    {cart.length > 0 && (
                        <span className="absolute top-0 right-2 bg-[#dc3545] text-white text-[9px] px-1 py-0.5 rounded-full">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    )}
                </Link>
            </nav>

            {/* ✅ Overlay for Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* ✅ Sidebar (Dynamic Categories) */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-600 text-2xl hover:text-[#dc3545]"
                    >
                        &times;
                    </button>
                </div>

                <ul className="p-4 space-y-4 text-gray-700">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <li key={cat.id}>
                                <Link
                                    to={`/category/${encodeURIComponent(cat.name.toLowerCase())}`}
                                    className="block hover:text-[#dc3545] font-medium"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">Loading categories...</p>
                    )}
                </ul>
            </div>



            {/* ✅ Search Panel (Mobile) */}
            {isSearchOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setSearchOpen(false)}
                    ></div>

                    {/* Bottom Sheet Popup */}
                    <div
                        className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-2xl z-50 animate-slide-up p-5"
                        style={{
                            height: "70vh",
                        }}
                        ref={mobileSearchRef}
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

                        {/* Heading */}
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Search Products
                        </h2>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={mobileSearchQuery}
                                onChange={(e) => setMobileSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#dc3545] outline-none text-gray-800"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                                />
                            </svg>
                        </div>

                        {/* Search Results */}
                        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 150px)" }}>
                            {mobileSearchQuery.length < 2 ? (
                                <div className="text-center text-gray-500 text-sm mt-8">
                                    Type at least 2 characters to search
                                </div>
                            ) : (mobileSearchResults.products.length === 0 && mobileSearchResults.categories.length === 0) ? (
                                <div className="text-center text-gray-500 text-sm mt-8">
                                    No results found for "{mobileSearchQuery}"
                                </div>
                            ) : (
                                <>
                                    {/* Categories Section */}
                                    {mobileSearchResults.categories.length > 0 && (
                                        <div className="mb-4">
                                            <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                                Categories
                                            </div>
                                            {mobileSearchResults.categories.map((category) => (
                                                <div
                                                    key={category._id}
                                                    onClick={() => handleMobileCategoryClick(category.name)}
                                                    className="px-2 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 border-b border-gray-100"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700 font-medium">
                                                            Groceries & Pets › {category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Products Section */}
                                    {mobileSearchResults.products.length > 0 && (
                                        <div>
                                            <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                                </svg>
                                                Products
                                            </div>
                                            {mobileSearchResults.products.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => handleMobileProductClick(product._id)}
                                                    className="px-2 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 border-b border-gray-100"
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800 font-medium">{product.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {typeof product.category === 'object' ? product.category?.name : product.category}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#dc3545]">Rs {product.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-[#dc3545]"
                        >
                            &times;
                        </button>
                    </div>
                </>
            )}

            {/* ✅ Deliver Popup */}
            {isDeliverOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setDeliverOpen(false)}
                    ></div>

                    <div className="fixed inset-0 flex justify-center items-center z-50 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                            <button
                                onClick={() => setDeliverOpen(false)}
                                className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-[#dc3545]"
                            >
                                &times;
                            </button>

                            <div className="flex justify-center mb-4">
                                <Link to="/" aria-label="Home">
                                    <img
                                        src="/Images/transparent-mart-logo.png"
                                        alt="Elegant Mart Logo"
                                        className="h-10 md:h-12 w-auto"
                                    />
                                </Link>
                            </div>

                            <h2 className="text-lg font-bold mb-3 text-gray-800 text-center">
                                Select Delivery Area
                            </h2>

                            <select
                                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-[#dc3545] outline-none text-gray-700"
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                            >
                                <option value="">Select Area / Sub Region</option>
                                <option value="Iqbal Avenue Phase 3">Iqbal Avenue Phase 3</option>
                                <option value="LDA Avenue Phase 1">LDA Avenue Phase 1</option>
                                <option value="P & D">P & D</option>
                                <option value="Nespak Society">Nespak Society</option>
                                <option value="Izmeer Society">Izmeer Society</option>
                            </select>

                            <button
                                className="mt-4 w-full bg-[#dc3545] text-white font-semibold py-2 rounded-full hover:bg-[#b92c3a] transition-colors"
                                onClick={() => setDeliverOpen(false)}
                            >
                                Save Location
                            </button>
                        </div>
                    </div>
                </>
            )}


        </>
    );
}

export default Navbar;
