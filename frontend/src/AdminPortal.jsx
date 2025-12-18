import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart,
  Bell,
  LogOut,
  X,
} from "lucide-react"; // npm install lucide-react

export default function AdminPortal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <Package size={20} />, label: "Products", link: "/admin/products" },
    { icon: <ShoppingCart size={20} />, label: "Orders", link: "/admin/orders" },
    { icon: <Users size={20} />, label: "Customers", link: "/admin/customers" },
    { icon: <CreditCard size={20} />, label: "Payments", link: "/admin/payments" },
    { icon: <BarChart size={20} />, label: "Analytics", link: "/admin/analytics" },
    { icon: <Bell size={20} />, label: "Notifications", link: "/admin/notifications" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-[#dc3545] text-white flex flex-col justify-between`}
      >
        <div>
          {/* Header with close icon (for mobile) */}
          <div className="flex justify-between items-center p-6 border-b border-[#b72b3a]">
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <button
              onClick={closeSidebar}
              className="md:hidden text-white text-2xl focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                onClick={closeSidebar}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#b72b3a] transition-colors"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-[#b72b3a]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white text-[#dc3545] font-semibold py-2 rounded-md hover:bg-gray-100 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white shadow rounded-lg p-4 flex justify-between items-center mb-6">
          {/* Hamburger for mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-2xl text-[#dc3545] focus:outline-none"
          >
            ☰
          </button>

          <h1 className="text-xl font-bold text-gray-700">Dashboard</h1>

          <div className="flex items-center space-x-4 relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src="/Images/Profile icon.jpg"
                    alt="Admin"
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
              <Link to="/login">
                <img
                  src="/Images/Profile icon.jpg"
                  alt="Login"
                  className="w-10 h-10 rounded-full border hover:opacity-80"
                />
              </Link>
            )}
          </div>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Sales", value: "Rs 1,200,000" },
            { title: "Orders", value: "2,340" },
            { title: "Customers", value: "1,120" },
            { title: "Products", value: "340" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-sm text-gray-500">{item.title}</h3>
              <p className="text-2xl font-bold text-[#dc3545]">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Dashboard Sections with Links */}
        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/products" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              📦 Product & Inventory Management
            </h2>
            <p className="text-gray-600">
              Manage your products and inventory here.
            </p>
          </Link>
        </section>

        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/orders" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              🛒 Order Management
            </h2>
            <p className="text-gray-600">
              View and update order statuses (Pending, Shipped, Delivered).
            </p>
          </Link>
        </section>

        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/customers" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              👤 Customer Management
            </h2>
            <p className="text-gray-600">
              Track customers, view purchase history, manage accounts.
            </p>
          </Link>
        </section>

        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/payments" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              💳 Payment & Transactions
            </h2>
            <p className="text-gray-600">
              View payment history, refunds, and method usage (COD, card, wallet).
            </p>
          </Link>
        </section>

        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/analytics" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              📊 Analytics & Reports
            </h2>
            <p className="text-gray-600">
              Generate sales reports, top-selling products, and customer insights.
            </p>
          </Link>
        </section>

        <section className="bg-white p-6 rounded-lg shadow mb-8 hover:shadow-lg transition-shadow duration-200">
          <Link to="/admin/notifications" className="block">
            <h2 className="text-lg font-bold mb-2 text-[#dc3545] hover:underline">
              🔔 Notifications & Communication
            </h2>
            <p className="text-gray-600">
              Send updates to customers (SMS, Email, App notifications).
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
