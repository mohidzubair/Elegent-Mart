import React, { useEffect, useState } from 'react';
import { subscribe, increment, decrement } from '../loadingManager';
import { useLocation } from 'react-router-dom';

export default function LoadingOverlay() {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = subscribe(setIsLoading);
        return unsubscribe;
    }, []);

    // Show a short loading pulse on route change so users see a smooth transition
    useEffect(() => {
        // when the location changes, briefly show the overlay. If API calls happen at the same
        // time, the manager's counter will keep the overlay visible until all work completes.
        increment();
        const t = setTimeout(() => decrement(), 350);
        return () => clearTimeout(t);
    }, [location.pathname]);

    // Small accessibility guard
    if (typeof document === 'undefined') return null;

    return (
        <div
            aria-hidden={!isLoading}
            aria-busy={isLoading}
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            style={{
                backgroundColor: 'rgba(0,0,0,0.28)',
                backdropFilter: isLoading ? 'blur(4px)' : 'none',
            }}
        >
            <div className="flex flex-col items-center gap-4">
                <div
                    className="rounded-full border-4 border-t-4 border-white/90 border-t-transparent w-16 h-16 animate-spin"
                    role="status"
                    aria-label="Loading"
                />
                <div className="text-white text-sm font-medium drop-shadow-md">Loading...</div>
            </div>
        </div>
    );
}
