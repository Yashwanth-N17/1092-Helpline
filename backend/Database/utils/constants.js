'use strict';

// ─────────────────────────────────────────────
// Call Status
// ─────────────────────────────────────────────
const CALL_STATUS = Object.freeze({
  INITIATED: 'INITIATED',       // Call connected, not yet processed
  IN_PROGRESS: 'IN_PROGRESS',   // Currently being handled
  TRANSFERRED: 'TRANSFERRED',   // Transferred to human officer
  RESOLVED: 'RESOLVED',         // Successfully resolved
  DROPPED: 'DROPPED',           // Call dropped unexpectedly
  MISSED: 'MISSED',             // No one answered
});

// ─────────────────────────────────────────────
// Severity Levels (AI-detected)
// ─────────────────────────────────────────────
const SEVERITY = Object.freeze({
  LOW: 'LOW',           // Informational, no immediate action needed
  MEDIUM: 'MEDIUM',     // Requires monitoring or follow-up
  HIGH: 'HIGH',         // Urgent — assign officer soon
  CRITICAL: 'CRITICAL', // Immediate human intervention required
});

// ─────────────────────────────────────────────
// Alert Status
// ─────────────────────────────────────────────
const ALERT_STATUS = Object.freeze({
  OPEN: 'OPEN',           // Newly created, unacknowledged
  ACKNOWLEDGED: 'ACKNOWLEDGED', // Seen by a dashboard operator
  RESOLVED: 'RESOLVED',   // Action taken, alert closed
  DISMISSED: 'DISMISSED', // Marked as non-actionable / false positive
});

// ─────────────────────────────────────────────
// Alert Category
// ─────────────────────────────────────────────
const ALERT_CATEGORY = Object.freeze({
  CHILD_ABUSE: 'CHILD_ABUSE',
  DOMESTIC_VIOLENCE: 'DOMESTIC_VIOLENCE',
  MISSING_CHILD: 'MISSING_CHILD',
  MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
  MENTAL_HEALTH: 'MENTAL_HEALTH',
  EXPLOITATION: 'EXPLOITATION',
  TRAFFICKING: 'TRAFFICKING',
  HARASSMENT: 'HARASSMENT',
  GENERAL_DISTRESS: 'GENERAL_DISTRESS',
  OTHER: 'OTHER',
});

// ─────────────────────────────────────────────
// Officer Status
// ─────────────────────────────────────────────
const OFFICER_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',     // Free to accept a transfer
  BUSY: 'BUSY',               // Currently handling a case
  ON_BREAK: 'ON_BREAK',       // Temporarily unavailable
  OFFLINE: 'OFFLINE',         // Not on duty
});

// ─────────────────────────────────────────────
// Transfer Status
// ─────────────────────────────────────────────
const TRANSFER_STATUS = Object.freeze({
  PENDING: 'PENDING',       // Transfer initiated, officer not yet accepted
  ACCEPTED: 'ACCEPTED',     // Officer accepted the transfer
  COMPLETED: 'COMPLETED',   // Case fully handled by officer
  FAILED: 'FAILED',         // Transfer could not be completed
  CANCELLED: 'CANCELLED',   // Transfer cancelled before acceptance
});

// ─────────────────────────────────────────────
// Transcript Speaker Types
// ─────────────────────────────────────────────
const SPEAKER_TYPE = Object.freeze({
  CALLER: 'CALLER',     // Person who called
  AI: 'AI',             // AI system response
  OFFICER: 'OFFICER',   // Human officer (post-transfer)
});

// ─────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────
const NOTIFICATION_TYPE = Object.freeze({
  ALERT_CREATED: 'ALERT_CREATED',
  ALERT_ESCALATED: 'ALERT_ESCALATED',
  TRANSFER_INITIATED: 'TRANSFER_INITIATED',
  TRANSFER_ACCEPTED: 'TRANSFER_ACCEPTED',
  CALL_DROPPED: 'CALL_DROPPED',
  SYSTEM: 'SYSTEM',
});

// ─────────────────────────────────────────────
// Notification Channels
// ─────────────────────────────────────────────
const NOTIFICATION_CHANNEL = Object.freeze({
  DASHBOARD: 'DASHBOARD', // Real-time dashboard push
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WEBHOOK: 'WEBHOOK',
});

// ─────────────────────────────────────────────
// Supported Languages (ISO 639-1)
// ─────────────────────────────────────────────
const SUPPORTED_LANGUAGES = Object.freeze({
  EN: 'en',   // English
  HI: 'hi',   // Hindi
  BN: 'bn',   // Bengali
  TA: 'ta',   // Tamil
  TE: 'te',   // Telugu
  MR: 'mr',   // Marathi
  GU: 'gu',   // Gujarati
  KN: 'kn',   // Kannada
  ML: 'ml',   // Malayalam
  PA: 'pa',   // Punjabi
  OR: 'or',   // Odia
  UR: 'ur',   // Urdu
});

// ─────────────────────────────────────────────
// Pagination Defaults
// ─────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

// ─────────────────────────────────────────────
// AI Model Config Keys
// ─────────────────────────────────────────────
const AI_ANALYSIS_KEYS = Object.freeze({
  SEVERITY: 'severity',
  CATEGORY: 'category',
  CONFIDENCE: 'confidence',
  SUMMARY: 'summary',
  REPLY: 'reply',
  ESCALATE: 'escalate',
  KEYWORDS: 'keywords',
});

module.exports = {
  CALL_STATUS,
  SEVERITY,
  ALERT_STATUS,
  ALERT_CATEGORY,
  OFFICER_STATUS,
  TRANSFER_STATUS,
  SPEAKER_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  SUPPORTED_LANGUAGES,
  PAGINATION,
  AI_ANALYSIS_KEYS,
};