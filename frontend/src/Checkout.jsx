


import React, { useState } from "react";
import { useCart } from "./context/CartContext";
import { Link } from "react-router-dom";
function Checkout() {
  const { cart } = useCart(); // ✅ Get cart items from context
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // 🧮 Calculate totals dynamically
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal > 1000 ? 50 : 0; // example rule
  const total = subtotal - discount;

  return (
    <>
      <main className="container mx-auto px-4 md:px-10 py-8 my-14">
        <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Billing + Shipping Info */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Billing Information</h3>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Shipping Address</label>
                <textarea
                  placeholder="House #123, Street 4, City"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                ></textarea>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-medium">City</label>
                  <input
                    type="text"
                    placeholder="Lahore"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">State</label>
                  <input
                    type="text"
                    placeholder="Punjab"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ZIP Code</label>
                  <input
                    type="text"
                    placeholder="54000"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#dc3545] outline-none"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary + Payment */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {/* ✅ Dynamic Cart Items */}
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mb-4">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between mb-3"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                    </div>
                    <span>Rs {item.price * item.quantity}</span>
                  </div>
                ))
              )}

              <div className="border-t my-3"></div>

              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount</span>
                <span>- Rs {discount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs {total}</span>
              </div>

              {/* Payment Method */}
              <h3 className="text-lg font-semibold mt-6 mb-2">
                Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>

              <button
                className="w-full mt-6 bg-[#dc3545] text-white py-3 rounded-lg hover:bg-white hover:text-[#dc3545] hover:border hover:border-[#dc3545] transition font-medium"
              >
                Place Order
              </button>

              <Link
                to="/cart"
                className="block mt-3 text-black hover:underline text-center"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Checkout;
