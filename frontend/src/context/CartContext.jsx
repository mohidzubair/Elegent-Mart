

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 🛒 Load cart from sessionStorage when app starts
    const [cart, setCart] = useState(() => {
        const savedCart = sessionStorage.getItem("cartData");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 💾 Save cart to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem("cartData", JSON.stringify(cart));
    }, [cart]);

    // ➕ Add item to cart
    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.name === product.name);
            if (existing) {
                return prev.map((item) =>
                    item.name === product.name
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // ➖ Remove item from cart
    const removeFromCart = (name) => {
        setCart((prev) => prev.filter((item) => item.name !== name));
    };

    // 🔢 Update quantity (increase or decrease)
    const updateQuantity = (name, change) => {
        setCart((prev) =>
            prev.map((item) =>
                item.name === name
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        );
    };

    // 💰 Calculate subtotal
    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, subtotal }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
