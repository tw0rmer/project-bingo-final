/**
 * API utility functions for making requests to the backend
 */

// Get the base API URL based on the environment
export const getApiBaseUrl = (): string => {
  // In Replit, always use relative URLs since everything runs on the same domain
  return '/api';
};

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Make a request to the API with proper error handling
 * @param endpoint - The API endpoint (without the /api prefix)
 * @param options - Request options
 * @returns Promise with the JSON response
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Set default headers
  const headers = new Headers(options.headers);
  
  // Set content type if not already set and we have a body
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add authorization header if token is provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });
  
  // Check if the response is OK
  if (!response.ok) {
    // Try to parse error message from JSON response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      // If parsing JSON fails, throw a generic error with status code
      if (e instanceof SyntaxError) {
        throw new Error(`API error: ${response.status}`);
      }
      throw e;
    }
  }
  
  // Check if the response is JSON before parsing
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // If not JSON, throw an error
  const text = await response.text();
  console.error('Non-JSON response:', text);
  throw new Error('Server returned non-JSON response');
}

/**
 * Get the current user's token from localStorage
 * @returns The token or null if not found
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Make an authenticated request to the API
 * @param endpoint - The API endpoint (without the /api prefix)
 * @param options - Request options
 * @returns Promise with the JSON response
 */
export async function authApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiRequest<T>(endpoint, {
    ...options,
    token,
  });
}