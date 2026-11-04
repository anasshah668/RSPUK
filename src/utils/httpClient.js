import { getBrowserClientId } from './clientIdentity';
import { clearAuthToken, getAuthToken } from './authToken';
let configData = null;

// Load config from public folder
const loadConfig = async () => {
  if (configData) return configData;
  
  try {
    const response = await fetch('/config.json');
    configData = await response.json();
    return configData;
  } catch (error) {
    console.error('Failed to load config:', error);
    // Fallback to default
    configData = {
      api: {
        baseUrl: import.meta.env.VITE_API_URL || 'https://rspuk-services.vercel.app/api',
        timeout: 30000
      }
    };
    return configData;
  }
};

// Get API base URL
const getBaseUrl = async () => {
  const config = await loadConfig();
  return config.api.baseUrl;
};

// HTTP Client with interceptors
class HttpClient {
  constructor() {
    this.baseURL = null;
    this.timeout = 30000;
  }

  async init() {
    if (!this.baseURL) {
      const config = await loadConfig();
      this.baseURL = config.api.baseUrl;
      this.timeout = config.api.timeout || 30000;
    }
  }

  // Request interceptor - adds headers, token, etc.
  async interceptRequest(url, options = {}) {
    await this.init();
    
    const token = getAuthToken();
    const shouldSkipAuth = Boolean(options.skipAuth);

    // Determine if this is a file upload (FormData)
    const isFormData = options.body instanceof FormData;
    if (isFormData && token && !shouldSkipAuth && !options.body.has('authToken')) {
      options.body.append('authToken', token);
    }

    const extraHeaders =
      options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)
        ? options.headers
        : {};

    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(getBrowserClientId() && { 'X-Client-Id': getBrowserClientId() }),
      ...extraHeaders,
    };

    if (!shouldSkipAuth && token) {
      if (!headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (!headers['X-Access-Token'] && !headers['x-access-token']) {
        headers['X-Access-Token'] = token;
      }
    }

    const { skipAuth, ...restOptions } = options;

    return {
      ...restOptions,
      headers,
      credentials: restOptions.credentials || 'include',
    };
  }

  // Response interceptor - handles errors, transforms responses
  async interceptResponse(response, meta = {}) {
    // Handle empty responses (204 No Content, etc.)
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const rawText = typeof data === 'string' ? data : '';
      const looksTooLarge =
        response.status === 413 ||
        /too large|payload too large|entity too large/i.test(
          rawText || String(data?.message || data?.error || ''),
        );

      const errorMessage = looksTooLarge
        ? 'Those pictures are too large for the server. Try fewer files, or a smaller JPEG/PNG — large camera photos are compressed automatically on retry.'
        : data?.message ||
          data?.error ||
          (rawText.trim() && !/^FUNCTION_/i.test(rawText) ? rawText.trim() : '') ||
          `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 401 && !meta.skipAuth && meta.sentToken) {
        clearAuthToken();
        try {
          localStorage.removeItem('user');
        } catch {
          /* ignore */
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rspuk-session-expired'));
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Main request method
  async request(endpoint, options = {}) {
    await this.init();
    
    const url = `${this.baseURL}/${endpoint}`;
    const { timeout, ...requestOptions } = options;
    
    // Apply request interceptor
    const interceptedOptions = await this.interceptRequest(url, requestOptions);
    const sentToken = Boolean(
      interceptedOptions?.headers?.Authorization || interceptedOptions?.headers?.['X-Access-Token'],
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const isFormData = interceptedOptions.body instanceof FormData;
    const timeoutMs = timeout || (isFormData ? Math.max(this.timeout, 120000) : this.timeout);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...interceptedOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.interceptResponse(response, {
        skipAuth: Boolean(requestOptions.skipAuth),
        sentToken,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The request took too long to complete');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server');
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET', ...options });
  }

  async post(endpoint, data = null, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options,
    });
  }

  async put(endpoint, data = null, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  async patch(endpoint, data = null, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: 'PATCH',
      body,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Export singleton instance
const httpClient = new HttpClient();
export default httpClient;
