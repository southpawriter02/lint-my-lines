/**
 * @file Medium test fixture for performance benchmarks.
 * @description Contains ~500 lines with various comment types.
 * @author Performance Test Suite
 */

// ============================================
// Section: Constants and Configuration
// ============================================

// TODO (CONFIG-001): Move to environment variables
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";

// FIXME (BUG-001): Update deprecated constants
const LEGACY_MODE = false;

/**
 * Configuration options for the client.
 * @typedef {Object} ClientConfig
 * @property {string} baseUrl - API base URL
 * @property {number} timeout - Request timeout
 * @property {number} retries - Max retry attempts
 */

// ============================================
// Section: Utility Functions
// ============================================

/**
 * Sleep for a specified duration.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  // Simple promise-based delay
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clone an object.
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  // NOTE (PERF-002): Consider using structuredClone for better performance
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a unique identifier.
 * @returns {string} UUID-like string
 */
function generateId() {
  // Simple ID generation
  return Math.random().toString(36).substring(2, 15);
}

// TODO (REFACTOR-001): Extract to separate utility module
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatTime(date) {
  return date.toISOString().split("T")[1].split(".")[0];
}

function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ============================================
// Section: Data Processing
// ============================================

/**
 * Process raw data into normalized format.
 * @param {Array} rawData - Raw input data
 * @returns {Array} Normalized data
 */
function normalizeData(rawData) {
  // Filter invalid entries
  const valid = rawData.filter(item => {
    // Check for required fields
    return item && item.id && item.value !== undefined;
  });

  // Transform to normalized format
  return valid.map(item => ({
    id: item.id,
    value: Number(item.value),
    timestamp: item.timestamp || Date.now(),
    metadata: item.metadata || {}
  }));
}

/**
 * Aggregate data by a key.
 * @param {Array} data - Input data array
 * @param {string} key - Key to aggregate by
 * @returns {Object} Aggregated results
 */
function aggregateByKey(data, key) {
  // TODO (PERF-003): Use Map for better performance
  const result = {};

  for (const item of data) {
    const keyValue = item[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(item);
  }

  return result;
}

// FIXME (BUG-002): Handle nested object paths
function getValueByPath(obj, path) {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Calculate statistics for numeric data.
 * @param {Array<number>} numbers - Numeric array
 * @returns {Object} Statistics object
 */
function calculateStats(numbers) {
  if (numbers.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
  }

  // Calculate sum
  const sum = numbers.reduce((a, b) => a + b, 0);

  // Calculate average
  const avg = sum / numbers.length;

  // Find min and max
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  return { min, max, avg, sum, count: numbers.length };
}

// ============================================
// Section: API Client
// ============================================

/**
 * API client for making HTTP requests.
 */
class ApiClient {
  /**
   * Create a new API client.
   * @param {ClientConfig} config - Client configuration
   */
  constructor(config = {}) {
    // Set default configuration
    this.baseUrl = config.baseUrl || API_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.retries = config.retries || MAX_RETRIES;

    // Initialize request queue
    this.requestQueue = [];

    // NOTE (IMPL-001): Add request interceptors here
  }

  /**
   * Make a GET request.
   * @param {string} path - Request path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(path, params = {}) {
    // Build query string
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}${query ? "?" + query : ""}`;

    // TODO (FEATURE-001): Add caching for GET requests
    return this.request("GET", url);
  }

  /**
   * Make a POST request.
   * @param {string} path - Request path
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async post(path, body = {}) {
    const url = `${this.baseUrl}${path}`;
    return this.request("POST", url, body);
  }

  /**
   * Make a PUT request.
   * @param {string} path - Request path
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async put(path, body = {}) {
    const url = `${this.baseUrl}${path}`;
    return this.request("PUT", url, body);
  }

  /**
   * Make a DELETE request.
   * @param {string} path - Request path
   * @returns {Promise<Object>} Response data
   */
  async delete(path) {
    const url = `${this.baseUrl}${path}`;
    return this.request("DELETE", url);
  }

  /**
   * Internal request method with retry logic.
   * @private
   */
  async request(method, url, body = null) {
    let lastError = null;

    // Retry loop
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        // FIXME (BUG-003): Add proper timeout handling
        const response = await this.executeRequest(method, url, body);
        return response;
      } catch (error) {
        lastError = error;
        // Wait before retry
        await sleep(1000 * (attempt + 1));
      }
    }

    throw lastError;
  }

  /**
   * Execute the actual HTTP request.
   * @private
   */
  async executeRequest(method, url, body) {
    // Simulated request execution
    // NOTE (TEST-001): This is a mock implementation
    return {
      status: 200,
      data: { success: true },
      timestamp: Date.now()
    };
  }
}

// ============================================
// Section: Data Models
// ============================================

/**
 * User model.
 */
class User {
  constructor(data) {
    this.id = data.id || generateId();
    this.name = data.name || "";
    this.email = data.email || "";
    this.createdAt = data.createdAt || new Date();

    // TODO (VALIDATION-001): Add email validation
  }

  /**
   * Convert to plain object.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt.toISOString()
    };
  }

  /**
   * Validate user data.
   * @returns {boolean}
   */
  isValid() {
    // Check required fields
    return this.name.length > 0 && this.email.length > 0;
  }
}

/**
 * Product model.
 */
class Product {
  constructor(data) {
    this.id = data.id || generateId();
    this.name = data.name || "";
    this.price = data.price || 0;
    this.inventory = data.inventory || 0;

    // FIXME (MODEL-001): Add category support
  }

  /**
   * Check if product is in stock.
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
    // NOTE (PRICING-001): Consider rounding strategies
    return this.price * (1 - discount / 100);
  }
}

/**
 * Order model.
 */
class Order {
  constructor(data) {
    this.id = data.id || generateId();
    this.userId = data.userId;
    this.items = data.items || [];
    this.status = data.status || "pending";
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Calculate order total.
   * @returns {number}
   */
  getTotal() {
    return this.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  /**
   * Check if order can be cancelled.
   * @returns {boolean}
   */
  canCancel() {
    // TODO (ORDER-001): Add time-based cancellation rules
    return this.status === "pending";
  }
}

// ============================================
// Section: Business Logic
// ============================================

/**
 * Process an order.
 * @param {Order} order - Order to process
 * @param {ApiClient} client - API client
 * @returns {Promise<Object>} Processing result
 */
async function processOrder(order, client) {
  // Validate order
  if (order.items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  // Check inventory
  // FIXME (INVENTORY-001): Use transaction for inventory updates
  for (const item of order.items) {
    const product = await client.get(`/products/${item.productId}`);
    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient inventory for ${item.productId}`);
    }
  }

  // Calculate total
  const total = order.getTotal();

  // TODO (PAYMENT-001): Integrate payment processing
  // TODO (NOTIFICATION-001): Send order confirmation email

  return {
    orderId: order.id,
    total,
    status: "processed",
    timestamp: Date.now()
  };
}

/**
 * Generate a report.
 * @param {Array} data - Report data
 * @param {Object} options - Report options
 * @returns {Object} Generated report
 */
function generateReport(data, options = {}) {
  const { startDate, endDate, groupBy } = options;

  // Filter by date range
  let filtered = data;
  if (startDate) {
    filtered = filtered.filter(item => item.timestamp >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(item => item.timestamp <= endDate);
  }

  // Group if specified
  let grouped = filtered;
  if (groupBy) {
    grouped = aggregateByKey(filtered, groupBy);
  }

  // Calculate summary
  const values = filtered.map(item => item.value);
  const stats = calculateStats(values);

  return {
    data: grouped,
    summary: stats,
    generatedAt: formatDateTime(new Date())
  };
}

// ============================================
// Section: Exports
// ============================================

module.exports = {
  // Constants
  DEFAULT_TIMEOUT,
  MAX_RETRIES,
  API_BASE_URL,

  // Utilities
  sleep,
  deepClone,
  generateId,
  formatDate,
  formatTime,
  formatDateTime,

  // Data processing
  normalizeData,
  aggregateByKey,
  getValueByPath,
  calculateStats,

  // Classes
  ApiClient,
  User,
  Product,
  Order,

  // Business logic
  processOrder,
  generateReport
};

// EOF - Medium test fixture
