'use strict';

const { Op } = require('sequelize');
const { Transcript, Call } = require('../index');

// ─── Create ────────────────────────────────────────────────────────────────────

const createTranscript = async (data) => {
  return Transcript.create(data);
};

const bulkCreateTranscripts = async (records) => {
  return Transcript.bulkCreate(records, { validate: true });
};

// ─── Read ──────────────────────────────────────────────────────────────────────

const getTranscriptById = async (id) => {
  return Transcript.findOne({ where: { id }, include: [{ model: Call, as: 'call' }] });
};

const getTranscriptsByCallId = async (call_id, { speaker } = {}) => {
  const where = { call_id };
  if (speaker) where.speaker = speaker;

  return Transcript.findAll({
    where,
    order: [['sequence_no', 'ASC'], ['spoken_at', 'ASC']],
  });
};

const getFullConversation = async (call_id) => {
  return Transcript.findAll({
    where: { call_id, is_redacted: false },
    order: [['sequence_no', 'ASC']],
    attributes: ['speaker', 'content', 'language', 'spoken_at', 'sequence_no'],
  });
};

const getTranscriptsByLanguage = async (call_id, language) => {
  return Transcript.findAll({
    where: { call_id, language },
    order: [['sequence_no', 'ASC']],
  });
};

const searchTranscripts = async (keyword, { call_id, limit = 50 } = {}) => {
  const where = {
    content: { [Op.iLike]: `%${keyword}%` },
  };
  if (call_id) where.call_id = call_id;

  return Transcript.findAll({
    where,
    order: [['spoken_at', 'DESC']],
    limit,
  });
};

// ─── Update ────────────────────────────────────────────────────────────────────

const updateTranscript = async (id, data) => {
  const [affectedRows, [updated]] = await Transcript.update(data, {
    where:     { id },
    returning: true,
  });
  return affectedRows > 0 ? updated : null;
};

const redactTranscript = async (id) => {
  return updateTranscript(id, { is_redacted: true, content: '[REDACTED]' });
};

const redactAllByCallId = async (call_id) => {
  return Transcript.update(
    { is_redacted: true, content: '[REDACTED]' },
    { where: { call_id } }
  );
};

// ─── Delete ────────────────────────────────────────────────────────────────────

const deleteTranscript = async (id) => {
  return Transcript.destroy({ where: { id } });
};

const deleteTranscriptsByCallId = async (call_id) => {
  return Transcript.destroy({ where: { call_id } });
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createTranscript,
  bulkCreateTranscripts,
  getTranscriptById,
  getTranscriptsByCallId,
  getFullConversation,
  getTranscriptsByLanguage,
  searchTranscripts,
  updateTranscript,
  redactTranscript,
  redactAllByCallId,
  deleteTranscript,
  deleteTranscriptsByCallId,
};