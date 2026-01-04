/**
 * @fileoverview Tests for performance-cache utilities.
 * @author Jules
 */
"use strict";

const assert = require("assert");
const {
  LRUCache,
  regexCache,
  clearAllCaches,
  getCachedRegex,
} = require("../../../lib/utils/performance-cache");

describe("performance-cache", function () {
  beforeEach(function () {
    clearAllCaches();
  });

  describe("LRUCache", function () {
    it("should store and retrieve values", function () {
      const cache = new LRUCache(10);
      cache.set("a", 1);
      cache.set("b", 2);
      assert.strictEqual(cache.get("a"), 1);
      assert.strictEqual(cache.get("b"), 2);
    });

    it("should return undefined for missing keys", function () {
      const cache = new LRUCache(10);
      assert.strictEqual(cache.get("missing"), undefined);
    });

    it("should evict oldest entry when at capacity", function () {
      const cache = new LRUCache(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("d", 4);

      assert.strictEqual(cache.has("a"), false);
      assert.strictEqual(cache.has("b"), true);
      assert.strictEqual(cache.has("c"), true);
      assert.strictEqual(cache.has("d"), true);
    });

    it("should refresh entry on access", function () {
      const cache = new LRUCache(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // Access 'a' to make it most recently used
      cache.get("a");

      // Add new entry, should evict 'b' (now oldest)
      cache.set("d", 4);

      assert.strictEqual(cache.has("a"), true);
      assert.strictEqual(cache.has("b"), false);
      assert.strictEqual(cache.has("c"), true);
      assert.strictEqual(cache.has("d"), true);
    });

    it("should update existing key without increasing size", function () {
      const cache = new LRUCache(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("a", 10); // Update existing

      assert.strictEqual(cache.size, 3);
      assert.strictEqual(cache.get("a"), 10);
    });

    it("should clear all entries", function () {
      const cache = new LRUCache(10);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.clear();

      assert.strictEqual(cache.size, 0);
      assert.strictEqual(cache.has("a"), false);
    });

    it("should delete specific entries", function () {
      const cache = new LRUCache(10);
      cache.set("a", 1);
      cache.set("b", 2);

      assert.strictEqual(cache.delete("a"), true);
      assert.strictEqual(cache.has("a"), false);
      assert.strictEqual(cache.has("b"), true);
    });

    it("should iterate keys and values", function () {
      const cache = new LRUCache(10);
      cache.set("a", 1);
      cache.set("b", 2);

      const keys = [...cache.keys()];
      const values = [...cache.values()];

      assert.deepStrictEqual(keys, ["a", "b"]);
      assert.deepStrictEqual(values, [1, 2]);
    });
  });

  describe("getCachedRegex", function () {
    it("should return compiled regex for valid pattern", function () {
      const { regex, error } = getCachedRegex("^TODO", "i");
      assert.ok(regex instanceof RegExp);
      assert.strictEqual(error, null);
      assert.strictEqual(regex.test("TODO: fix"), true);
    });

    it("should return error for invalid pattern", function () {
      const { regex, error } = getCachedRegex("[invalid", "");
      assert.strictEqual(regex, null);
      assert.ok(error.includes("Invalid"));
    });

    it("should cache compiled regex", function () {
      const result1 = getCachedRegex("^test", "i");
      const result2 = getCachedRegex("^test", "i");

      assert.strictEqual(result1.regex, result2.regex);
    });

    it("should cache different patterns separately", function () {
      const result1 = getCachedRegex("^a", "");
      const result2 = getCachedRegex("^b", "");

      assert.notStrictEqual(result1.regex, result2.regex);
    });

    it("should treat different flags as different patterns", function () {
      const result1 = getCachedRegex("^test", "i");
      const result2 = getCachedRegex("^test", "g");

      assert.notStrictEqual(result1.regex, result2.regex);
    });
  });

  describe("clearAllCaches", function () {
    it("should clear regex cache", function () {
      getCachedRegex("^pattern", "i");
      assert.ok(regexCache.size > 0);

      clearAllCaches();
      assert.strictEqual(regexCache.size, 0);
    });
  });
});
