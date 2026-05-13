'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class AIResult extends Model {}

  AIResult.init(
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
      transcript_id: {
        type:       DataTypes.UUID,
        allowNull:  true,
        references: { model: 'transcripts', key: 'id' },
        onDelete:   'SET NULL',
        comment:    'Null when result is for full-call analysis',
      },
      model_name: {
        type:      DataTypes.STRING(80),
        allowNull: false,
        comment:   'e.g. gpt-4o, gemini-1.5-pro, custom-1098-v2',
      },
      model_version: {
        type:      DataTypes.STRING(40),
        allowNull: true,
      },
      analysis_type: {
        type:      DataTypes.ENUM(
          'severity_classification',
          'intent_detection',
          'entity_extraction',
          'sentiment_analysis',
          'reply_generation',
          'summary',
          'escalation_decision'
        ),
        allowNull: false,
      },
      severity_level: {
        type:      DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: true,
      },
      severity_score: {
        type:      DataTypes.DECIMAL(5, 4),
        allowNull: true,
        validate:  { min: 0, max: 1 },
        comment:   'Confidence score for severity classification',
      },
      intent: {
        type:      DataTypes.STRING(120),
        allowNull: true,
        comment:   'Detected caller intent label',
      },
      entities: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
        comment:      'Extracted named entities: location, victim, threat, etc.',
      },
      sentiment: {
        type:      DataTypes.ENUM('positive', 'neutral', 'negative', 'panic', 'aggressive'),
        allowNull: true,
      },
      ai_reply: {
        type:      DataTypes.TEXT,
        allowNull: true,
        comment:   'AI-generated operator guidance or caller response',
      },
      summary: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      should_escalate: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      escalation_reason: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      raw_response: {
        type:      DataTypes.JSONB,
        allowNull: true,
        comment:   'Full raw API response from AI provider',
      },
      prompt_tokens: {
        type:      DataTypes.INTEGER,
        allowNull: true,
      },
      completion_tokens: {
        type:      DataTypes.INTEGER,
        allowNull: true,
      },
      latency_ms: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'AI inference latency in milliseconds',
      },
      analysed_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      metadata: {
        type:         DataTypes.JSONB,
        allowNull:    true,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName:  'AIResult',
      tableName:  'ai_results',
      timestamps: true,
      indexes: [
        { fields: ['call_id'] },
        { fields: ['transcript_id'] },
        { fields: ['analysis_type'] },
        { fields: ['severity_level'] },
        { fields: ['should_escalate'] },
        { fields: ['analysed_at'] },
      ],
    }
  );

  return AIResult;
};