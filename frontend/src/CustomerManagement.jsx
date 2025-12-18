import React, { useState } from "react";

export default function CustomerManagement() {
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchText, setSearchText] = useState("");

    const customers = [
        {
            id: "#C101",
            name: "Ali Khan",
            email: "ali.khan@example.com",
            phone: "03001234567",
            joined: "Jan 10, 2025",
            status: "Active",
        },
        {
            id: "#C102",
            name: "Sara Malik",
            email: "sara.malik@example.com",
            phone: "03009876543",
            joined: "Feb 15, 2025",
            status: "Blocked",
        },
        {
            id: "#C103",
            name: "Ahmed Raza",
            email: "ahmed.raza@example.com",
            phone: "03111222333",
            joined: "Mar 1, 2025",
            status: "Active",
        },
    ];

    const filteredCustomers = customers.filter((c) => {
        const matchesStatus = statusFilter === "All" || c.status === statusFilter;
        const matchesSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) ||
            c.email.toLowerCase().includes(searchText.toLowerCase()) ||
            c.phone.includes(searchText);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Top Navbar */}
            <header className="bg-[#dc3545] text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Customer Management</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">Welcome, Admin</span>
                    <img src="/Images/Profile icon.jpg" alt="Admin" className="w-10 h-10 rounded-full border" />
                </div>
            </header>

            {/* Content */}
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
                        <h3 className="text-sm text-gray-500">Total Customers</h3>
                        <p className="text-2xl font-bold text-blue-500">1500</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Active Customers</h3>
                        <p className="text-2xl font-bold text-green-500">1400</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Blocked Customers</h3>
                        <p className="text-2xl font-bold text-red-500">100</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="🔍 Search customers..."
                        className="w-full md:w-1/3 px-4 py-2 border rounded-lg mb-3 md:mb-0"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border rounded-lg"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Customers</option>
                        <option value="Active">Active</option>
                        <option value="Blocked">Blocked</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Customer ID</th>
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Joined</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3 border">{c.id}</td>
                                    <td className="p-3 border">{c.name}</td>
                                    <td className="p-3 border">{c.email}</td>
                                    <td className="p-3 border">{c.phone}</td>
                                    <td className="p-3 border">{c.joined}</td>
                                    <td className="p-3 border">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${c.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-3 border space-x-2">
                                        <button className="text-blue-500 hover:underline">View</button>
                                        {c.status === "Active" ? (
                                            <button className="text-red-500 hover:underline">Block</button>
                                        ) : (
                                            <button className="text-green-500 hover:underline">Unblock</button>
                                        )}
                                        <button className="text-gray-500 hover:underline">Delete</button>
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
