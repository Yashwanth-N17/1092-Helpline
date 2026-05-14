'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Officer extends Model {}

  Officer.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      employee_id: {
        type:      DataTypes.STRING(30),
        allowNull: false,
        unique:    true,
      },
      full_name: {
        type:      DataTypes.STRING(150),
        allowNull: false,
        validate:  { notEmpty: true },
      },
      email: {
        type:      DataTypes.STRING(200),
        allowNull: false,
        unique:    true,
        validate:  { isEmail: true },
      },
      phone: {
        type:      DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type:      DataTypes.ENUM(
          'operator',
          'supervisor',
          'field_officer',
          'medical_responder',
          'counsellor',
          'admin'
        ),
        allowNull: false,
        defaultValue: 'operator',
      },
      department: {
        type:      DataTypes.STRING(100),
        allowNull: true,
      },
      jurisdiction: {
        type:      DataTypes.STRING(150),
        allowNull: true,
        comment:   'District / zone / state the officer is responsible for',
      },
      availability_status: {
        type:         DataTypes.ENUM('available', 'busy', 'off_duty', 'on_leave'),
        allowNull:    false,
        defaultValue: 'available',
      },
      is_active: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
      last_login_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      password_hash: {
        type:      DataTypes.STRING(255),
        allowNull: true,
        comment:   'bcrypt hash — nullable for SSO-only accounts',
      },
      notification_preferences: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: { sms: true, email: true, push: false },
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName:  'Officer',
      tableName:  'officers',
      timestamps: true,
      indexes: [
        { fields: ['employee_id'], unique: true },
        { fields: ['email'],       unique: true },
        { fields: ['role'] },
        { fields: ['availability_status'] },
        { fields: ['is_active'] },
        { fields: ['jurisdiction'] },
      ],
    }
  );

  return Officer;
};