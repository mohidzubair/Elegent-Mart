// Small loading manager used by api calls and UI to coordinate a global loading overlay.
// It keeps an internal counter so overlapping requests don't hide the overlay prematurely.

let _count = 0;
const _listeners = new Set();

function _notify() {
  const isLoading = _count > 0;
  _listeners.forEach((fn) => {
    try {
      fn(isLoading);
    } catch (err) {
      // swallow listener errors to avoid breaking others
      // console.error('loadingManager listener error', err);
    }
  });
}

export function increment() {
  _count += 1;
  _notify();
}

export function decrement() {
  _count = Math.max(0, _count - 1);
  _notify();
}

export function reset() {
  _count = 0;
  _notify();
}

// Subscribe to loading state changes. Returns an unsubscribe function.
export function subscribe(fn) {
  _listeners.add(fn);
  // send current state immediately
  try { fn(_count > 0); } catch (err) {}
  return () => _listeners.delete(fn);
}

export function isLoading() {
  return _count > 0;
}

export default {
  increment,
  decrement,
  reset,
  subscribe,
  isLoading,
};
