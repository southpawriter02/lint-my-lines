/**
 * @fileoverview Performance caching utilities for lint-my-lines.
 * @author Jules
 */
"use strict";

/**
 * LRU (Least Recently Used) Cache with configurable max size.
 * When the cache reaches capacity, the oldest entry is evicted.
 */
class LRUCache {
  /**
   * Create an LRU cache
   * @param {number} maxSize - Maximum number of entries (default: 100)
   */
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing: delete and re-add to move to end
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // At capacity: delete oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   * @returns {number} Number of entries
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache (oldest first)
   * @returns {IterableIterator<string>} Iterator of keys
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Get all values in the cache (oldest first)
   * @returns {IterableIterator<*>} Iterator of values
   */
  values() {
    return this.cache.values();
  }
}

// Global caches with LRU eviction (cleared between test runs)
const regexCache = new LRUCache(200);
const jsdocCache = new LRUCache(500);
const dateCache = new LRUCache(200);

// File-scoped caches using WeakMap (auto-GC when sourceCode is released)
const commentCache = new WeakMap();
const identifierCache = new WeakMap();
const nodeIndexCache = new WeakMap();

// v1.1.1: Enhanced context caches
const fileContextCache = new WeakMap();      // Cache file context per sourceCode
const commentContextCache = new LRUCache(300);  // Cache enhanced comment classification

/**
 * Clear all global caches. Call this between test runs to ensure clean state.
 * Note: WeakMap caches (commentCache, identifierCache, nodeIndexCache)
 * are automatically cleared when their keys are garbage collected.
 */
function clearAllCaches() {
  regexCache.clear();
  jsdocCache.clear();
  dateCache.clear();
  commentContextCache.clear();  // v1.1.1
}

/**
 * Get a cached compiled regex, compiling and caching if necessary
 * @param {string} pattern - Regex pattern
 * @param {string} flags - Regex flags
 * @returns {{ regex: RegExp|null, error: string|null }} Compiled regex or error
 */
function getCachedRegex(pattern, flags = "") {
  const key = `${pattern}|${flags}`;

  if (regexCache.has(key)) {
    return regexCache.get(key);
  }

  try {
    const regex = new RegExp(pattern, flags);
    const result = { regex, error: null };
    regexCache.set(key, result);
    return result;
  } catch (e) {
    const result = { regex: null, error: e.message };
    regexCache.set(key, result);
    return result;
  }
}

module.exports = {
  LRUCache,
  regexCache,
  jsdocCache,
  dateCache,
  commentCache,
  identifierCache,
  nodeIndexCache,
  // v1.1.1: Enhanced context caches
  fileContextCache,
  commentContextCache,
  clearAllCaches,
  getCachedRegex,
};
