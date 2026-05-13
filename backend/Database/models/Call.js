'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Call extends Model {}

  Call.init(
    {
      id: {
        type:          DataTypes.UUID,
        defaultValue:  DataTypes.UUIDV4,
        primaryKey:    true,
        allowNull:     false,
      },
      caller_number: {
        type:      DataTypes.STRING(20),
        allowNull: false,
        validate:  { notEmpty: true },
      },
      caller_name: {
        type:      DataTypes.STRING(120),
        allowNull: true,
      },
      call_type: {
        type:         DataTypes.ENUM('inbound', 'outbound', 'missed'),
        allowNull:    false,
        defaultValue: 'inbound',
      },
      status: {
        type:         DataTypes.ENUM(
          'initiated',
          'active',
          'on_hold',
          'transferred',
          'completed',
          'dropped',
          'failed'
        ),
        allowNull:    false,
        defaultValue: 'initiated',
      },
      channel: {
        type:         DataTypes.ENUM('voice', 'ivr', 'chat', 'whatsapp', 'sms'),
        allowNull:    false,
        defaultValue: 'voice',
      },
      language: {
        type:         DataTypes.STRING(10),
        allowNull:    false,
        defaultValue: 'en',
        comment:      'BCP-47 language tag e.g. en, hi, mr',
      },
      severity_level: {
        type:         DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull:    true,
        defaultValue: null,
        comment:      'Populated after AI analysis',
      },
      started_at: {
        type:      DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ended_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      duration_seconds: {
        type:         DataTypes.INTEGER,
        allowNull:    true,
        defaultValue: null,
        validate:     { min: 0 },
      },
      location_raw: {
        type:      DataTypes.TEXT,
        allowNull: true,
        comment:   'Raw location string as provided by caller',
      },
      location_lat: {
        type:      DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      location_lng: {
        type:      DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      recording_url: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      is_test: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
        comment:      'Flag for mock/test calls',
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
        comment:      'Arbitrary extra data from telephony provider',
      },
    },
    {
      sequelize,
      modelName:  'Call',
      tableName:  'calls',
      timestamps: true,
      indexes: [
        { fields: ['caller_number'] },
        { fields: ['status'] },
        { fields: ['severity_level'] },
        { fields: ['started_at'] },
        { fields: ['channel'] },
      ],
    }
  );

  return Call;
};