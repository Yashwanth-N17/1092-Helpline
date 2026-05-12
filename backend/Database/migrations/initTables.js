'use strict';

/**
 * initTables.js
 * Run:
 * node backend/database/migrations/initTables.js
 */

const { sequelize } = require('../../src/index');

const IS_FORCE = process.env.FORCE_SYNC === 'true';
const IS_ALTER = process.env.ALTER_SYNC === 'true';

async function initTables() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');

    // Sequelize handles connection automatically during sync
    await sequelize.authenticate();

    console.log('✅ Database connection established.');

    if (IS_FORCE) {
      console.log('⚠️ FORCE_SYNC=true');
    } else if (IS_ALTER) {
      console.log('⚠️ ALTER_SYNC=true');
    } else {
      console.log('ℹ️ Safe sync mode');
    }

    await sequelize.sync({
      force: IS_FORCE,
      alter: IS_ALTER
    });

    console.log('✅ All tables synchronized successfully.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;

  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

if (require.main === module) {
  initTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initTables };