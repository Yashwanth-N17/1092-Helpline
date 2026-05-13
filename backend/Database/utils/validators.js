'use strict';

// ─── Phone ─────────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return PHONE_REGEX.test(phone.trim());
};

// ─── Email ─────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

// ─── UUID ──────────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (id) => {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id);
};

// ─── Enums ─────────────────────────────────────────────────────────────────────

const VALID_CALL_STATUSES    = ['initiated', 'active', 'on_hold', 'transferred', 'completed', 'dropped', 'failed'];
const VALID_SEVERITY_LEVELS  = ['low', 'medium', 'high', 'critical'];
const VALID_CHANNELS         = ['voice', 'ivr', 'chat', 'whatsapp', 'sms'];
const VALID_ALERT_TYPES      = ['child_abuse', 'domestic_violence', 'missing_child', 'medical_emergency', 'fire', 'natural_disaster', 'mental_health_crisis', 'sexual_abuse', 'trafficking', 'cybercrime', 'other'];
const VALID_ALERT_STATUSES   = ['open', 'acknowledged', 'in_progress', 'resolved', 'false_alarm', 'escalated'];
const VALID_OFFICER_ROLES    = ['operator', 'supervisor', 'field_officer', 'medical_responder', 'counsellor', 'admin'];
const VALID_AVAILABILITY     = ['available', 'busy', 'off_duty', 'on_leave'];
const VALID_NOTIF_CHANNELS   = ['sms', 'email', 'push', 'whatsapp', 'in_app'];
const VALID_ANALYSIS_TYPES   = ['severity_classification', 'intent_detection', 'entity_extraction', 'sentiment_analysis', 'reply_generation', 'summary', 'escalation_decision'];
const VALID_SPEAKERS         = ['caller', 'operator', 'ai', 'system'];

const isValidEnum = (value, validValues) => {
  return validValues.includes(value);
};

// ─── Coordinates ───────────────────────────────────────────────────────────────

const isValidLatitude = (lat) => {
  const n = parseFloat(lat);
  return !isNaN(n) && n >= -90 && n <= 90;
};

const isValidLongitude = (lng) => {
  const n = parseFloat(lng);
  return !isNaN(n) && n >= -180 && n <= 180;
};

const isValidCoordinates = (lat, lng) => isValidLatitude(lat) && isValidLongitude(lng);

// ─── Confidence Score ──────────────────────────────────────────────────────────

const isValidConfidenceScore = (score) => {
  const n = parseFloat(score);
  return !isNaN(n) && n >= 0 && n <= 1;
};

// ─── Pagination ────────────────────────────────────────────────────────────────

const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page  || '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  return { page, limit };
};

// ─── Date Range ────────────────────────────────────────────────────────────────

const isValidDateString = (str) => {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
};

const parseDateRange = (from_date, to_date) => {
  const result = {};
  if (from_date && isValidDateString(from_date)) result.from_date = new Date(from_date);
  if (to_date   && isValidDateString(to_date))   result.to_date   = new Date(to_date);
  return result;
};

// ─── Call Validators ───────────────────────────────────────────────────────────

const validateCreateCall = (data) => {
  const errors = [];

  if (!data.caller_number)               errors.push('caller_number is required.');
  if (!isValidPhone(data.caller_number)) errors.push('caller_number must be a valid E.164 phone number.');

  if (data.call_type  && !isValidEnum(data.call_type,  ['inbound','outbound','missed'])) errors.push('Invalid call_type.');
  if (data.channel    && !isValidEnum(data.channel,    VALID_CHANNELS))    errors.push('Invalid channel.');
  if (data.status     && !isValidEnum(data.status,     VALID_CALL_STATUSES)) errors.push('Invalid status.');

  if (data.location_lat && !isValidLatitude(data.location_lat))   errors.push('Invalid location_lat.');
  if (data.location_lng && !isValidLongitude(data.location_lng))  errors.push('Invalid location_lng.');

  return { valid: errors.length === 0, errors };
};

// ─── Transcript Validators ─────────────────────────────────────────────────────

const validateCreateTranscript = (data) => {
  const errors = [];

  if (!data.call_id)         errors.push('call_id is required.');
  if (!isValidUUID(data.call_id)) errors.push('call_id must be a valid UUID.');
  if (!data.speaker)         errors.push('speaker is required.');
  if (!isValidEnum(data.speaker, VALID_SPEAKERS)) errors.push('Invalid speaker.');
  if (!data.content || data.content.trim() === '') errors.push('content must not be empty.');
  if (data.confidence_score !== undefined && !isValidConfidenceScore(data.confidence_score)) errors.push('confidence_score must be between 0 and 1.');

  return { valid: errors.length === 0, errors };
};

// ─── Alert Validators ──────────────────────────────────────────────────────────

const validateCreateAlert = (data) => {
  const errors = [];

  if (!data.call_id)              errors.push('call_id is required.');
  if (!isValidUUID(data.call_id)) errors.push('call_id must be a valid UUID.');
  if (!data.alert_type)           errors.push('alert_type is required.');
  if (!isValidEnum(data.alert_type, VALID_ALERT_TYPES))     errors.push('Invalid alert_type.');
  if (!data.severity_level)       errors.push('severity_level is required.');
  if (!isValidEnum(data.severity_level, VALID_SEVERITY_LEVELS)) errors.push('Invalid severity_level.');
  if (!data.title || data.title.trim() === '')  errors.push('title must not be empty.');

  return { valid: errors.length === 0, errors };
};

// ─── Officer Validators ────────────────────────────────────────────────────────

const validateCreateOfficer = (data) => {
  const errors = [];

  if (!data.employee_id || data.employee_id.trim() === '') errors.push('employee_id is required.');
  if (!data.full_name   || data.full_name.trim()   === '') errors.push('full_name is required.');
  if (!data.email)                errors.push('email is required.');
  if (!isValidEmail(data.email))  errors.push('email must be a valid email address.');
  if (data.phone && !isValidPhone(data.phone)) errors.push('phone must be a valid E.164 number.');
  if (data.role && !isValidEnum(data.role, VALID_OFFICER_ROLES)) errors.push('Invalid officer role.');

  return { valid: errors.length === 0, errors };
};

// ─── AIResult Validators ───────────────────────────────────────────────────────

const validateCreateAIResult = (data) => {
  const errors = [];

  if (!data.call_id)              errors.push('call_id is required.');
  if (!isValidUUID(data.call_id)) errors.push('call_id must be a valid UUID.');
  if (!data.model_name)           errors.push('model_name is required.');
  if (!data.analysis_type)        errors.push('analysis_type is required.');
  if (!isValidEnum(data.analysis_type, VALID_ANALYSIS_TYPES)) errors.push('Invalid analysis_type.');
  if (data.severity_score !== undefined && !isValidConfidenceScore(data.severity_score)) errors.push('severity_score must be between 0 and 1.');

  return { valid: errors.length === 0, errors };
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  isValidPhone,
  isValidEmail,
  isValidUUID,
  isValidEnum,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  isValidConfidenceScore,
  isValidDateString,
  parsePagination,
  parseDateRange,
  validateCreateCall,
  validateCreateTranscript,
  validateCreateAlert,
  validateCreateOfficer,
  validateCreateAIResult,

  // Enum constants (re-exported for use in routes/services)
  VALID_CALL_STATUSES,
  VALID_SEVERITY_LEVELS,
  VALID_CHANNELS,
  VALID_ALERT_TYPES,
  VALID_ALERT_STATUSES,
  VALID_OFFICER_ROLES,
  VALID_AVAILABILITY,
  VALID_NOTIF_CHANNELS,
  VALID_ANALYSIS_TYPES,
  VALID_SPEAKERS,
};