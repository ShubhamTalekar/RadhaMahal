/**
 * Admin auth utilities.
 *
 * The JWT is now stored in an HttpOnly cookie set by the server.
 * JavaScript cannot read it (that's the point — XSS protection).
 *
 * Auth state on the frontend is tracked with a simple flag in sessionStorage
 * that tells us "a login happened during this session". The cookie itself
 * carries the actual credential to the server on every fetch(..., { credentials: 'include' }).
 */

const ADMIN_FLAG_KEY = 'radhamahal_admin_logged_in';

/**
 * Mark that the current session has an admin login.
 * This does NOT store the token — the token lives in an HttpOnly cookie.
 */
export function markAdminLoggedIn() {
    sessionStorage.setItem(ADMIN_FLAG_KEY, 'true');
}

/**
 * Check if the current session is marked as admin-authenticated.
 * The real auth validation happens server-side via the cookie.
 */
export function isAdminAuthenticated() {
    return sessionStorage.getItem(ADMIN_FLAG_KEY) === 'true';
}

/**
 * Clear the admin session flag (called on logout).
 */
export function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_FLAG_KEY);
}

/**
 * Perform admin logout — clears the server-side HttpOnly cookie
 * and the client-side session flag.
 */
export async function adminLogout() {
    try {
        const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        await fetch(`${BASE}/api/v1/admin/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch {
        // Best-effort — if the server is unreachable, we still clear locally
    }
    clearAdminSession();
}
