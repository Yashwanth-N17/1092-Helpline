'use strict';

const { Op } = require('sequelize');
const { PAGINATION, SEVERITY } = require('./constants');

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

/**
 * Parses and validates pagination parameters.
 * @param {Object} query - Express query object or plain object with page/limit
 * @returns {{ limit: number, offset: number, page: number }}
 */
function getPagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

/**
 * Formats a Sequelize findAndCountAll result into a standard paginated response.
 * @param {Object} result - { count, rows } from Sequelize
 * @param {number} page
 * @param {number} limit
 * @returns {Object}
 */
function formatPaginatedResponse(result, page, limit) {
  const totalPages = Math.ceil(result.count / limit);
  return {
    data: result.rows,
    meta: {
      total: result.count,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// ─────────────────────────────────────────────
// Date / Time Helpers
// ─────────────────────────────────────────────

/**
 * Returns a Sequelize where clause for filtering by a date range.
 * Both from and to are optional.
 * @param {string|Date} [from]
 * @param {string|Date} [to]
 * @returns {Object|null} Sequelize Op.between / Op.gte / Op.lte clause, or null
 */
function dateRangeFilter(from, to) {
  if (from && to) {
    return { [Op.between]: [new Date(from), new Date(to)] };
  }
  if (from) {
    return { [Op.gte]: new Date(from) };
  }
  if (to) {
    return { [Op.lte]: new Date(to) };
  }
  return null;
}

/**
 * Returns today's start and end as Date objects.
 * @returns {{ start: Date, end: Date }}
 */
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Formats a Date object to ISO string, safely.
 * @param {Date|string|null} date
 * @returns {string|null}
 */
function toISOStringSafe(date) {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Severity Helpers
// ─────────────────────────────────────────────

/**
 * Returns a numeric weight for a severity value (for sorting/comparison).
 * @param {string} severity
 * @returns {number}
 */
function severityWeight(severity) {
  const weights = {
    [SEVERITY.LOW]: 1,
    [SEVERITY.MEDIUM]: 2,
    [SEVERITY.HIGH]: 3,
    [SEVERITY.CRITICAL]: 4,
  };
  return weights[severity] || 0;
}

/**
 * Determines whether a given severity level requires immediate escalation.
 * @param {string} severity
 * @returns {boolean}
 */
function requiresEscalation(severity) {
  return severity === SEVERITY.HIGH || severity === SEVERITY.CRITICAL;
}

/**
 * Returns the higher severity of two values.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function maxSeverity(a, b) {
  return severityWeight(a) >= severityWeight(b) ? a : b;
}

// ─────────────────────────────────────────────
// String / Sanitization Helpers
// ─────────────────────────────────────────────

/**
 * Trims and lowercases a string safely.
 * @param {*} value
 * @returns {string}
 */
function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

/**
 * Truncates a string to a max length, appending '...' if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength = 255) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Masks a phone number for safe logging (e.g. +91XXXXXX4321).
 * @param {string} phone
 * @returns {string}
 */
function maskPhoneNumber(phone) {
  if (!phone || phone.length < 4) return '****';
  const visible = phone.slice(-4);
  return phone.slice(0, phone.length - 10).padEnd(phone.length - 4, 'X') + visible;
}

// ─────────────────────────────────────────────
// Object / Response Helpers
// ─────────────────────────────────────────────

/**
 * Removes undefined and null keys from a plain object.
 * Useful for building Sequelize where clauses dynamically.
 * @param {Object} obj
 * @returns {Object}
 */
function compactObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  );
}

/**
 * Builds a standard success response envelope.
 * @param {*} data
 * @param {string} [message]
 * @returns {Object}
 */
function successResponse(data, message = 'Success') {
  return { success: true, message, data };
}

/**
 * Builds a standard error response envelope.
 * @param {string} message
 * @param {*} [details]
 * @returns {Object}
 */
function errorResponse(message = 'An error occurred', details = null) {
  return { success: false, message, details };
}

// ─────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────

/**
 * Checks whether a value is a valid UUID v4.
 * @param {string} value
 * @returns {boolean}
 */
function isValidUUID(value) {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

/**
 * Checks whether a value exists in a constants enum object.
 * @param {Object} enumObj - e.g. SEVERITY, CALL_STATUS
 * @param {string} value
 * @returns {boolean}
 */
function isValidEnumValue(enumObj, value) {
  return Object.values(enumObj).includes(value);
}

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

module.exports = {
  // Pagination
  getPagination,
  formatPaginatedResponse,

  // Date / Time
  dateRangeFilter,
  getTodayRange,
  toISOStringSafe,

  // Severity
  severityWeight,
  requiresEscalation,
  maxSeverity,

  // String
  normalizeString,
  truncate,
  maskPhoneNumber,

  // Object / Response
  compactObject,
  successResponse,
  errorResponse,

  // Validation
  isValidUUID,
  isValidEnumValue,
};