import React, { useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const AnalyticsReports = () => {
    useEffect(() => {
        // Sales Chart (Line)
        new Chart(document.getElementById("salesChart"), {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
                datasets: [
                    {
                        label: "Sales (PKR)",
                        data: [120000, 150000, 100000, 180000, 200000, 170000, 220000, 250000],
                        borderColor: "#dc3545",
                        backgroundColor: "rgba(220,53,69,0.2)",
                        fill: true,
                        tension: 0.3,
                    },
                ],
            },
        });

        // Orders Chart (Pie)
        new Chart(document.getElementById("ordersChart"), {
            type: "pie",
            data: {
                labels: ["Pending", "Shipped", "Delivered", "Cancelled"],
                datasets: [
                    {
                        data: [120, 300, 900, 50],
                        backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"],
                    },
                ],
            },
        });

        // Payment Methods Chart (Doughnut)
        new Chart(document.getElementById("paymentChart"), {
            type: "doughnut",
            data: {
                labels: ["Cash", "Credit Card", "Easypaisa", "JazzCash"],
                datasets: [
                    {
                        data: [500, 800, 700, 300],
                        backgroundColor: ["#f97316", "#2563eb", "#16a34a", "#9333ea"],
                    },
                ],
            },
        });
    }, []);

    return (
        <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
            {/* Top Navbar */}
            <header className="bg-[#dc3545] text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Analytics & Reports</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">Welcome, Admin</span>
                    <img src="/Images/Profile icon.jpg" alt="Profile" className="w-10 h-10 rounded-full border" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">

                {/* Stats Overview */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Sales</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">Rs 1,200,000</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Orders</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">2,340</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Customers</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">1,120</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Products</h3>
                        <p className="text-2xl font-bold text-[#dc3545]">340</p>
                    </div>
                </section>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Sales</h3>
                        <p className="text-2xl font-bold text-green-600">PKR 1,250,000</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Orders</h3>
                        <p className="text-2xl font-bold text-blue-600">4,520</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Active Customers</h3>
                        <p className="text-2xl font-bold text-purple-600">1,240</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Top Category</h3>
                        <p className="text-2xl font-bold text-orange-600">Vegetables</p>
                    </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
                    <canvas id="salesChart" height="100"></canvas>
                </div>

                {/* Orders & Payment Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
                        <canvas id="ordersChart" height="200"></canvas>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Payments Breakdown</h2>
                        <canvas id="paymentChart" height="200"></canvas>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Top 5 Best-Selling Products</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 border">Product</th>
                                    <th className="p-3 border">Category</th>
                                    <th className="p-3 border">Units Sold</th>
                                    <th className="p-3 border">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { product: "Tomatoes", category: "Vegetables", sold: "1,200", revenue: "PKR 240,000" },
                                    { product: "Milk", category: "Dairy", sold: "950", revenue: "PKR 190,000" },
                                    { product: "Rice", category: "Grains", sold: "800", revenue: "PKR 400,000" },
                                    { product: "Chicken", category: "Meat", sold: "700", revenue: "PKR 560,000" },
                                    { product: "Onions", category: "Vegetables", sold: "650", revenue: "PKR 130,000" },
                                ].map((item, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-3 border">{item.product}</td>
                                        <td className="p-3 border">{item.category}</td>
                                        <td className="p-3 border">{item.sold}</td>
                                        <td className="p-3 border">{item.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AnalyticsReports;
