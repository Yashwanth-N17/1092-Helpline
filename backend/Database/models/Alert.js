'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Alert extends Model {}

  Alert.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      call_id: {
        type:       DataTypes.UUID,
        allowNull:  false,
        references: { model: 'calls', key: 'id' },
        onDelete:   'CASCADE',
      },
      alert_type: {
        type:      DataTypes.ENUM(
          'child_abuse',
          'domestic_violence',
          'missing_child',
          'medical_emergency',
          'fire',
          'natural_disaster',
          'mental_health_crisis',
          'sexual_abuse',
          'trafficking',
          'cybercrime',
          'other'
        ),
        allowNull: false,
      },
      severity_level: {
        type:         DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull:    false,
        defaultValue: 'medium',
      },
      status: {
        type:         DataTypes.ENUM(
          'open',
          'acknowledged',
          'in_progress',
          'resolved',
          'false_alarm',
          'escalated'
        ),
        allowNull:    false,
        defaultValue: 'open',
      },
      title: {
        type:      DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      location_raw: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      location_lat: {
        type:      DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      location_lng: {
        type:      DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      assigned_officer_id: {
        type:       DataTypes.UUID,
        allowNull:  true,
        references: { model: 'officers', key: 'id' },
        onDelete:   'SET NULL',
      },
      triggered_by: {
        type:         DataTypes.ENUM('ai', 'operator', 'system', 'auto_rule'),
        allowNull:    false,
        defaultValue: 'ai',
      },
      acknowledged_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      resolved_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      resolution_notes: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName:  'Alert',
      tableName:  'alerts',
      timestamps: true,
      indexes: [
        { fields: ['call_id'] },
        { fields: ['status'] },
        { fields: ['severity_level'] },
        { fields: ['alert_type'] },
        { fields: ['assigned_officer_id'] },
        { fields: ['triggered_by'] },
      ],
    }
  );

  return Alert;
};