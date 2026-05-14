'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Transfer extends Model {}

  Transfer.init(
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
      officer_id: {
        type:       DataTypes.UUID,
        allowNull:  true,
        references: { model: 'officers', key: 'id' },
        onDelete:   'SET NULL',
        comment:    'Officer the call was transferred to',
      },
      transferred_from: {
        type:      DataTypes.STRING(100),
        allowNull: true,
        comment:   'Queue name, department, or officer employee_id source',
      },
      transferred_to: {
        type:      DataTypes.STRING(100),
        allowNull: false,
        comment:   'Destination queue, department, or direct officer',
      },
      transfer_type: {
        type:      DataTypes.ENUM(
          'blind',
          'warm',
          'conference',
          'department',
          'external_agency'
        ),
        allowNull: false,
        defaultValue: 'blind',
      },
      reason: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type:         DataTypes.ENUM('pending', 'completed', 'failed', 'rejected'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      initiated_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      notes: {
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
      modelName:  'Transfer',
      tableName:  'transfers',
      timestamps: true,
      indexes: [
        { fields: ['call_id'] },
        { fields: ['officer_id'] },
        { fields: ['status'] },
        { fields: ['transfer_type'] },
        { fields: ['initiated_at'] },
      ],
    }
  );

  return Transfer;
};