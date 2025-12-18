import React, { useState } from "react";

export default function TransactionManagement() {
    const [methodFilter, setMethodFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchText, setSearchText] = useState("");

    const transactions = [
        {
            id: "TXN1001",
            customer: "Ali Khan",
            phone: "03001234567",
            amount: "PKR 2,500",
            method: "Credit Card",
            date: "Sep 25, 2025",
            status: "Success",
        },
        {
            id: "TXN1002",
            customer: "Sara Malik",
            phone: "03009876543",
            amount: "PKR 1,800",
            method: "Easypaisa",
            date: "Sep 24, 2025",
            status: "Pending",
        },
        {
            id: "TXN1003",
            customer: "Ahmed Raza",
            phone: "03111222333",
            amount: "PKR 3,000",
            method: "JazzCash",
            date: "Sep 23, 2025",
            status: "Failed",
        },
    ];

    const filteredTransactions = transactions.filter((t) => {
        const matchesMethod = methodFilter === "All" || t.method === methodFilter;
        const matchesStatus = statusFilter === "All" || t.status === statusFilter;
        const matchesSearch =
            t.customer.toLowerCase().includes(searchText.toLowerCase()) ||
            t.phone.includes(searchText) ||
            t.id.toLowerCase().includes(searchText.toLowerCase());
        return matchesMethod && matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-[#dc3545] text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Payments & Transactions</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">Welcome, Admin</span>
                    <img src="/Images/Profile icon.jpg" alt="Admin" className="w-10 h-10 rounded-full border" />
                </div>
            </header>

            <main className="p-6">
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

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Transactions</h3>
                        <p className="text-2xl font-bold text-blue-500">2450</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Revenue</h3>
                        <p className="text-2xl font-bold text-green-500">PKR 1,250,000</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Pending Payments</h3>
                        <p className="text-2xl font-bold text-yellow-500">35</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                    <input
                        type="text"
                        placeholder="🔍 Search by ID, Name, Phone..."
                        className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <div className="flex space-x-3">
                        <select
                            className="px-4 py-2 border rounded-lg"
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                        >
                            <option value="All">All Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Easypaisa">Easypaisa</option>
                            <option value="JazzCash">JazzCash</option>
                        </select>
                        <select
                            className="px-4 py-2 border rounded-lg"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Success">Success</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Txn ID</th>
                                <th className="p-3 border">Customer</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Amount</th>
                                <th className="p-3 border">Method</th>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3 border">{t.id}</td>
                                    <td className="p-3 border">{t.customer}</td>
                                    <td className="p-3 border">{t.phone}</td>
                                    <td className="p-3 border">{t.amount}</td>
                                    <td className="p-3 border">{t.method}</td>
                                    <td className="p-3 border">{t.date}</td>
                                    <td className="p-3 border">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${t.status === "Success"
                                                    ? "bg-green-100 text-green-700"
                                                    : t.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-3 border">
                                        <button className="text-blue-500 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
