import React, { useState } from "react";

const Notifications = () => {
    const [form, setForm] = useState({
        title: "",
        message: "",
        audience: "All Customers",
    });

    const [notifications, setNotifications] = useState([
        {
            title: "Flash Sale",
            message: "Get 20% off on all dairy products today!",
            audience: "All Customers",
            date: "Sep 27, 2025",
        },
        {
            title: "Delivery Reminder",
            message: "Your order #1045 will arrive tomorrow.",
            audience: "Specific User",
            date: "Sep 26, 2025",
        },
        {
            title: "Inactive Customer Offer",
            message: "We miss you! Enjoy PKR 300 off your next purchase.",
            audience: "Inactive Customers",
            date: "Sep 24, 2025",
        },
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.message) return alert("Please fill all fields!");

        const newNotification = {
            ...form,
            date: new Date().toLocaleDateString(),
        };
        setNotifications([newNotification, ...notifications]);
        setForm({ title: "", message: "", audience: "All Customers" });
    };

    const handleDelete = (index) => {
        const updated = notifications.filter((_, i) => i !== index);
        setNotifications(updated);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
            {/* Navbar */}
            <header className="bg-[#dc3545] text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Notifications & Communication</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">Welcome, Admin</span>
                    <img
                        src="/Images/Profile icon.jpg"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-8">
                {/* Stats Overview */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Sales", value: "Rs 1,200,000" },
                        { label: "Orders", value: "2,340" },
                        { label: "Customers", value: "1,120" },
                        { label: "Products", value: "340" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-lg shadow text-center"
                        >
                            <h3 className="text-sm text-gray-500">{item.label}</h3>
                            <p className="text-2xl font-bold text-[#dc3545]">{item.value}</p>
                        </div>
                    ))}
                </section>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Total Notifications Sent</h3>
                        <p className="text-2xl font-bold text-blue-600">1,245</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Promotional Campaigns</h3>
                        <p className="text-2xl font-bold text-green-600">18</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <h3 className="text-sm text-gray-500">Unread Customer Messages</h3>
                        <p className="text-2xl font-bold text-red-600">32</p>
                    </div>
                </div>

                {/* Send Notification Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Enter notification title"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Message
                            </label>
                            <textarea
                                rows="4"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Write notification message..."
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Audience
                            </label>
                            <select
                                value={form.audience}
                                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option>All Customers</option>
                                <option>Active Customers</option>
                                <option>Inactive Customers</option>
                                <option>Specific User</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#dc3545] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Send
                        </button>
                    </form>
                </div>

                {/* Recent Notifications Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Title</th>
                                <th className="p-3 border">Message</th>
                                <th className="p-3 border">Audience</th>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((n, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3 border">{n.title}</td>
                                    <td className="p-3 border">{n.message}</td>
                                    <td className="p-3 border">{n.audience}</td>
                                    <td className="p-3 border">{n.date}</td>
                                    <td className="p-3 border space-x-2">
                                        <button className="text-blue-500 hover:underline">View</button>
                                        <button
                                            onClick={() => handleDelete(i)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Notifications;
