'use strict';

/**
 * database.config.js
 *
 * Sequelize connection configuration for all environments.
 * Values are read from environment variables (.env).
 * Used by both the Sequelize instance (src/database/index.js)
 * and the Sequelize CLI (.sequelizerc).
 */

require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '1098_helpline',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,        // snake_case column names
    timestamps: true,         // created_at / updated_at
    freezeTableName: false,   // Sequelize pluralizes table names
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000, // ms
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,       // ms
  },
};

const config = {
  development: {
    ...common,
    logging: (sql) => console.log(`[SQL] ${sql}`),
  },

  test: {
    ...common,
    database: process.env.DB_NAME_TEST || '1098_helpline_test',
    logging: false,
  },

  production: {
    ...common,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? {
            require: true,
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      acquire: 60000,
      idle: 10000,
    },
  },
};

module.exports = config;