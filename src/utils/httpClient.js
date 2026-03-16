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
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
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
    
    const token = localStorage.getItem('token');
    
    // Determine if this is a file upload (FormData)
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return {
      ...options,
      headers,
    };
  }

  // Response interceptor - handles errors, transforms responses
  async interceptResponse(response) {
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
      const errorMessage = 
        data?.message || 
        data?.error || 
        `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle 401 Unauthorized - clear token and redirect
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optionally redirect to login
        // window.location.href = '/login';
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
    
    // Apply request interceptor
    const interceptedOptions = await this.interceptRequest(url, options);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...interceptedOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Apply response interceptor
      return await this.interceptResponse(response);
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
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
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
