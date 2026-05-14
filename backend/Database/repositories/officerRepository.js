'use strict';

const { Op } = require('sequelize');
const { Officer, Transfer, Notification, Alert } = require('../index');

// ─── Create ────────────────────────────────────────────────────────────────────

const createOfficer = async (data) => {
  return Officer.create(data);
};

// ─── Read ──────────────────────────────────────────────────────────────────────

const getOfficerById = async (id, { withRelations = false } = {}) => {
  const options = { where: { id } };

  if (withRelations) {
    options.include = [
      { model: Transfer,     as: 'transfers',     limit: 20, order: [['initiated_at', 'DESC']] },
      { model: Notification, as: 'notifications', limit: 20, order: [['created_at',   'DESC']] },
    ];
  }

  return Officer.findOne(options);
};

const getOfficerByEmail = async (email) => {
  return Officer.findOne({ where: { email: email.toLowerCase() } });
};

const getOfficerByEmployeeId = async (employee_id) => {
  return Officer.findOne({ where: { employee_id } });
};

const getAllOfficers = async ({
  page                = 1,
  limit               = 20,
  role,
  availability_status,
  is_active           = true,
  jurisdiction,
} = {}) => {
  const where = { is_active };

  if (role)                where.role                = role;
  if (availability_status) where.availability_status = availability_status;
  if (jurisdiction)        where.jurisdiction        = { [Op.iLike]: `%${jurisdiction}%` };

  const offset = (page - 1) * limit;

  const { count, rows } = await Officer.findAndCountAll({
    where,
    limit,
    offset,
    order:      [['full_name', 'ASC']],
    attributes: { exclude: ['password_hash'] },
  });

  return {
    total:       count,
    page:        Number(page),
    total_pages: Math.ceil(count / limit),
    data:        rows,
  };
};

const getAvailableOfficers = async ({ role, jurisdiction } = {}) => {
  const where = { availability_status: 'available', is_active: true };
  if (role)        where.role        = role;
  if (jurisdiction) where.jurisdiction = { [Op.iLike]: `%${jurisdiction}%` };

  return Officer.findAll({
    where,
    attributes: { exclude: ['password_hash'] },
    order:      [['full_name', 'ASC']],
  });
};

// ─── Update ────────────────────────────────────────────────────────────────────

const updateOfficer = async (id, data) => {
  const [affectedRows, [updated]] = await Officer.update(data, {
    where:     { id },
    returning: true,
  });
  return affectedRows > 0 ? updated : null;
};

const setAvailability = async (id, availability_status) => {
  return updateOfficer(id, { availability_status });
};

const updateLastLogin = async (id) => {
  return updateOfficer(id, { last_login_at: new Date() });
};

const deactivateOfficer = async (id) => {
  return updateOfficer(id, { is_active: false, availability_status: 'off_duty' });
};

// ─── Delete ────────────────────────────────────────────────────────────────────

const deleteOfficer = async (id) => {
  return Officer.destroy({ where: { id } });
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createOfficer,
  getOfficerById,
  getOfficerByEmail,
  getOfficerByEmployeeId,
  getAllOfficers,
  getAvailableOfficers,
  updateOfficer,
  setAvailability,
  updateLastLogin,
  deactivateOfficer,
  deleteOfficer,
};