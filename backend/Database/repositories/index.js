'use strict';

const callRepository = require('./callRepository');
const transcriptRepository = require('./transcriptRepository');
const aiResultRepository = require('./aiResultRepository');
const alertRepository = require('./alertRepository');
const officerRepository = require('./officerRepository');

module.exports = {
  callRepository,
  transcriptRepository,
  aiResultRepository,
  alertRepository,
  officerRepository,
};