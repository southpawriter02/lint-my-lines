/**
 * @file Large test fixture for performance benchmarks.
 * @description Contains ~1000+ lines with various comment types.
 * @author Performance Test Suite
 * @version 1.0.0
 */

// ============================================
// SECTION 1: CONSTANTS
// ============================================

// Application constants
const APP_NAME = "PerformanceTest";
const APP_VERSION = "1.0.0";

// TODO (CONFIG-001): Move to configuration file
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 100;
const CACHE_TTL = 3600000;

// API endpoints
const API_ENDPOINTS = {
  users: "/api/users",
  products: "/api/products",
  orders: "/api/orders",
  analytics: "/api/analytics"
};

// FIXME (SECURITY-001): Remove hardcoded credentials
const DEBUG_MODE = false;

// Status codes
const STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled"
};

// ============================================
// SECTION 2: TYPE DEFINITIONS
// ============================================

/**
 * User configuration type.
 * @typedef {Object} UserConfig
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {Object} preferences - User preferences
 */

/**
 * Product configuration type.
 * @typedef {Object} ProductConfig
 * @property {string} id - Product ID
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {number} inventory - Stock count
 */

/**
 * Order configuration type.
 * @typedef {Object} OrderConfig
 * @property {string} id - Order ID
 * @property {string} userId - Customer ID
 * @property {Array} items - Order items
 * @property {string} status - Order status
 */

// ============================================
// SECTION 3: UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique identifier.
 * @returns {string} UUID-like string
 */
function generateId() {
  // NOTE (IMPL-001): Using simple random string for testing
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Sleep for specified duration.
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clone an object.
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  // TODO (PERF-001): Use structuredClone when available
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle a function.
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit
 * @returns {Function} Throttled function
 */
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry a function with exponential backoff.
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<*>} Function result
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // FIXME (RETRY-001): Add jitter to backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  throw lastError;
}

// ============================================
// SECTION 4: VALIDATION
// ============================================

/**
 * Validate email format.
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function isValidEmail(email) {
  // NOTE (VALIDATION-001): Basic regex, not RFC compliant
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number.
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
function isValidPhone(phone) {
  // TODO (VALIDATION-002): Support international formats
  const regex = /^\d{10}$/;
  return regex.test(phone.replace(/\D/g, ""));
}

/**
 * Validate URL format.
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required fields.
 * @param {Object} obj - Object to validate
 * @param {Array<string>} fields - Required field names
 * @returns {Object} Validation result
 */
function validateRequired(obj, fields) {
  const missing = fields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === "";
  });

  return {
    valid: missing.length === 0,
    missing
  };
}

// ============================================
// SECTION 5: DATA TRANSFORMATION
// ============================================

/**
 * Normalize data array.
 * @param {Array} data - Raw data
 * @returns {Array} Normalized data
 */
function normalizeData(data) {
  // Filter invalid entries
  return data
    .filter(item => item && item.id)
    .map(item => ({
      ...item,
      id: String(item.id),
      timestamp: item.timestamp || Date.now(),
      _normalized: true
    }));
}

/**
 * Group data by key.
 * @param {Array} data - Data array
 * @param {string} key - Grouping key
 * @returns {Object} Grouped data
 */
function groupByKey(data, key) {
  // TODO (PERF-002): Use Map for better performance
  return data.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
}

/**
 * Sort data by field.
 * @param {Array} data - Data array
 * @param {string} field - Sort field
 * @param {string} order - Sort order
 * @returns {Array} Sorted data
 */
function sortByField(data, field, order = "asc") {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (order === "desc") {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

/**
 * Filter data by criteria.
 * @param {Array} data - Data array
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered data
 */
function filterByCriteria(data, criteria) {
  return data.filter(item => {
    for (const [key, value] of Object.entries(criteria)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Paginate data.
 * @param {Array} data - Data array
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated result
 */
function paginate(data, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: data.slice(start, end),
    page,
    pageSize,
    total: data.length,
    totalPages: Math.ceil(data.length / pageSize)
  };
}

// ============================================
// SECTION 6: STATISTICS
// ============================================

/**
 * Calculate sum.
 * @param {Array<number>} numbers - Number array
 * @returns {number} Sum
 */
function sum(numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

/**
 * Calculate average.
 * @param {Array<number>} numbers - Number array
 * @returns {number} Average
 */
function average(numbers) {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * Calculate median.
 * @param {Array<number>} numbers - Number array
 * @returns {number} Median
 */
function median(numbers) {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  // FIXME (STATS-001): Handle even-length arrays properly
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate standard deviation.
 * @param {Array<number>} numbers - Number array
 * @returns {number} Standard deviation
 */
function standardDeviation(numbers) {
  if (numbers.length === 0) return 0;

  const avg = average(numbers);
  const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
  return Math.sqrt(average(squaredDiffs));
}

/**
 * Calculate percentile.
 * @param {Array<number>} numbers - Number array
 * @param {number} p - Percentile (0-100)
 * @returns {number} Percentile value
 */
function percentile(numbers, p) {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// ============================================
// SECTION 7: CACHING
// ============================================

/**
 * Simple in-memory cache.
 */
class Cache {
  constructor(ttl = CACHE_TTL) {
    this.store = new Map();
    this.ttl = ttl;

    // NOTE (CACHE-001): No automatic cleanup, call prune() manually
  }

  /**
   * Get cached value.
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set cached value.
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Optional TTL override
   */
  set(key, value, ttl = this.ttl) {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  /**
   * Check if key exists.
   * @param {string} key - Cache key
   * @returns {boolean} Has key
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Delete cached value.
   * @param {string} key - Cache key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cached values.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Remove expired entries.
   */
  prune() {
    // TODO (CACHE-002): Optimize pruning for large caches
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache size.
   * @returns {number} Number of entries
   */
  get size() {
    return this.store.size;
  }
}

// ============================================
// SECTION 8: EVENT EMITTER
// ============================================

/**
 * Simple event emitter.
 */
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Add event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Add one-time event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event.
   * @param {string} event - Event name
   * @param {...*} args - Event arguments
   */
  emit(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // FIXME (EVENTS-001): Handle async callbacks
      callbacks.forEach(cb => cb(...args));
    }
  }

  /**
   * Remove all listeners.
   * @param {string} event - Optional event name
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// ============================================
// SECTION 9: HTTP CLIENT
// ============================================

/**
 * HTTP client for API requests.
 */
class HttpClient {
  /**
   * Create HTTP client.
   * @param {Object} config - Client configuration
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || "";
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.headers = config.headers || {};

    // TODO (HTTP-001): Add request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Make GET request.
   * @param {string} url - Request URL
   * @param {Object} config - Request config
   * @returns {Promise<Object>} Response
   */
  async get(url, config = {}) {
    return this.request({ ...config, method: "GET", url });
  }

  /**
   * Make POST request.
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} config - Request config
   * @returns {Promise<Object>} Response
   */
  async post(url, data, config = {}) {
    return this.request({ ...config, method: "POST", url, data });
  }

  /**
   * Make PUT request.
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} config - Request config
   * @returns {Promise<Object>} Response
   */
  async put(url, data, config = {}) {
    return this.request({ ...config, method: "PUT", url, data });
  }

  /**
   * Make DELETE request.
   * @param {string} url - Request URL
   * @param {Object} config - Request config
   * @returns {Promise<Object>} Response
   */
  async delete(url, config = {}) {
    return this.request({ ...config, method: "DELETE", url });
  }

  /**
   * Make HTTP request.
   * @private
   */
  async request(config) {
    // NOTE (HTTP-002): Mock implementation for testing
    return {
      status: 200,
      data: { success: true },
      headers: {},
      config
    };
  }
}

// ============================================
// SECTION 10: DATA MODELS
// ============================================

/**
 * Base model class.
 */
class BaseModel {
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Convert to JSON.
   * @returns {Object}
   */
  toJSON() {
    return { ...this };
  }

  /**
   * Update model.
   * @param {Object} data - Update data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}

/**
 * User model.
 */
class User extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.name = data.name || "";
    this.email = data.email || "";
    this.role = data.role || "user";
    this.active = data.active !== false;
  }

  /**
   * Check if user is admin.
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === "admin";
  }

  /**
   * Validate user.
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name) {
      errors.push("Name is required");
    }

    if (!isValidEmail(this.email)) {
      errors.push("Invalid email format");
    }

    // TODO (USER-001): Add password validation

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Product model.
 */
class Product extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.name = data.name || "";
    this.description = data.description || "";
    this.price = data.price || 0;
    this.inventory = data.inventory || 0;
    this.category = data.category || "uncategorized";
  }

  /**
   * Check if in stock.
   * @returns {boolean}
   */
  isInStock() {
    return this.inventory > 0;
  }

  /**
   * Calculate discounted price.
   * @param {number} discount - Discount percentage
   * @returns {number}
   */
  getDiscountedPrice(discount) {
    // FIXME (PRICE-001): Handle currency precision
    return this.price * (1 - discount / 100);
  }
}

/**
 * Order model.
 */
class Order extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.userId = data.userId;
    this.items = data.items || [];
    this.status = data.status || STATUS.PENDING;
    this.total = data.total || 0;
  }

  /**
   * Calculate order total.
   * @returns {number}
   */
  calculateTotal() {
    this.total = this.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return this.total;
  }

  /**
   * Check if can be cancelled.
   * @returns {boolean}
   */
  canCancel() {
    // NOTE (ORDER-001): Add time-based restrictions
    return this.status === STATUS.PENDING;
  }
}

// ============================================
// SECTION 11: SERVICE LAYER
// ============================================

/**
 * User service.
 */
class UserService {
  constructor(client, cache) {
    this.client = client;
    this.cache = cache;
  }

  /**
   * Get user by ID.
   * @param {string} id - User ID
   * @returns {Promise<User>}
   */
  async getById(id) {
    // Check cache first
    const cached = this.cache.get(`user:${id}`);
    if (cached) return cached;

    // Fetch from API
    const response = await this.client.get(`${API_ENDPOINTS.users}/${id}`);
    const user = new User(response.data);

    // Cache result
    this.cache.set(`user:${id}`, user);

    return user;
  }

  /**
   * Create user.
   * @param {Object} data - User data
   * @returns {Promise<User>}
   */
  async create(data) {
    const user = new User(data);
    const validation = user.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    // TODO (USER-002): Check for duplicate email
    await this.client.post(API_ENDPOINTS.users, user.toJSON());

    return user;
  }

  /**
   * Update user.
   * @param {string} id - User ID
   * @param {Object} data - Update data
   * @returns {Promise<User>}
   */
  async update(id, data) {
    const user = await this.getById(id);
    user.update(data);

    await this.client.put(`${API_ENDPOINTS.users}/${id}`, user.toJSON());

    // Invalidate cache
    this.cache.delete(`user:${id}`);

    return user;
  }

  /**
   * Delete user.
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    // FIXME (USER-003): Handle cascade deletion
    await this.client.delete(`${API_ENDPOINTS.users}/${id}`);
    this.cache.delete(`user:${id}`);
  }
}

/**
 * Product service.
 */
class ProductService {
  constructor(client, cache) {
    this.client = client;
    this.cache = cache;
  }

  /**
   * Get product by ID.
   * @param {string} id - Product ID
   * @returns {Promise<Product>}
   */
  async getById(id) {
    const cached = this.cache.get(`product:${id}`);
    if (cached) return cached;

    const response = await this.client.get(`${API_ENDPOINTS.products}/${id}`);
    const product = new Product(response.data);

    this.cache.set(`product:${id}`, product);

    return product;
  }

  /**
   * List products.
   * @param {Object} filters - Filter options
   * @returns {Promise<Array<Product>>}
   */
  async list(filters = {}) {
    // TODO (PRODUCT-001): Add pagination
    const response = await this.client.get(API_ENDPOINTS.products, filters);
    return response.data.map(p => new Product(p));
  }

  /**
   * Search products.
   * @param {string} query - Search query
   * @returns {Promise<Array<Product>>}
   */
  async search(query) {
    // NOTE (SEARCH-001): Implement full-text search
    const all = await this.list();
    return all.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Order service.
 */
class OrderService {
  constructor(client, cache, userService, productService) {
    this.client = client;
    this.cache = cache;
    this.userService = userService;
    this.productService = productService;
  }

  /**
   * Create order.
   * @param {Object} data - Order data
   * @returns {Promise<Order>}
   */
  async create(data) {
    // Validate user exists
    await this.userService.getById(data.userId);

    // Validate products and inventory
    for (const item of data.items) {
      const product = await this.productService.getById(item.productId);

      if (!product.isInStock()) {
        throw new Error(`Product ${product.name} is out of stock`);
      }

      // FIXME (ORDER-002): Check quantity against inventory
      item.price = product.price;
    }

    const order = new Order(data);
    order.calculateTotal();

    await this.client.post(API_ENDPOINTS.orders, order.toJSON());

    return order;
  }

  /**
   * Get order by ID.
   * @param {string} id - Order ID
   * @returns {Promise<Order>}
   */
  async getById(id) {
    const response = await this.client.get(`${API_ENDPOINTS.orders}/${id}`);
    return new Order(response.data);
  }

  /**
   * Cancel order.
   * @param {string} id - Order ID
   * @returns {Promise<Order>}
   */
  async cancel(id) {
    const order = await this.getById(id);

    if (!order.canCancel()) {
      throw new Error("Order cannot be cancelled");
    }

    order.status = STATUS.CANCELLED;
    order.update({});

    await this.client.put(`${API_ENDPOINTS.orders}/${id}`, order.toJSON());

    return order;
  }
}

// ============================================
// SECTION 12: EXPORTS
// ============================================

module.exports = {
  // Constants
  APP_NAME,
  APP_VERSION,
  DEFAULT_TIMEOUT,
  MAX_RETRIES,
  BATCH_SIZE,
  CACHE_TTL,
  API_ENDPOINTS,
  STATUS,

  // Utilities
  generateId,
  sleep,
  deepClone,
  debounce,
  throttle,
  retryWithBackoff,

  // Validation
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validateRequired,

  // Data transformation
  normalizeData,
  groupByKey,
  sortByField,
  filterByCriteria,
  paginate,

  // Statistics
  sum,
  average,
  median,
  standardDeviation,
  percentile,

  // Classes
  Cache,
  EventEmitter,
  HttpClient,
  BaseModel,
  User,
  Product,
  Order,

  // Services
  UserService,
  ProductService,
  OrderService
};

// EOF - Large test fixture for performance benchmarks
