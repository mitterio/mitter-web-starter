const credentials = require('./../../config/credentials.json');
const config = require('./../../config/config.json');

module.exports = require('@mitter-io/node').Mitter.forNode(
  {
    applicationId: config.mitterApplicationId,
    accessKey: {
      accessKey: credentials.mitterAccessKey,
      accessSecret: credentials.mitterAccessSecret
    },
    mitterApiBaseUrl: config.mitterApiUrl || 'https://api.mitter.io'
  }
);
