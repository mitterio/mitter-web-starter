const credentials = require('./../../config/credentials.json');
const config = require('./../../config/config.json');

module.exports = require('@mitter-io/node').Mitter.forNode(
    config.mitterApplicationId,
    {
        accessKey: credentials.mitterAccessKey,
        accessSecret: credentials.mitterAccessSecret
    }
);
