import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * checkAuth() - lightweight, avoids calling the /profile endpoint when
     * we have no local hint that the user is logged in. This suppresses
     * expected 401 network responses in the dev console for anonymous users.
     *
     * Behaviour:
     * - If localStorage has an 'authUser' entry, attempt a server check (cookie-based).
     * - If not, skip the network call and use localStorage (null) as the source of truth.
     *
     * Note: The server sets an httpOnly cookie on login which cannot be read from JS.
     * This approach trades a full server-side verification on every page load for
     * quieter developer experience. If you prefer server-first verification,
     * revert to always calling /api/auth/profile.
     */
    const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem('authUser');

            // If we have no local hint the user is logged in, skip calling the profile endpoint.
            if (!storedUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // If localStorage contains a user, validate it against the server (cookie/session)
            const res = await fetch('/api/auth/profile', {
                credentials: 'include'
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                // Refresh localStorage
                localStorage.setItem('authUser', JSON.stringify(userData));
            } else {
                setUser(null);
                localStorage.removeItem('authUser');
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            // On network error, fall back to whatever is in localStorage if present
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) setUser(JSON.parse(storedUser));
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
            localStorage.removeItem('authUser');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
