import { config } from './config';
import { toast } from 'sonner';

/**
 * Standardized API client for communicating with the backend.
 * Handles base URL, default headers, auth tokens, and error normalization.
 */
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = { ...options.headers };
        
        // Only set application/json if it's not FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers,
            // Send HttpOnly admin cookie automatically on every request
            credentials: 'include',
        };

        try {
            const response = await fetch(url, config);
            
            // Handle HTTP errors
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Fallback if not JSON
                    errorData = { error: await response.text() };
                }
                
                const errorMessage = errorData?.message || errorData?.error || `HTTP Error ${response.status}`;
                
                if (response.status === 401) {
                    // Handle unauthorized — dispatch event for UI to react
                    window.dispatchEvent(new CustomEvent('unauthorized_access'));
                }

                throw new Error(errorMessage);
            }

            // Expect JSON responses by default
            return await response.json();

        } catch (error) {
            console.error(`[API Error] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
            // Optionally auto-toast errors if instructed, but usually better handled by caller
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.fetch(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.fetch(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    put(endpoint, body, options = {}) {
        return this.fetch(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    delete(endpoint, body, options = {}) {
        return this.fetch(endpoint, {
            ...options,
            method: 'DELETE',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

export const api = new ApiClient(config.API_BASE_URL);
