'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {}

  Notification.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      alert_id: {
        type:       DataTypes.UUID,
        allowNull:  false,
        references: { model: 'alerts', key: 'id' },
        onDelete:   'CASCADE',
      },
      officer_id: {
        type:       DataTypes.UUID,
        allowNull:  true,
        references: { model: 'officers', key: 'id' },
        onDelete:   'SET NULL',
        comment:    'Null for broadcast notifications',
      },
      channel: {
        type:      DataTypes.ENUM('sms', 'email', 'push', 'whatsapp', 'in_app'),
        allowNull: false,
      },
      recipient_address: {
        type:      DataTypes.STRING(255),
        allowNull: false,
        comment:   'Phone number, email, or device token',
      },
      subject: {
        type:      DataTypes.STRING(255),
        allowNull: true,
      },
      body: {
        type:      DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type:         DataTypes.ENUM('queued', 'sent', 'delivered', 'failed', 'read'),
        allowNull:    false,
        defaultValue: 'queued',
      },
      provider: {
        type:      DataTypes.STRING(60),
        allowNull: true,
        comment:   'e.g. twilio, sendgrid, firebase',
      },
      provider_message_id: {
        type:      DataTypes.STRING(255),
        allowNull: true,
        comment:   'External message ID from provider',
      },
      sent_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      delivered_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      read_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      failure_reason: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      retry_count: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 0,
        validate:     { min: 0 },
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName:  'Notification',
      tableName:  'notifications',
      timestamps: true,
      indexes: [
        { fields: ['alert_id'] },
        { fields: ['officer_id'] },
        { fields: ['channel'] },
        { fields: ['status'] },
        { fields: ['sent_at'] },
        { fields: ['provider_message_id'] },
      ],
    }
  );

  return Notification;
};