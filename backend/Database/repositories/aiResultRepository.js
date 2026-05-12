'use strict';

const { Op } = require('sequelize');
const { AIResult, Call, Transcript } = require('../index');

// ─── Create ────────────────────────────────────────────────────────────────────

const createAIResult = async (data) => {
  return AIResult.create(data);
};

const bulkCreateAIResults = async (records) => {
  return AIResult.bulkCreate(records, { validate: true });
};

// ─── Read ──────────────────────────────────────────────────────────────────────

const getAIResultById = async (id) => {
  return AIResult.findOne({
    where:   { id },
    include: [
      { model: Call,       as: 'call' },
      { model: Transcript, as: 'transcript' },
    ],
  });
};

const getAIResultsByCallId = async (call_id, { analysis_type } = {}) => {
  const where = { call_id };
  if (analysis_type) where.analysis_type = analysis_type;

  return AIResult.findAll({
    where,
    order: [['analysed_at', 'DESC']],
  });
};

const getLatestAIResultForCall = async (call_id, analysis_type) => {
  return AIResult.findOne({
    where: { call_id, analysis_type },
    order: [['analysed_at', 'DESC']],
  });
};

const getAIResultsByTranscriptId = async (transcript_id) => {
  return AIResult.findAll({
    where: { transcript_id },
    order: [['analysed_at', 'DESC']],
  });
};

const getEscalationCandidates = async () => {
  return AIResult.findAll({
    where: {
      should_escalate: true,
      analysis_type:   'escalation_decision',
    },
    include: [{ model: Call, as: 'call' }],
    order:   [['analysed_at', 'DESC']],
    limit:   100,
  });
};

const getAIResultsBySeverity = async (severity_level) => {
  return AIResult.findAll({
    where: { severity_level },
    order: [['analysed_at', 'DESC']],
    limit: 200,
  });
};

// ─── Stats ─────────────────────────────────────────────────────────────────────

const getAIResultStats = async () => {
  const { sequelize } = require('../index');

  return AIResult.findAll({
    attributes: [
      'analysis_type',
      'severity_level',
      [sequelize.fn('COUNT', sequelize.col('id')),              'count'],
      [sequelize.fn('AVG',   sequelize.col('latency_ms')),      'avg_latency_ms'],
      [sequelize.fn('AVG',   sequelize.col('severity_score')),  'avg_severity_score'],
    ],
    group: ['analysis_type', 'severity_level'],
    raw:   true,
  });
};

// ─── Update ────────────────────────────────────────────────────────────────────

const updateAIResult = async (id, data) => {
  const [affectedRows, [updated]] = await AIResult.update(data, {
    where:     { id },
    returning: true,
  });
  return affectedRows > 0 ? updated : null;
};

// ─── Delete ────────────────────────────────────────────────────────────────────

const deleteAIResult = async (id) => {
  return AIResult.destroy({ where: { id } });
};

const deleteAIResultsByCallId = async (call_id) => {
  return AIResult.destroy({ where: { call_id } });
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createAIResult,
  bulkCreateAIResults,
  getAIResultById,
  getAIResultsByCallId,
  getLatestAIResultForCall,
  getAIResultsByTranscriptId,
  getEscalationCandidates,
  getAIResultsBySeverity,
  getAIResultStats,
  updateAIResult,
  deleteAIResult,
  deleteAIResultsByCallId,
};