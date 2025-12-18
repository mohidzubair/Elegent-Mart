import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LogOut, Edit, Trash2 } from "lucide-react";

const ProductsInventory = () => {
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllProducts, setShowAllProducts] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [stats, setStats] = useState({
        totalSales: 0,
        ordersCount: 0,
        customersCount: 0,
        productsCount: 0
    });
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Form states
    const [categoryForm, setCategoryForm] = useState({
        _id: null,
        name: '',
        image: '',
        banner: ''
    });
    const [productForm, setProductForm] = useState({
        _id: null,
        name: '',
        image: '',
        category: '',
        unit: '',
        price: '',
        description: '',
        stock: '',
        discount: 0,
        brand: '',
        tags: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        fetchStats();
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await apiFetch('/api/analytics/stats', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                console.log('Stats fetched:', data);
                setStats(data);
            } else {
                console.error('Failed to fetch stats, status:', res.status);
                // Set default stats if fetch fails
                setStats({
                    totalSales: 0,
                    ordersCount: 0,
                    customersCount: 0,
                    productsCount: 0
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            // Set default stats on error
            setStats({
                totalSales: 0,
                ordersCount: 0,
                customersCount: 0,
                productsCount: 0
            });
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await apiFetch('/api/categories', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            const res = await apiFetch('/api/products?limit=1000', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                console.log('Products fetched:', data);
                console.log('Setting products to:', data.data || []);
                setProducts(data.data || []);
            } else {
                console.error('Failed to fetch products, status:', res.status);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    const toggleCategoryForm = () => {
        setShowCategoryForm(!showCategoryForm);
        if (!showCategoryForm) {
            // Reset form when opening
            setCategoryForm({ _id: null, name: '', image: '', banner: '' });
        }
        setError(null);
        setSuccess(null);
    };

    const toggleProductForm = () => {
        setShowProductForm(!showProductForm);
        if (!showProductForm) {
            // Reset form when opening
            setProductForm({
                _id: null,
                name: '',
                image: '',
                category: '',
                unit: '',
                price: '',
                description: '',
                stock: '',
                discount: 0,
                brand: '',
                tags: ''
            });
        }
        setError(null);
        setSuccess(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Category CRUD operations
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const url = categoryForm._id
                ? `/api/categories/${categoryForm._id}`
                : '/api/categories';
            const method = categoryForm._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: categoryForm.name,
                    image: categoryForm.image,
                    banner: categoryForm.banner
                })
            });

            if (res.ok) {
                setSuccess(categoryForm._id ? 'Category updated!' : 'Category created!');
                fetchCategories();
                setTimeout(() => {
                    toggleCategoryForm();
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to save category');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = (category) => {
        setCategoryForm({
            _id: category._id,
            name: category.name,
            image: category.image,
            banner: category.banner
        });
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setSuccess('Category deleted!');
                fetchCategories();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete category');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    // Product CRUD operations
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const url = productForm._id
                ? `/api/products/${productForm._id}`
                : '/api/products';
            const method = productForm._id ? 'PUT' : 'POST';

            const productData = {
                name: productForm.name,
                image: productForm.image,
                category: productForm.category,
                unit: productForm.unit,
                price: Number(productForm.price),
                description: productForm.description,
                stock: Number(productForm.stock),
                discount: Number(productForm.discount),
                brand: productForm.brand,
                tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            console.log('Submitting product:', productData);
            console.log('URL:', url, 'Method:', method);

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

            console.log('Response status:', res.status);

            if (res.ok) {
                const savedProduct = await res.json();
                console.log('Product saved:', savedProduct);
                setSuccess(productForm._id ? 'Product updated!' : 'Product created!');

                // Add a small delay before fetching to ensure DB is updated
                setTimeout(() => {
                    fetchProducts();
                    fetchStats();
                }, 500);

                setTimeout(() => {
                    toggleProductForm();
                }, 1500);
            } else {
                const data = await res.json();
                console.error('Error response:', data);
                setError(data.message || 'Failed to save product');
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setProductForm({
            _id: product._id,
            name: product.name,
            image: product.image,
            category: typeof product.category === 'object' ? product.category?.name : product.category,
            unit: product.unit,
            price: product.price,
            description: product.description || '',
            stock: product.stock,
            discount: product.discount || 0,
            brand: product.brand || '',
            tags: product.tags ? product.tags.join(', ') : ''
        });
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setSuccess('Product deleted!');
                fetchProducts();
                fetchStats(); // Update stats
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete product');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-[#dc3545] text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Products & Inventory Management</h1>
                <div className="flex items-center space-x-4 relative">
                    {user ? (
                        <div>
                            <button
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <span className="text-sm hidden sm:inline">Welcome, {user.name}</span>
                                <img
                                    src="/Images/Profile icon.jpg"
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border hover:opacity-80 cursor-pointer"
                                />
                            </button>
                            {showUserDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs text-[#dc3545] font-medium mt-1">Role: {user.role}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Welcome, Admin</span>
                            <img
                                src="/Images/Profile icon.jpg"
                                alt="Profile"
                                className="w-10 h-10 rounded-full border"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 space-y-12">
                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Stats Overview - Dynamic Data */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Sales</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">
                            Rs {stats.totalSales.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Orders</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">
                            {stats.ordersCount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Customers</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">
                            {stats.customersCount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Products</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">
                            {stats.productsCount.toLocaleString()}
                        </p>
                    </div>
                </section>

                {/* ================= CATEGORY MANAGEMENT ================= */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Manage Categories</h2>
                        <button
                            onClick={toggleCategoryForm}
                            className="bg-[#dc3545] text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
                        >
                            + Add Category
                        </button>
                    </div>

                    {/* Category Form */}
                    {showCategoryForm && (
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h3 className="text-md font-bold mb-3">
                                {categoryForm._id ? 'Edit Category' : 'Create / Edit Category'}
                            </h3>

                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                {/* Name */}
                                <inputvalues
                                    type="text"
                                    placeholder="Category Name"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />

                                {/* Image */}
                                <label className="block text-sm font-semibold">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setCategoryForm({ ...categoryForm, image: `/Images/${file.name}` });
                                        }
                                    }}
                                    required={!categoryForm._id}
                                />

                                {/* Banner */}
                                <label className="block text-sm font-semibold">Banner Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setCategoryForm({ ...categoryForm, banner: `/Images/${file.name}` });
                                        }
                                    }}
                                    required={!categoryForm._id}
                                />

                                {/* Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleCategoryForm}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Category List */}
                    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Categories</h3>
                            {categories.length > 5 && (
                                <button
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="text-[#dc3545] hover:underline text-sm font-medium"
                                >
                                    {showAllCategories ? 'Show Less' : `View All (${categories.length})`}
                                </button>
                            )}
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Image</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                                            No categories found. Add one to get started!
                                        </td>
                                    </tr>
                                ) : (
                                    (showAllCategories ? categories : categories.slice(0, 5)).map((cat) => (
                                        <tr key={cat._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{cat.id}</td>
                                            <td className="px-4 py-2 font-semibold">{cat.name}</td>
                                            <td className="px-4 py-2">
                                                <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded" />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(cat)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ================= PRODUCT MANAGEMENT ================= */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Manage Products</h2>
                        <button
                            onClick={toggleProductForm}
                            className="bg-[#dc3545] text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
                        >
                            + Add Product
                        </button>
                    </div>

                    {/* Product Form */}
                    {showProductForm && (
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h3 className="text-md font-bold mb-3">Add / Edit Product</h3>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                {/* Product Name */}
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />

                                {/* Category */}
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>

                                {/* Image */}
                                <label className="block text-sm font-semibold">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setProductForm({ ...productForm, image: `/Images/${file.name}` });
                                        }
                                    }}
                                    required={!productForm._id}
                                />

                                {/* Unit */}
                                <input
                                    type="text"
                                    placeholder="Unit (e.g., 1 Kg, 500ml)"
                                    value={productForm.unit}
                                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />

                                {/* Price */}
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                    min={0}
                                />

                                {/* Description */}
                                <textarea
                                    placeholder="Description"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                {/* Allow Decimal */}
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="form-checkbox" />
                                    <span>Allow Decimal Quantity</span>
                                </label>

                                {/* Quantity Increase */}
                                <input
                                    type="number"
                                    placeholder="Quantity Increase (default 1)"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    step="0.01"
                                />

                                {/* Stock */}
                                <input
                                    type="number"
                                    placeholder="Stock Quantity"
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    min={0}
                                    required
                                />

                                {/* Discount */}
                                <input
                                    type="number"
                                    placeholder="Discount (%)"
                                    value={productForm.discount}
                                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    min={0}
                                    max={100}
                                />

                                {/* Brand */}
                                <input
                                    type="text"
                                    placeholder="Brand"
                                    value={productForm.brand}
                                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                {/* Expiry Date */}
                                <input
                                    type="date"
                                    placeholder="Expiry Date"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                {/* Tags */}
                                <input
                                    type="text"
                                    placeholder="Tags (comma separated)"
                                    value={productForm.tags}
                                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                {/* Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleProductForm}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Product List */}
                    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Products</h3>
                            {products.length > 5 && (
                                <button
                                    onClick={() => setShowAllProducts(!showAllProducts)}
                                    className="text-[#dc3545] hover:underline text-sm font-medium"
                                >
                                    {showAllProducts ? 'Show Less' : `View All (${products.length})`}
                                </button>
                            )}
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2">Image</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                            No products found. Add one to get started!
                                        </td>
                                    </tr>
                                ) : (
                                    (showAllProducts ? products : products.slice(0, 5)).map((product) => (
                                        <tr key={product._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                            </td>
                                            <td className="px-4 py-2 font-semibold">{product.name}</td>
                                            <td className="px-4 py-2">
                                                {typeof product.category === 'object' ? product.category?.name : product.category}
                                            </td>
                                            <td className="px-4 py-2">Rs {product.price}</td>
                                            <td className="px-4 py-2">
                                                <span className={product.stock < 10 ? 'text-red-600 font-bold' : ''}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductsInventory;
