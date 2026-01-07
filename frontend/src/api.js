export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { increment, decrement } from './loadingManager';

// Small fetch wrapper used across the app. Defaults:
// - credentials: 'include' so cookie-based auth (httpOnly token) works in development
// - Accept: application/json
// Callers can override any option by passing an opts object.
export async function apiFetch(path, opts = {}) {
    const url = path.startsWith('http') ? path : `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;

    const defaultOpts = {
        credentials: 'include',
        headers: {
            Accept: 'application/json'
        }
    };

    // Merge headers carefully so callers can add headers without losing defaults
    const merged = {
        ...defaultOpts,
        ...opts,
        headers: {
            ...defaultOpts.headers,
            ...(opts.headers || {})
        }
    };

    // Show global loading overlay for duration of the fetch. Uses a counter so overlapping
    // requests are handled correctly.
    try {
        increment();
        const res = await fetch(url, merged);
        return res;
    } finally {
        // ensure we decrement even on errors
        decrement();
    }
}
