const axios = require('axios');
const mitter = require('./../clients/mitter');

const mitterAxiosClient = axios.create({
    baseURL: 'abcd'
});

mitter.enableAxiosInterceptor(mitterAxiosClient);

module.exports = mitterAxiosClient;
