export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    return fetch(url, merged);
}
