/**
 * @file Small test fixture for performance benchmarks.
 * @description Contains ~50 lines with various comment types.
 */

// TODO (PERF-001): Optimize this function
function calculateSum(numbers) {
  // Simple sum calculation
  let total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total;
}

// FIXME (BUG-123): Handle edge case for empty arrays
function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  return calculateSum(numbers) / numbers.length;
}

/**
 * Process data and return results.
 * @param {Array} data - Input data array
 * @returns {Object} Processed results
 */
function processData(data) {
  // Filter out invalid entries
  const valid = data.filter(item => item != null);

  // Calculate statistics
  const sum = calculateSum(valid);
  const avg = calculateAverage(valid);

  return {
    sum,
    avg,
    count: valid.length
  };
}

// NOTE (DEV-456): This is a utility function
function formatNumber(num) {
  return num.toFixed(2);
}

/* Multi-line block comment
 * explaining the purpose of this module.
 * It handles data processing operations.
 */

module.exports = {
  calculateSum,
  calculateAverage,
  processData,
  formatNumber
};
