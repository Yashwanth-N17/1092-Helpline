'use strict';

const { Op } = require('sequelize');
const { Alert, Call, Officer, Notification } = require('../index');

// ─── Create ────────────────────────────────────────────────────────────────────

const createAlert = async (data) => {
  return Alert.create(data);
};

// ─── Read ──────────────────────────────────────────────────────────────────────

const getAlertById = async (id, { withRelations = false } = {}) => {
  const options = { where: { id } };

  if (withRelations) {
    options.include = [
      { model: Call,         as: 'call' },
      { model: Officer,      as: 'assignedOfficer' },
      { model: Notification, as: 'notifications' },
    ];
  }

  return Alert.findOne(options);
};

const getAllAlerts = async ({
  page           = 1,
  limit          = 20,
  status,
  severity_level,
  alert_type,
  assigned_officer_id,
  from_date,
  to_date,
} = {}) => {
  const where = {};

  if (status)               where.status               = status;
  if (severity_level)       where.severity_level       = severity_level;
  if (alert_type)           where.alert_type           = alert_type;
  if (assigned_officer_id)  where.assigned_officer_id  = assigned_officer_id;

  if (from_date || to_date) {
    where.created_at = {};
    if (from_date) where.created_at[Op.gte] = new Date(from_date);
    if (to_date)   where.created_at[Op.lte] = new Date(to_date);
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Alert.findAndCountAll({
    where,
    limit,
    offset,
    order:   [['created_at', 'DESC']],
    include: [{ model: Call, as: 'call', attributes: ['id', 'caller_number', 'status'] }],
  });

  return {
    total:       count,
    page:        Number(page),
    total_pages: Math.ceil(count / limit),
    data:        rows,
  };
};

const getOpenAlerts = async () => {
  return Alert.findAll({
    where: { status: { [Op.in]: ['open', 'acknowledged'] } },
    order: [['severity_level', 'ASC'], ['created_at', 'ASC']],
  });
};

const getCriticalAlerts = async () => {
  return Alert.findAll({
    where: {
      severity_level: 'critical',
      status:         { [Op.notIn]: ['resolved', 'false_alarm'] },
    },
    order:   [['created_at', 'ASC']],
    include: [{ model: Call, as: 'call' }],
  });
};

const getAlertsByCallId = async (call_id) => {
  return Alert.findAll({
    where: { call_id },
    order: [['created_at', 'DESC']],
  });
};

const getAlertsByOfficerId = async (officer_id) => {
  return Alert.findAll({
    where: { assigned_officer_id: officer_id },
    order: [['created_at', 'DESC']],
  });
};

// ─── Update ────────────────────────────────────────────────────────────────────

const updateAlert = async (id, data) => {
  const [affectedRows, [updated]] = await Alert.update(data, {
    where:     { id },
    returning: true,
  });
  return affectedRows > 0 ? updated : null;
};

const acknowledgeAlert = async (id, officer_id) => {
  return updateAlert(id, {
    status:           'acknowledged',
    assigned_officer_id: officer_id,
    acknowledged_at:  new Date(),
  });
};

const resolveAlert = async (id, resolution_notes = '') => {
  return updateAlert(id, {
    status:           'resolved',
    resolved_at:      new Date(),
    resolution_notes,
  });
};

const escalateAlert = async (id) => {
  return updateAlert(id, { status: 'escalated' });
};

// ─── Delete ────────────────────────────────────────────────────────────────────

const deleteAlert = async (id) => {
  return Alert.destroy({ where: { id } });
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createAlert,
  getAlertById,
  getAllAlerts,
  getOpenAlerts,
  getCriticalAlerts,
  getAlertsByCallId,
  getAlertsByOfficerId,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  deleteAlert,
};