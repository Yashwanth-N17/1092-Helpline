'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Transcript extends Model {}

  Transcript.init(
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
      speaker: {
        type:      DataTypes.ENUM('caller', 'operator', 'ai', 'system'),
        allowNull: false,
      },
      content: {
        type:      DataTypes.TEXT,
        allowNull: false,
        validate:  { notEmpty: true },
      },
      content_original: {
        type:      DataTypes.TEXT,
        allowNull: true,
        comment:   'Raw content before translation/normalization',
      },
      language: {
        type:         DataTypes.STRING(10),
        allowNull:    false,
        defaultValue: 'en',
      },
      confidence_score: {
        type:      DataTypes.DECIMAL(5, 4),
        allowNull: true,
        validate:  { min: 0, max: 1 },
        comment:   'ASR confidence 0.0–1.0',
      },
      sequence_no: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:   'Order of utterance within the call',
      },
      spoken_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      audio_start_ms: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'Millisecond offset from call start',
      },
      audio_end_ms: {
        type:      DataTypes.INTEGER,
        allowNull: true,
      },
      is_redacted: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
        comment:      'PII redacted flag',
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName:  'Transcript',
      tableName:  'transcripts',
      timestamps: true,
      indexes: [
        { fields: ['call_id'] },
        { fields: ['speaker'] },
        { fields: ['spoken_at'] },
        { fields: ['sequence_no'] },
      ],
    }
  );

  return Transcript;
};