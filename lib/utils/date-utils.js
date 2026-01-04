/**
 * @fileoverview Date parsing utilities for TODO aging analysis.
 * @author Jules
 */
"use strict";

const { dateCache } = require("./performance-cache");

// Quick rejection pattern - skip expensive parsing if no date-like chars
const QUICK_DATE_CHECK =
  /\d{4}|\d{1,2}[/.-]\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;

// Month name to number mapping
const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

// Date patterns to match in comments
const DATE_PATTERNS = [
  // ISO format: 2025-01-03
  {
    regex: /(\d{4})-(\d{2})-(\d{2})/,
    extract: (match) => ({
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[3], 10),
    }),
  },
  // US format: 01/03/2025 or 1/3/2025
  {
    regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    extract: (match) => ({
      year: parseInt(match[3], 10),
      month: parseInt(match[1], 10) - 1,
      day: parseInt(match[2], 10),
    }),
  },
  // Written format: Jan 3, 2025 or January 3rd, 2025
  {
    regex: /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
    extract: (match) => ({
      year: parseInt(match[3], 10),
      month: MONTH_MAP[match[1].toLowerCase().slice(0, 3)],
      day: parseInt(match[2], 10),
    }),
  },
  // European format: 03.01.2025 or 3.1.2025
  {
    regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    extract: (match) => ({
      year: parseInt(match[3], 10),
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[1], 10),
    }),
  },
];

/**
 * Parse a date string into a Date object
 * @param {string} dateStr - Date string in various formats
 * @returns {Date|null} Parsed Date object or null if unparseable
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }

  for (const pattern of DATE_PATTERNS) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      const parts = pattern.extract(match);
      const date = new Date(parts.year, parts.month, parts.day);

      // Validate the date is real (e.g., not Feb 30)
      if (
        date.getFullYear() === parts.year &&
        date.getMonth() === parts.month &&
        date.getDate() === parts.day
      ) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Parse a date string with caching.
 * Uses quick rejection pattern for early return on non-date strings.
 *
 * @param {string} dateStr - Date string in various formats
 * @returns {Date|null} Parsed Date object or null if unparseable
 */
function parseDateCached(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }

  // Quick rejection for strings that definitely aren't dates
  if (!QUICK_DATE_CHECK.test(dateStr)) {
    return null;
  }

  if (dateCache.has(dateStr)) {
    return dateCache.get(dateStr);
  }

  const result = parseDate(dateStr);
  dateCache.set(dateStr, result);
  return result;
}

/**
 * Calculate age in days from a date to now
 * @param {Date} date - The date to calculate age from
 * @param {Date} [now] - Optional "now" date for testing
 * @returns {number} Age in days
 */
function calculateAgeDays(date, now = new Date()) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return -1;
  }

  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Extract a date from a TODO/FIXME comment
 * Looks for dates in the reference part: TODO (author, 2025-01-03): description
 * @param {string} commentText - The full comment text
 * @returns {Object} Object with date, reference, and keyword
 */
function extractDateFromComment(commentText) {
  const result = {
    date: null,
    reference: null,
    keyword: null,
    description: null,
  };

  if (!commentText || typeof commentText !== "string") {
    return result;
  }

  // Match TODO/FIXME/NOTE with reference: TODO (reference): description
  const todoMatch = commentText.match(
    /\b(TODO|FIXME|NOTE)\s*\(([^)]+)\)\s*:\s*(.*)/i
  );

  if (todoMatch) {
    result.keyword = todoMatch[1].toUpperCase();
    result.reference = todoMatch[2].trim();
    result.description = todoMatch[3].trim();

    // Try to extract date from the reference
    result.date = parseDate(result.reference);
  } else {
    // Try to find a date anywhere in the comment
    for (const pattern of DATE_PATTERNS) {
      const match = commentText.match(pattern.regex);
      if (match) {
        const parts = pattern.extract(match);
        result.date = new Date(parts.year, parts.month, parts.day);
        break;
      }
    }

    // Also try to identify keyword without proper format
    const keywordMatch = commentText.match(/\b(TODO|FIXME|NOTE)\b/i);
    if (keywordMatch) {
      result.keyword = keywordMatch[1].toUpperCase();
    }
  }

  return result;
}

/**
 * Check if a date is in the future
 * @param {Date} date - Date to check
 * @param {Date} [now] - Optional "now" date for testing
 * @returns {boolean} True if date is in the future
 */
function isFutureDate(date, now = new Date()) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() > now.getTime();
}

/**
 * Format age in human-readable format
 * @param {number} days - Age in days
 * @returns {string} Human-readable age string
 */
function formatAge(days) {
  if (days < 0) {
    return "unknown";
  }
  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "1 day";
  }
  if (days < 7) {
    return `${days} days`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year" : `${years} years`;
}

module.exports = {
  parseDate,
  parseDateCached,
  calculateAgeDays,
  extractDateFromComment,
  isFutureDate,
  formatAge,
  DATE_PATTERNS,
  MONTH_MAP,
  QUICK_DATE_CHECK,
};
